"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function Editor() {
  const { t } = useTranslation();
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);
  const setSelection = useEditorStore((s) => s.setSelection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const captureSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      setSelection(null);
    } else {
      setSelection({ start, end, text: el.value.slice(start, end) });
    }
  }, [setSelection]);

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onSelect={captureSelection}
      onKeyUp={captureSelection}
      onMouseUp={captureSelection}
      aria-label={t("editor.ariaLabel")}
      placeholder={t("editor.placeholder")}
      className="w-full max-w-[720px] mx-auto block resize-none overflow-hidden border-none outline-none bg-base text-primary px-6 py-8 min-h-[60vh] placeholder:text-muted"
      style={{ lineHeight: 1.8, fontSize: "1.0625rem" }}
    />
  );
}
