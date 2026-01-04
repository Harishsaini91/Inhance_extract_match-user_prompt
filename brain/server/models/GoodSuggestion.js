// H:\Brain_api\brain\server\models\GoodSuggestion.js

const mongoose = require("mongoose");

const GoodSuggestionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, index: true },
    prompt: String,

    safetyScore: Number,

    sourceStage: {
      type: String,
      default: "safety",
    },

    aiFailCount: { type: Number, default: 0 },
    nextRetryAt: { type: Date },
       processing: {
      type: Boolean,
      default: false,
      index: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodSuggestion", GoodSuggestionSchema);
