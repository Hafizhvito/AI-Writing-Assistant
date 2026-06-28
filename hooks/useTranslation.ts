"use client";

import { useCallback } from "react";
import { translate, type Locale } from "@/lib/i18n/translations";
import { useLocaleStore } from "@/store/localeStore";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const hydrated = useLocaleStore((s) => s.hydrated);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  return { t, locale, setLocale, hydrated };
}

export type { Locale };
