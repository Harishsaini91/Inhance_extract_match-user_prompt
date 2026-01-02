// H:\Brain_api\brain\server\models\BaseSuggestion.js

const mongoose = require("mongoose");

const BaseSuggestionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    stage: {
      type: String,
      enum: ["raw", "safety", "ai", "final"],
      default: "raw",
      index: true,
    },


       // 🔴 REQUIRED FOR WORKER
    processing: {
      type: Boolean,
      default: false,
      index: true,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    failedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

 

module.exports = BaseSuggestionSchema;
