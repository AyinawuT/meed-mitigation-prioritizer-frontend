// Pre-flight check screen (PreflightCheck.tsx).
// Keys are the exact English source strings rendered in the component.
// Shared keys NOT here (defined elsewhere): "Cities", "OPTIONAL", "COMPLETE"
// (common.ts); "Impact", "Alignment", "Feasibility", "Sector" (recommendations.ts);
// step titles like "Emissions Data" (cityProfile.ts).
export const preflight: Record<string, string> = {
  // ── Breadcrumb & header ─────────────────────────────────────────────
  "Pre-flight Check": "Verificación Previa",
  "Pre-flight Summary": "Resumen de Verificación Previa",
  "Review data completeness before generating action recommendations for {name}.":
    "Revisa la completitud de los datos antes de generar recomendaciones de acciones para {name}.",
  "City not found.": "Ciudad no encontrada.",

  // ── Data completeness card ──────────────────────────────────────────
  "Data completeness": "Completitud de datos",
  "PARTIAL": "PARCIAL",
  "NOT ENTERED": "SIN INGRESAR",
  "Edit": "Editar",
  "Enter data": "Ingresar datos",
  "Optional — skipped": "Opcional — omitido",

  // ── Model confidence ────────────────────────────────────────────────
  "Model confidence": "Confianza del modelo",
  "Low": "Baja",
  "Moderate": "Moderada",
  "High": "Alta",
  "High — strong basis for a reliable ranking.":
    "Alta — base sólida para un ranking confiable.",
  "Moderate — sufficient to generate a rankable list of actions.":
    "Moderada — suficiente para generar una lista de acciones clasificable.",
  "Low — rankings may be unreliable. Add more data.":
    "Baja — el ranking puede no ser confiable. Agrega más datos.",
  "Emissions data is the most critical input — without it, recommendations are based on sector averages only. Enter your GHG inventory to unlock accurate rankings.":
    "Los datos de emisiones son el insumo más crítico — sin ellos, las recomendaciones se basan solo en promedios sectoriales. Ingresa tu inventario de GEI para desbloquear rankings precisos.",
  "Complete your emissions data by confirming all sectors to significantly improve ranking accuracy.":
    "Completa tus datos de emisiones confirmando todos los sectores para mejorar significativamente la precisión del ranking.",
  "Adding socioeconomic data would raise confidence to ~85%.":
    "Agregar datos socioeconómicos elevaría la confianza a ~85%.",

  // ── Pilot data availability ─────────────────────────────────────────
  "Pilot data availability": "Disponibilidad de datos del piloto",
  "Excellent": "Excelente",
  "Good": "Buena",
  "Fair": "Regular",
  "No data": "Sin datos",

  // ── Scoring weights ─────────────────────────────────────────────────
  "Scoring Weights": "Ponderaciones de Puntuación",
  "Custom weights active": "Ponderaciones personalizadas activas",
  "Adjust how much each pillar contributes to the final ranking. Moving one slider redistributes the remainder proportionally across the other two.":
    "Ajusta cuánto contribuye cada pilar al ranking final. Al mover un control deslizante, el resto se redistribuye proporcionalmente entre los otros dos.",
  "Default weights follow the Aceleradora Local de Mitigación methodology: Impact {impact}% · Alignment {alignment}% · Feasibility {feasibility}%":
    "Las ponderaciones predeterminadas siguen la metodología de la Aceleradora Local de Mitigación: Impacto {impact}% · Alineación {alignment}% · Viabilidad {feasibility}%",
  "Emissions reduction potential & timeline": "Potencial de reducción de emisiones y plazos",
  "Policy support, sectors & co-benefits": "Apoyo de políticas, sectores y co-beneficios",
  "Legal environment & socioeconomic fit": "Entorno legal y ajuste socioeconómico",
  "Total: {n}%": "Total: {n}%",
  "Reset to defaults": "Restablecer valores predeterminados",
  "Default: {n}%": "Predeterminado: {n}%",
  "· adjusted": "· ajustado",

  // ── Exclusion review ────────────────────────────────────────────────
  "Exclusion Review": "Revisión de Exclusiones",
  "You have set exclusion preferences in Strategic Preferences. Preview which actions would be excluded and confirm your selection before generating the ranking.":
    "Has configurado preferencias de exclusión en Preferencias Estratégicas. Previsualiza qué acciones serían excluidas y confirma tu selección antes de generar el ranking.",
  "Sectors to exclude:": "Sectores a excluir:",
  "Co-benefits (negative impact):": "Co-beneficios (impacto negativo):",
  "Free text:": "Texto libre:",
  "None": "Ninguno",
  "Edit exclusion criteria →": "Editar criterios de exclusión →",
  "{n} actions confirmed for exclusion": "{n} acciones confirmadas para exclusión",
  "{n} action confirmed for exclusion": "{n} acción confirmada para exclusión",
  "These will be removed from the ranking when you generate recommendations.":
    "Estas se eliminarán del ranking cuando generes las recomendaciones.",
  "Clear": "Limpiar",
  "Loading preview…": "Cargando vista previa…",
  "Preview proposed exclusions →": "Previsualizar exclusiones propuestas →",
  "Preview generated locally (backend unavailable). Free-text matching is approximate.":
    "Vista previa generada localmente (backend no disponible). La coincidencia de texto libre es aproximada.",
  "{n} actions": "{n} acciones",
  "{n} action": "{n} acción",
  "matched your exclusion criteria. Select which ones to exclude from the ranking.":
    "con coincidencia en tus criterios de exclusión. Selecciona cuáles excluir del ranking.",
  "Select all": "Seleccionar todas",
  "Deselect all": "Deseleccionar todas",
  "Action has negative impact on selected co-benefit(s): {label}":
    "La acción tiene un impacto negativo en los co-beneficios seleccionados: {label}",
  "Co-benefit": "Co-beneficio",
  "Free text": "Texto libre",
  "Confirm {n} exclusions": "Confirmar {n} exclusiones",
  "Confirm {n} exclusion": "Confirmar {n} exclusión",
  "Cancel": "Cancelar",
  "{sel} of {total} selected": "{sel} de {total} seleccionadas",

  // ── Co-benefit labels (CO_BENEFIT_LABELS values, translated at render) ──
  "Air Quality": "Calidad del Aire",
  "Water Quality": "Calidad del Agua",
  "Habitat & Biodiversity": "Hábitat y Biodiversidad",
  "Housing": "Vivienda",
  "Stakeholder Engagement": "Participación de Actores",
  "Cost of Living": "Costo de Vida",
  "Mobility": "Movilidad",

  // ── Sector display names (translated at render only) ────────────────
  "Stationary Energy": "Energía Estacionaria",
  "Transportation": "Transporte",
  "Waste": "Residuos",
  "Industrial Processes & Product Use (IPPU)": "Procesos Industriales y Uso de Productos (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)": "Agricultura, Silvicultura y Otros Usos de la Tierra (AFOLU)",

  // ── Generate CTA ────────────────────────────────────────────────────
  "Emissions data required.": "Se requieren datos de emisiones.",
  "Confirm at least one emissions sector before generating recommendations. Without it, there is no city-specific data to rank actions against.":
    "Confirma al menos un sector de emisiones antes de generar recomendaciones. Sin ellos, no hay datos específicos de la ciudad para clasificar las acciones.",
  "Generate recommendations — confirm you're ready": "Generar recomendaciones — confirma que estás listo",
  "Enter emissions data to continue": "Ingresa datos de emisiones para continuar",
};
