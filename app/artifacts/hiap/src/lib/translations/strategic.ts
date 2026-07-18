// Strategic Preferences page (StrategicPreferences.tsx).
// Keys are the English source strings rendered in components.
// Note: "Strategic Preferences" itself lives in cityProfile.ts.
export const strategic: Record<string, string> = {
  // ── Shared with PolicyAlignment.tsx (defined once here) ─────────────
  "City not found.": "Ciudad no encontrada.",
  "Save & continue →": "Guardar y continuar →",
  "Save & return to pre-flight →": "Guardar y volver a la verificación previa →",

  // ── Header ──────────────────────────────────────────────────────────
  "← Back": "← Volver",
  "Tell Aceleradora Local de Mitigación which sectors and goals matter most to your city, how quickly actions must be implementable, and whether any types of actions should be excluded from the ranking.":
    "Indícale a Aceleradora Local de Mitigación qué sectores y objetivos importan más a tu ciudad, qué tan rápido deben poder implementarse las acciones y si algún tipo de acción debe excluirse del ranking.",
  "ALM ALIGNMENT: Alignment shapes 22% of ranking — priority sectors 15% · timeframe preference 5% · strategic priorities 5%":
    "ALINEACIÓN ALM: La alineación determina el 22% del ranking — sectores prioritarios 15% · preferencia de plazo 5% · prioridades estratégicas 5%",

  // ── Section titles & badges ─────────────────────────────────────────
  "Priority Sectors": "Sectores Prioritarios",
  "Strategic Priorities": "Prioridades Estratégicas",
  "Implementation Timeline": "Cronograma de Implementación",
  "Actions to Exclude": "Acciones a Excluir",
  "ALIGNMENT · 15%": "ALINEACIÓN · 15%",
  "ALIGNMENT · 5%": "ALINEACIÓN · 5%",

  // ── Priority sectors ────────────────────────────────────────────────
  "Select the sectors your city wants to prioritise. Actions in these sectors will receive a higher alignment score.":
    "Selecciona los sectores que tu ciudad quiere priorizar. Las acciones de estos sectores recibirán una puntuación de alineación más alta.",
  "Stationary Energy": "Energía estacionaria",
  "Transportation": "Transporte",
  "Waste": "Residuos",
  "Industrial Processes & Product Use (IPPU)": "Procesos industriales y uso de productos (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)": "Agricultura, silvicultura y otros usos de la tierra (AFOLU)",
  "{n} sectors selected": "{n} sectores seleccionados",
  "{n} sector selected": "{n} sector seleccionado",

  // ── Strategic priorities (co-benefits) ──────────────────────────────
  "Select the co-benefits your city wants to emphasise. Actions that deliver these co-benefits alongside emissions reductions will score higher in the alignment ranking.":
    "Selecciona los co-beneficios que tu ciudad quiere destacar. Las acciones que generen estos co-beneficios junto con reducciones de emisiones obtendrán una puntuación más alta en el ranking de alineación.",
  "Air Quality": "Calidad del aire",
  "Water Quality": "Calidad del agua",
  "Habitat & Biodiversity": "Hábitat y biodiversidad",
  "Housing": "Vivienda",
  "Stakeholder Engagement": "Participación de partes interesadas",
  "Cost of Living": "Costo de vida",
  "Mobility": "Movilidad",
  "{n} co-benefits selected": "{n} co-beneficios seleccionados",
  "{n} co-benefit selected": "{n} co-beneficio seleccionado",

  // ── Implementation timeline ─────────────────────────────────────────
  "Select your city's preferred implementation horizon. Actions whose timeline matches your preference receive a higher alignment score.":
    "Selecciona el horizonte de implementación preferido de tu ciudad. Las acciones cuyo cronograma coincida con tu preferencia reciben una puntuación de alineación más alta.",
  "Short-term": "Corto plazo",
  "Medium-term": "Mediano plazo",
  "Long-term": "Largo plazo",
  "No preference": "Sin preferencia",

  // ── Actions to exclude ──────────────────────────────────────────────
  "Specify which types of actions your city wants to exclude from the ranking. In the pre-flight summary, you will be able to review and confirm which specific actions are proposed for exclusion before running the ranking.":
    "Especifica qué tipos de acciones tu ciudad quiere excluir del ranking. En el resumen de verificación previa podrás revisar y confirmar qué acciones específicas se proponen para exclusión antes de ejecutar el ranking.",
  "Exclude by sector": "Excluir por sector",
  "All actions belonging to these sectors will be proposed for exclusion.":
    "Todas las acciones pertenecientes a estos sectores se propondrán para exclusión.",
  "{n} sectors marked for exclusion": "{n} sectores marcados para exclusión",
  "{n} sector marked for exclusion": "{n} sector marcado para exclusión",
  "Exclude by co-benefit impact": "Excluir por impacto en co-beneficios",
  "Actions that have a negative effect on the selected co-benefits will be proposed for exclusion.":
    "Las acciones que tengan un efecto negativo en los co-beneficios seleccionados se propondrán para exclusión.",
  "{n} co-benefits selected — actions with negative impact on these will be proposed for exclusion":
    "{n} co-beneficios seleccionados — las acciones con impacto negativo en ellos se propondrán para exclusión",
  "{n} co-benefit selected — actions with negative impact on these will be proposed for exclusion":
    "{n} co-beneficio seleccionado — las acciones con impacto negativo en él se propondrán para exclusión",
  "Additional exclusion criteria": "Criterios adicionales de exclusión",
  "(optional)": "(opcional)",
  "Describe any other actions to exclude — for example, actions already under way, politically infeasible, or outside your mandate.":
    "Describe cualquier otra acción a excluir — por ejemplo, acciones ya en marcha, políticamente inviables o fuera de tu mandato.",
  "Do not include actions related to electric vehicles or electric mobility":
    "No incluir acciones relacionadas con vehículos eléctricos o movilidad eléctrica",
  "Additional exclusion criteria recorded": "Criterios adicionales de exclusión registrados",
  "No exclusion criteria set — all actions will be included in the ranking.":
    "Sin criterios de exclusión — todas las acciones se incluirán en el ranking.",
};
