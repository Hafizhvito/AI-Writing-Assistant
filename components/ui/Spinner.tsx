"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const { t } = useTranslation();

  return (
    <svg
      aria-label={t("loading.ariaLabel")}
      role="status"
      className={cn(
        "animate-spin",
        size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
