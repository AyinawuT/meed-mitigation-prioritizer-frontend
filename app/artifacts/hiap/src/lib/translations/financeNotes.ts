// Spanish translations for the free-text notes / amount_note of the ccglobal
// climate-finance opportunities. The source dataset authors these in English
// (mixing Spanish institutional terms), so they render English in the ES UI.
//
// STOPGAP: keyed by the exact English source string; localizeFinanceNote falls
// back to the original text when a string isn't found (e.g. the upstream note
// is edited). The durable fix is localized note fields in the ccglobal dataset.
//
// NOTE: several source strings are internal analyst annotations (scoring flags,
// build TODOs) rather than user copy — translated here for completeness, but a
// data-side cleanup of what's surfaced would be preferable.

const FINANCE_NOTES_ES: Record<string, string> = {
  "2-year cycle. Yr1 Capital Inicial de Transición: up to 95% / max CLP 450,000 (asignación directa). Yr2 Inversiones de Transición: concursable up to 90% / max CLP 3,500,000. Plus 6 asesorías técnicas + 4 capacitaciones grupales/yr. Subject to budget availability.":
    "Ciclo de 2 años. Año 1 Capital Inicial de Transición: hasta 95% / máx. CLP 450.000 (asignación directa). Año 2 Inversiones de Transición: concursable hasta 90% / máx. CLP 3.500.000. Además, 6 asesorías técnicas + 4 capacitaciones grupales al año. Sujeto a disponibilidad presupuestaria.",
  "2026 concurso: total ~CLP 6,975,575,000. Per-hectare bonificación; literal C cap ~10 UTM/ha. Funds raleos, podas, establecimiento de regeneración, cortafuegos, cercos, obras de conservación de suelos, PFNM, asesoría profesional. Two lines: small owners (CONAF accompanies the whole process) and other interested parties.":
    "Concurso 2026: total ~CLP 6.975.575.000. Bonificación por hectárea; tope literal C ~10 UTM/ha. Financia raleos, podas, establecimiento de regeneración, cortafuegos, cercos, obras de conservación de suelos, PFNM y asesoría profesional. Dos líneas: pequeños propietarios (CONAF acompaña todo el proceso) y otros interesados.",
  "Adjacent research line — not a city-applicant fund; recorded as enabling/context, not a city finance opportunity. Confirm current call window in bases.":
    "Línea de investigación adyacente — no es un fondo al que postule la ciudad; se registra como habilitante/contexto, no como una oportunidad de financiamiento municipal. Confirmar la ventana de postulación vigente en las bases.",
  "Annual budget program (Partida 12, Capítulo 02, Programa 14). Funds indigenous road conservation, basic roads, rural sanitation, rural buildings; feasibility/design for 15,000+ homes and 1,000+ new rural water systems. Amounts in DIPRES/DGOP quarterly execution reports.":
    "Programa presupuestario anual (Partida 12, Capítulo 02, Programa 14). Financia conservación de caminos indígenas, caminos básicos, saneamiento rural y edificaciones rurales; factibilidad/diseño para más de 15.000 viviendas y más de 1.000 nuevos sistemas de agua rural. Montos en los informes trimestrales de ejecución de DIPRES/DGOP.",
  "Annual paving programme; mainly mobility/urban, weak direct climate relevance. Included for completeness.":
    "Programa anual de pavimentación; principalmente movilidad/urbano, con débil relevancia climática directa. Se incluye por completitud.",
  "Annual research fund (Ley 20.283) financing native-forest science; XVII call in 2026. Amount per call set in bases.":
    "Fondo anual de investigación (Ley 20.283) que financia ciencia del bosque nativo; XVII concurso en 2026. Monto por concurso definido en las bases.",
  "Clearest EV-weighted transport subsidy; eligible actor is the colectivo operator, not the municipality. EV gets the special (higher) subsidy. Verified amounts approximate — confirm current value on ChileAtiende ficha 43671.":
    "El subsidio de transporte más claramente orientado a vehículos eléctricos (EV); el actor elegible es el operador de colectivos, no el municipio. El EV recibe el subsidio especial (mayor). Montos verificados aproximados — confirmar el valor vigente en la ficha 43671 de ChileAtiende.",
  "Climate-explicit (water security/basin resilience) but mainly STATUTORY administration, NOT a competitive fund a city applies to. Tag access as statutory/intermediated. Reformed Código de Aguas (Ley 21.435). Permanent.":
    "Explícitamente climático (seguridad hídrica/resiliencia de cuencas), pero principalmente administración ESTATUTARIA, NO un fondo concursable al que postule la ciudad. Clasificar el acceso como estatutario/intermediado. Código de Aguas reformado (Ley 21.435). Permanente.",
  "Climate-explicit: agroecología, resiliencia frente al cambio climático, escasez hídrica. 16 regions; 2nd cycle 2025-2027, postulation 13-29 Oct 2025 (closed now). Norma Técnica REX 24376. RECURRENCE=cycle-based (re-opens per 2-yr cycle), not permanent-standing.":
    "Explícitamente climático: agroecología, resiliencia frente al cambio climático, escasez hídrica. 16 regiones; 2º ciclo 2025-2027, postulación 13-29 oct 2025 (ya cerrada). Norma Técnica REX 24376. RECURRENCIA=por ciclos (se reabre cada ciclo de 2 años), no permanente.",
  "Climate-explicit: irrigation / water security / adaptation to escasez hídrica. Standing annual instrument in the Concursos de Programas de Fomento. Confirm exact amounts against bases.":
    "Explícitamente climático: riego / seguridad hídrica / adaptación a la escasez hídrica. Instrumento anual permanente dentro de los Concursos de Programas de Fomento. Confirmar los montos exactos con las bases.",
  "Climate-explicit: rural water security & sanitation (adaptation). Program since 1964; ~2,422 systems; ~2.27M people. Statutory basis Ley 20.998 (Servicios Sanitarios Rurales). Beneficiary = rural water committee/cooperative, NOT the municipality directly. Five-year modernization co-financed by a World Bank US$250M loan (Water Transition Program). RECURRENCE=permanent standing/statutory.":
    "Explícitamente climático: seguridad hídrica y saneamiento rural (adaptación). Programa desde 1964; ~2.422 sistemas; ~2,27 millones de personas. Base legal Ley 20.998 (Servicios Sanitarios Rurales). Beneficiario = comité/cooperativa de agua rural, NO el municipio directamente. Modernización a cinco años cofinanciada por un préstamo del Banco Mundial de US$250M (Water Transition Program). RECURRENCIA=permanente/estatutaria.",
  "Climate-explicit: soil recovery, erosion control, vegetal cover. Statutory basis Ley 20.412. Regional concursos with dates published per Dirección Regional. RECURRENCE=annual standing instrument.":
    "Explícitamente climático: recuperación de suelos, control de erosión, cobertura vegetal. Base legal Ley 20.412. Concursos regionales con fechas publicadas por cada Dirección Regional. RECURRENCIA=instrumento anual permanente.",
  "Co-financed advisory + investment to link smallholders with buyers; amounts per norma técnica / concurso.":
    "Asesoría cofinanciada + inversión para vincular a pequeños productores con compradores; montos según norma técnica / concurso.",
  "Co-financed technical advisory for productive/commercial development; amounts per norma técnica / concurso.":
    "Asesoría técnica cofinanciada para el desarrollo productivo/comercial; montos según norma técnica / concurso.",
  "Co-finances on-farm productive investments; ceilings per norma técnica / concurso bases.":
    "Cofinancia inversiones productivas prediales; topes según norma técnica / bases del concurso.",
  "Co-financing of on-farm irrigation works/technification; ceilings set in the program norma técnica / concurso bases (confirm at build of any city row).":
    "Cofinanciamiento de obras de riego/tecnificación predial; topes definidos en la norma técnica del programa / bases del concurso (confirmar al construir cada fila de ciudad).",
  "Community-owned PV developed through municipalities; 59 comunas in design (earlier MMA/energia reporting). Access pathway is a rollout, not open application.":
    "Fotovoltaica de propiedad comunitaria desarrollada a través de los municipios; 59 comunas en diseño (según reportes previos de MMA/energía). La vía de acceso es un despliegue, no una postulación abierta.",
  "Conservation/maintenance of existing APR infrastructure; per the DOH conservation budget line.":
    "Conservación/mantenimiento de infraestructura APR existente; según la línea presupuestaria de conservación de la DOH.",
  "Construction + conservation of urban parks; National Urban Parks Policy names 'environment, resilience and climate change' as an axis. Construction not openly competitive (SEREMI-prioritised); confirm conservation call mechanics.":
    "Construcción + conservación de parques urbanos; la Política Nacional de Parques Urbanos señala 'medio ambiente, resiliencia y cambio climático' como un eje. La construcción no es abiertamente concursable (priorizada por la SEREMI); confirmar el mecanismo de postulación para conservación.",
  "Cross-sector infrastructure transfer fund; climate-adjacent. Budget-line dependent -> flag as time-boxed. Confirm scope/amounts against DGOP/DIPRES at build of any city row.":
    "Fondo de transferencia de infraestructura intersectorial; climáticamente adyacente. Depende de la línea presupuestaria → marcar como acotado en el tiempo. Confirmar alcance/montos con DGOP/DIPRES al construir cada fila de ciudad.",
  "Development-infrastructure transfer fund (Subt 33 'A otros ejecutores'); amounts per Ley de Presupuestos / DIPRES.":
    "Fondo de transferencia para infraestructura de desarrollo (Subt. 33 'A otros ejecutores'); montos según Ley de Presupuestos / DIPRES.",
  "Energy access for rural/isolated/vulnerable community infrastructure. Eligible = indigenous communities, juntas de vecinos, NGOs, bomberos. Last postulación finished 2024-07-20 (ChileAtiende).":
    "Acceso a energía para infraestructura comunitaria rural/aislada/vulnerable. Elegibles = comunidades indígenas, juntas de vecinos, ONG, bomberos. La última postulación finalizó el 20-07-2024 (ChileAtiende).",
  "Equalises urban development; funds construction/repair of community infrastructure & equipment. FLAG broad fund: over-matches in scoring; include but down-weight.":
    "Equipara el desarrollo urbano; financia construcción/reparación de infraestructura y equipamiento comunitario. OJO fondo amplio: sobre-coincide en la puntuación; incluir pero ponderar a la baja.",
  "Extension teams (asesoría técnica permanente) + Fondo Único de Financiamiento for users' investment needs; amounts via convenio/contrato.":
    "Equipos de extensión (asesoría técnica permanente) + Fondo Único de Financiamiento para las necesidades de inversión de los usuarios; montos vía convenio/contrato.",
  "Fills the debt-instrument gap. Firm actor, not municipality. US$83M+ placed in 2024.":
    "Cubre la brecha de instrumentos de deuda. El actor es la empresa, no el municipio. Más de US$83M colocados en 2024.",
  "Fleet-renewal subsidy; climate relevance is replacement toward cleaner vehicles (not exclusively zero-emission). Exact 2026 amounts/windows unverified — confirm on ChileAtiende ficha 25058.":
    "Subsidio de renovación de flota; la relevancia climática es el reemplazo por vehículos más limpios (no exclusivamente cero emisiones). Montos/ventanas exactos de 2026 sin verificar — confirmar en la ficha 25058 de ChileAtiende.",
  "GEOGRAPHICALLY GATED: Arauco, Biobío, Malleco, Cautín; from 2024 also Los Ríos & Los Lagos. Do not surface for comunas outside these. Cross-sector rural infra; climate-adjacent. RECURRENCE=time-boxed (annual budget but targeted program horizon), flag as not-permanent.":
    "RESTRINGIDO GEOGRÁFICAMENTE: Arauco, Biobío, Malleco, Cautín; desde 2024 también Los Ríos y Los Lagos. No mostrar para comunas fuera de estas. Infraestructura rural intersectorial; climáticamente adyacente. RECURRENCIA=acotada en el tiempo (presupuesto anual pero con horizonte de programa definido), marcar como no permanente.",
  "General productive-investment instrument; climate relevance indirect (can fund irrigation/energy works). Standing annual instrument.":
    "Instrumento general de inversión productiva; relevancia climática indirecta (puede financiar obras de riego/energía). Instrumento anual permanente.",
  "Households in enrolled comunas co-finance rooftop PV; municipality's role is enrolment/organising (19 comunas reported open).":
    "Los hogares de las comunas inscritas cofinancian fotovoltaica en techos; el rol del municipio es la inscripción/organización (19 comunas reportadas como abiertas).",
  "INDAP finances up to 90% of net cost per the vigente tabla de costos (Decreto 16/2024), plus the technical-assistance cost; applicant funds the remainder. Subprogramas: fertilización fosforada, elementos químicos esenciales, coberturas vegetales, métodos anti-erosión, eliminación de impedimentos físico-químicos.":
    "INDAP financia hasta el 90% del costo neto según la tabla de costos vigente (Decreto 16/2024), más el costo de la asesoría técnica; el postulante financia el resto. Subprogramas: fertilización fosforada, elementos químicos esenciales, coberturas vegetales, métodos anti-erosión, eliminación de impedimentos físico-químicos.",
  "Indigenous rural development; municipal-delivered like PRODESAL -> city is implementer. Permanent standing program. Climate-adjacent (general silvoagropecuario development).":
    "Desarrollo rural indígena; ejecutado por el municipio como PRODESAL → la ciudad es la implementadora. Programa permanente. Climáticamente adyacente (desarrollo silvoagropecuario general).",
  "Innovation/R&D co-financing; broad. Climate-relevant only for clean-tech projects.":
    "Cofinanciamiento de innovación/I+D; amplio. Relevante climáticamente solo para proyectos de tecnología limpia.",
  "Llamado Regular up to UF 30,000 (design+execution); Llamado Especial up to UF 6,000":
    "Llamado Regular hasta UF 30.000 (diseño+ejecución); Llamado Especial hasta UF 6.000",
  "Maintenance counterpart of APR/SSR investment; explicit water-security relevance. Permanent standing line. Confirm exact budget against DIPRES/MOP execution reports.":
    "Contraparte de mantenimiento de la inversión en APR/SSR; relevancia explícita para la seguridad hídrica. Línea permanente. Confirmar el presupuesto exacto con los informes de ejecución de DIPRES/MOP.",
  "Mandate explicitly includes adaptación y resiliencia al cambio climático, escasez hídrica y reconversión productiva, though program is general rural extension (specificity=broad). Executed BY municipalities under convenio -> city is implementer, not just enabler. Solicitud todo el año. Norma Técnica REX 0070-53141 (18.11.2025).":
    "El mandato incluye explícitamente adaptación y resiliencia al cambio climático, escasez hídrica y reconversión productiva, aunque el programa es de extensión rural general (especificidad=amplia). Ejecutado POR los municipios bajo convenio → la ciudad es implementadora, no solo habilitadora. Solicitud todo el año. Norma Técnica REX 0070-53141 (18.11.2025).",
  "Multi-year APP/concession pipeline 2022-2026 (roads, airports, hospitals, energy-supply works); financed via concession model, not a grant.":
    "Cartera plurianual de APP/concesiones 2022-2026 (caminos, aeropuertos, hospitales, obras de suministro energético); financiada mediante el modelo de concesión, no una subvención.",
  "Municipal energy management programme: supports Estrategia Energética Local + Sello + co-financing of community energy projects. 141 comunas adhered, 123 EELs (page).":
    "Programa municipal de gestión energética: apoya la Estrategia Energética Local + Sello + cofinanciamiento de proyectos energéticos comunitarios. 141 comunas adheridas, 123 EEL (página).",
  "Named 2022-2026 plan with an end date -> RECURRENCE=time-boxed. PPP instrument; city is not the applicant. Climate-adjacent.":
    "Plan con nombre 2022-2026 y fecha de término → RECURRENCIA=acotada en el tiempo. Instrumento de APP; la ciudad no es la postulante. Climáticamente adyacente.",
  "Neighbourhood recovery incl. public-space and green works; adjacent climate relevance via green/공간 upgrades.":
    "Recuperación de barrios, incluyendo obras de espacio público y áreas verdes; relevancia climática adyacente mediante mejoras verdes/de espacio.",
  "PV up to 10 kWp; solar thermal up to 1,500 L accumulation":
    "Fotovoltaica hasta 10 kWp; solar térmica hasta 1.500 L de acumulación",
  "Program-level, not per-project: ~half of DOH budget, order CLP 300 bn/yr; sector estimated need ~US$500M. New systems, expansion, and sanitation for rural localities. Per-project amounts via SNI/BIP formulation.":
    "A nivel de programa, no por proyecto: ~la mitad del presupuesto de la DOH, del orden de CLP 300 mil millones/año; necesidad estimada del sector ~US$500M. Nuevos sistemas, ampliación y saneamiento para localidades rurales. Montos por proyecto vía formulación SNI/BIP.",
  "Public-building investment; climate relevance indirect (energy in public buildings). Standing investment subtitle. Flows through the SNI/BIP gate, not a concurso.":
    "Inversión en edificios públicos; relevancia climática indirecta (energía en edificios públicos). Subtítulo de inversión permanente. Pasa por el filtro SNI/BIP, no por un concurso.",
  "Recovers deteriorated public space; funds green areas, rainwater solutions, lighting, pavement, furniture. Governed by DS 312/2016 + Resolución Exenta per call. Page last shows 2023-2024 call (page lag); cadence is annual.":
    "Recupera espacio público deteriorado; financia áreas verdes, soluciones de aguas lluvia, iluminación, pavimento, mobiliario. Regido por el DS 312/2016 + Resolución Exenta por convocatoria. La página muestra por última vez la convocatoria 2023-2024 (desfase de la página); la cadencia es anual.",
  "Reformed subsidy law (Aug 2024) earmarks >=50% of regional Fondos de Apoyo Regional (FAR) to operation + fleet renewal; incentivises zero-emission buses, charging infrastructure and public bicycles. 1,028 electric buses awarded for incorporation 2026-27; 396 e-buses already operating across regional cities. Per-call amounts set by each GORE's bases.":
    "La ley de subsidios reformada (agosto 2024) destina ≥50% de los Fondos de Apoyo Regional (FAR) a operación + renovación de flota; incentiva buses de cero emisiones, infraestructura de carga y bicicletas públicas. 1.028 buses eléctricos adjudicados para incorporación 2026-27; 396 e-buses ya operando en ciudades regionales. Montos por convocatoria definidos en las bases de cada GORE.",
  "Regional tier. Municipal small-works fund; very city-accessible but broad (capped at Moderate).":
    "Nivel regional. Fondo de obras menores municipales; muy accesible para la ciudad pero amplio (limitado a Moderado).",
  "Regional tier. Productivity/investment fund; climate relevance depends on the funded project. Confirm per-region call.":
    "Nivel regional. Fondo de productividad/inversión; la relevancia climática depende del proyecto financiado. Confirmar la convocatoria por región.",
  "Regional tier. Structured nationally by Ley de Presupuestos glosa 07; same line across GOREs. Actor = NGOs, not the municipality; activities not infrastructure.":
    "Nivel regional. Estructurado nacionalmente por la Ley de Presupuestos glosa 07; misma línea en todos los GORE. Actor = ONG, no el municipio; actividades, no infraestructura.",
  "Regional tier. The main regional investment channel (created 1974). Broad: down-weight in scoring (capped at Moderate).":
    "Nivel regional. El principal canal de inversión regional (creado en 1974). Amplio: ponderar a la baja en la puntuación (limitado a Moderado).",
  "Rolling credit, not a concurso. Climate relevance indirect (finances any AFC investment, incl. irrigation/soil). Permanent standing instrument.":
    "Crédito rotativo, no un concurso. Relevancia climática indirecta (financia cualquier inversión de la AFC, incl. riego/suelo). Instrumento permanente.",
  "Sanitation/solid-waste/electrification/heritage for low-income areas; per Ley de Presupuestos can fund waste valorization & management models, energization, rural connectivity. Water/waste relevance.":
    "Saneamiento/residuos sólidos/electrificación/patrimonio para zonas de bajos ingresos; según la Ley de Presupuestos puede financiar valorización de residuos y modelos de gestión, energización y conectividad rural. Relevancia en agua/residuos.",
  "Short- and long-term credit lines for working capital and investment; rates/ceilings per credit policy.":
    "Líneas de crédito de corto y largo plazo para capital de trabajo e inversión; tasas/topes según la política de crédito.",
  "Statutory administration of water rights + Planes Estratégicos de Recursos Hídricos (PERH) per basin (updated every 10 yrs) + a fund for research/innovation/education in water resources (regional distribution), created by the Ley 21.435 reform.":
    "Administración estatutaria de derechos de agua + Planes Estratégicos de Recursos Hídricos (PERH) por cuenca (actualizados cada 10 años) + un fondo para investigación/innovación/educación en recursos hídricos (distribución regional), creado por la reforma de la Ley 21.435.",
  "Strongest city-relevant transport lever but city is not the applicant — operators apply, GORE administers. Amount per call set in GORE bases (unverified at program level). Climate: electrification of regional public transport.":
    "La palanca de transporte más relevante para la ciudad, pero la ciudad no es la postulante — los operadores postulan, el GORE administra. Monto por convocatoria definido en las bases del GORE (sin verificar a nivel de programa). Clima: electrificación del transporte público regional.",
  "Subsidy to scrap and renew buses of regulated/registered public transport; favours lower-emission replacement. Amount varies by vehicle and process (per ChileAtiende ficha 25058).":
    "Subsidio para chatarrizar y renovar buses del transporte público regulado/registrado; favorece el reemplazo de menores emisiones. El monto varía según el vehículo y el proceso (ficha 25058 de ChileAtiende).",
  "Subt 31 Iniciativas de Inversión for public/community buildings; per SNI/BIP formulation and Ley de Presupuestos.":
    "Subt. 31 Iniciativas de Inversión para edificios públicos/comunitarios; según formulación SNI/BIP y Ley de Presupuestos.",
  "TIME-SENSITIVE: 2026 cycle applications close noon 1 Jul 2026; results late Aug 2026. Native-forest conservation/recovery/sustainable-management — mitigation (forest carbon) + adaptation (soil/fire) relevance. City fit via municipal land or facilitation of local owners.":
    "SENSIBLE AL TIEMPO: las postulaciones del ciclo 2026 cierran al mediodía del 1 jul 2026; resultados a fines de agosto 2026. Conservación/recuperación/manejo sostenible del bosque nativo — relevancia de mitigación (carbono forestal) + adaptación (suelo/fuego). Encaje para la ciudad vía terrenos municipales o facilitación a propietarios locales.",
  "Technical assistance to municipalities for local energy management; enabling, not a cash fund.":
    "Asistencia técnica a los municipios para la gestión energética local; habilitante, no un fondo en efectivo.",
  "Three components: Asesoría Técnica (AT), Capital de Trabajo (CT, ex-FOA), Inversiones de activos productivos (IFP), by microproducer typology. Amounts in the norma técnica / procedimiento operativo.":
    "Tres componentes: Asesoría Técnica (AT), Capital de Trabajo (CT, ex-FOA), Inversiones de activos productivos (IFP), según tipología de microproductor. Montos en la norma técnica / procedimiento operativo.",
  "Urban recovery fund; broad. Lower direct climate relevance; included for completeness.":
    "Fondo de recuperación urbana; amplio. Menor relevancia climática directa; se incluye por completitud.",
  "co-financed (municipality + neighbours + MINVU); per call":
    "cofinanciado (municipio + vecinos + MINVU); por convocatoria",
  "co-financing up to ~50% of rooftop PV + ~30% aggregate-purchase discount":
    "cofinanciamiento de hasta ~50% de fotovoltaica en techos + ~30% de descuento por compra agregada",
  "co-financing via concursable windows; amount varies":
    "cofinanciamiento vía ventanas concursables; el monto varía",
  "covers a share of the collateral a firm lacks for a bank loan (incl. green projects)":
    "cubre una parte de la garantía que le falta a una empresa para un crédito bancario (incl. proyectos verdes)",
  "energy/thermal upgrades to schools; amount per call":
    "mejoras energéticas/térmicas en escuelas; monto por convocatoria",
  "in-kind technical assistance (no cash grant)":
    "asistencia técnica en especie (sin subvención en efectivo)",
  "large regional investment projects; per-project, requires SNI 'Recomendación Satisfactoria (RS)'":
    "proyectos de inversión regional de gran escala; por proyecto, requiere 'Recomendación Satisfactoria (RS)' del SNI",
  "large; backed by a ~US$1,000M green-hydrogen fund (with EIB/KfW); facilities phased in":
    "gran escala; respaldado por un fondo de hidrógeno verde de ~US$1.000M (con BEI/KfW); instalaciones incorporadas por etapas",
  "per call; 2026 convocatoria prioritised >=10 projects in decarbonisation, green H2, clean energy, CO2 capture":
    "por convocatoria; la convocatoria 2026 priorizó ≥10 proyectos en descarbonización, H2 verde, energía limpia y captura de CO2",
  "per call; innovation & R&D co-financing, includes clean-tech / sustainability lines":
    "por convocatoria; cofinanciamiento de innovación e I+D, incluye líneas de tecnología limpia / sostenibilidad",
  "per-neighbourhood programme":
    "programa por barrio",
  "per-park; SEREMI-prioritised by green-area deficit, population, vulnerability":
    "por parque; priorizado por la SEREMI según déficit de áreas verdes, población y vulnerabilidad",
  "per-project":
    "por proyecto",
  "per-project, budget-dependent":
    "por proyecto, dependiente del presupuesto",
  "per-project, budget-dependent (no fixed ceiling on the program page)":
    "por proyecto, dependiente del presupuesto (sin tope fijo en la página del programa)",
  "per-region; e.g. up to ~CLP 300,000,000 (Arica y Parinacota 2026)":
    "por región; p. ej. hasta ~CLP 300.000.000 (Arica y Parinacota 2026)",
  "up to US$30M per firm, term up to 20 years; CORFO funds the financial institution, not the firm directly":
    "hasta US$30M por empresa, plazo de hasta 20 años; CORFO financia a la institución financiera, no directamente a la empresa",
  "up to ~CLP 30,000,000; max 2 projects per org; activities up to 6 months (Jul-Dec 2026)":
    "hasta ~CLP 30.000.000; máx. 2 proyectos por organización; actividades de hasta 6 meses (jul-dic 2026)",
  "~CLP 6.8M special subsidy for electric replacement; figures of ~CLP 7.7M and up to ~CLP 9M cited with scrappage (vary by region/process). Reajustado cada marzo.":
    "~CLP 6,8M de subsidio especial para reemplazo eléctrico; se citan cifras de ~CLP 7,7M y hasta ~CLP 9M con chatarrización (varían por región/proceso). Reajustado cada marzo.",
};

