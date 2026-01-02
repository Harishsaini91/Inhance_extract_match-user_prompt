const mongoose = require("mongoose");
const BaseSuggestionSchema = require("./BaseSuggestion");

const SafetyVerifiedSchema = new mongoose.Schema({
  ...BaseSuggestionSchema.obj,

  safetyScore: {
    type: Number,
    required: true,
  },

  flagged: {
    type: Boolean,
    default: false,
  },

  redFlagReason: {
    type: String,
    default: "",
  },

  stage: {
    type: String,
    default: "safety",
  },
});

module.exports = mongoose.model(
  "SafetyVerifiedSuggestion",
  SafetyVerifiedSchema
);
