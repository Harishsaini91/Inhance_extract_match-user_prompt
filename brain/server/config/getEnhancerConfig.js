const SystemConfig = require("../models/SystemConfig");

module.exports = async function getEnhancerConfig() {
  const doc = await SystemConfig.findOne({ key: "ENHANCER" });

  return {
    mode: doc?.value?.mode || "free",
    strategy: doc?.value?.strategy || "hybrid",
  };
};
