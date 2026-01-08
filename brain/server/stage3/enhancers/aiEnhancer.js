// H:\Brain_api\brain\server\stage3\enhancers\aiEnhancer.js

const AI_TIMEOUT_MS = 20_000; // 20 seconds

module.exports = async function aiEnhancer(input) {
  if (!input || !input.cleanedText) {
    throw new Error("AI_INVALID_INPUT");
  }

  console.log("🧪 AI DEBUG MODE INPUT:\n", input.cleanedText);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");


  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Brain-AI-Stage3",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          temperature: 0.15,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: `

You are a backend semantic normalization engine.
Your output is consumed by an automated multi-stage AI system.

CRITICAL OBJECTIVE:
Regardless of input length, style, emotion, or structure,
you MUST extract sufficient semantic signal for reliable topic clustering.

--------------------------------------------------
INPUT CHARACTERISTICS:
User input may include:
- problem descriptions
- reasoning and explanations
- emotions and uncertainty
- partial solutions or outcomes
- long narratives (50+ lines possible)

You MUST normalize all content into structured, domain-level meaning.

--------------------------------------------------
GLOBAL RULES (NON-NEGOTIABLE):

- Optimize for STRUCTURAL CONSISTENCY, not creativity
- Similar topics MUST produce similar keyword sets
- Do NOT ask questions
- Do NOT give advice or instructions
- Do NOT include examples
- Do NOT include opinions or intent descriptions
- Do NOT include markdown or formatting
- Do NOT include headings other than required labels

--------------------------------------------------
SUMMARY RULES:

- Write EXACTLY 3–5 short sentences
- Describe WHAT the topic is (objective meaning only)
- Remove personal language and emotions
- Use neutral, factual, encyclopedic tone
- Do NOT repeat original sentence structure
- No questions, no suggestions

--------------------------------------------------
KEYWORDS RULES (STRICT — CONTROLLED FAILURE):

MANDATORY REQUIREMENT:
important You MUST output AT LEAST 10 valid keywords.
important TARGET RANGE: 12–18 keywords.

If fewer than 10 valid keywords are possible for the topic,
you MUST still extract all available concepts and expand with close domain synonyms.
If this is not possible, output exactly:
INVALID

--------------------------------------------------
KEYWORD EXTRACTION METHOD:

- Identify ALL distinct semantic concepts in the input
- A single topic ALWAYS contains multiple related concepts
- Do NOT stop after capturing the main idea
- Each meaningful concept MUST contribute keywords

For EACH core concept:
- Select ONE stable core noun
-must Add 2–4 close, interchangeable synonyms

--------------------------------------------------
KEYWORD FORMAT & QUALITY CONSTRAINTS:

- Output ONE FLAT, comma-separated list
- Keywords must be nouns or noun phrases ONLY
- Prefer short, atomic terms over long phrases
- All keywords must belong to the SAME domain
- Maintain a CONSISTENT abstraction level
- Limited multi-word phrases are allowed if domain-necessary

--------------------------------------------------
STRICT EXCLUSIONS (DO NOT OUTPUT):

- Verbs or verb forms
- Advice, actions, or intent
- Emotional states (fear, anxiety, confusion, etc.)
- Questions or uncertainty markers
- Generic fillers (time, thing, life, problem, feeling)
- Rare, poetic, or uncommon words
- Meta words (process, framework, system, approach)

--------------------------------------------------
QUALITY PRIORITY:

Completeness > Brevity

It is BETTER to over-extract relevant keywords
than to compress meaning into a minimal list.

--------------------------------------------------
CATEGORY RULES:

Choose EXACTLY ONE domain category:

education, technology, health, finance,
career, government, social, military, general

--------------------------------------------------
STRICT OUTPUT FORMAT (NO EXTRA TEXT):

SUMMARY:
<3–5 sentences>

KEYWORDS:
<comma separated keyword list ( must 10–18 items)>

CATEGORY:
<single lowercase word>

--------------------------------------------------
FAILURE RULE:
Only output INVALID if keyword minimum cannot be satisfied.


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
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      throw new Error("AI_TIMEOUT");
    }

    throw new Error("AI_FETCH_FAILED");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`AI_HTTP_${response.status}`);
  }

  const data = await response.json();

  console.log("🧠 RAW AI API RESPONSE:\n", JSON.stringify(data, null, 2));

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("AI_NO_OUTPUT");
  }

  const trimmed = content.trim();

  if (trimmed === "INVALID") {
    throw new Error("AI_MARKED_INVALID");
  }

  return trimmed;
};
