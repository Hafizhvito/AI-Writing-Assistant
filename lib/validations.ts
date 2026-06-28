import { z } from "zod";

export const aiActionSchema = z.enum([
  "improve",
  "grammar",
  "summarize",
  "expand",
  "rewrite",
  "rephrase",
]);

export const toneSchema = z.enum([
  "professional",
  "casual",
  "friendly",
  "persuasive",
  "academic",
  "creative",
]);

export const requestSchema = z.object({
  action: aiActionSchema,
  text: z.string().min(10, "Text too short").max(10000, "Text too long (max 10,000 characters)").trim(),
  tone: toneSchema.optional(),
});

export const grammarIssueSchema = z.object({
  id: z.string(),
  type: z.enum(["grammar", "spelling", "style", "punctuation"]),
  original: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
});

export type AiRequest = z.infer<typeof requestSchema>;
