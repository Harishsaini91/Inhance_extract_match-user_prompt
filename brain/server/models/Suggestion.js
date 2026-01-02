// H:\Brain_api\brain\server\models\Suggestion.js

const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema(
  {
    /* ===============================
       USER INPUT
    =============================== */
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    rawText: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      default: "unknown",
    },

    reason: {
      type: String,
      default: "",
    },

    /* ===============================
       ADMIN MODERATION
    =============================== */
    adminApproved: {
      type: Boolean,
      default: false,
    },

    adminNotes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",        // user submitted
        "rejected",       // safety / admin rejected
        "approved",       // admin approved
        "processed",      // AI enhanced
        "archived"        // ignored / stored
      ],
      default: "pending",
      index: true,
    },

    /* ===============================
       SAFETY & FILTERING
    =============================== */
    safetyScore: {
      type: Number,
      default: 0,
    },

    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },

    redFlagReason: {
      type: String,
      default: "",
    },

    blockedKeywords: {
      type: [String],
      default: [],
    },

    /* ===============================
       AI ENHANCEMENT (MANUAL TRIGGER)
    =============================== */
    aiUsed: {
      type: Boolean,
      default: false,
    },

    enhancedText: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    /* ===============================
       ADD-ON 1: IDEA POTENTIAL SCORE
       (ADMIN-ONLY, NOT SAFETY)
    =============================== */
    ideaPotential: {
      score: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: null,
      },
      reason: {
        type: String,
        default: "",
      },
      evaluatedByAI: {
        type: Boolean,
        default: false,
      },
    },

    /* ===============================
       ADD-ON 2: TREND DETECTOR
    =============================== */
    votes: {
      type: Number,
      default: 0,
      index: true,
    },

    voteHistory: [
      {
        count: Number,
        at: Date,
      },
    ],

    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },

    trendingBadgeAt: {
      type: Date,
      default: null,
    },

    /* ===============================
       ADD-ON 3: COLD IDEA REVIVER
    =============================== */
    revivedFromCold: {
      type: Boolean,
      default: false,
    },

    revivalSuggestions: {
      improvedTitle: String,
      betterAngle: String,
      audienceSplit: {
        beginner: String,
        advanced: String,
      },
    },

    revivalStatus: {
      type: String,
      enum: ["not_attempted", "suggested", "applied", "ignored"],
      default: "not_attempted",
    },

    /* ===============================
       ANALYTICS & FUTURE USE
    =============================== */
    source: {
      type: String,
      enum: ["user", "admin", "system"],
      default: "user",
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Suggestion", SuggestionSchema);
