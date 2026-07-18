export const methodology: Record<string, string> = {
  "HOW ALM WORKS": "CÓMO FUNCIONA ALM",

  // ── Hero ────────────────────────────────────────────────────────────
  "The prioritization methodology": "La metodología de priorización",
  "Aceleradora Local de Mitigación ranks climate mitigation actions for your city using a three-pillar scoring model. Every score is traceable — you can see exactly which data inputs produced each number and why an action ranked where it did.":
    "Aceleradora Local de Mitigación clasifica las acciones de mitigación climática para tu ciudad usando un modelo de puntuación de tres pilares. Cada puntuación es rastreable — puedes ver exactamente qué datos de entrada produjeron cada número y por qué una acción quedó clasificada donde quedó.",

  // ── Table of contents ───────────────────────────────────────────────
  "ON THIS PAGE": "EN ESTA PÁGINA",
  "The overall formula": "La fórmula general",
  "Pillar 1 — Impact": "Pilar 1 — Impacto",
  "Pillar 2 — Alignment": "Pilar 2 — Alineación",
  "Pillar 3 — Feasibility": "Pilar 3 — Viabilidad",
  "Pre-scoring filters": "Filtros previos a la puntuación",
  "How to interpret your results": "Cómo interpretar tus resultados",

  // ── Overall formula ─────────────────────────────────────────────────
  "OVERALL SCORING FORMULA": "FÓRMULA GENERAL DE PUNTUACIÓN",
  "Final score": "Puntuación final",
  "Impact score": "Puntuación de impacto",
  "Alignment score": "Puntuación de alineación",
  "Feasibility score": "Puntuación de viabilidad",
  "These are the default weights. You can adjust them on the Pre-flight page, weights always sum to 100%.":
    "Estas son las ponderaciones predeterminadas. Puedes ajustarlas en la página de Pre-flight, las ponderaciones siempre suman 100%.",

  // ── Pillar cards ────────────────────────────────────────────────────
  "Emission reduction potential": "Potencial de reducción de emisiones",
  "Default weight: 55%": "Ponderación predeterminada: 55%",
  "How much of your city's emissions could this action address, and how quickly?":
    "¿Qué parte de las emisiones de tu ciudad podría abordar esta acción, y con qué rapidez?",
  "Reduction share": "Proporción de reducción",
  "Matched emissions weighted by evidence strength, as a share of total city emissions":
    "Emisiones correspondientes ponderadas por la solidez de la evidencia, como proporción de las emisiones totales de la ciudad",
  "Timeline score": "Puntuación de plazo",
  "How quickly results can be delivered — faster delivery scores higher":
    "Qué tan rápido se pueden entregar los resultados — una entrega más rápida obtiene mayor puntuación",
  "Policy and strategic fit": "Ajuste político y estratégico",
  "Default weight: 22%": "Ponderación predeterminada: 22%",
  "Is this action supported by existing plans and your city's stated priorities?":
    "¿Está esta acción respaldada por los planes existentes y las prioridades declaradas de tu ciudad?",
  "Policy support score": "Puntuación de apoyo de políticas",
  "Signals from national NDC, PARCC, PACCC, and sector plans":
    "Señales de la NDC nacional, PARCC, PACCC y planes sectoriales",
  "Sector preference match": "Coincidencia de preferencia sectorial",
  "Whether the action is in a sector your city has prioritized":
    "Si la acción está en un sector que tu ciudad ha priorizado",
  "Co-benefit preference match": "Coincidencia de preferencia de co-beneficios",
  "How well the action's co-benefits align with your city's selected priorities":
    "Qué tan bien los co-beneficios de la acción se alinean con las prioridades seleccionadas por tu ciudad",
  "Timeframe preference match": "Coincidencia de preferencia de plazo",
  "Whether the action's implementation horizon matches your city's preferred timeline":
    "Si el horizonte de implementación de la acción coincide con el plazo preferido de tu ciudad",
  "Implementation readiness": "Preparación para la implementación",
  "Default weight: 23%": "Ponderación predeterminada: 23%",
  "Can your city realistically implement this action given its legal and financial context?":
    "¿Puede tu ciudad implementar de manera realista esta acción dado su contexto legal y financiero?",
  "Legal readiness": "Preparación legal",
  "Continuous score from the legal assessment — blocked actions are removed before this step":
    "Puntuación continua de la evaluación legal — las acciones bloqueadas se eliminan antes de este paso",
  "Mitigation feasibility": "Viabilidad de mitigación",
  "Pre-calculated score reflecting how feasible the action is given your city's real conditions":
    "Puntuación precalculada que refleja qué tan viable es la acción dadas las condiciones reales de tu ciudad",
  "Financial feasibility": "Viabilidad financiera",
  "Pre-calculated score reflecting how realistically your city can finance and deliver the action":
    "Puntuación precalculada que refleja qué tan realista es que tu ciudad financie y ejecute la acción",

  // ── Pillar 1 — Impact ───────────────────────────────────────────────
  "Pillar 1 — Impact in detail": "Pilar 1 — Impacto en detalle",
  "The impact score measures two things: how large a share of your city's total emissions this action could realistically reduce, and how quickly it could deliver results. Actions targeting large emission sources with strong evidence of effectiveness score highest. Actions that can be implemented quickly get an additional boost.":
    "La puntuación de impacto mide dos cosas: qué tan grande es la parte de las emisiones totales de tu ciudad que esta acción podría reducir de manera realista, y con qué rapidez podría entregar resultados. Las acciones dirigidas a grandes fuentes de emisiones con evidencia sólida de efectividad obtienen la puntuación más alta. Las acciones que pueden implementarse rápidamente reciben un impulso adicional.",
  "Match action to your city's emissions": "Relaciona la acción con las emisiones de tu ciudad",
  "The tool matches each action to the parts of your city's emissions inventory it could address. The matched emissions are weighted by an evidence-based strength rating to estimate realistic reduction potential.":
    "La herramienta relaciona cada acción con las partes del inventario de emisiones de tu ciudad que podría abordar. Las emisiones correspondientes se ponderan con una calificación de solidez basada en evidencia para estimar el potencial de reducción realista.",
  "Apply the impact strength multiplier": "Aplica el multiplicador de fuerza de impacto",
  "Each action has an evidence-based impact rating. This scales the matched emissions to reflect realistic reduction potential:":
    "Cada acción tiene una calificación de impacto basada en evidencia. Esto escala las emisiones correspondientes para reflejar el potencial de reducción realista:",
  "Very high → 1.0   |   High → 0.8   |   Medium → 0.6   |   Low → 0.4   |   Very low → 0.2":
    "Muy alto → 1.0   |   Alto → 0.8   |   Medio → 0.6   |   Bajo → 0.4   |   Muy bajo → 0.2",
  "Calculate reduction share of total city emissions": "Calcula la proporción de reducción sobre las emisiones totales de la ciudad",
  "The weighted matched emissions are divided by your city's total emissions to produce a share between 0 and 1. For AFOLU actions (forestry and land use), carbon removal entries count as positive contributions to both the numerator and denominator.":
    "Las emisiones correspondientes ponderadas se dividen por las emisiones totales de tu ciudad para producir una proporción entre 0 y 1. Para las acciones AFOLU (silvicultura y uso de suelo), las entradas de remoción de carbono cuentan como contribuciones positivas tanto al numerador como al denominador.",
  "Combine with timeline score": "Combina con la puntuación de plazo",
  "Actions that deliver results faster score higher. A missing or unknown timeline is treated as neutral:":
    "Las acciones que entregan resultados más rápido obtienen mayor puntuación. Un plazo faltante o desconocido se trata como neutral:",
  "Less than 5 years    → 1.0\n5 to 10 years        → 0.5\nMore than 10 years   → 0.0\nMissing or unknown   → 0.5 (neutral)\n\nImpact score = (0.80 × reduction share) + (0.20 × timeline score)":
    "Menos de 5 años        → 1.0\n5 a 10 años            → 0.5\nMás de 10 años         → 0.0\nFaltante o desconocido → 0.5 (neutral)\n\nPuntuación de impacto = (0.80 × proporción de reducción) + (0.20 × puntuación de plazo)",

  // ── Pillar 2 — Alignment ────────────────────────────────────────────
  "Pillar 2 — Alignment in detail": "Pilar 2 — Alineación en detalle",
  "The alignment score measures how well each action fits into the policy landscape your city operates in and the priorities your city has declared. Actions backed by multiple levels of government policy and matching your city's own preferences score highest.":
    "La puntuación de alineación mide qué tan bien encaja cada acción en el panorama de políticas en el que opera tu ciudad y en las prioridades que tu ciudad ha declarado. Las acciones respaldadas por múltiples niveles de política gubernamental y que coinciden con las preferencias propias de tu ciudad obtienen la puntuación más alta.",
  "Load policy signals for your city": "Carga las señales de políticas de tu ciudad",
  "The tool checks whether each action is backed by Chile's national climate commitments (NDC), the regional climate plan (PARCC), your municipality's own climate plan (PACCC) where available, and sector-specific policy documents. Signals are weighted by level — national carries more weight than regional, which carries more than municipal. Binding targets carry more weight than sector priorities, which carry more than general mentions.":
    "La herramienta verifica si cada acción está respaldada por los compromisos climáticos nacionales de Chile (NDC), el plan climático regional (PARCC), el plan climático propio de tu municipio (PACCC) cuando está disponible, y documentos de políticas sectoriales. Las señales se ponderan por nivel — el nacional tiene más peso que el regional, que tiene más que el municipal. Las metas vinculantes tienen más peso que las prioridades sectoriales, que tienen más que las menciones generales.",
  "Score policy support per action": "Puntúa el apoyo de políticas por acción",
  "Each action receives a policy support score (0–1) based on how many plans support it and the strength of those signals. Policy support is the dominant alignment input at 75% weight. The full alignment formula:":
    "Cada acción recibe una puntuación de apoyo de políticas (0–1) basada en cuántos planes la respaldan y la fuerza de esas señales. El apoyo de políticas es el insumo dominante de la alineación con una ponderación del 75%. La fórmula completa de alineación:",
  "Alignment score = (0.75 × policy support)\n              + (0.15 × sector match)\n              + (0.05 × co-benefit match)\n              + (0.05 × timeframe match)":
    "Puntuación de alineación = (0.75 × apoyo de políticas)\n              + (0.15 × coincidencia sectorial)\n              + (0.05 × coincidencia de co-beneficios)\n              + (0.05 × coincidencia de plazo)",
  "Apply sector preference": "Aplica la preferencia sectorial",
  "Whether the action falls in a sector your city selected as a priority on the Strategic Preferences page. A match scores 1.0; no match scores 0.0. This contributes 15% of the alignment score.":
    "Si la acción cae en un sector que tu ciudad seleccionó como prioridad en la página de Preferencias Estratégicas. Una coincidencia puntúa 1.0; sin coincidencia puntúa 0.0. Esto contribuye el 15% de la puntuación de alineación.",
  "Match co-benefit preferences": "Compara las preferencias de co-beneficios",
  "How well the action's co-benefits align with the priorities your city selected. If your city selected no co-benefit priorities, this component defaults to neutral (0.5).":
    "Qué tan bien los co-beneficios de la acción se alinean con las prioridades que tu ciudad seleccionó. Si tu ciudad no seleccionó prioridades de co-beneficios, este componente se establece por defecto en neutral (0.5).",
  "Match timeframe preference": "Compara la preferencia de plazo",
  "Whether the action's timeline matches your city's preferred implementation horizon:":
    "Si el plazo de la acción coincide con el horizonte de implementación preferido de tu ciudad:",
  "Exact match                              → 1.0\nAdjacent match (e.g. medium vs short)    → 0.5\nFar mismatch (e.g. short vs long)        → 0.0\nNo preference set or timeline missing    → 0.5 (neutral)":
    "Coincidencia exacta                          → 1.0\nCoincidencia adyacente (ej. medio vs corto)  → 0.5\nDesajuste lejano (ej. corto vs largo)        → 0.0\nSin preferencia definida o plazo faltante    → 0.5 (neutral)",
  "Policy support is the dominant input at 75% weight. An action backed by Chile's NDC and a regional plan will score significantly higher than one with no policy backing — even if your city hasn't explicitly prioritized that sector.":
    "El apoyo de políticas es el insumo dominante con una ponderación del 75%. Una acción respaldada por la NDC de Chile y un plan regional puntuará significativamente más alto que una sin respaldo de políticas — incluso si tu ciudad no ha priorizado explícitamente ese sector.",

  // ── Pillar 3 — Feasibility ──────────────────────────────────────────
  "Pillar 3 — Feasibility in detail": "Pilar 3 — Viabilidad en detalle",
  "The feasibility score measures how ready your city is to actually deliver an action — combining its legal standing, how feasible it is given real local conditions, and how realistically it can be financed. Actions where the city has clear authority, strong local conditions, and accessible funding score highest.":
    "La puntuación de viabilidad mide qué tan preparada está tu ciudad para ejecutar realmente una acción — combinando su situación legal, qué tan viable es dadas las condiciones locales reales, y qué tan realista es su financiamiento. Las acciones donde la ciudad tiene autoridad clara, condiciones locales sólidas y financiamiento accesible obtienen la puntuación más alta.",
  "Each action is assessed against Chilean municipal law. The assessment produces a continuous score between 0 and 1 based on two dimensions —":
    "Cada acción se evalúa según la ley municipal chilena. La evaluación produce una puntuación continua entre 0 y 1 basada en dos dimensiones —",
  "ownership": "titularidad",
  "(does the municipality have the legal authority?) and": "(¿tiene el municipio la autoridad legal?) y",
  "restrictions": "restricciones",
  "(are there legal barriers?). Actions where the municipality clearly has authority and faces no restrictions score close to 1.0. Actions where authority is shared or conditional score lower but remain in the ranking, flagged for your review. Actions where the municipality has no legal authority are removed from the ranking entirely before scoring begins. If the legal assessment is missing for an action, the component defaults to neutral (0.5).":
    "(¿existen barreras legales?). Las acciones donde el municipio claramente tiene autoridad y no enfrenta restricciones puntúan cerca de 1.0. Las acciones donde la autoridad es compartida o condicional puntúan más bajo pero permanecen en el ranking, marcadas para tu revisión. Las acciones donde el municipio no tiene autoridad legal se eliminan del ranking por completo antes de que comience la puntuación. Si falta la evaluación legal para una acción, el componente se establece por defecto en neutral (0.5).",
  "Mitigation feasibility score": "Puntuación de viabilidad de mitigación",
  "A pre-calculated score reflecting how feasible the action is given your city's real conditions — including socioeconomic factors, local capacity, and the characteristics of the action. This score is produced by a dedicated assessment and used directly in the formula. If missing, it defaults to neutral (0.5).":
    "Una puntuación precalculada que refleja qué tan viable es la acción dadas las condiciones reales de tu ciudad — incluyendo factores socioeconómicos, capacidad local y las características de la acción. Esta puntuación se produce mediante una evaluación dedicada y se usa directamente en la fórmula. Si falta, se establece por defecto en neutral (0.5).",
  "Financial feasibility score": "Puntuación de viabilidad financiera",
  "A pre-calculated score reflecting how realistically your city can finance and deliver the action — based on the action's cost and complexity, your city's budget profile and delivery capacity, and the availability of matching funds. The Financial Feasibility page shows the full reasoning, matched funds, and comparable funded projects for each action. If missing, it defaults to neutral (0.5).":
    "Una puntuación precalculada que refleja qué tan realista es que tu ciudad financie y ejecute la acción — basada en el costo y la complejidad de la acción, el perfil presupuestario y la capacidad de ejecución de tu ciudad, y la disponibilidad de fondos compatibles. La página de Viabilidad Financiera muestra el razonamiento completo, los fondos compatibles y proyectos financiados comparables para cada acción. Si falta, se establece por defecto en neutral (0.5).",
  "Combine components into a feasibility score": "Combina los componentes en una puntuación de viabilidad",
  "When any component is missing, the tool uses 0.5 as a neutral fallback so no action is unfairly penalized due to incomplete data:":
    "Cuando falta algún componente, la herramienta usa 0.5 como respaldo neutral para que ninguna acción sea penalizada injustamente por datos incompletos:",
  "Feasibility score = (0.34 × legal score)\n                  + (0.33 × mitigation feasibility)\n                  + (0.33 × financial feasibility)":
    "Puntuación de viabilidad = (0.34 × puntuación legal)\n                  + (0.33 × viabilidad de mitigación)\n                  + (0.33 × viabilidad financiera)",

  // ── Pre-scoring filters ─────────────────────────────────────────────
  "Before scoring begins, two types of filter can remove actions from the ranking entirely. Removed actions receive no score and are listed transparently so you can review and adjust if needed.":
    "Antes de que comience la puntuación, dos tipos de filtro pueden eliminar acciones del ranking por completo. Las acciones eliminadas no reciben puntuación y se listan de forma transparente para que puedas revisarlas y ajustarlas si es necesario.",
  "A — Legal filter (automatic)": "A — Filtro legal (automático)",
  "The tool automatically checks every action against your city's municipal legal context across two dimensions:":
    "La herramienta verifica automáticamente cada acción contra el contexto legal municipal de tu ciudad en dos dimensiones:",
  "(legal authority) and": "(autoridad legal) y",
  "(legal constraints). If either dimension returns a": "(limitaciones legales). Si cualquiera de las dimensiones devuelve",
  "blocked": "bloqueada",
  "verdict, the action is removed before scoring begins.": "como veredicto, la acción se elimina antes de que comience la puntuación.",
  "Dimension": "Dimensión",
  "Verdict": "Veredicto",
  "Effect": "Efecto",
  "Ownership": "Titularidad",
  "Restrictions": "Restricciones",
  "conditional": "condicional",
  "enabled": "habilitada",
  "Municipality lacks legal authority — action removed before scoring":
    "El municipio carece de autoridad legal — la acción se elimina antes de la puntuación",
  "Shared or partial authority — action scores at reduced rate, flagged":
    "Autoridad compartida o parcial — la acción puntúa a tasa reducida, marcada",
  "Full municipal authority — action scores normally":
    "Autoridad municipal plena — la acción puntúa normalmente",
  "Hard legal restriction — action removed before scoring":
    "Restricción legal estricta — la acción se elimina antes de la puntuación",
  "Soft restrictions or authorization needed — scores at reduced rate":
    "Restricciones leves o autorización necesaria — puntúa a tasa reducida",
  "No restrictions identified — action scores normally":
    "No se identificaron restricciones — la acción puntúa normalmente",
  "If the legal assessment is missing for an action, it is not removed. It passes with a conditional flag for your review. Only a confirmed":
    "Si falta la evaluación legal para una acción, no se elimina. Pasa con una marca condicional para tu revisión. Solo un veredicto confirmado de",
  "verdict on either dimension causes removal.": "en cualquiera de las dimensiones causa la eliminación.",
  "B — City preference exclusions (your choice)": "B — Exclusiones por preferencia de la ciudad (tu elección)",
  "On the Strategic Preferences page, you can instruct the tool to remove specific types of actions based on your city's political, operational, or mandate-based decisions. For example:":
    "En la página de Preferencias Estratégicas, puedes indicar a la herramienta que elimine tipos específicos de acciones según las decisiones políticas, operativas o de mandato de tu ciudad. Por ejemplo:",
  '"Do not include actions that significantly increase household costs for vulnerable communities"':
    '"No incluir acciones que aumenten significativamente los costos de los hogares de las comunidades vulnerables"',
  "or": "o",
  '"Exclude any actions that require new fossil fuel infrastructure."':
    '"Excluir cualquier acción que requiera nueva infraestructura de combustibles fósiles."',
  "Unlike the legal filter, this is a deliberate choice by your city. An excluded action may be perfectly legal and could score very highly if re-included. Use preference exclusions for genuine constraints, not to filter by expected score.":
    "A diferencia del filtro legal, esta es una elección deliberada de tu ciudad. Una acción excluida puede ser perfectamente legal y podría puntuar muy alto si se vuelve a incluir. Usa las exclusiones por preferencia para restricciones genuinas, no para filtrar por puntuación esperada.",
  "Removed actions are listed transparently in your results so you can review and adjust if needed.":
    "Las acciones eliminadas se listan de forma transparente en tus resultados para que puedas revisarlas y ajustarlas si es necesario.",

  // ── How to interpret your results ───────────────────────────────────
  "High impact score, lower feasibility score": "Puntuación de impacto alta, puntuación de viabilidad más baja",
  "The action addresses a large share of your city's emissions but faces legal or financial headwinds. These are high-value actions worth investing in — but they may require policy groundwork or external funding to unlock first.":
    "La acción aborda una gran parte de las emisiones de tu ciudad pero enfrenta obstáculos legales o financieros. Son acciones de alto valor en las que vale la pena invertir — pero pueden requerir trabajo previo de políticas o financiamiento externo para desbloquearse primero.",
  "High alignment score, lower impact score": "Puntuación de alineación alta, puntuación de impacto más baja",
  "The action is well-supported by existing plans and your priorities but addresses a smaller share of emissions. These are low-friction actions — good candidates for quick wins and building political momentum.":
    "La acción está bien respaldada por los planes existentes y tus prioridades pero aborda una parte menor de las emisiones. Son acciones de baja fricción — buenas candidatas para logros rápidos y para generar impulso político.",
  "Adjusting the weights": "Ajustar las ponderaciones",
  "If near-term deliverability matters more to your city right now, increase the feasibility weight on the Strategic Preferences page. If political alignment matters most, increase the alignment weight. The ranking updates immediately to reflect your city's priorities.":
    "Si la capacidad de entrega a corto plazo importa más a tu ciudad en este momento, aumenta la ponderación de viabilidad en la página de Preferencias Estratégicas. Si la alineación política importa más, aumenta la ponderación de alineación. El ranking se actualiza inmediatamente para reflejar las prioridades de tu ciudad.",
};
