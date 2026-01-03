// H:\Brain_api\brain\server\stage3\knowledge\knowledgeUpdater.js

const DynamicKnowledge = require("../../models/DynamicKnowledge");

module.exports = async function updateKnowledge(keywords, category) {
  for (const key of keywords) {
    await DynamicKnowledge.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, type: "keyword" },
      { upsert: true }
    );
  }

  await DynamicKnowledge.findOneAndUpdate(
    { key: category },
    { $inc: { count: 1 }, type: "category" },
    { upsert: true }
  );
};
