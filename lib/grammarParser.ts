import { grammarIssueSchema } from "@/lib/validations";
import type { GrammarIssue } from "@/types";

export function parseGrammarResponse(raw: string): GrammarIssue[] {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    const issues: GrammarIssue[] = [];
    for (const item of parsed) {
      const result = grammarIssueSchema.safeParse(item);
      if (result.success) issues.push(result.data);
    }
    return issues;
  } catch {
    return [];
  }
}
