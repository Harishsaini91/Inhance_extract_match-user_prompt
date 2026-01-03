require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const GoodSuggestion = require("../models/GoodSuggestion");
const EnhancedSuggestion = require("../models/EnhancedSuggestion");

const preProcessor = require("./core/preProcessor");
const getEnhancer = require("./enhancers");
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
      /* 1️⃣ Pre-process raw text */
      const pre = preProcessor(doc.prompt);

      /* 2️⃣ Run enhancer (AI or FREE) */
      const enhancer = getEnhancer();
      const enhancedResult = await enhancer(pre);

      /* 3️⃣ Approval gate */
      const isApproved = approve({
        original: doc.prompt,
        enhanced: enhancedResult,
      });

      if (!isApproved) continue;

      /* 4️⃣ Normalize output (AI vs FREE) */
      let finalData;

      // 🤖 AI path → parse plain text
      if (enhancedResult.enhancementSource === "ai") {
         console.log("🧠 RAW AI RESPONSE:\n", enhancedResult.rawAIText);
        finalData = pre.parseAI(enhancedResult.rawAIText);
      }
      // 🛠️ FREE path → already structured
      else {
        finalData = enhancedResult;
      }

      /* 5️⃣ Store enhanced suggestion */
      await EnhancedSuggestion.create({
        userEmail: doc.userEmail,
        originalPrompt: doc.prompt,
        enhancedText: finalData.enhancedText,
        keywords: finalData.keywords,
        category: finalData.category,
        enhancementSource: enhancedResult.enhancementSource,
        approved: true,
      });

      /* 6️⃣ Update dynamic knowledge */
      await updateKnowledge(finalData.keywords, finalData.category);

      /* 7️⃣ Remove processed suggestion */
      await GoodSuggestion.findByIdAndDelete(doc._id);

    } catch (err) {
      console.error("❌ Stage-3 error:", err.message);
    }
  }
}

/* Run every 30 seconds */
setInterval(runEnhancer, 10000);
