// Policy Alignment page (PolicyAlignment.tsx).
// Keys are the English source strings rendered in components.
// Note: "Policy Alignment" itself lives in cityProfile.ts; "City not found.",
// "Save & continue →" and "Save & return to pre-flight →" live in strategic.ts.
export const policy: Record<string, string> = {
  // ── Header ──────────────────────────────────────────────────────────
  "Optional": "Opcional",
  "Aceleradora Local de Mitigación has assessed each candidate action against national, regional, and municipal climate policy. Policy alignment shapes how actions are ranked — better-backed actions score higher.":
    "Aceleradora Local de Mitigación ha evaluado cada acción candidata frente a la política climática nacional, regional y municipal. La alineación de políticas influye en cómo se clasifican las acciones — las acciones con mayor respaldo obtienen una puntuación más alta.",
  "ALM ALIGNMENT: Policy alignment contributes 75% to the city's alignment score · Alignment shapes 22% of ranking":
    "ALINEACIÓN ALM: La alineación de políticas aporta el 75% de la puntuación de alineación de la ciudad · La alineación determina el 22% del ranking",

  // ── Data source note ────────────────────────────────────────────────
  "Policy signals sourced from {n} national, {r} regional and {m} municipal plans for":
    "Señales de política obtenidas de {n} planes nacionales, {r} regionales y {m} municipales para",
  "· {n} candidate actions checked for policy backing":
    "· {n} acciones candidatas revisadas en busca de respaldo de políticas",

  // ── Score cards ─────────────────────────────────────────────────────
  "National plan": "Plan nacional",
  "Regional plan": "Plan regional",
  "Municipal plan": "Plan municipal",
  "alignment": "alineación",
  "Strong alignment": "Alineación fuerte",
  "Moderate alignment": "Alineación moderada",
  "Limited alignment": "Alineación limitada",
  "No plan uploaded": "Sin plan subido",
  "Uploaded — awaiting processing": "Subido — en espera de procesamiento",
  "Average policy support score across {n} national mitigation plans · {a} actions assessed":
    "Puntuación promedio de respaldo de políticas en {n} planes nacionales de mitigación · {a} acciones evaluadas",
  "Average signal strength across {n} regional plan · {c} of {total} actions with regional coverage":
    "Fuerza promedio de las señales en {n} plan regional · {c} de {total} acciones con cobertura regional",
  "Average signal strength across {n} municipal plan · {c} of {total} actions with municipal coverage":
    "Fuerza promedio de las señales en {n} plan municipal · {c} de {total} acciones con cobertura municipal",
  "{file} received · municipal alignment score will be added when processed":
    "{file} recibido · la puntuación de alineación municipal se añadirá cuando sea procesado",
  "Upload your PACCC or local climate plan to add a municipal alignment score":
    "Sube tu PACCC o plan climático local para añadir una puntuación de alineación municipal",

  // ── Scope sections ──────────────────────────────────────────────────
  "National Plans": "Planes Nacionales",
  "Regional Plans": "Planes Regionales",
  "Municipal Plans": "Planes Municipales",
  "Region": "Región",
  "{n} plans": "{n} planes",
  "{n} plan": "{n} plan",
  "1 plan uploaded": "1 plan subido",
  "No data": "Sin datos",

  // ── Municipal upload ────────────────────────────────────────────────
  "Upload your municipal climate plan": "Sube tu plan climático municipal",
  "Drag and drop or click to browse · PDF or Word document":
    "Arrastra y suelta o haz clic para explorar · Documento PDF o Word",
  "Upload your PACCC, PLADECO, or local climate action plan. Our team will download and process the document to extract policy signals, which will then be added to the ranking in a future update — it will not be reflected immediately.":
    "Sube tu PACCC, PLADECO o plan de acción climática local. Nuestro equipo descargará y procesará el documento para extraer señales de política, que se añadirán al ranking en una actualización futura — no se reflejará de inmediato.",
  "Uploaded · {kb} KB · Awaiting processing": "Subido · {kb} KB · En espera de procesamiento",
  "Remove": "Eliminar",

  // ── Plan cards ──────────────────────────────────────────────────────
  "↗ source": "↗ fuente",
  "Horizon: {h} · ": "Horizonte: {h} · ",
  "{n} actions matched": "{n} acciones coincidentes",
  "{n} action matched": "{n} acción coincidente",
  "{n} strong": "{n} fuertes",
  "{n} moderate": "{n} moderadas",

  // ── Evidence table ──────────────────────────────────────────────────
  "Action": "Acción",
  "Signal type": "Tipo de señal",
  "Policy support": "Respaldo de políticas",
  "Strength": "Fuerza",
  "The kind of policy backing found — e.g. a direct mandate (Policy action), budget allocation (Funding), institutional responsibility (Governance), inclusion in a sector strategy (Sector plan), or a link to an emissions target.":
    "El tipo de respaldo de políticas encontrado — p. ej., un mandato directo (Acción de política), asignación de presupuesto (Financiamiento), responsabilidad institucional (Gobernanza), inclusión en una estrategia sectorial (Plan sectorial) o un vínculo con una meta de emisiones.",
  "How explicitly this plan covers the action, from 0% (no mention) to 100% (full, direct mandate). Scores above 75% are considered strong.":
    "Qué tan explícitamente este plan cubre la acción, desde 0% (sin mención) hasta 100% (mandato completo y directo). Las puntuaciones superiores al 75% se consideran fuertes.",
  "Overall signal quality: Strong = explicit, high-confidence coverage · Moderate = indirect or partial reference · Weak = incidental mention.":
    "Calidad general de la señal: Fuerte = cobertura explícita y de alta confianza · Moderada = referencia indirecta o parcial · Débil = mención incidental.",
  "Policy action": "Acción de política",
  "Funding": "Financiamiento",
  "Governance": "Gobernanza",
  "Sector plan": "Plan sectorial",
  "Emissions target": "Meta de emisiones",
  "Strong": "Fuerte",
  "Moderate": "Moderada",
  "Weak": "Débil",

  // ── Footer navigation ───────────────────────────────────────────────
  "← Back to context breakdown": "← Volver al desglose de contexto",
  "← Back to pre-flight": "← Volver a la verificación previa",
  "← Skip this step": "← Omitir este paso",
  "Save & return to context breakdown →": "Guardar y volver al desglose de contexto →",
};
