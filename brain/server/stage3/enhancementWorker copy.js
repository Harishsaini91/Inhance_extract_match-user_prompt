// H:\Brain_api\brain\server\stage3\enhancementWorker.js

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
      const pre = preProcessor(doc.prompt);

      const enhancer = getEnhancer();
      const enhanced = await enhancer(pre);

      const isApproved = approve({
        original: doc.prompt,
        enhanced,
      });

      if (!isApproved) continue;

      await EnhancedSuggestion.create({
        userEmail: doc.userEmail,
        originalPrompt: doc.prompt,
        enhancedText: enhanced.enhancedText,
        keywords: enhanced.keywords,
        category: enhanced.category,
        enhancementSource: enhanced.enhancementSource,
        approved: true,
      });

      await updateKnowledge(enhanced.keywords, enhanced.category);
      await GoodSuggestion.findByIdAndDelete(doc._id);
    } catch (err) {
      console.error("❌ Stage-3 error:", err.message);
    }
  }
}

/* Run every 30 sec */
setInterval(runEnhancer, 30000);
