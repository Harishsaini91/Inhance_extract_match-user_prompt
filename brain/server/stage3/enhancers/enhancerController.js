/**
 * Enhancer Controller
 * -------------------
 * Controls enhancement behavior using:
 * - ENHANCER_MODE      (ai | free | off)
 * - ENHANCER_STRATEGY  (hybrid | ai-only)
 *
 * STRICT RULES:
 * - ai + ai-only  → AI only, throw on failure
 * - ai + hybrid   → AI first, fallback to local
 * - free / off    → local only
 */

const { runAIEnhancer, runLocalEnhancer } = require("./index");
 
module.exports = async function enhance(input,{ mode, strategy }) {
  // 🔴 OFF MODE
  // Enhancement disabled → safe local output
//   if (MODE === "off") {
//     // return runLocalEnhancer(input);
//     console.log("🛑 Stage-3 Enhancer is OFF — worker will not process documents");
//   return;
//   }

  // 🟡 FREE MODE
  // No AI usage at all
  if (mode === "free") {
    return runLocalEnhancer(input);
  }

  // 🟢 AI MODE
  if (mode === "ai") {
    // 🔥 STRICT AI ONLY
    // No try/catch → error bubbles up
    if (strategy === "ai-only") {
      return await runAIEnhancer(input);
    }

    // 🟢 HYBRID MODE (AI → fallback local)
    try {
      return await runAIEnhancer(input);
    } catch (err) {
      console.warn(
        "⚠ AI enhancer failed → switching to local fallback:",
        err.message
      );
      return await runLocalEnhancer(input);
    }
  }

  // 🛟 Absolute safety fallback
  return runLocalEnhancer(input);
};
