"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  hint: string;
  shortcut?: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ hint, shortcut, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "flex items-center gap-1.5 whitespace-nowrap",
            "rounded-md px-2.5 py-1.5 text-xs",
            "bg-[var(--bg-overlay)] text-[var(--text-primary)]",
            "border border-[var(--border-default)]",
            "shadow-md"
          )}
        >
          {hint}
          {shortcut && (
            <kbd
              className={cn(
                "rounded px-1 py-0.5 text-[10px] font-mono",
                "bg-[var(--bg-surface)] border border-[var(--border-strong)]",
                "text-[var(--text-secondary)]"
              )}
            >
              {shortcut}
            </kbd>
          )}
        </span>
      )}
    </span>
  );
}
