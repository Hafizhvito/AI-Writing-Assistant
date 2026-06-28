import { useMemo } from "react";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function useEditorStats(text: string) {
  return useMemo(() => {
    const words = countWords(text);
    const chars = text.length;
    const readingTime = Math.ceil(words / 200);
    return { words, chars, readingTime };
  }, [text]);
}
