const mongoose = require("mongoose");

const EnhancedSuggestionSchema = new mongoose.Schema(
  {
    userEmail: String,
    originalPrompt: String,
    enhancedText: String,
    keywords: [String],
    category: String,
    approved: Boolean,
    enhancementSource: {
      type: String,
      enum: ["ai", "local", "fallback"],
      required: true,
    }


  },
  { timestamps: true }
);

module.exports = mongoose.model("EnhancedSuggestion", EnhancedSuggestionSchema);
