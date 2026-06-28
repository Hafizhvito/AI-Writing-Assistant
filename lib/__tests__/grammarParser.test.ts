import { describe, it, expect } from "vitest";
import { parseGrammarResponse } from "@/lib/grammarParser";

describe("parseGrammarResponse", () => {
  it("parses valid JSON array", () => {
    const raw = `[{"id":"1","type":"grammar","original":"teh","suggestion":"the","explanation":"Misspelling"}]`;
    const result = parseGrammarResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].suggestion).toBe("the");
  });

  it("strips markdown fences", () => {
    const raw = '```json\n[{"id":"1","type":"spelling","original":"a","suggestion":"b","explanation":"x"}]\n```';
    expect(parseGrammarResponse(raw)).toHaveLength(1);
  });

  it("returns empty array on invalid JSON", () => {
    expect(parseGrammarResponse("not json")).toEqual([]);
  });
});
