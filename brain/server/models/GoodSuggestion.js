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
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodSuggestion", GoodSuggestionSchema);
