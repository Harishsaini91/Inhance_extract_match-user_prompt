const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const RedFlagSuggestion = require("../models/RedFlagSuggestion");
const GoodSuggestion = require("../models/GoodSuggestion");

/**
 * ❌ DELETE RedFlagSuggestion (Reject)
 * Admin decides to permanently remove it
 */
router.delete("/redflag/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const doc = await RedFlagSuggestion.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Suggestion not found" });
    }

    await RedFlagSuggestion.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "RedFlagSuggestion deleted successfully",
    });
  } catch (err) {
    console.error("Delete RedFlagSuggestion error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ APPROVE RedFlagSuggestion
 * Move → GoodSuggestion
 */
router.post("/redflag/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const redFlagDoc = await RedFlagSuggestion.findById(id);
    if (!redFlagDoc) {
      return res.status(404).json({ success: false, message: "Suggestion not found" });
    }

    // 1️⃣ Create GoodSuggestion FIRST
    const goodSuggestion = await GoodSuggestion.create({
      userEmail: redFlagDoc.userEmail,
      prompt: redFlagDoc.prompt,
      safetyScore: redFlagDoc.safetyScore,
      sourceStage: "redflag-admin",

      processing: false,
      aiFailCount: 0,
      nextRetryAt: null,

      approvedBy: "admin",
      approvalSource: "redflag",
      approvedAt: new Date(),
    });

    // 2️⃣ Delete RedFlagSuggestion ONLY after success
    await RedFlagSuggestion.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Suggestion approved and moved to GoodSuggestion",
      goodSuggestionId: goodSuggestion._id,
    });
  } catch (err) {
    console.error("Approve RedFlagSuggestion error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
