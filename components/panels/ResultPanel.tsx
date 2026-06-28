"use client";

import { motion } from "framer-motion";
import { X, Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATIONS, REDUCED_MOTION_TRANSITION } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import DiffViewer from "@/components/editor/DiffViewer";
import { cn } from "@/lib/utils";

export function ResultPanel() {
  const { t } = useTranslation();
  const {
    aiResult,
    aiError,
    text,
    isLoading,
    showDiff,
    lastAiAction,
    setShowDiff,
    setActivePanel,
    applyResult,
    discardResult,
    runAiAction,
  } = useEditorStore();

  const reducedMotion = useReducedMotion();
  const anim = ANIMATIONS.panelSlideIn;
  const transition = reducedMotion
    ? { ...anim.transition, ...REDUCED_MOTION_TRANSITION }
    : anim.transition;

  return (
    <motion.aside
      key="result-panel"
      initial={reducedMotion ? { opacity: 0 } : anim.initial}
      animate={reducedMotion ? { opacity: 1 } : anim.animate}
      exit={reducedMotion ? { opacity: 0 } : anim.exit}
      transition={transition}
      style={{ width: 340, minWidth: 340 }}
      className="flex flex-col h-full border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      aria-label={t("result.panelLabel")}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]"
        style={{ background: "var(--bg-surface)" }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("result.title")}
        </h2>
        <button
          type="button"
          aria-label={t("result.closePanel")}
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiError ? (
          /* Error state */
          <div
            className="rounded-lg p-4 border"
            style={{
              background: "var(--danger-light)",
              borderColor: "var(--danger)",
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: "var(--danger)" }}
                aria-hidden
              />
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {aiError}
              </p>
            </div>
            {lastAiAction && (
              <Button
                variant="ghost"
                onClick={() => runAiAction(lastAiAction)}
                disabled={isLoading}
                loading={isLoading}
                className="text-xs px-2.5 py-1.5 h-auto gap-1.5"
              >
                <RefreshCw size={12} aria-hidden />
                {t("common.retry")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Show changes toggle */}
            <button
              type="button"
              onClick={() => setShowDiff(!showDiff)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                "rounded-md px-2.5 py-1.5 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                showDiff
                  ? "bg-[var(--accent-light)] text-[var(--accent-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
              aria-pressed={showDiff}
            >
              {showDiff ? <EyeOff size={13} aria-hidden /> : <Eye size={13} aria-hidden />}
              {showDiff ? t("result.hideChanges") : t("result.showChanges")}
            </button>

            {showDiff && aiResult ? (
              <DiffViewer original={text} revised={aiResult} />
            ) : (
              /* Preview */
              <div
                className="rounded-lg p-4 border border-[var(--border-default)] text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {aiResult ?? ""}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer actions — only shown when there's a result (no error) */}
      {!aiError && (
        <div
          className="flex gap-2 px-4 py-3 border-t border-[var(--border-default)]"
          style={{ background: "var(--bg-surface)" }}
        >
          <Button
            variant="primary"
            className="flex-1"
            onClick={applyResult}
            disabled={!aiResult}
          >
            {t("common.replace")}
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={discardResult}
          >
            {t("common.discard")}
          </Button>
        </div>
      )}
    </motion.aside>
  );
}
