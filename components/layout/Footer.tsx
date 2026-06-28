"use client";

import { Shield } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useTranslation } from "@/hooks/useTranslation";
import WordCount from "@/components/editor/WordCount";

export function Footer() {
  const { t } = useTranslation();
  const text = useEditorStore((s) => s.text);

  return (
    <footer className="flex items-center justify-between px-6 py-2 border-t border-border bg-surface text-xs text-muted select-none">
      <div className="flex items-center gap-1.5">
        <Shield size={12} className="shrink-0" aria-hidden="true" />
        <span>{t("footer.privacy")}</span>
      </div>
      <WordCount text={text} />
    </footer>
  );
}
