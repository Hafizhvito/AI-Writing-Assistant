"use client";

import { useEffect, useRef, useMemo } from "react";
import { Keyboard, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "./Button";

interface Shortcut {
  keys: string[];
  descriptionKey: string;
}

const SHORTCUT_DEFS: Shortcut[] = [
  { keys: ["⌘", "K"], descriptionKey: "shortcuts.items.palette" },
  { keys: ["⌘", "I"], descriptionKey: "shortcuts.items.improve" },
  { keys: ["⌘", "G"], descriptionKey: "shortcuts.items.grammar" },
  { keys: ["⌘", "J"], descriptionKey: "shortcuts.items.summarize" },
  { keys: ["⌘", "E"], descriptionKey: "shortcuts.items.expand" },
  { keys: ["⌘", "R"], descriptionKey: "shortcuts.items.rewrite" },
  { keys: ["⌘", "D"], descriptionKey: "shortcuts.items.theme" },
  { keys: ["⌘", "S"], descriptionKey: "shortcuts.items.snapshot" },
  { keys: ["Esc"], descriptionKey: "shortcuts.items.close" },
  { keys: ["?"], descriptionKey: "shortcuts.items.cheatsheet" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const shortcuts = useMemo(
    () =>
      SHORTCUT_DEFS.map(({ keys, descriptionKey }) => ({
        keys,
        description: t(descriptionKey),
      })),
    [t]
  );

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => closeBtnRef.current?.focus(), 16);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Focus trap + Esc
  useEffect(() => {
    if (!open) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 id="shortcuts-title" className="text-sm font-semibold text-[var(--text-primary)]">
              {t("shortcuts.title")}
            </h2>
          </div>
          <Button
            ref={closeBtnRef}
            variant="ghost"
            className="h-auto p-1"
            onClick={onClose}
            aria-label={t("shortcuts.close")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Shortcuts grid */}
        <div className="grid grid-cols-1 gap-x-8 p-5 sm:grid-cols-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-[var(--border-default)] py-2.5 last:border-0 sm:[&:nth-last-child(2)]:border-0"
            >
              <span className="text-sm text-[var(--text-secondary)]">
                {shortcut.description}
              </span>
              <div className="ml-4 flex shrink-0 items-center gap-1">
                {shortcut.keys.map((key, ki) => (
                  <kbd
                    key={ki}
                    className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--bg-overlay)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-primary)]"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-default)] px-5 py-3 text-[11px] text-[var(--text-muted)]">
          {t("shortcuts.platformNote")}
        </div>
      </div>
    </div>
  );
}
