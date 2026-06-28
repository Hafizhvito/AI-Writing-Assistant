"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2, X } from "lucide-react";

import { Header, Sidebar, Footer } from "@/components/layout";
import Editor from "@/components/editor/Editor";
import { ActionToolbar, ToneSelector } from "@/components/toolbar";
import { GrammarPanel, ResultPanel } from "@/components/panels";
import {
  ToastContainer,
  CommandPalette,
  ShortcutsModal,
  useToast,
} from "@/components/ui";

import { useEditorStore } from "@/store/editorStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATIONS, REDUCED_MOTION_TRANSITION } from "@/lib/animations";
import type { AiAction } from "@/types";

const AI_ACTIONS: { action: AiAction; label: string }[] = [
  { action: "improve", label: "Improve Writing" },
  { action: "grammar", label: "Grammar Check" },
  { action: "summarize", label: "Summarize" },
  { action: "expand", label: "Expand" },
  { action: "rewrite", label: "Rewrite" },
  { action: "rephrase", label: "Rephrase" },
];

function applyThemeToggle() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // ignore storage errors
  }
}

export default function Home() {
  const {
    text,
    documentTitle,
    activePanel,
    isLoading,
    showDiff,
    setActivePanel,
    setShowDiff,
    hydrateFromStorage,
    runAiAction,
    createSnapshot,
  } = useEditorStore();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileActionOpen, setMobileActionOpen] = useState(false);

  const { addToast } = useToast();
  const reducedMotion = useReducedMotion();

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Auto-save
  useAutoSave(text, documentTitle);

  const handleSnapshot = useCallback(() => {
    createSnapshot();
    addToast("Snapshot saved", "success");
  }, [createSnapshot, addToast]);

  const handleClose = useCallback(() => {
    if (paletteOpen) {
      setPaletteOpen(false);
    } else if (shortcutsOpen) {
      setShortcutsOpen(false);
    } else if (mobileActionOpen) {
      setMobileActionOpen(false);
    } else if (activePanel !== null) {
      setActivePanel(null);
    }
  }, [paletteOpen, shortcutsOpen, mobileActionOpen, activePanel, setActivePanel]);

  useKeyboardShortcuts({
    onPalette: () => setPaletteOpen(true),
    onImprove: () => runAiAction("improve"),
    onGrammar: () => runAiAction("grammar"),
    onSummarize: () => runAiAction("summarize"),
    onExpand: () => runAiAction("expand"),
    onRewrite: () => runAiAction("rewrite"),
    onTheme: applyThemeToggle,
    onSnapshot: handleSnapshot,
    onClose: handleClose,
    onShortcuts: () => setShortcutsOpen(true),
  });

  const handleCommand = useCallback(
    (id: string) => {
      switch (id) {
        case "improve":
        case "grammar":
        case "summarize":
        case "expand":
        case "rewrite":
        case "rephrase":
          runAiAction(id as AiAction);
          break;
        case "save-snapshot":
          handleSnapshot();
          break;
        case "toggle-theme":
          applyThemeToggle();
          break;
        case "toggle-diff":
          setShowDiff(!showDiff);
          break;
        case "shortcuts":
          setShortcutsOpen(true);
          break;
        case "close-panel":
          setActivePanel(null);
          break;
      }
    },
    [runAiAction, handleSnapshot, setShowDiff, showDiff, setActivePanel]
  );

  const bottomSheetAnim = ANIMATIONS.bottomSheetSlideUp;
  const sheetTransition = reducedMotion
    ? { ...bottomSheetAnim.transition, ...REDUCED_MOTION_TRANSITION }
    : bottomSheetAnim.transition;

  return (
    <div className="flex flex-col h-screen bg-base overflow-hidden">
      {/* Notifications */}
      <ToastContainer />

      {/* Fixed overlay components */}
      <Header />
      <Sidebar />

      {/* aria-live region for AI loading state */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isLoading ? "AI is processing your request…" : ""}
      </div>

      {/* Header height spacer */}
      <div className="shrink-0 h-[52px]" aria-hidden="true" />

      {/* Main content row — fills remaining viewport height */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar spacer — pushes editor right on md+ */}
        <div
          className="hidden md:block shrink-0 w-[240px]"
          aria-hidden="true"
        />

        {/* Editor column — scrollable */}
        <main
          id="main-content"
          aria-label="Document editor"
          className="flex-1 min-w-0 overflow-y-auto"
        >
          <Editor />
          <div className="max-w-[720px] mx-auto px-6 pb-4">
            <ToneSelector />
          </div>
          {/* Extra bottom padding so toolbar doesn't obscure last line */}
          <div className="h-24 md:h-20" aria-hidden="true" />
        </main>

        {/* Desktop AI panel — in-flow right column (lg+) */}
        <div className="hidden lg:flex h-full shrink-0">
          <AnimatePresence mode="wait">
            {activePanel === "grammar" && <GrammarPanel key="grammar-desktop" />}
            {activePanel === "result" && <ResultPanel key="result-desktop" />}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 md:pl-[240px]">
        <Footer />
      </div>

      {/* ActionToolbar — already fixed, hidden on mobile via md:flex in ActionToolbar */}
      <ActionToolbar />

      {/* ─── Tablet (md–lg): AI panel as fixed right overlay ─────────────── */}
      <div className="hidden md:block lg:hidden">
        <AnimatePresence mode="wait">
          {activePanel && (
            <div
              key="tablet-panel-wrapper"
              className="fixed right-0 z-40"
              style={{ top: 52, bottom: 0, width: 340 }}
            >
              {activePanel === "grammar" ? (
                <GrammarPanel key="grammar-tablet" />
              ) : (
                <ResultPanel key="result-tablet" />
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Mobile (<md): AI panel as bottom sheet ──────────────────────── */}
      <div className="md:hidden">
        <AnimatePresence>
          {activePanel && (
            <motion.div
              key="mobile-panel-sheet"
              initial={
                reducedMotion ? { opacity: 0 } : bottomSheetAnim.initial
              }
              animate={
                reducedMotion ? { opacity: 1 } : bottomSheetAnim.animate
              }
              exit={reducedMotion ? { opacity: 0 } : bottomSheetAnim.exit}
              transition={sheetTransition}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
              style={{ height: "70vh" }}
              role="dialog"
              aria-modal="true"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="h-1 w-10 rounded-full bg-[var(--border-default)]" />
              </div>
              <div className="h-full overflow-y-auto [&>aside]:border-l-0 [&>aside]:h-full">
                {activePanel === "grammar" ? (
                  <GrammarPanel key="grammar-mobile" />
                ) : (
                  <ResultPanel key="result-mobile" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Mobile FAB + action sheet ───────────────────────────────────── */}
      <div className="md:hidden">
        {/* FAB */}
        <button
          type="button"
          aria-label="Open AI actions"
          onClick={() => setMobileActionOpen(true)}
          disabled={isLoading}
          className="fixed bottom-6 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 size={24} aria-hidden="true" />
        </button>

        {/* Action sheet */}
        <AnimatePresence>
          {mobileActionOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-action-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileActionOpen(false)}
                aria-hidden="true"
              />

              {/* Sheet */}
              <motion.div
                key="mobile-action-sheet"
                initial={
                  reducedMotion ? { opacity: 0 } : bottomSheetAnim.initial
                }
                animate={
                  reducedMotion ? { opacity: 1 } : bottomSheetAnim.animate
                }
                exit={
                  reducedMotion ? { opacity: 0 } : bottomSheetAnim.exit
                }
                transition={sheetTransition}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[var(--border-default)] bg-[var(--bg-surface)] px-4 pb-10 pt-3"
                role="dialog"
                aria-modal="true"
                aria-label="AI actions"
              >
                {/* Drag handle */}
                <div className="flex justify-center pb-3">
                  <div className="h-1 w-10 rounded-full bg-[var(--border-default)]" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    AI Actions
                  </h2>
                  <button
                    type="button"
                    aria-label="Close AI actions"
                    onClick={() => setMobileActionOpen(false)}
                    className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {AI_ACTIONS.map(({ action, label }) => (
                    <button
                      key={action}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setMobileActionOpen(false);
                        runAiAction(action);
                      }}
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-text)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Overlays ────────────────────────────────────────────────────── */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onCommand={handleCommand}
      />

      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
