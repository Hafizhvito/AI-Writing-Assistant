"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATIONS, REDUCED_MOTION_TRANSITION } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { GrammarIssueType } from "@/types";

const TYPE_BADGE_CLASS: Record<GrammarIssueType, string> = {
  grammar: "bg-[var(--accent-light)] text-[var(--accent-text)]",
  spelling: "bg-[var(--danger-light)] text-[var(--danger)]",
  style: "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
  punctuation: "bg-[var(--success-light)] text-[var(--success)]",
};

function SkeletonCard() {
  return (
    <div
      className="rounded-lg p-4 border border-[var(--border-default)] animate-pulse"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-[var(--bg-hover)]" />
      </div>
      <div className="h-3 w-3/4 rounded bg-[var(--bg-hover)] mb-2" />
      <div className="h-3 w-1/2 rounded bg-[var(--bg-hover)] mb-3" />
      <div className="h-3 w-full rounded bg-[var(--bg-hover)] mb-1" />
      <div className="h-3 w-5/6 rounded bg-[var(--bg-hover)] mb-4" />
      <div className="h-8 w-16 rounded-md bg-[var(--bg-hover)]" />
    </div>
  );
}

export function GrammarPanel() {
  const { t } = useTranslation();
  const {
    grammarIssues,
    isLoading,
    loadingAction,
    setActivePanel,
    applyGrammarFix,
    applyAllGrammarFixes,
  } = useEditorStore();

  const reducedMotion = useReducedMotion();
  const anim = ANIMATIONS.panelSlideIn;
  const transition = reducedMotion
    ? { ...anim.transition, ...REDUCED_MOTION_TRANSITION }
    : anim.transition;

  const showSkeleton = isLoading && loadingAction === "grammar";

  return (
    <motion.aside
      key="grammar-panel"
      initial={reducedMotion ? { opacity: 0 } : anim.initial}
      animate={reducedMotion ? { opacity: 1 } : anim.animate}
      exit={reducedMotion ? { opacity: 0 } : anim.exit}
      transition={transition}
      style={{ width: 340, minWidth: 340 }}
      className="flex flex-col h-full border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      aria-label={t("grammar.panelLabel")}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-2">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {t("grammar.title")}
          </h2>
          {!showSkeleton && grammarIssues.length > 0 && (
            <span
              className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                background: "var(--danger-light)",
                color: "var(--danger)",
                minWidth: 20,
              }}
              aria-label={t("grammar.issuesCount", { n: grammarIssues.length })}
            >
              {grammarIssues.length}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={t("grammar.closePanel")}
          onClick={() => setActivePanel(null)}
          className={cn(
            "rounded-md p-1 transition-colors duration-150",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {/* Loading announcement */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {showSkeleton ? t("grammar.checking") : ""}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showSkeleton ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : grammarIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <CheckCircle2
              size={40}
              style={{ color: "var(--success)" }}
              aria-hidden
            />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {t("grammar.noIssues")}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("grammar.looksGreat")}
            </p>
          </div>
        ) : (
          grammarIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg p-4 border border-[var(--border-default)]"
              style={{ background: "var(--bg-primary)" }}
            >
              {/* Type badge */}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-3",
                  TYPE_BADGE_CLASS[issue.type]
                )}
              >
                {t(`grammar.types.${issue.type}`)}
              </span>

              {/* Original (strikethrough) */}
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                <span
                  className="line-through"
                  style={{ color: "var(--danger)" }}
                >
                  {issue.original}
                </span>
              </p>

              {/* Suggestion */}
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "var(--success)" }}
              >
                {issue.suggestion}
              </p>

              {/* Explanation */}
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {issue.explanation}
              </p>

              <Button
                variant="ghost"
                onClick={() => applyGrammarFix(issue.id)}
                className="text-xs px-2.5 py-1.5 h-auto"
              >
                {t("common.apply")}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Sticky footer — Apply All */}
      {!showSkeleton && grammarIssues.length > 0 && (
        <div
          className="px-4 py-3 border-t border-[var(--border-default)]"
          style={{ background: "var(--bg-surface)" }}
        >
          <Button
            variant="primary"
            className="w-full"
            onClick={applyAllGrammarFixes}
          >
            <AlertCircle size={14} aria-hidden />
            {t("grammar.applyAll", { n: grammarIssues.length })}
          </Button>
        </div>
      )}
    </motion.aside>
  );
}
