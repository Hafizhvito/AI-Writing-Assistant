"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

interface ToneConfig {
  value: Tone;
  labelKey: string;
}

const TONE_DEFS: ToneConfig[] = [
  { value: "professional", labelKey: "tones.professional" },
  { value: "casual", labelKey: "tones.casual" },
  { value: "friendly", labelKey: "tones.friendly" },
  { value: "persuasive", labelKey: "tones.persuasive" },
  { value: "academic", labelKey: "tones.academic" },
  { value: "creative", labelKey: "tones.creative" },
];

export function ToneSelector() {
  const { t } = useTranslation();
  const { selectedTone, setSelectedTone } = useEditorStore();

  const tones = useMemo(
    () =>
      TONE_DEFS.map(({ value, labelKey }) => ({
        value,
        label: t(labelKey),
      })),
    [t]
  );

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="radiogroup"
      aria-label={t("tones.ariaLabel")}
    >
      {tones.map(({ value, label }) => {
        const isSelected = selectedTone === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setSelectedTone(value)}
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-xs font-medium",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              isSelected
                ? "bg-accent text-white"
                : [
                    "bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
                    "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                    "border border-[var(--border-default)]",
                  ]
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
