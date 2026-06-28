"use client";

import { Languages } from "lucide-react";
import { LOCALES } from "@/lib/i18n/translations";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { t, locale, setLocale } = useTranslation();

  const next = LOCALES.find((l) => l.code !== locale) ?? LOCALES[0];

  return (
    <button
      type="button"
      onClick={() => setLocale(next.code)}
      aria-label={t("language.toggle")}
      title={next.label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold",
        "text-secondary hover:text-primary hover:bg-hover transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      )}
    >
      <Languages size={15} aria-hidden="true" />
      <span className="uppercase tracking-wide">{locale}</span>
    </button>
  );
}
