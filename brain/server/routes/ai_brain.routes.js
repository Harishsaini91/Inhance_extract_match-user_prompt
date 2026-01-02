const express = require("express");
const router = express.Router();

const RawSuggestion = require("../models/RawSuggestion");
const BlacklistedEmail = require("../models/BlacklistedEmail");

/**
 * POST /api/brain/prompt
 * Entry point (Postman frontend)
 */
router.post("/prompt", async (req, res) => {
  try {
    const { email, prompt } = req.body;

    if (!email || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Email and prompt are required",
      });
    }

    /* 🔒 Blacklist Check (FIRST) */
    const isBlacklisted = await BlacklistedEmail.findOne({
      email: email.toLowerCase(),
      permanent: true,
    });

    if (isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: "Email is blacklisted. Submission not allowed.",
        reason: isBlacklisted.reason,
      });
    }

    /* ✅ Create Raw Suggestion */
    const raw = await RawSuggestion.create({
      userEmail: email,
      prompt,
    });

    return res.status(201).json({
      success: true,
      message: "Prompt stored (raw stage)",
      data: {
        id: raw._id,
        stage: "raw",
      },
    });
  } catch (err) {
    console.error("Raw Prompt Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
