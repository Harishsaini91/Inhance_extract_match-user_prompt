// server/stage4/stage4.worker.js
const crypto = require("crypto");

const EnhancedSuggestion = require("../models/EnhancedSuggestion");
const CanonicalTopic = require("../models/CanonicalTopic");
const TopicSourceArchive = require("../models/TopicSourceArchive");

const { matchTopic, extractCoreKeywords } = require("./topic.matcher");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function stage4Worker() {
  const suggestion = await EnhancedSuggestion.findOneAndUpdate(
    { approved: true, processing: false },
    { $set: { processing: true } },
    { new: true }
  );

  if (!suggestion) return;

  let topic = null;
  let topicSaved = false;
  let archiveSaved = false;

  try {
    // 1️⃣ Find / create / update CanonicalTopic
    const existingTopics = await CanonicalTopic.find({
      category: suggestion.category,
    });

    const matchResult = matchTopic(existingTopics, suggestion);
    const coreKeywords = extractCoreKeywords(suggestion.keywords);

    if (!matchResult) {
      const topicKeySource =
        suggestion.category + "|" + coreKeywords.sort().join("|");

      const topicKey = crypto
        .createHash("sha1")
        .update(topicKeySource)
        .digest("hex");

      topic = await CanonicalTopic.create({
        topicKey,
        category: suggestion.category,
        canonicalTitle: coreKeywords[0] || suggestion.category,
        canonicalText: suggestion.enhancedText,
        canonicalKeywords: coreKeywords,
        sourceSuggestionIds: [suggestion._id],
        sourceCount: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      });
    } else {
      topic = matchResult.topic;

      await CanonicalTopic.updateOne(
        { _id: topic._id },
        {
          $addToSet: { sourceSuggestionIds: suggestion._id },
          $inc: { sourceCount: 1 },
          $set: { lastSeenAt: new Date() },
        }
      );
    }

    topicSaved = true; // ✅ CanonicalTopic success

    // 2️⃣ Archive
    await TopicSourceArchive.create({
      topicId: topic._id,
      topicKey: topic.topicKey,
      originalEnhancedId: suggestion._id,
      userEmail: suggestion.userEmail,
      originalPrompt: suggestion.originalPrompt,
      enhancedText: suggestion.enhancedText,
      keywords: suggestion.keywords,
      category: suggestion.category,
      approved: suggestion.approved,
      enhancementSource: suggestion.enhancementSource,
      createdAt: suggestion.createdAt,
    });

    archiveSaved = true; // ✅ Archive success

    // 3️⃣ DELETE ONLY IF BOTH SUCCEEDED
    if (topicSaved && archiveSaved) {
      await EnhancedSuggestion.deleteOne({ _id: suggestion._id });
      console.log("🗑️ EnhancedSuggestion deleted safely");
    }
  } catch (err) {
    console.error("❌ Stage-4 failed:", err.message);

    // 🔁 unlock for retry
    await EnhancedSuggestion.updateOne(
      { _id: suggestion._id },
      { $set: { processing: false } }
    );
  }
}


module.exports = stage4Worker;
