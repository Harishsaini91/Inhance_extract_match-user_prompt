// H:\Brain_api\brain\server\stage3\enhancers\index.js

const aiEnhancer = require("./aiEnhancer");
const freeEnhancer = require("./freeEnhancer");
const parseAIInsight = require("../core/parseAIInsight");

/**
 * AI enhancer wrapper
 * - Calls AI
 * - Parses output
 * - Throws on any failure
 */
async function runAIEnhancer(input) {
  const aiText = await aiEnhancer(input);
  const parsed = parseAIInsight(aiText);

  return {
    ...parsed,
    enhancementSource: "ai",
  };
}

/**
 * Local enhancer wrapper
 * - Never throws
 * - Always returns usable output
 */
async function runLocalEnhancer(input) {
  return await freeEnhancer(input);
}

module.exports = {
  runAIEnhancer,
  runLocalEnhancer,
};
