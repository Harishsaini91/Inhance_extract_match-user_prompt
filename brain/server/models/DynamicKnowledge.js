const mongoose = require("mongoose");

const DynamicKnowledgeSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    type: { type: String }, // keyword | category
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DynamicKnowledge", DynamicKnowledgeSchema);
