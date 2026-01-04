// H:\Brain_api\brain\server\stage3\enhancers\freeEnhancer.js

/**
 * Local fallback enhancer
 * - Never throws
 * - Never fails
 * - Guarantees minimal usable output
 */

module.exports = async function freeEnhancer(input) {
  const rawText = (input && input.cleanedText) || "";

  // 🧹 Basic cleanup (safe, local)
  const enhancedText = rawText
    .replace(/\s+/g, " ")
    .replace(/\b(i|im|iam)\b/gi, "I")
    .trim();

  // 🔑 Keyword extraction (safe fallback)
  let keywords = enhancedText
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4);

  // remove duplicates
  keywords = [...new Set(keywords)].slice(0, 5);

  // guarantee keywords
  if (keywords.length === 0) {
    keywords = ["general"];
  }

  // 🗂 Very light category inference
  let category = "general";

  if (keywords.some(k => ["study", "learn", "education"].includes(k))) {
    category = "education";
  } else if (keywords.some(k => ["programming", "code", "software"].includes(k))) {
    category = "technology";
  }

  return {
    enhancedText,
    keywords,
    category,
    enhancementSource: "local",
  };
};
