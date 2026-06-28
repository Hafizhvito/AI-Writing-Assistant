"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useToastStore, type Toast, type ToastType } from "@/store/toastStore";
import { useTranslation } from "@/hooks/useTranslation";
import { ANIMATIONS } from "@/lib/animations";
import { cn } from "@/lib/utils";

const borderColorMap: Record<ToastType, string> = {
  success: "border-l-[var(--success)]",
  error: "border-l-[var(--danger)]",
  info: "border-l-accent",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { t } = useTranslation();
  const removeToast = useToastStore((s) => s.removeToast);

  const labelMap: Record<ToastType, string> = {
    success: t("toast.success"),
    error: t("toast.error"),
    info: t("toast.info"),
  };

  return (
    <motion.div
      key={toast.id}
      layout
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      {...ANIMATIONS.toastSlideIn}
      className={cn(
        "relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]",
        "rounded-md border-l-4 border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] shadow-md px-4 py-3",
        borderColorMap[toast.type]
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-0.5">
          {labelMap[toast.type]}
        </p>
        <p className="text-sm text-[var(--text-primary)] break-words">
          {toast.message}
        </p>
      </div>
      <button
        aria-label={t("a11y.dismissNotification")}
        onClick={() => removeToast(toast.id)}
        className={cn(
          "shrink-0 mt-0.5 rounded p-0.5",
          "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
          "hover:bg-[var(--bg-hover)]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { t } = useTranslation();
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label={t("a11y.notifications")}
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);
  const removeToast = useToastStore((s) => s.removeToast);
  return { addToast, removeToast };
}
