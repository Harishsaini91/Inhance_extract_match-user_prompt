// server/models/TopicSourceArchive.js
const mongoose = require("mongoose");

const TopicSourceArchiveSchema = new mongoose.Schema(
  {
    // 🔗 Stage-4 link
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanonicalTopic",
      index: true,
    },

    topicKey: String,

    // 🔗 Original Stage-3 ID
    originalEnhancedId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    userEmail: String,

    originalPrompt: String,
    enhancedText: String,

    keywords: [String],
    category: String,

    approved: Boolean,
    enhancementSource: String,

    createdAt: Date,
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("TopicSourceArchive", TopicSourceArchiveSchema);
