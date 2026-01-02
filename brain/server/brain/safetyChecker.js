/**
 * safetyChecker
 * -------------------------
 * Rule-based safety filter
 * No AI calls
 * Deterministic & fast
 */

// H:\Brain_api\brain\server\brain\safetyChecker.js
const SEXUAL_KEYWORDS = [
  "sex",
  "nude",
  "porn",
  "xxx",
  "blowjob",
  "handjob",
  "fuck",
  "fucking",
  "boobs",
  "breasts",
  "vagina",
  "penis",
  "dick",
  "pussy",
  "cum",
  "orgasm",
  "rape",
  "fetish",
];

const ABUSIVE_KEYWORDS = [
  "kill",
  "murder",
  "bomb",
  "terrorist",
  "attack",
  "shoot",
  "die",
  "suicide",
  "hate",
  "racist",
  "nazi",
  "violence",
  "abuse",
  "slur",
];

function safetyChecker(text = "") {
  const lowerText = text.toLowerCase();

  let matches = [];
  let score = 0;

  /* 🔍 Sexual content detection */
  SEXUAL_KEYWORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      matches.push(word);
      score += 0.2;
    }
  });

  /* 🔍 Abusive / violent content detection */
  ABUSIVE_KEYWORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      matches.push(word);
      score += 0.15;
    }
  });

  /* 🧮 Normalize score */
  if (score > 1) score = 1;

  const isUnsafe = score >= 0.3;

  return {
    isUnsafe,
    score: Number(score.toFixed(2)),
    matches,
  };
}

module.exports = safetyChecker;
