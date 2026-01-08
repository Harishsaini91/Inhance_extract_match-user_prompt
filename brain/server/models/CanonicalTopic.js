// server/models/CanonicalTopic.js
const mongoose = require("mongoose");

const CanonicalTopicSchema = new mongoose.Schema(
  {
    topicKey: {
      type: String,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      index: true,
    },

    canonicalTitle: String,

    // 🔒 LOCKED meaning (first writer wins)
    canonicalText: String,

    canonicalKeywords: [String],

    // 🔗 ALL contributing suggestion IDs
    sourceSuggestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EnhancedSuggestion",
      },
    ],

    sourceCount: {
      type: Number,
      default: 1,
    },

    firstSeenAt: Date,
    lastSeenAt: Date,

    confidenceScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanonicalTopic", CanonicalTopicSchema);
