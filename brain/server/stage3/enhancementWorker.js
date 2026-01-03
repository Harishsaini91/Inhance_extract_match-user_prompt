
// H:\Brain_api\brain\server\stage3\enhancementWorker.js
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

/* Models */
const GoodSuggestion = require("../models/GoodSuggestion");
const EnhancedSuggestion = require("../models/EnhancedSuggestion");

/* Core logic */
const cleanUserText = require("./core/cleanUserText");
const parseAIInsight = require("./core/parseAIInsight");
const extractLocalInsight = require("./enhancers/freeEnhancer");
/* Enhancers */
const getEnhancer = require("./enhancers");

/* Approval & knowledge */
const approve = require("./approval/approvalManager");
const updateKnowledge = require("./knowledge/knowledgeUpdater");

/* DB */
mongoose.connect(process.env.MONGO_URI);

/* Worker */
async function runEnhancer() {
  console.log("⚙️ Stage-3 Enhancer running...");

  const docs = await GoodSuggestion.find().limit(5);

  for (const doc of docs) {
    try {
      /* 1️⃣ Clean user input */
      const cleanedText = cleanUserText(doc.prompt);

      /* 2️⃣ Run enhancer (AI or FREE) */
      const enhancer = getEnhancer();
      const enhancedResult = await enhancer({ cleanedText });

      /* 3️⃣ Approval gate */
      const isApproved = approve({
        original: doc.prompt,
        enhanced: enhancedResult,
      });

      if (!isApproved) continue;

      /* 4️⃣ Normalize output */
      let finalData;

      // 🤖 AI response → strict parser
      if (enhancedResult.enhancementSource === "ai") {
        console.log("🧠 RAW AI RESPONSE:\n", enhancedResult.rawAIText);
        finalData = parseAIInsight(enhancedResult.rawAIText);
      }
      // 🛠 FREE fallback → local extraction
      else {
        finalData = extractLocalInsight(cleanedText);
      }

      /* 5️⃣ Save enhanced suggestion */
      await EnhancedSuggestion.create({
        userEmail: doc.userEmail,
        originalPrompt: doc.prompt,
        enhancedText: finalData.enhancedText,
        keywords: finalData.keywords,
        category: finalData.category,
        enhancementSource: enhancedResult.enhancementSource,
        approved: true,
      });

      /* 6️⃣ Update knowledge base */
      await updateKnowledge(finalData.keywords, finalData.category);

      /* 7️⃣ Remove processed suggestion */
      await GoodSuggestion.findByIdAndDelete(doc._id);

      console.log("✅ Stage-3 success:", doc._id);

    } catch (err) {
      console.error("❌ Stage-3 error:", err.message);
    }
  }
}

/* Run every 10 seconds */
setInterval(runEnhancer, 10000);
