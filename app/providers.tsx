"use client";

import { LocaleProvider } from "@/components/providers/LocaleProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
