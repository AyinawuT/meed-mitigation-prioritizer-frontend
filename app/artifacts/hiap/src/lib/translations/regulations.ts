export const regulations: Record<string, string> = {
  // ── Sector display names ────────────────────────────────────────────
  "Stationary Energy": "Energía Estacionaria",
  "Transportation": "Transporte",
  "Waste": "Residuos",
  "IPPU": "IPPU",
  "AFOLU": "AFOLU",
  "Cross-sector": "Intersectorial",

  // ── Verdict chips ───────────────────────────────────────────────────
  "Enabled": "Habilitada",
  "Conditional": "Condicional",
  "Blocked": "Bloqueada",

  // ── Excluded action card ────────────────────────────────────────────
  "Excluded": "Excluida",
  "Hide details ▲": "Ocultar detalles ▲",
  "Why excluded? ▼": "¿Por qué se excluyó? ▼",
  "Ownership": "Titularidad",
  "Restrictions": "Restricciones",
  "Legal justification": "Justificación legal",
  "Legal references": "Referencias legales",

  // ── Flagged action card ─────────────────────────────────────────────
  "Assessment pending": "Evaluación pendiente",
  "No legal assessment is available for this action yet. It has been included in the ranking with a neutral legal score.":
    "Aún no hay una evaluación legal disponible para esta acción. Se ha incluido en el ranking con una puntuación legal neutral.",

  // ── Page header ─────────────────────────────────────────────────────
  "Aceleradora Local de Mitigación has checked each candidate action against Chilean laws. Actions where the city lacks the legal authority to implement them independently are excluded from the ranking before scoring begins.":
    "Aceleradora Local de Mitigación ha verificado cada acción candidata contra las leyes chilenas. Las acciones donde la ciudad carece de la autoridad legal para implementarlas de forma independiente se excluyen del ranking antes de comenzar la puntuación.",
  "ALM FEASIBILITY: Legal verdict shapes 34% of feasibility score · Feasibility shapes 23% of ranking":
    "VIABILIDAD ALM: El veredicto legal define el 34% de la puntuación de viabilidad · La viabilidad define el 23% del ranking",

  // ── Summary cards ───────────────────────────────────────────────────
  "passed legal review": "pasaron la revisión legal",
  "Run the pipeline to see legal review": "Ejecuta el pipeline para ver la revisión legal",
  "top {n} shown in your ranking": "las {n} mejores se muestran en tu ranking",
  "Excluded from ranking": "Excluidas del ranking",
  "Removed before scoring": "Eliminadas antes de la puntuación",
  "Flagged — evidence missing": "Marcadas — falta evidencia",
  "Included in ranking, assessment pending": "Incluidas en el ranking, evaluación pendiente",

  // ── Loading / error / all-passed states ─────────────────────────────
  "Running legal review…": "Ejecutando revisión legal…",
  "Checking all candidate actions against Chilean laws": "Verificando todas las acciones candidatas contra las leyes chilenas",
  "Could not load legal review": "No se pudo cargar la revisión legal",
  "Retry": "Reintentar",
  "All actions passed the legal review": "Todas las acciones pasaron la revisión legal",
  "No actions were excluded or flagged based on legal authority requirements.":
    "Ninguna acción fue excluida ni marcada por requisitos de autoridad legal.",

  // ── Sections ────────────────────────────────────────────────────────
  "Excluded from ranking ({n})": "Excluidas del ranking ({n})",
  "These actions were removed before scoring. The city does not currently have the legal authority to implement them independently.":
    "Estas acciones se eliminaron antes de la puntuación. La ciudad no cuenta actualmente con la autoridad legal para implementarlas de forma independiente.",
  "Flagged — evidence missing ({n})": "Marcadas — falta evidencia ({n})",
  "No legal assessment was found for these actions. They are included in the ranking with a neutral legal score.":
    "No se encontró una evaluación legal para estas acciones. Se incluyen en el ranking con una puntuación legal neutral.",
  "No excluded or flagged actions in {sector}.": "No hay acciones excluidas ni marcadas en {sector}.",

  // ── Navigation ──────────────────────────────────────────────────────
  "Save & return to context breakdown →": "Guardar y volver al desglose de contexto →",
  "Save & return to pre-flight →": "Guardar y volver a la verificación previa →",
  "Strategic preferences →": "Preferencias estratégicas →",
};
