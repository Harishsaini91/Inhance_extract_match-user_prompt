const { runAIEnhancer, runLocalEnhancer } = require("./index");

const MODE = process.env.ENHANCER_MODE || "free";       // ai | free | off
const STRATEGY = process.env.ENHANCER_STRATEGY || "hybrid"; // hybrid | ai-only

module.exports = async function enhance(input) {
  // 🔴 OFF MODE → no enhancement logic
  if (MODE === "off") {
    return runLocalEnhancer(input);
  }

  // 🟡 FREE MODE → always local
  if (MODE === "free") {
    return runLocalEnhancer(input);
  }

  // 🟢 AI MODE
  if (MODE === "ai") {
    // ❌ Strict AI only
    if (STRATEGY === "ai-only") {
      return await runAIEnhancer(input); // throws if AI fails
    }

    // ✅ HYBRID (recommended)
    try {
      return await runAIEnhancer(input);
    } catch (err) {
      console.warn("⚠ AI enhancer failed → fallback to local", err.message);
      return await runLocalEnhancer(input);
    }
  }

  // Safety fallback (should never reach)
  return runLocalEnhancer(input);
};
