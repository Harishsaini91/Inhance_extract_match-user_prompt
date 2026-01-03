// H:\Brain_api\brain\server\stage3\enhancers\index.js

const freeEnhancer = require("./freeEnhancer");
const aiEnhancer = require("./aiEnhancer");

module.exports = function getEnhancer() {
  /* 🔹 AI mode enabled */
  if (process.env.ENHANCER_MODE === "ai") {
    return async function safeAiEnhancer(input) {
      try {
        console.log("🤖 [AI] Enhancer selected");

        const result = await aiEnhancer(input);

        return {
          ...result,
          enhancementSource: "ai", // ✅ Method 1 (DB truth)
        };
      } catch (err) {
        console.warn(
          "⚠️ [AI] Failed → fallback to FREE:",
          err.message
        );

        const fallback = await freeEnhancer(input);

        console.log("🛠️ [FREE] Enhancer used (fallback)");

        return {
          ...fallback,
          enhancementSource: "free", // ✅ Method 1 (DB truth)
        };
      }
    };
  }

  /* 🔹 Free-only mode */
  return async function freeOnlyEnhancer(input) {
    console.log("🛠️ [FREE] Enhancer used");

    const result = await freeEnhancer(input);

    return {
      ...result,
      enhancementSource: "free", // ✅ Method 1 (DB truth)
    };
  };
};
