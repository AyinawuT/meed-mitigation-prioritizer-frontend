import { useState, useCallback, type ReactNode } from "react";
import { Ctx, type Lang } from "@/lib/i18n";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("hiap:lang") : null;
  const [lang, setLangState] = useState<Lang>((stored as Lang) ?? "en");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("hiap:lang", l); } catch {}
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
