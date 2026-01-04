// H:\Brain_api\brain\server\stage3\enhancementWorker.js

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

/* Models */
const GoodSuggestion = require("../models/GoodSuggestion");
const EnhancedSuggestion = require("../models/EnhancedSuggestion");

/* Core */
const cleanUserText = require("./core/cleanUserText");

/* Strategy */
const enhancementStrategy = require("./strategy/enhancementStrategy");

/* Enhancer Controller */
const enhance = require("./enhancers/enhancerController");

/* Config (DB-based runtime config) */
const getEnhancerConfig = require("../config/getEnhancerConfig");

/* Approval & knowledge */
const approve = require("./approval/approvalManager");
const updateKnowledge = require("./knowledge/knowledgeUpdater");

/* DB */
mongoose.connect(process.env.MONGO_URI);

/* Worker */
async function runEnhancer() {
  /* 🔧 READ RUNTIME CONFIG FROM DB */
  const { mode, strategy } = await getEnhancerConfig();

  /* 🛑 HARD STOP STAGE-3 */
  if (mode === "off") {
    console.log("🛑 Stage-3 Enhancer is OFF (DB config) — skipping cycle");
    return;
  }

  console.log(`⚙️ Stage-3 Enhancer running [mode=${mode}, strategy=${strategy}]`);

  const docs = await GoodSuggestion.find({
    processing: { $ne: true },
  }).limit(5);

  for (const doc of docs) {
    /* 🔒 Lock document */
    const locked = await GoodSuggestion.findOneAndUpdate(
      { _id: doc._id, processing: { $ne: true } },
      { processing: true },
      { new: true }
    );

    if (!locked) continue;

    try {
      const decision = enhancementStrategy(locked);

      /* ⏳ WAIT MODE */
      if (decision.action === "WAIT") {
        await GoodSuggestion.findByIdAndUpdate(locked._id, {
          nextRetryAt: decision.retryAfterMs
            ? new Date(Date.now() + decision.retryAfterMs)
            : locked.nextRetryAt,
          aiFailCount: decision.resetFailCount ? 0 : locked.aiFailCount,
          processing: false,
        });
        continue;
      }

      /* 🧹 Clean input */
      const cleanedText = cleanUserText(locked.prompt);

      let enhancedResult;

      /* 🚀 ENHANCEMENT */
      if (
        decision.action === "TRY_AI" ||
        decision.action === "USE_LOCAL"
      ) {
        try {
          enhancedResult = await enhance(
            { cleanedText, originalPrompt: locked.prompt },
            { mode, strategy }
          );

          // reset AI failure counters
          locked.aiFailCount = 0;
          locked.nextRetryAt = null;
        } catch (err) {
          // strict AI failure
          locked.aiFailCount += 1;

          await GoodSuggestion.findByIdAndUpdate(locked._id, {
            aiFailCount: locked.aiFailCount,
            processing: false,
          });

          console.error("❌ Enhancement failed:", err.message);
          continue;
        }
      }

      /* ✅ Approval */
      const isApproved = approve({
        original: locked.prompt,
        enhanced: enhancedResult,
      });

      if (!isApproved) {
        await GoodSuggestion.findByIdAndUpdate(locked._id, {
          processing: false,
        });
        continue;
      }

      /* 💾 Save enhanced result */
      await EnhancedSuggestion.create({
        userEmail: locked.userEmail,
        originalPrompt: locked.prompt,
        enhancedText: enhancedResult.enhancedText,
        keywords: enhancedResult.keywords,
        category: enhancedResult.category,
        enhancementSource: enhancedResult.enhancementSource,
        approved: true,
      });

      /* 📚 Update knowledge */
      await updateKnowledge(
        enhancedResult.keywords,
        enhancedResult.category
      );

      /* 🗑 Remove processed suggestion */
      await GoodSuggestion.findByIdAndDelete(locked._id);

       
      console.log("✅ Stage-3 success:", locked._id);
    } catch (err) {
      console.error("❌ Stage-3 worker error:", err.message);

      await GoodSuggestion.findByIdAndUpdate(locked._id, {
        processing: false,
      });
    }
  }
}

/* Run every 10 seconds */
setInterval(runEnhancer, 10000);
