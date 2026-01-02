const mongoose = require("mongoose");
const BaseSuggestionSchema = require("./BaseSuggestion");

const AIProcessedSchema = new mongoose.Schema({
  ...BaseSuggestionSchema.obj,

  safetyScore: Number,
  flagged: Boolean,
  redFlagReason: String,

  enhancedText: String,
  explanation: String,
  keywords: [String],
  aiModelUsed: String,

  stage: {
    type: String,
    default: "ai",
  },
});

module.exports = mongoose.model(
  "AIProcessedSuggestion",
  AIProcessedSchema
);
