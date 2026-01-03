// H:\Brain_api\brain\server\stage3\enhancers\aiEnhancer.js

module.exports = async function aiEnhancer(input) {
  console.log("🧪 AI DEBUG MODE INPUT:\n", input.cleanedText);

  let response;
  try {
    response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Brain-AI-Stage3",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          temperature: 0.2,          // 🔒 reduces randomness
          max_tokens: 300,           // enough but controlled
          messages: [
            {
              role: "system",
              content: `
You are a backend content refinement engine.

TASK:
Rewrite the user idea into a short, clear, professional explanation.

RULES:
- Fix spelling and grammar
- Remove emotional and personal language
- Use simple, meaningful words
- Do NOT repeat original sentence structure
- Do NOT give advice or motivation
- Do NOT include examples
- Do NOT include headings or markdown
- Do NOT include explanations

KEYWORDS RULES:
- Extract only topic-relevant keywords
- Avoid generic words (time, thing, problem)
- Maximum 6 keywords

CATEGORY RULES:
Choose ONE only from:
education, technology, health, finance, career, government, social, military, general

STRICT OUTPUT FORMAT (NO EXTRA TEXT):

SUMMARY:
<3–5 short sentences>

KEYWORDS:
<comma separated keywords>

CATEGORY:
<single lowercase word>

If you cannot follow the format exactly, output:
INVALID
              `.trim(),
            },
            {
              role: "user",
              content: input.cleanedText,
            },
          ],
        }),
      }
    );
  } catch (err) {
    throw new Error("AI_FETCH_FAILED");
  }

  const data = await response.json();

  console.log("🧠 RAW AI API RESPONSE:\n", JSON.stringify(data, null, 2));

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("AI_NO_OUTPUT");
  }

  return content.trim();
};
