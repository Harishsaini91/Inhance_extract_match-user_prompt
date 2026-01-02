// H:\Brain_api\brain\server\models\BadSuggestion.js

const mongoose = require("mongoose");

const BadSuggestionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, index: true },
    prompt: String,

    safetyScore: Number,
    redFlagReason: String,

    blockedBy: {
      type: String,
      default: "system",
    },

    permanent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BadSuggestion", BadSuggestionSchema);
