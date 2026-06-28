import { create } from "zustand";
import type { Locale } from "@/lib/i18n/translations";

const STORAGE_KEY = "writeflow:locale";

function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("id")) return "id";
  } catch {
    // ignore
  }
  return "en";
}

interface LocaleStore {
  locale: Locale;
  hydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "en",
  hydrated: false,
  hydrate: () => {
    const locale = readLocale();
    set({ locale, hydrated: true });
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  },
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    set({ locale });
  },
}));
