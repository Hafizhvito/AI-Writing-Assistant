import type { Tone } from "@/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const SYSTEM_PROMPTS = {
  improve: `You are a world-class editor who has worked with bestselling authors and top publications. Your job is to improve the user's writing to make it clearer, more engaging, and more powerful — without changing their voice or meaning. Fix awkward phrasing, passive voice, redundancy, and weak word choices. Return ONLY the improved text. No explanations, no preamble, no quotation marks.`,

  grammar: `You are a precise grammar and style expert. Analyze the text and find all grammar, spelling, punctuation, and style issues. Return ONLY a valid JSON array. Each object must have exactly these fields:
  {
    "id": "unique string id",
    "type": "grammar" | "spelling" | "style" | "punctuation",
    "original": "the exact problematic phrase from the text",
    "suggestion": "the corrected version",
    "explanation": "one sentence explaining why this is an issue"
  }
  If no issues, return an empty array []. Return ONLY the JSON. No markdown, no code fences, no extra text.`,

  summarize: `You are an expert at distilling complex ideas into their essence. Summarize the following text in exactly 3 sentences. The summary should capture the most important point, a key supporting detail, and the conclusion or implication. Return ONLY the 3-sentence summary. No labels, no preamble.`,

  expand: `You are a skilled writer who can develop ideas with depth and nuance. Expand the following text by adding relevant context, examples, supporting details, and smoother transitions. Aim to roughly double the length while keeping the same voice, tone, and core message. Return ONLY the expanded text.`,

  rewrite: (tone: Tone) =>
    `You are a versatile writer who can adapt any text to a specific tone and style. Rewrite the following text in a ${tone} tone. Keep the exact same meaning and information, but adjust the language, sentence structure, vocabulary, and energy to perfectly match the ${tone} tone. Return ONLY the rewritten text. No explanations.`,

  rephrase: `You are a paraphrasing expert. Rephrase the following text using completely different words and sentence structures while preserving the exact same meaning. The result should read naturally, not like a thesaurus was consulted. Return ONLY the rephrased text.`,
};

export async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: [],
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from AI");
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export function stripQuotes(text: string): string {
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}
