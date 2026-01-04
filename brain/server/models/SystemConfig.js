const mongoose = require("mongoose");

const SystemConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed,
    updatedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemConfig", SystemConfigSchema);
