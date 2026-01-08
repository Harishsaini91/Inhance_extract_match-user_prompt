// server/stage4/stage4.worker.js

const crypto = require("crypto");

const EnhancedSuggestion = require("../models/EnhancedSuggestion");
const CanonicalTopic = require("../models/CanonicalTopic");
const TopicSourceArchive = require("../models/TopicSourceArchive");

const { matchTopic } = require("./topic.matcher");

async function stage4Worker() {
  const suggestion = await EnhancedSuggestion.findOneAndUpdate(
    { approved: true, processing: false },
    { $set: { processing: true } },
    { new: true }
  );

  if (!suggestion) return;

  try {
    const existingTopics = await CanonicalTopic.find({
      category: suggestion.category,
    });

    const { topic, canonicalConcepts } = matchTopic(
      existingTopics,
      suggestion
    );

    let finalTopic = topic;

    // 🆕 CREATE NEW TOPIC
    if (!finalTopic) {
      if (canonicalConcepts.length < 3) {
        throw new Error("INSUFFICIENT_CANONICAL_CONCEPTS");
      }

      const topicKeySource =
        suggestion.category + "|" + canonicalConcepts.sort().join("|");

      const topicKey = crypto
        .createHash("sha1")
        .update(topicKeySource)
        .digest("hex");

      finalTopic = await CanonicalTopic.create({
        topicKey,
        category: suggestion.category,
        canonicalTitle: canonicalConcepts[0],
        canonicalText: suggestion.enhancedText,
        canonicalKeywords: canonicalConcepts,
        sourceSuggestionIds: [suggestion._id],
        sourceCount: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        confidenceScore: 0.3,
      });
    }
    // 🔁 MERGE INTO EXISTING TOPIC
    else {
      await CanonicalTopic.updateOne(
        { _id: finalTopic._id },
        {
          $addToSet: { sourceSuggestionIds: suggestion._id },
          $inc: { sourceCount: 1 },
          $set: { lastSeenAt: new Date() },
        }
      );
    }

    // 📦 ARCHIVE SOURCE
    await TopicSourceArchive.create({
      topicId: finalTopic._id,
      topicKey: finalTopic.topicKey,
      originalEnhancedId: suggestion._id,
      userEmail: suggestion.userEmail,
      originalPrompt: suggestion.originalPrompt,
      enhancedText: suggestion.enhancedText,
      keywords: suggestion.keywords,
      category: suggestion.category,
      approved: suggestion.approved,
      enhancementSource: suggestion.enhancementSource,
      archivedAt: new Date(),
    });

    // 🗑️ DELETE STAGE-3 DOC
    await EnhancedSuggestion.deleteOne({ _id: suggestion._id });

    console.log("🟢 Stage-4 merged into topic:", finalTopic._id);
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
