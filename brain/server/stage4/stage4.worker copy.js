// server/stage4/stage4.worker.js
const crypto = require("crypto");

const EnhancedSuggestion = require("../models/EnhancedSuggestion");
const CanonicalTopic = require("../models/CanonicalTopic");
const TopicSourceArchive = require("../models/TopicSourceArchive");

const { matchTopic, extractCoreKeywords } = require("./topic.matcher");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function stage4Worker() {
  console.log("🟡 Stage-4 tick started");

  // 🔍 Check how many docs are available
  const count = await EnhancedSuggestion.countDocuments({
    approved: true,
    processing: false,
  });
  console.log("📊 Available suggestions:", count);

  if (count === 0) {
    console.log("⏸️ No suggestions found, waiting 2 minutes...");
    await sleep(120000);
    return;
  }

  // 🔒 Lock one suggestion
  const suggestion = await EnhancedSuggestion.findOneAndUpdate(
    { approved: true, processing: false },
    { $set: { processing: true } },
    { new: true }
  );

  if (!suggestion) {
    console.log("⚠️ Could not lock suggestion, waiting 2 minutes...");
    await sleep(120000);
    return;
  }

  console.log("🟢 Picked suggestion ID:", suggestion._id);
  console.log("🧾 Suggestion data:", {
    category: suggestion.category,
    keywords: suggestion.keywords,
    enhancementSource: suggestion.enhancementSource,
  });

  try {
    // 🔍 Fetch topics
    const existingTopics = await CanonicalTopic.find({
      category: suggestion.category,
    });
    console.log("📂 Existing topics in category:", existingTopics.length);

    const matchResult = matchTopic(existingTopics, suggestion);
    const coreKeywords = extractCoreKeywords(suggestion.keywords);

    let topic;

    if (!matchResult) {
      console.log("➕ Creating new CanonicalTopic");

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

      console.log("✅ CanonicalTopic created:", topic._id);
    } else {
      topic = matchResult.topic;
      console.log("🔁 Merging into existing topic:", topic._id);

      await CanonicalTopic.updateOne(
        { _id: topic._id },
        {
          $addToSet: { sourceSuggestionIds: suggestion._id },
          $inc: { sourceCount: 1 },
          $set: { lastSeenAt: new Date() },
        }
      );
    }

    // 📦 Archive
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

    console.log("📦 Archived suggestion");

    // ❌ Delete stage-3
    await EnhancedSuggestion.deleteOne({ _id: suggestion._id });
    console.log("🗑️ Deleted EnhancedSuggestion");

  } catch (err) {
    console.error("❌ Stage-4 error:", err.message);

    await EnhancedSuggestion.updateOne(
      { _id: suggestion._id },
      { $set: { processing: false } }
    );

    console.log("🔓 Unlocked suggestion, waiting 2 minutes...");
    await sleep(120000);
  }
}

module.exports = stage4Worker;
