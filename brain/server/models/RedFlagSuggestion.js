// H:\Brain_api\brain\server\models\RedFlagSuggestion.js

const mongoose = require("mongoose");

const RedFlagSuggestionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      lowercase: true,
      index: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    safetyScore: {
      type: Number,
      required: true,
    },

    redFlagReason: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: ["sexual", "abuse", "threat", "mixed"],
      default: "sexual",
    },

    sourceStage: {
      type: String,
      default: "safety",
    },

    reviewed: {
      type: Boolean,
      default: false,
    },

    actionTaken: {
      type: String,
      enum: ["none", "warned", "blocked", "ignored"],
      default: "none",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RedFlagSuggestion",
  RedFlagSuggestionSchema
);
