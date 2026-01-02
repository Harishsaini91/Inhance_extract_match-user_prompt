const mongoose = require("mongoose");
const BaseSuggestionSchema = require("./BaseSuggestion");

const FinalSuggestionSchema = new mongoose.Schema({
  ...BaseSuggestionSchema.obj,

  safetyScore: Number,
  flagged: Boolean,
  redFlagReason: String,

  enhancedText: String,
  explanation: String,
  keywords: [String],
  aiModelUsed: String,

  title: String,
  description: String,

  approvedBy: String,
  published: {
    type: Boolean,
    default: false,
  },

  stage: {
    type: String,
    default: "final",
  },
});

module.exports = mongoose.model("FinalSuggestion", FinalSuggestionSchema);
