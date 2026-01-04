// H:\Brain_api\brain\server\stage3\strategy\enhancementStrategy.js

/**
 * Strategy decisions:
 * - TRY_AI       → attempt AI enhancement
 * - USE_LOCAL    → use local core logic
 * - WAIT         → skip document until nextRetryAt
 */

module.exports = function enhancementStrategy(doc) {
  const mode = process.env.ENHANCER_STRATEGY || "hybrid";
  // allowed: "ai-only", "hybrid"

  const now = Date.now();

  /* ⏳ Time gate (AI-only pause window) */
  if (doc.nextRetryAt && doc.nextRetryAt.getTime() > now) {
    return {
      action: "WAIT",
      reason: "retry_window_active",
    };
  }

  /* 🤖 AI-ONLY MODE */
  if (mode === "ai-only") {
    if (doc.aiFailCount >= 3) {
      return {
        action: "WAIT",
        reason: "ai_failed_3_times",
        retryAfterMs: 30 * 60 * 1000, // 30 minutes
        resetFailCount: true,
      };
    }

    return {
      action: "TRY_AI",
    };
  }

  /* 🧠 HYBRID MODE */
  if (doc.aiFailCount >= 3) {
    return {
      action: "USE_LOCAL",
      reason: "ai_failed_3_times",
    };
  }

  return {
    action: "TRY_AI",
  };
};
