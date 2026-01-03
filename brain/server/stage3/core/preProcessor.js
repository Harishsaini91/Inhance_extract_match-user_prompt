// H:\Brain_api\brain\server\stage3\core\preProcessor.js

function parsePlainAIResponse(text) {
  if (!text || text.includes("INVALID")) {
    throw new Error("AI_FORMAT_INVALID");
  }

  const enhancedMatch = text.match(/ENHANCED_TEXT:\s*([\s\S]*?)\nKEYWORDS:/);
  const keywordsMatch = text.match(/KEYWORDS:\s*(.*?)\nCATEGORY:/);
  const categoryMatch = text.match(/CATEGORY:\s*(.*)$/);

  if (!enhancedMatch || !keywordsMatch || !categoryMatch) {
    throw new Error("AI_PARSE_FAILED");
  }

  const enhancedText = enhancedMatch[1].trim();
  const keywords = keywordsMatch[1]
    .split(",")
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2);

  const category = categoryMatch[1].trim().toLowerCase();

  if (!enhancedText || keywords.length < 3 || !category) {
    throw new Error("AI_DATA_INCOMPLETE");
  }

  return {
    enhancedText,
    keywords,
    category,
  };
}

module.exports = function preProcessor(input) {
  return {
    cleanedText: input.trim().replace(/\s+/g, " "),
    parseAI: parsePlainAIResponse,
  };
};
