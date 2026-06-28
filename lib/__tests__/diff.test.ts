import { describe, it, expect } from "vitest";
import { wordDiff } from "@/lib/diff";

describe("wordDiff", () => {
  it("marks removed and added words", () => {
    const result = wordDiff("hello world", "hello there");
    expect(result.some((p) => p.type === "removed" && p.text === "world")).toBe(true);
    expect(result.some((p) => p.type === "added" && p.text === "there")).toBe(true);
  });
});
