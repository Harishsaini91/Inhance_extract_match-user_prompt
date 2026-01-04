const SystemConfig = require("../models/SystemConfig");

module.exports = async function syncEnhancerConfig() {
  const mode = process.env.ENHANCER_MODE || "free";
  const strategy = process.env.ENHANCER_STRATEGY || "hybrid";

  await SystemConfig.findOneAndUpdate(
    { key: "ENHANCER" },
    {
      value: { mode, strategy },
      updatedBy: "env-sync",
    },
    { upsert: true }
  );

  console.log("✅ Enhancer config synced to DB:", { mode, strategy });
};
