// H:\Brain_api\brain\server\routes\verification.routes.js

const express = require("express");
const router = express.Router();

const RawSuggestion = require("../models/RawSuggestion");
const SafetyVerified = require("../models/SafetyVerifiedSuggestion");
const BlacklistedEmail = require("../models/BlacklistedEmail");
const safetyChecker = require("../brain/safetyChecker");
const moveStage = require("../utils/moveStage");

/**
 * POST /api/brain/verify/safety/:id
 */
router.post("/verify/safety/:id", async (req, res) => {
  const result = await moveStage({
    prevModel: RawSuggestion,
    nextModel: SafetyVerified,
    prevId: req.params.id,

    buildNextData: async (raw) => {
      const safety = safetyChecker(raw.prompt);

      /* 🔒 Auto-blacklist (high confidence only) */
      if (safety.isUnsafe && safety.score >= 0.9) {
        await BlacklistedEmail.findOneAndUpdate(
          { email: raw.userEmail.toLowerCase() },
          {
            email: raw.userEmail.toLowerCase(),
            reason: "sexual",
            details: safety.matches.join(", "),
            blockedBy: "system",
            permanent: true,
          },
          { upsert: true }
        );
      }

      return {
        userEmail: raw.userEmail,
        prompt: raw.prompt,
        safetyScore: safety.score,
        flagged: safety.isUnsafe,
        redFlagReason: safety.matches.join(", "),
        status: safety.isUnsafe ? "rejected" : "safe",
      };
    },
  });

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: "Safety verification failed",
      reason: result.error,
    });
  }

  res.json({
    success: true,
    movedFrom: "raw",
    movedTo: "safety_verified",
    newId: result.newId,
  });
});

module.exports = router;