/**
 * Localize a finance opportunity note / amount_note. Returns the Spanish
 * translation when the language is "es" and the exact source string is known;
 * otherwise returns the original text (English fallback).
 */
export function localizeFinanceNote(text: string | null | undefined, lang: string): string {
  if (!text) return "";
  if (lang !== "es") return text;
  return FINANCE_NOTES_ES[text.trim()] ?? text;
}

// ─── Enum badge labels ────────────────────────────────────────────────────────
// The finance API returns snake_case enum values (status, instrument, lifecycle).
// enumLabel maps them to clean English labels that then resolve through t()
// (ES entries live in translations/financial.ts). Shared by the finance screen
// AND the recommendations action drawer, which render the same opportunities.

export const OPP_STATUS_LABEL: Record<string, string> = {
  ongoing: "Ongoing", open: "Open", closed: "Closed",
  emerging: "Emerging", in_rollout: "In rollout", periodic: "Periodic",
};
export const INSTRUMENT_LABEL: Record<string, string> = {
  grant: "Grant", loan: "Loan", blended: "Blended", subsidy: "Subsidy",
  co_financing: "Co-financing", technical_assistance: "Technical assistance",
};
export const LIFECYCLE_LABEL: Record<string, string> = {
  completed: "Completed", financed: "Financed", appraised: "Appraised",
  formulated: "Formulated", "in-execution": "In execution",
};

