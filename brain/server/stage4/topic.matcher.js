// server/stage4/topic.matcher.js

const { MIN_SHARED_CONCEPTS } = require("./stage4.constants");

/**
 * Canonical concept vocabulary (HAND-DEFINED, STABLE)
 * This is the CORE FIX
 */
const CANONICAL_MAP = {
  technology: {
    animation: ["animation", "vfx", "cgi", "motion"],
    production: ["production", "pipeline", "workflow", "projects", "deadlines"],
    finance: ["income", "revenue", "cash flow", "cashflow", "costs", "budget"],
    team: ["artists", "artist", "workload", "team", "staff"],
    clients: ["clients", "client", "customers"],
    management: ["management", "planning", "scheduling", "coordination"],
  },

  career: {
    skills: ["skills", "expertise", "ability"],
    growth: ["growth", "progress", "advancement"],
    learning: ["learning", "education", "training"],
    work: ["work", "job", "profession"],
    confidence: ["confidence", "self belief", "self esteem"],
  },

  health: {
    nutrition: ["nutrition", "diet", "food"],
    activity: ["exercise", "movement", "activity"],
    lifestyle: ["lifestyle", "habits", "routine"],
    energy: ["energy", "fatigue"],
    wellbeing: ["health", "well being", "wellbeing"],
  },
};

/**
 * Convert raw AI keywords → canonical concepts
 */
function canonicalizeKeywords(keywords = [], category) {
  const domainMap = CANONICAL_MAP[category];
  if (!domainMap) return [];

  const concepts = new Set();

  for (const keyword of keywords) {
    const k = keyword.toLowerCase();

    for (const [concept, variants] of Object.entries(domainMap)) {
      if (variants.some(v => k.includes(v))) {
        concepts.add(concept);
      }
    }
  }

  return [...concepts];
}

/**
 * Match incoming suggestion against existing topics
 */
function matchTopic(existingTopics, suggestion) {
  const incomingConcepts = canonicalizeKeywords(
    suggestion.keywords,
    suggestion.category
  );

  let bestMatch = null;
  let bestScore = 0;

  for (const topic of existingTopics) {
    const shared = topic.canonicalKeywords.filter(c =>
      incomingConcepts.includes(c)
    );

    if (shared.length > bestScore) {
      bestScore = shared.length;
      bestMatch = topic;
    }
  }

  return bestScore >= MIN_SHARED_CONCEPTS
    ? { topic: bestMatch, canonicalConcepts: incomingConcepts }
    : { topic: null, canonicalConcepts: incomingConcepts };
}

module.exports = { matchTopic };
