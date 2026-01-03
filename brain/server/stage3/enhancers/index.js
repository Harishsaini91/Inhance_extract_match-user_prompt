
// H:\Brain_api\brain\server\stage3\enhancers\index.js
const freeEnhancer = require("./freeEnhancer");
const aiEnhancer = require("./aiEnhancer");

module.exports = function getEnhancer() {
  if (process.env.ENHANCER_MODE === "ai") {
    return async function safeAiEnhancer(input) {
      try {
        console.log("🤖 [AI] Enhancer selected");

        const aiText = await aiEnhancer(input);
        const parsed = input.parseAI(aiText);

        return {
          ...parsed,
          enhancementSource: "ai",
        };
      } catch (err) {
        console.warn("⚠️ [AI] Failed → fallback:", err.message);
        const fallback = await freeEnhancer(input);

        return {
          ...fallback,
          enhancementSource: "free",
        };
      }
    };
  }

  return async function freeOnlyEnhancer(input) {
        console.log("🤖 [Free] Enhancer selected");

    const result = await freeEnhancer(input);
    return {
      ...result,
      enhancementSource: "free",
    };
  };
};
 