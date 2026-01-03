/**
 * parseAIInsight.js
 * -----------------
 * Strict parser for AI plain-text responses.
 *
 * Expected AI format:
 *
 * SUMMARY:
 * <text>
 *
 * KEYWORDS:
 * <comma separated keywords>
 *
 * CATEGORY:
 * <single lowercase word>
 */

// H:\Brain_api\brain\server\stage3\core\parseAIInsight.js

const ALLOWED_CATEGORIES = [
  "education",
  "technology",
  "health",
  "finance",
  "career",
  "government",
  "social",
  "military",
  "general",
];

module.exports = function parseAIInsight(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  const text = rawText.trim();

  // ❌ Explicit AI failure signal
  if (text === "INVALID") {
    throw new Error("AI_MARKED_INVALID");
  }

  /* ---------- Extract blocks ---------- */

  const summaryMatch = text.match(
    /SUMMARY:\s*([\s\S]*?)\n\s*\n\s*KEYWORDS:/i
  );

  const keywordsMatch = text.match(
    /KEYWORDS:\s*([\s\S]*?)\n\s*\n\s*CATEGORY:/i
  );

  const categoryMatch = text.match(
    /CATEGORY:\s*(.+)$/i
  );

  if (!summaryMatch || !keywordsMatch || !categoryMatch) {
    throw new Error("AI_FORMAT_MISMATCH");
  }

  /* ---------- Normalize summary ---------- */

  const enhancedText = summaryMatch[1]
    .replace(/\s+/g, " ")
    .trim();

  if (enhancedText.length < 40) {
    throw new Error("AI_SUMMARY_TOO_WEAK");
  }

  /* ---------- Normalize keywords ---------- */

  const keywords = keywordsMatch[1]
    .split(",")
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2)
    .filter((v, i, a) => a.indexOf(v) === i) // remove duplicates
    .slice(0, 6);

  if (keywords.length < 3) {
    throw new Error("AI_KEYWORDS_INSUFFICIENT");
  }

  /* ---------- Normalize category ---------- */

  const category = categoryMatch[1]
    .trim()
    .toLowerCase();

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error("AI_CATEGORY_INVALID");
  }

  /* ---------- Final structured output ---------- */

  return {
    enhancedText,
    keywords,
    category,
  };
};
