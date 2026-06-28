"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  SpellCheck,
  Wand2,
  FileText,
  Maximize2,
  RefreshCw,
  Repeat2,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATIONS, REDUCED_MOTION_TRANSITION } from "@/lib/animations";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import type { AiAction } from "@/types";

interface ActionConfig {
  action: AiAction;
  label: string;
  icon: React.ElementType;
  shortcut: string;
}

const ACTIONS: ActionConfig[] = [
  { action: "improve", label: "Improve", icon: Wand2, shortcut: "⌘I" },
  { action: "grammar", label: "Grammar", icon: SpellCheck, shortcut: "⌘G" },
  { action: "summarize", label: "Summarize", icon: FileText, shortcut: "⌘J" },
  { action: "expand", label: "Expand", icon: Maximize2, shortcut: "⌘E" },
  { action: "rewrite", label: "Rewrite", icon: RefreshCw, shortcut: "⌘R" },
  { action: "rephrase", label: "Rephrase", icon: Repeat2, shortcut: "" },
];

interface ActionToolbarProps {
  hasSelection?: boolean;
}

export function ActionToolbar({ hasSelection }: ActionToolbarProps) {
  const { text, isLoading, loadingAction, runAiAction, selection } =
    useEditorStore();
  const reducedMotion = useReducedMotion();

  const hasActiveSelection =
    hasSelection ?? !!(selection && selection.start !== selection.end);
  const isVisible = hasActiveSelection || text.length >= 10;

  const anim = ANIMATIONS.toolbarFadeUp;
  const transition = reducedMotion
    ? { ...anim.transition, ...REDUCED_MOTION_TRANSITION }
    : anim.transition;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="action-toolbar"
          initial={reducedMotion ? { opacity: 0 } : anim.initial}
          animate={reducedMotion ? { opacity: 1 } : anim.animate}
          exit={reducedMotion ? { opacity: 0 } : anim.exit}
          transition={transition}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
            "flex items-center gap-1 px-2 py-1.5",
            "rounded-full",
            "bg-[var(--bg-surface)] border border-[var(--border-default)]",
            "shadow-lg"
          )}
          role="toolbar"
          aria-label="AI actions"
        >
          {ACTIONS.map(({ action, label, icon: Icon, shortcut }) => {
            const actionLoading = isLoading && loadingAction === action;

            return (
              <Tooltip
                key={action}
                hint={label}
                shortcut={shortcut || undefined}
              >
                <button
                  type="button"
                  disabled={isLoading}
                  aria-label={shortcut ? `${label} (${shortcut})` : label}
                  aria-busy={actionLoading}
                  onClick={() => runAiAction(action)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "text-xs font-medium",
                    "transition-colors duration-150",
                    "text-[var(--text-secondary)]",
                    "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    actionLoading &&
                      "bg-[var(--accent-light)] text-[var(--accent-text)]"
                  )}
                >
                  <Icon
                    size={14}
                    className={cn(
                      "shrink-0",
                      actionLoading && "animate-spin"
                    )}
                    aria-hidden
                  />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </Tooltip>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
