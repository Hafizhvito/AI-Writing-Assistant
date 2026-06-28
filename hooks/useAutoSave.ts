import { useEffect, useRef } from "react";
import { saveCurrentDraft } from "@/lib/storage";

export function useAutoSave(text: string, documentTitle: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveCurrentDraft(text, documentTitle);
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, documentTitle]);
}
