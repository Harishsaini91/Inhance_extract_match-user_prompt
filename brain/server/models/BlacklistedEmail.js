// H:\Brain_api\brain\server\models\BlacklistedEmail.js

const mongoose = require("mongoose");

const BlacklistedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    reason: {
      type: String,
      enum: ["sexual", "abusive", "spam", "hate", "other"],
      required: true,
    },

    details: {
      type: String,
      default: "",
    },

    blockedBy: {
      type: String,
      enum: ["system", "admin"],
      default: "system",
    },

    blockedAt: {
      type: Date,
      default: Date.now,
    },

    permanent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BlacklistedEmail",
  BlacklistedEmailSchema
);
