"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Wand2,
  SpellCheck2,
  AlignLeft,
  ChevronsUpDown,
  RefreshCw,
  Quote,
  Save,
  Download,
  SunMoon,
  GitCompare,
  Keyboard,
  X,
  Search,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

type GroupKey = "ai" | "document" | "view" | "navigation";

interface Command {
  id: string;
  label: string;
  group: GroupKey;
  keywords: string[];
  shortcut?: string;
  icon: LucideIcon;
}

const GROUP_KEYS: GroupKey[] = ["ai", "document", "view", "navigation"];

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return true;
  if (t.includes(q)) return true;
  // subsequence match
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function filterCommands(query: string, commands: Command[]): Command[] {
  if (!query.trim()) return commands;
  return commands.filter((cmd) => {
    const target = [cmd.label, ...cmd.keywords].join(" ");
    return fuzzyMatch(query, target);
  });
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCommand: (id: string) => void;
}

export function CommandPalette({ open, onClose, onCommand }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allCommands = useMemo<Command[]>(
    () => [
      {
        id: "improve",
        label: t("actions.improveFull"),
        group: "ai",
        keywords: ["ai", "enhance", "better", "polish", "fix", "improve", "writing"],
        shortcut: "⌘I",
        icon: Wand2,
      },
      {
        id: "grammar",
        label: t("actions.grammarFull"),
        group: "ai",
        keywords: ["spelling", "punctuation", "errors", "check", "grammar"],
        shortcut: "⌘G",
        icon: SpellCheck2,
      },
      {
        id: "summarize",
        label: t("actions.summarize"),
        group: "ai",
        keywords: ["brief", "short", "summary", "condense", "shorten", "summarize"],
        shortcut: "⌘J",
        icon: AlignLeft,
      },
      {
        id: "expand",
        label: t("actions.expand"),
        group: "ai",
        keywords: ["lengthen", "elaborate", "detail", "more", "longer", "expand"],
        shortcut: "⌘E",
        icon: ChevronsUpDown,
      },
      {
        id: "rewrite",
        label: t("actions.rewrite"),
        group: "ai",
        keywords: ["rework", "redo", "tone", "transform", "regenerate", "rewrite"],
        shortcut: "⌘R",
        icon: RefreshCw,
      },
      {
        id: "rephrase",
        label: t("actions.rephrase"),
        group: "ai",
        keywords: ["paraphrase", "reword", "different", "wording", "alternative", "rephrase"],
        icon: Quote,
      },
      {
        id: "save-snapshot",
        label: t("commandPalette.saveSnapshot"),
        group: "document",
        keywords: ["save", "backup", "version", "history", "preserve", "snapshot"],
        shortcut: "⌘S",
        icon: Save,
      },
      {
        id: "export",
        label: t("commandPalette.exportDocument"),
        group: "document",
        keywords: ["download", "markdown", "copy", "file", "share", "export"],
        icon: Download,
      },
      {
        id: "toggle-theme",
        label: t("commandPalette.toggleTheme"),
        group: "view",
        keywords: ["dark", "light", "mode", "color", "appearance", "theme"],
        shortcut: "⌘D",
        icon: SunMoon,
      },
      {
        id: "toggle-diff",
        label: t("commandPalette.toggleDiff"),
        group: "view",
        keywords: ["diff", "compare", "changes", "delta", "before", "after"],
        icon: GitCompare,
      },
      {
        id: "shortcuts",
        label: t("commandPalette.keyboardShortcuts"),
        group: "view",
        keywords: ["help", "keys", "hotkeys", "cheatsheet", "reference", "shortcuts"],
        shortcut: "?",
        icon: Keyboard,
      },
      {
        id: "close-panel",
        label: t("commandPalette.closePanel"),
        group: "navigation",
        keywords: ["close", "dismiss", "hide", "panel", "exit"],
        shortcut: "Esc",
        icon: X,
      },
    ],
    [t]
  );

  const groupLabels = useMemo(
    () => ({
      ai: t("commandPalette.groups.ai"),
      document: t("commandPalette.groups.document"),
      view: t("commandPalette.groups.view"),
      navigation: t("commandPalette.groups.navigation"),
    }),
    [t]
  );

  const filtered = filterCommands(query, allCommands);
  const grouped = GROUP_KEYS.map((group) => ({
    group,
    label: groupLabels[group],
    commands: filtered.filter((c) => c.group === group),
  })).filter((g) => g.commands.length > 0);
  const flatCommands = grouped.flatMap((g) => g.commands);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      const id = setTimeout(() => inputRef.current?.focus(), 16);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx((prev) => Math.min(prev, Math.max(flatCommands.length - 1, 0)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatCommands.length]);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
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
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIdx((i) => Math.min(i + 1, flatCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIdx((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatCommands[activeIdx]) {
            onCommand(flatCommands[activeIdx].id);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatCommands, activeIdx, onCommand, onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
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
        aria-label={t("commandPalette.title")}
        className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]"
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={true}
            aria-controls="command-palette-list"
            aria-autocomplete="list"
            aria-label={t("commandPalette.search")}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
            placeholder={t("commandPalette.placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
          />
          <kbd className="hidden items-center gap-1 rounded border border-[var(--border-default)] bg-[var(--bg-overlay)] px-1.5 py-0.5 text-xs font-medium text-[var(--text-muted)] sm:inline-flex">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} id="command-palette-list" className="max-h-[360px] overflow-y-auto py-1.5">
          {grouped.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              {t("commandPalette.noResults")}
            </p>
          ) : (
            grouped.map(({ group, label, commands }) => (
              <div key={group}>
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {label}
                </p>
                {commands.map((cmd) => {
                  const idx = flatCommands.indexOf(cmd);
                  const isActive = idx === activeIdx;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      data-active={isActive}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-[var(--accent-light)] text-[var(--accent-text)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      )}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => {
                        onCommand(cmd.id);
                        onClose();
                      }}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-[var(--accent-text)]" : "text-[var(--text-muted)]"
                        )}
                      />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="inline-flex items-center gap-0.5 rounded border border-[var(--border-default)] bg-[var(--bg-overlay)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-[var(--border-default)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
          <span>{t("commandPalette.footerNav")}</span>
          <span>{t("commandPalette.footerEnter")}</span>
          <span>{t("commandPalette.footerEsc")}</span>
        </div>
      </div>
    </div>
  );
}
