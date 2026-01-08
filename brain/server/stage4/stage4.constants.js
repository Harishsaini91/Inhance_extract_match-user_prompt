// server/stage4/stage4.constants.js
module.exports = {
  // minimum overlap ratio (0–1)
  OVERLAP_RATIO_THRESHOLD: 0.5,

  // keywords that add noise, not meaning
  STOP_WORDS: [
    "always",
    "because",
    "never",
    "very",
    "many",
    "much",
    "things",
    "thing",
    "people",
    "every",
    "day",
  ],

  MAX_CORE_KEYWORDS: 6,
};
