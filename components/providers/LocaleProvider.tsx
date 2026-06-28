"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/localeStore";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useLocaleStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
