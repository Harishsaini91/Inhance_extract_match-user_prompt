// H:\Brain_api\brain\server\stage3\core\cleanUserText.js

/**
 * cleanUserText.js
 *
 * 
 *  ----------------
 * Normalizes raw user input for AI or local processing.
 *
 * Responsibilities:
 * - Trim extra spaces
 * - Normalize line breaks
 * - Remove control characters
 * - Keep original meaning intact
 *
 * ❌ Does NOT extract keywords
 * ❌ Does NOT categorize
 * ❌ Does NOT rewrite meaning
 */

module.exports = function cleanUserText(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/[\r\n\t]+/g, " ")   // normalize whitespace
    .replace(/\s+/g, " ")         // collapse multiple spaces
    .replace(/[^\x20-\x7E]/g, "") // remove non-printable chars
    .trim();
};
