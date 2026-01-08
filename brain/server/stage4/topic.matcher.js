// server/stage4/topic.matcher.js
const {
  OVERLAP_RATIO_THRESHOLD,
  STOP_WORDS,
  MAX_CORE_KEYWORDS,
} = require("./stage4.constants");

function normalize(arr = []) {
  return arr
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k && !STOP_WORDS.includes(k));
}

// extract core meaning keywords
function extractCoreKeywords(keywords = []) {
  return normalize(keywords).slice(0, MAX_CORE_KEYWORDS);
}

// overlap ratio = common / min(lenA, lenB)
function overlapRatio(a = [], b = []) {
  if (!a.length || !b.length) return 0;

  const setB = new Set(b);
  const common = a.filter((k) => setB.has(k)).length;

  return common / Math.min(a.length, b.length);
}

function matchTopic(existingTopics, suggestion) {
  const incomingCore = extractCoreKeywords(suggestion.keywords);

  let bestMatch = null;
  let bestScore = 0;

  for (const topic of existingTopics) {
    if (topic.category !== suggestion.category) continue;

    const topicCore = extractCoreKeywords(topic.canonicalKeywords);
    const score = overlapRatio(topicCore, incomingCore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestScore >= OVERLAP_RATIO_THRESHOLD
    ? { topic: bestMatch, coreKeywords: incomingCore }
    : null;
}

module.exports = { matchTopic, extractCoreKeywords };
