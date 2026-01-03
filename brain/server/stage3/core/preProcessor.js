// H:\Brain_api\brain\server\stage3\core\preProcessor.js
function extractKeywords(text) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4)
    .slice(0, 6);
}

function inferCategory(keywords) {
  if (keywords.some(k => ["ai", "machine", "learning"].includes(k)))
    return "ai";
  if (keywords.some(k => ["programming", "javascript", "python"].includes(k)))
    return "programming";
  return "general";
}

module.exports = function preProcessor(input) {
  const cleanedText = input.trim().replace(/\s+/g, " ");

  return {
    cleanedText,

    parseAI(aiText) {
      if (!aiText || aiText.length < 20) {
        throw new Error("AI_OUTPUT_TOO_WEAK");
      }

      const keywords = extractKeywords(aiText);
      const category = inferCategory(keywords);

      return {
        enhancedText: aiText.trim(),
        keywords,
        category,
      };
    },
  };
};
