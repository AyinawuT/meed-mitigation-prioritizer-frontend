export const processing: Record<string, string> = {
  // ── Header ──────────────────────────────────────────────────────────
  "Recommendations ready": "Recomendaciones listas",
  "Generating action recommendations": "Generando recomendaciones de acciones",
  "Started just now · {name} · Expected wait time 30 seconds":
    "Iniciado hace un momento · {name} · Tiempo de espera estimado: 30 segundos",

  // ── Overall progress ────────────────────────────────────────────────
  "{pct}% complete": "{pct}% completado",
  "{stage} in progress": "{stage} en proceso",
  "All analyses complete": "Todos los análisis completados",

  // ── Stage labels ────────────────────────────────────────────────────
  "Data validation": "Validación de datos",
  "Impact Analysis": "Análisis de Impacto",
  "Alignment Analysis": "Análisis de Alineación",
  "Feasibility Analysis": "Análisis de Viabilidad",

  // ── Stage descriptions ──────────────────────────────────────────────
  "Emissions + context data verified": "Datos de emisiones y contexto verificados",
  "Scoring {n} actions on emissions reduction potential & implementation timeline":
    "Puntuando {n} acciones según su potencial de reducción de emisiones y cronograma de implementación",
  "Matching actions to national, regional and local frameworks and strategic preferences":
    "Vinculando acciones con marcos nacionales, regionales y locales y con las preferencias estratégicas",
  "Assessing socioeconomic context and regulations & laws":
    "Evaluando el contexto socioeconómico y las regulaciones y leyes",

  // ── Footer note ─────────────────────────────────────────────────────
  "Results will be ready shortly!": "¡Los resultados estarán listos pronto!",

  // ── Error state ─────────────────────────────────────────────────────
  "Prioritization failed": "La priorización falló",
  "The scoring pipeline encountered an error. This is usually caused by missing or malformed input data.":
    "El pipeline de puntuación encontró un error. Esto suele deberse a datos de entrada faltantes o mal formados.",
  "← Back to pre-flight check": "← Volver a la verificación previa",
};
