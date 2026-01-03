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

Rewrite the user idea into clear, professional, technically accurate language.

RULES:
- Fix spelling and grammar
- Remove casual, emotional, or personal wording
- Use neutral, industry-standard language
- Do NOT add opinions or motivation
- Do NOT explain what you are doing
- Do NOT use markdown, bullets, or numbering
- Do NOT return JSON

STRICT OUTPUT FORMAT (NO EXTRA TEXT):

ENHANCED_TEXT:
<single professional paragraph>

KEYWORDS:
<comma-separated keywords>

CATEGORY:
<single lowercase word>

If format cannot be followed exactly, output:
INVALID
            `.trim(),
          },
          {
            role: "user",
            content: input.cleanedText,
          },
        ],
      }),
    });
  } catch {
    throw new Error("AI_FETCH_FAILED");
  }

  const data = await response.json();

  if (
    !data ||
    !data.choices ||
    !data.choices[0] ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    throw new Error("AI_INVALID_RESPONSE");
  }

  return data.choices[0].message.content;
};
