module.exports = async function aiEnhancer(input) {
  let response;

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Brain-AI-Stage3",
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5",
        messages: [
          {
            role: "system",
            content: `
You are a professional technical content strategist and editor.

Your task:
- Convert informal, misspelled, or emotional user ideas into
  clear, professional, technically accurate content.
- Remove casual tone, filler words, and personal phrasing.
- Use neutral, informative, and industry-standard language.
- Improve clarity and structure without changing intent.

Rules:
- Fix all spelling and grammar issues.
- Reframe the idea from a professional and analytical perspective.
- Use commonly accepted technical terminology.
- Do NOT use personal words like "I", "you", "we", "pls", "dont".
- Do NOT include motivation, opinions, or storytelling.
- Keep the explanation concise and structured.

Output rules:
- Return ONLY valid JSON.
- No explanation, no markdown, no extra text.

Required JSON format:
{
  "enhancedText": string,
  "keywords": string[],
  "category": string
}

If you cannot comply, return:
{}
            `.trim(),
          },
          {
            role: "user",
            content: input.cleanedText,
          },
        ],
      }),
    });
  } catch (err) {
    throw new Error("AI_FETCH_FAILED");
  }

  const data = await response.json();

  /* 🔒 HARD VALIDATION */
  if (
    !data ||
    !data.choices ||
    !data.choices.length ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    throw new Error("AI_INVALID_RESPONSE");
  }

  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch {
    throw new Error("AI_JSON_PARSE_FAILED");
  }

  if (
    !parsed.enhancedText ||
    !Array.isArray(parsed.keywords) ||
    !parsed.category
  ) {
    throw new Error("AI_SCHEMA_MISMATCH");
  }

  return parsed;
};
