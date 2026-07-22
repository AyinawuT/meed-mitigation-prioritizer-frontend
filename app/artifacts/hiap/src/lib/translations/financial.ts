// Financial feasibility screen (FinancialFeasibility.tsx).
// Keys are the exact English source strings rendered in the component.
// Shared keys NOT here (defined elsewhere): "Cities" (common.ts);
// "Sector", "All sectors" (recommendations.ts); "Low", "High" (preflight.ts —
// feminine forms "Baja"/"Alta", which also agree with intensidad/autonomía/
// capacidad/complejidad here).
export const financial: Record<string, string> = {
  // ── Page header ─────────────────────────────────────────────────────
  "Loading financial feasibility data…": "Cargando datos de viabilidad financiera…",
  "Financial Feasibility": "Viabilidad Financiera",
  "For every action, the tool compares what the action needs (capital and preparation) against what {city} has (budget autonomy and delivery capacity) to estimate how realistically the city can finance and deliver it — and which funds could help close the gap.":
    "Para cada acción, la herramienta compara lo que la acción necesita (capital y preparación) con lo que {city} tiene (autonomía presupuestaria y capacidad de ejecución) para estimar qué tan realista es que la ciudad pueda financiarla y ejecutarla — y qué fondos podrían ayudar a cerrar la brecha.",
  "ALM FEASIBILITY: Financial feasibility shapes 33% of feasibility score · Feasibility shapes 23% of ranking":
    "VIABILIDAD ALM: La viabilidad financiera determina el 33% de la puntuación de viabilidad · La viabilidad determina el 23% del ranking",
  "Could not load financial feasibility data.": "No se pudieron cargar los datos de viabilidad financiera.",

  // ── City profile card ───────────────────────────────────────────────
  "{city}'s financial profile": "Perfil financiero de {city}",
  "Delivery-ready city": "Ciudad lista para ejecutar",
  "Financially strong city": "Ciudad financieramente fuerte",
  "Revenue-strong city": "Ciudad con ingresos sólidos",
  "Capacity-rich city": "Ciudad con alta capacidad",
  "Transitioning city": "Ciudad en transición",
  "{city} relies more on central transfers than its own revenue, but has the staff and track record to run projects well once funded.":
    "{city} depende más de las transferencias centrales que de sus ingresos propios, pero cuenta con el personal y la trayectoria para ejecutar bien los proyectos una vez financiados.",
  "{city} generates strong local revenue and has the institutional capacity to plan and deliver most projects independently.":
    "{city} genera ingresos locales sólidos y tiene la capacidad institucional para planificar y ejecutar la mayoría de los proyectos de forma independiente.",
  "{city} generates significant local revenue but may need to build delivery capacity to implement more complex projects.":
    "{city} genera ingresos locales significativos, pero puede necesitar desarrollar capacidad de ejecución para implementar proyectos más complejos.",
  "{city} has strong institutional capacity but depends heavily on central transfers to fund project delivery.":
    "{city} tiene una sólida capacidad institucional, pero depende en gran medida de las transferencias centrales para financiar la ejecución de proyectos.",
  "{city} is building its financial and delivery capacity, and may need external support for larger-scale projects.":
    "{city} está desarrollando su capacidad financiera y de ejecución, y puede necesitar apoyo externo para proyectos de mayor escala.",
  "Four factors determine an action's financial route": "Cuatro factores determinan la ruta financiera de una acción",
  "Each action's cost and complexity are weighed against what {city} can fund and deliver.":
    "El costo y la complejidad de cada acción se comparan con lo que {city} puede financiar y ejecutar.",
  "What the action needs": "Lo que la acción necesita",
  "What {city} has": "Lo que {city} tiene",
  "Capital intensity": "Intensidad de capital",
  "Financial autonomy": "Autonomía financiera",
  "Preparation complexity": "Complejidad de preparación",
  "Delivery capacity": "Capacidad de ejecución",
  "How much money the action typically requires to implement, based on similar actions delivered elsewhere. Varies per action.":
    "Cuánto dinero requiere típicamente la acción para implementarse, según acciones similares ejecutadas en otros lugares. Varía según la acción.",
  "Share of {city}'s budget raised locally rather than received from national transfers. Lower autonomy means less room to self-fund.":
    "Proporción del presupuesto de {city} recaudada localmente en lugar de recibida por transferencias nacionales. Menor autonomía significa menos margen para autofinanciarse.",
  "How much planning, technical design, or specialist input the action needs before it can start. Varies by action.":
    "Cuánta planificación, diseño técnico o aporte especializado necesita la acción antes de poder comenzar. Varía según la acción.",
  "Whether {city} has enough qualified staff to plan, procure and run a project once it's financed.":
    "Si {city} cuenta con suficiente personal calificado para planificar, licitar y ejecutar un proyecto una vez financiado.",
  "Varies per action": "Varía según la acción",
  "Varies per city": "Varía según la ciudad",
  "What this means for actions": "Qué significa esto para las acciones",

  // ── Financial routes (ROUTE_DEFS, translated at render) ─────────────
  "Self-deliverable": "Autoejecutable",
  "Needs co-finance": "Necesita cofinanciamiento",
  "Needs finance & support": "Necesita financiamiento y apoyo",
  // Route values that arrive unmapped from the finance API (title-cased fallback).
  "Needs Technical Assistance": "Necesita asistencia técnica",
  "Own-Budget Feasible": "Viable con presupuesto propio",
  "Unknown": "Desconocida",
  "Low-cost — the city can fund and run it alone.":
    "Bajo costo — la ciudad puede financiarla y ejecutarla por sí sola.",
  "Cost exceeds the budget — outside funds can cover the gap.":
    "El costo supera el presupuesto — fondos externos pueden cubrir la brecha.",
  "High cost and complexity — needs funding plus outside expertise.":
    "Alto costo y complejidad — necesita financiamiento y experiencia externa.",

  // ── Capacity / cost levels (levelLabel output; "Low"/"High" live in preflight.ts) ──
  "Medium": "Media",
  "Lower": "Más baja",
  "Higher": "Más alta",

  // ── Detail pane ─────────────────────────────────────────────────────
  "← Close": "← Cerrar",
  "What determined this route": "Qué determinó esta ruta",
  "Fund Access": "Acceso a Fondos",
  "{n} DIRECT": "{n} DIRECTOS",
  "Fundable from own budget": "Financiable con presupuesto propio",
  "This action is feasible from the city's own budget — external funding is not required. Any sector funds below are optional sources the city could choose to use.":
    "Esta acción es viable con el presupuesto propio de la ciudad — no se requiere financiamiento externo. Los fondos del sector que aparecen a continuación son fuentes opcionales que la ciudad podría utilizar si lo desea.",
  "Show all {n} sector funds >": "Mostrar los {n} fondos del sector >",
  "self-fundable": "autofinanciable",
  "No matched funds yet": "Aún no hay fondos coincidentes",
  "No catalogued funds in the national investment system (BIP/SNI) or award records currently match this action. This will update automatically as new delivery rounds are added.":
    "Ningún fondo catalogado en el sistema nacional de inversiones (BIP/SNI) ni en los registros de adjudicaciones coincide actualmente con esta acción. Esto se actualizará automáticamente a medida que se agreguen nuevas rondas de ejecución.",
  "Funding opportunity": "Oportunidad de financiamiento",
  "View fund ↗": "Ver fondo ↗",
  "Show fewer funds": "Mostrar menos fondos",
  "Show all {n} matched funds >": "Mostrar los {n} fondos coincidentes >",
  "Matched Projects": "Proyectos Coincidentes",
  "{n} TOTAL": "{n} EN TOTAL",
  "Loading…": "Cargando…",
  "No matched projects yet": "Aún no hay proyectos coincidentes",
  "No catalogued projects in the national investment system (BIP/SNI) or award records currently match this action. This will update automatically as new delivery rounds are added.":
    "Ningún proyecto catalogado en el sistema nacional de inversiones (BIP/SNI) ni en los registros de adjudicaciones coincide actualmente con esta acción. Esto se actualizará automáticamente a medida que se agreguen nuevas rondas de ejecución.",
  "Project": "Proyecto",
  "Strong match": "Coincidencia fuerte",
  "Goal aligned": "Alineada con el objetivo",
  "Matched": "Coincidente",
  "Cost:": "Costo:",
  "Sector:": "Sector:",
  "Channel:": "Canal:",
  "Funder:": "Financiador:",
  "Cycle:": "Ciclo:",
  "Show fewer projects": "Mostrar menos proyectos",
  "Show all {n} matched projects >": "Mostrar los {n} proyectos coincidentes >",

  // ── Table & filters ─────────────────────────────────────────────────
  "What's financially aligned — and what isn't": "Qué está financieramente alineado — y qué no",
  "Filter by financial route to see what's feasible now versus what needs outside support, or narrow by sector. Click View for full reasoning per action.":
    "Filtra por ruta financiera para ver qué es viable ahora y qué necesita apoyo externo, o acota por sector. Haz clic en Ver para el razonamiento completo de cada acción.",
  "All": "Todas",
  "Sorted by score, highest first": "Ordenado por puntuación, de mayor a menor",
  "No financial feasibility data is available for {city} yet.":
    "Aún no hay datos de viabilidad financiera disponibles para {city}.",
  "Action": "Acción",
  "Route": "Ruta",
  "Score": "Puntuación",
  "Detail": "Detalle",
  "No actions match the selected route.": "Ninguna acción coincide con la ruta seleccionada.",
  "direct": "directos",
  "View ↗": "Ver ↗",
  "Prev": "Anterior",
  "Next": "Siguiente",
  "How this is calculated:": "Cómo se calcula:",
  "Each score weighs the action's cost and complexity against {city}'s profile above, plus the funds catalogued for its sector. It estimates financing difficulty — not the odds of winning a specific fund.":
    "Cada puntuación compara el costo y la complejidad de la acción con el perfil de {city} mostrado arriba, más los fondos catalogados para su sector. Estima la dificultad de financiamiento — no la probabilidad de ganar un fondo específico.",

  // ── Footer nav ──────────────────────────────────────────────────────
  "← Policy alignment": "← Alineación de políticas",
  "Save & return to context breakdown →": "Guardar y volver al desglose de contexto →",
  "Pre-flight check →": "Verificación previa →",
};
