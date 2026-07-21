import { useState, useEffect } from "react";
import { common } from "@/lib/translations/common";
import { footer } from "@/lib/translations/footer";
import { stepbar } from "@/lib/translations/stepbar";
import { mapembed } from "@/lib/translations/mapembed";
import { notfound } from "@/lib/translations/notfound";
import { landing } from "@/lib/translations/landing";
import { cityProfile } from "@/lib/translations/cityProfile";
import { emissions } from "@/lib/translations/emissions";
import { socioeconomic } from "@/lib/translations/socioeconomic";
import { regulations } from "@/lib/translations/regulations";
import { strategic } from "@/lib/translations/strategic";
import { policy } from "@/lib/translations/policy";
import { financial } from "@/lib/translations/financial";
import { preflight } from "@/lib/translations/preflight";
import { processing } from "@/lib/translations/processing";
import { recommendations } from "@/lib/translations/recommendations";
import { methodology } from "@/lib/translations/methodology";
import { about } from "@/lib/translations/about";
import { definitions } from "@/lib/translations/definitions";
import { gate } from "@/lib/translations/gate";

export type Lang = "en" | "es";

// ─── Module-level store (no React context) ─────────────────────────────────────
// A single source of truth; every useLanguage() subscriber re-renders when it changes.

function getStored(): Lang {
  try { return (localStorage.getItem("hiap:lang") as Lang) || "en"; } catch { return "en"; }
}

let _lang: Lang = getStored();
const _listeners = new Set<() => void>();

function _setLang(l: Lang) {
  if (_lang === l) return;
  _lang = l;
  try { localStorage.setItem("hiap:lang", l); } catch {}
  _listeners.forEach((fn) => fn());
}

// ─── Translations ──────────────────────────────────────────────────────────────
// The ES dictionary is keyed by the English source strings rendered in
// components; entries live in one module per screen under ./translations/.

const ES: Record<string, string> = {
  ...common,
  ...footer,
  ...stepbar,
  ...mapembed,
  ...notfound,
  ...landing,
  ...cityProfile,
  ...emissions,
  ...socioeconomic,
  ...regulations,
  ...strategic,
  ...policy,
  ...financial,
  ...preflight,
  ...processing,
  ...recommendations,
  ...methodology,
  ...about,
  ...definitions,
  ...gate,
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useLanguage() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const notify = () => forceUpdate((n) => n + 1);
    _listeners.add(notify);
    return () => { _listeners.delete(notify); };
  }, []);

  const lang = _lang;

  function t(en: string, vars?: Record<string, string>): string {
    if (import.meta.env.DEV && lang === "es" && !(en in ES)) {
      console.warn("[i18n] missing ES entry:", en);
    }
    let text = lang === "es" ? (ES[en] ?? en) : en;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, v);
      }
    }
    return text;
  }

  return { lang, setLang: _setLang, t };
}