// Matched-project sector + funding-channel enums. The project feed mixes
// snake_case tags (stationary_energy) with prose labels (Housing and Urban
// Development); both normalize here to a canonical English label that resolves
// through t() (ES entries in translations/financial.ts).
export const PROJECT_SECTOR_LABEL: Record<string, string> = {
  transport: "Transport", waste: "Waste", water: "Water", energy: "Energy",
  afolu: "AFOLU", stationary_energy: "Stationary Energy",
  "housing and urban development": "Housing and Urban Development",
  "natural resources and environment": "Natural Resources and Environment",
};
export const PROJECT_CHANNEL_LABEL: Record<string, string> = {
  "public investment": "Public investment",
  "competitive fund": "Competitive fund",
  "intermediated multilateral": "Intermediated multilateral",
};

export function enumLabel(raw: string | undefined, map: Record<string, string>): string {
  if (!raw) return "";
  const key = raw.toLowerCase().trim();
  if (map[key]) return map[key];
  const spaced = key.replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Matched projects carry the source (Spanish, from BIP/SNI) name plus an English
// translation in project_name_i18n. Show the active language's name as primary
// and the other as a secondary reference line.
export function localizeProjectName(
  proj: { project_name?: string; project_name_i18n?: { en?: string; es?: string } },
  lang: string,
): { primary: string; alt: string | null } {
  const es = proj.project_name_i18n?.es;
  const en = proj.project_name_i18n?.en ?? proj.project_name;
  const primary = (lang === "es" ? es ?? en : en ?? es) ?? proj.project_name ?? "";
  const altRaw = lang === "es" ? en : es;
  const alt = altRaw && altRaw !== primary ? altRaw : null;
  return { primary, alt };
}

// ─── Finance route reason ─────────────────────────────────────────────────────
// The API `reason` is a templated sentence: a base clause (with an optional
// "via N fund(s)") plus an optional " N comparable project(s) on record." tail.
// Translate the base template and re-insert the numbers.

const REASON_BASE_ES: Record<string, string> = {
  "Capacity is the constraint, not money; needs technical assistance.":
    "La restricción es la capacidad, no el dinero; necesita asistencia técnica.",
  "Capital need exceeds the city's autonomy; co-finance available via {n} fund(s) the city can apply to directly.":
    "La necesidad de capital supera la autonomía de la ciudad; hay cofinanciamiento disponible mediante {n} fondo(s) al/a los que la ciudad puede postular directamente.",
  "Capital need exceeds the city's autonomy; co-finance available via {n} fund(s), awarded competitively.":
    "La necesidad de capital supera la autonomía de la ciudad; hay cofinanciamiento disponible mediante {n} fondo(s), adjudicado(s) por concurso.",
  "High capital and preparation needs; external finance plus technical support, via {n} fund(s) the city can apply to directly.":
    "Altas necesidades de capital y de preparación; financiamiento externo más apoyo técnico, mediante {n} fondo(s) al/a los que la ciudad puede postular directamente.",
  "High capital and preparation needs; external finance plus technical support, via {n} fund(s), awarded competitively.":
    "Altas necesidades de capital y de preparación; financiamiento externo más apoyo técnico, mediante {n} fondo(s), adjudicado(s) por concurso.",
  "Low-capital action the city can deliver itself.":
    "Acción de bajo capital que la ciudad puede ejecutar por sí misma.",
  "Within the city's own budget and capacity.":
    "Dentro del presupuesto y la capacidad propios de la ciudad.",
};

export function localizeFinanceReason(reason: string | null | undefined, lang: string): string {
  if (!reason) return "";
  if (lang !== "es") return reason;
  let base = reason.trim();
  let tail = "";
  const m = base.match(/\s*(\d+) comparable project\(s\) on record\.\s*$/);
  if (m) {
    tail = ` ${m[1]} proyecto(s) comparable(s) registrado(s).`;
    base = base.slice(0, m.index).trim();
  }
  let fundN: string | null = null;
  const key = base.replace(/via (\d+) fund\(s\)/, (_full, n) => { fundN = n as string; return "via {n} fund(s)"; });
  const esBase = REASON_BASE_ES[key];
  if (!esBase) return reason; // unknown template → leave untouched rather than half-translate
  return (fundN !== null ? esBase.replace("{n}", fundN) : esBase) + tail;
}
