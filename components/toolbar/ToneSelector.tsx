"use client";

import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

interface ToneConfig {
  value: Tone;
  label: string;
}

const TONES: ToneConfig[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
  { value: "academic", label: "Academic" },
  { value: "creative", label: "Creative" },
];

export function ToneSelector() {
  const { selectedTone, setSelectedTone } = useEditorStore();

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="radiogroup"
      aria-label="Writing tone"
    >
      {TONES.map(({ value, label }) => {
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
