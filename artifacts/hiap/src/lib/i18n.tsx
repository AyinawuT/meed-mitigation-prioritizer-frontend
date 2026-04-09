import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, vars?: Record<string, string>) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const ES: Record<string, string> = {
  // ── Navbar ──────────────────────────────────────────────────────────
  "Dashboard": "Panel",
  "Methodology": "Metodología",
  "About": "Acerca de",

  // ── Status badges ────────────────────────────────────────────────────
  "AVAILABLE": "DISPONIBLE",
  "IN PROGRESS": "EN PROCESO",
  "ONBOARDED": "INCORPORADA",
  "NOT STARTED": "SIN INICIAR",
  "COMPLETE": "COMPLETO",
  "HIGH": "ALTA",
  "MEDIUM": "MEDIA",
  "LOW": "BAJA",
  "Start →": "Iniciar →",
  "Continue →": "Continuar →",

  // ── Landing — hero ────────────────────────────────────────────────────
  "Prioritise climate actions for your city": "Prioriza las acciones climáticas para tu ciudad",
  "MEED+ HIAP analyses your city's emissions, policy context, and implementation capacity to recommend the highest-impact mitigation actions — ranked and ready to act on.":
    "MEED+ HIAP analiza las emisiones de tu ciudad, el contexto de políticas y la capacidad de implementación para recomendar las acciones de mitigación de mayor impacto — clasificadas y listas para actuar.",
  "Search by city name (e.g. Iquique, Antofagasta, Arica)...":
    "Busca por nombre de ciudad (ej. Iquique, Antofagasta, Arica)...",

  // ── Landing — stats bar ───────────────────────────────────────────────
  "Mitigation actions": "Acciones de mitigación",
  "Cities onboarded": "Ciudades incorporadas",
  "GPC sectors covered": "Sectores GPC cubiertos",
  "Time to recommendations": "Tiempo hasta recomendaciones",

  // ── Landing — how it works ────────────────────────────────────────────
  "How it works": "Cómo funciona",
  "MEED+ HIAP guides you through four steps to generate a ranked action plan for your city.":
    "MEED+ HIAP te guía a través de cuatro pasos para generar un plan de acción clasificado para tu ciudad.",
  "Select your city": "Selecciona tu ciudad",
  "Search by city name to find your city's profile.":
    "Busca por nombre de ciudad para encontrar el perfil de tu ciudad.",
  "Complete your profile": "Completa tu perfil",
  "Review and confirm emissions data, socioeconomic context, regulations & laws, policy alignment, and strategic preferences.":
    "Revisa y confirma los datos de emisiones, contexto socioeconómico, regulaciones y leyes, alineación de políticas y preferencias estratégicas.",
  "Generate recommendations": "Generar recomendaciones",
  "Run MEED+ HIAP's scoring pipeline across 155 mitigation actions ranked for your city.":
    "Ejecuta el pipeline de puntuación de MEED+ HIAP a través de 155 acciones de mitigación clasificadas para tu ciudad.",
  "Act on the ranking": "Actúa sobre el ranking",
  "Download your ranked action plan and share with your city's climate team.":
    "Descarga tu plan de acción clasificado y compártelo con el equipo climático de tu ciudad.",

  // ── Landing — city card ───────────────────────────────────────────────
  "Total population": "Población total",
  "Total land area": "Área total",
  "Population density": "Densidad poblacional",
  "Open {name} City Profile →": "Abrir perfil de {name} →",

  // ── Landing — cities grid ─────────────────────────────────────────────
  "Cities": "Ciudades",
  "{count} cities across northern Chile. Open a city profile to begin.":
    "{count} ciudades del norte de Chile. Abre un perfil de ciudad para comenzar.",

  // ── CityProfile — breadcrumb & header ────────────────────────────────
  "residents": "habitantes",
  "Complete at least 3 sections first": "Completa al menos 3 secciones primero",
  "Complete at least 3 sections to unlock recommendations":
    "Completa al menos 3 secciones para desbloquear las recomendaciones",
  "{done} sections complete · {prog} in progress · {ns} not started":
    "{done} secciones completas · {prog} en proceso · {ns} sin iniciar",

  // ── CityProfile — section heading & description ───────────────────────
  "City Profile": "Perfil de Ciudad",
  "Complete each section to build the foundation for your action recommendations. Sections marked":
    "Completa cada sección para construir la base de tus recomendaciones de acciones. Las secciones marcadas como",
  "have the greatest impact on ranking accuracy.":
    "tienen el mayor impacto en la precisión del ranking.",

  // ── CityProfile — status bar ──────────────────────────────────────────
  "complete": "completas",
  "in progress": "en proceso",
  "not started": "sin iniciar",
  "No sections started yet": "Ninguna sección iniciada aún",
  "{n} more section{s} needed to unlock recommendations →":
    "{n} sección{s} más para desbloquear las recomendaciones →",
  "Ready to generate recommendations": "Listo para generar recomendaciones",

  // ── CityProfile — key stats ───────────────────────────────────────────
  "Total emissions": "Emisiones totales",
  "Population": "Población",
  "Land area": "Área",
  "Pop. density": "Densidad pobl.",
  "inhabitants per km²": "habitantes por km²",
  "Inventory year {year}": "Año de inventario {year}",

  // ── CityProfile — section titles & descs ─────────────────────────────
  "Emissions Data": "Datos de Emisiones",
  "Your city's GHG inventory by sector. The primary input for action prioritisation.":
    "Inventario de GEI de tu ciudad por sector. El principal insumo para la priorización de acciones.",
  "Socioeconomic Context": "Contexto Socioeconómico",
  "Population, GDP, and key socioeconomic indicators to improve ranking accuracy.":
    "Población, PIB e indicadores socioeconómicos clave para mejorar la precisión del ranking.",
  "Regulations & Laws": "Regulaciones y Leyes",
  "Local legislation and policies that determine which actions are feasible.":
    "Legislación y políticas locales que determinan qué acciones son viables.",
  "Strategic Preferences": "Preferencias Estratégicas",
  "Sector priorities, co-benefits, budget range, and implementation timeline.":
    "Prioridades sectoriales, co-beneficios, rango presupuestario y cronograma de implementación.",
  "Policy Alignment": "Alineación de Políticas",
  "Optional: align recommendations with national, regional and local climate frameworks.":
    "Opcional: alinea las recomendaciones con marcos climáticos nacionales, regionales y locales.",

  // ── Recommendations — page header ─────────────────────────────────────
  "Top mitigation actions for {name}": "Principales acciones de mitigación para {name}",
  "actions ranked": "acciones clasificadas",
  "excluded (legal filter)": "excluidas (filtro legal)",
  "Total city emissions": "Emisiones totales de la ciudad",

  // ── Recommendations — top picks ───────────────────────────────────────
  "My top picks": "Mis selecciones",
  "Top 3 mitigation actions": "Top 3 acciones de mitigación",
  "{n} action{s} selected — use arrows to reorder.": "{n} acción{s} seleccionada{s} — usa las flechas para reordenar.",
  "Highest-ranked actions based on {name}'s data and priorities.":
    "Acciones mejor clasificadas según los datos y prioridades de {name}.",
  "Clear picks": "Limpiar selección",
  "actions excluded (failed mandatory legal requirements)":
    "acciones excluidas (no cumplen requisitos legales obligatorios)",

  // ── Recommendations — cards & table ──────────────────────────────────
  "Ranked action plan": "Plan de acción clasificado",
  "Top pick": "Mejor opción",
  "Recommendations for {name}": "Recomendaciones para {name}",
  "{count} actions ranked for your city": "{count} acciones clasificadas para tu ciudad",
  "Generate plan": "Generar plan",
  "Score breakdown": "Desglose de puntuación",
  "Implementation cost": "Costo de implementación",
  "Timeline": "Plazo",
  "Impact": "Impacto",
  "Alignment": "Alineación",
  "Feasibility": "Viabilidad",
  "Sector": "Sector",
  "View all {count} recommendations": "Ver las {count} recomendaciones",
  "Back to city profile": "Volver al perfil de ciudad",
  "Weights used": "Ponderaciones utilizadas",
  "Re-run with new weights": "Recalcular con nuevas ponderaciones",
  "All ranked actions": "Todas las acciones clasificadas",
  "Search actions...": "Buscar acciones...",
  "All sectors": "Todos los sectores",
  "Filter by sector": "Filtrar por sector",
  "Excluded by filter": "Excluido por filtro",
  "Excluded — legal": "Excluido — legal",
  "No actions match your search": "Ninguna acción coincide con tu búsqueda",

  // ── About ─────────────────────────────────────────────────────────────
  "About MEED+ HIAP": "Acerca de MEED+ HIAP",
  "Visit openearth.org ↗": "Visitar openearth.org ↗",
  "Visit ssg.coop ↗": "Visitar ssg.coop ↗",

  // ── Methodology ───────────────────────────────────────────────────────
  "HOW MEED+ HIAP WORKS": "CÓMO FUNCIONA MEED+ HIAP",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("hiap:lang") : null;
  const [lang, setLangState] = useState<Lang>((stored as Lang) ?? "en");

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("hiap:lang", l); } catch {}
  }

  function t(en: string, vars?: Record<string, string>): string {
    let text = lang === "es" ? (ES[en] ?? en) : en;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, v);
      }
    }
    return text;
  }

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
