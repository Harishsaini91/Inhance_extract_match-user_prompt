// H:\Brain_api\brain\server\workers\safetyWorker.js

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const RawSuggestion = require("../models/RawSuggestion");
const GoodSuggestion = require("../models/GoodSuggestion");
const RedFlagSuggestion = require("../models/RedFlagSuggestion");
const BadSuggestion = require("../models/BadSuggestion");
const BlacklistedEmail = require("../models/BlacklistedEmail");

const safetyChecker = require("../brain/safetyChecker");

console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);

const BATCH_SIZE = 5;

async function runSafetyWorker() {
  console.log("🛡 Safety Worker running...");

  const raws = await RawSuggestion.find({
    processing: false,
    retryCount: { $lt: 3 },
  })
    .limit(BATCH_SIZE)
    .sort({ createdAt: 1 });

  for (const raw of raws) {
    try {
      /* 🔒 Lock raw */
      const doc = await RawSuggestion.findOneAndUpdate(
        { _id: raw._id, processing: false },
        { processing: true },
        { new: true }
      );

      if (!doc) continue;

      const safety = safetyChecker(doc.prompt);

      /* 🟢 GOOD → AI allowed */
      if (!safety.isUnsafe) {
        await GoodSuggestion.create({
          userEmail: doc.userEmail,
          prompt: doc.prompt,
          safetyScore: safety.score,
        });

        await RawSuggestion.findByIdAndDelete(doc._id);
        continue;
      }

      /* 🔴 BAD → permanent block */
      if (safety.score >= 0.9) {
        await BlacklistedEmail.findOneAndUpdate(
          { email: doc.userEmail },
          {
            email: doc.userEmail,
            reason: "sexual",
            details: safety.matches.join(", "),
            blockedBy: "system",
            permanent: true,
          },
          { upsert: true }
        );

        await BadSuggestion.create({
          userEmail: doc.userEmail,
          prompt: doc.prompt,
          safetyScore: safety.score,
          redFlagReason: safety.matches.join(", "),
        });

        await RawSuggestion.findByIdAndDelete(doc._id);
        continue;
      }

      /* 🟡 MEDIUM → needs decision */
      await RedFlagSuggestion.create({
        userEmail: doc.userEmail,
        prompt: doc.prompt,
        safetyScore: safety.score,
        redFlagReason: safety.matches.join(", "),
        category: "sexual",
      });

      await RawSuggestion.findByIdAndDelete(doc._id);
    } catch (err) {
      await RawSuggestion.findByIdAndUpdate(raw._id, {
        $set: {
          processing: false,
          failedAt: new Date(),
        },
        $inc: {
          retryCount: 1,
        },
      });

      console.error("❌ Safety worker error:", err.message);
    }
  }
}

/* Run every 20 seconds */
setInterval(runSafetyWorker, 20000);
