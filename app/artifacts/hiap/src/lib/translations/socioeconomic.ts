export const socioeconomic: Record<string, string> = {
  // ── Not-found state ─────────────────────────────────────────────────
  "City not found.": "Ciudad no encontrada.",
  "← Back to cities": "← Volver a ciudades",

  // ── Page header ─────────────────────────────────────────────────────
  "Aceleradora Local de Mitigación uses socioeconomic indicators to assess how feasible each climate action is for {city}. Indicators such as income levels, employment, and urban density shape which actions are realistically deliverable.":
    "Aceleradora Local de Mitigación utiliza indicadores socioeconómicos para evaluar qué tan viable es cada acción climática para {city}. Indicadores como niveles de ingreso, empleo y densidad urbana definen qué acciones son realistamente ejecutables.",
  "{n} indicators loaded": "{n} indicadores cargados",
  "ALM FEASIBILITY: Mitigation feasibility shapes 33% of feasibility score · Feasibility shapes 23% of ranking":
    "VIABILIDAD ALM: La viabilidad de mitigación define el 33% de la puntuación de viabilidad · La viabilidad define el 23% del ranking",

  // ── Category labels ─────────────────────────────────────────────────
  "Very High": "Muy Alto",
  "High": "Alto",
  "Medium": "Medio",
  "Low": "Bajo",
  "Very Low": "Muy Bajo",

  // ── Themes ──────────────────────────────────────────────────────────
  "Income & Welfare": "Ingresos y Bienestar",
  "Housing": "Vivienda",
  "Mobility": "Movilidad",
  "Energy": "Energía",
  "Employment": "Empleo",
  "Demographics": "Demografía",
  "Digital Infrastructure": "Infraestructura Digital",
  "Land Use": "Uso de Suelo",
  "Other": "Otros",

  // ── Table headers ───────────────────────────────────────────────────
  "INDICATOR": "INDICADOR",
  "VALUE": "VALOR",
  "RELATIVE LEVEL": "NIVEL RELATIVO",
  "ALM CLIMATE RELEVANCE": "RELEVANCIA CLIMÁTICA ALM",

  // ── Indicator labels ────────────────────────────────────────────────
  // ("Population" lives in cityProfile.ts — not duplicated here)
  "Poverty Rate": "Tasa de Pobreza",
  "Median Household Income": "Ingreso Mediano del Hogar",
  "Unemployment Rate": "Tasa de Desempleo",
  "Renter Share": "Proporción de Arrendatarios",
  "Home Ownership": "Propiedad de Vivienda",
  "Public Transport Mode Share": "Participación Modal del Transporte Público",
  "Transport & Logistics Employment": "Empleo en Transporte y Logística",
  "Construction Employment": "Empleo en Construcción",
  "Electricity Access": "Acceso a Electricidad",
  "Agriculture & Forestry Employment": "Empleo en Agricultura y Silvicultura",
  "Electricity & Gas Employment": "Empleo en Electricidad y Gas",
  "Manufacturing Employment": "Empleo en Manufactura",
  "Mining Employment": "Empleo en Minería",
  "Water & Waste Employment": "Empleo en Agua y Residuos",
  "Disability Prevalence": "Prevalencia de Discapacidad",
  "Fixed Internet Household Access": "Acceso de Hogares a Internet Fijo",
  "Indigenous Population Share": "Proporción de Población Indígena",
  "Literacy Rate": "Tasa de Alfabetización",
  "Mean Years of Schooling": "Años Promedio de Escolaridad",
  "Primary Forest Share": "Proporción de Bosque Primario",
  "Secondary Forest Share": "Proporción de Bosque Secundario",
  "Silviculture Share": "Proporción de Silvicultura",
  "Cropland Share": "Proporción de Cultivos",
  "Pasture Share": "Proporción de Praderas",
  "Grassland Share": "Proporción de Pastizales",
  "Shrubland Share": "Proporción de Matorrales",
  "Beach Dune Share": "Proporción de Playas y Dunas",
  "Ice Snow Share": "Proporción de Hielo y Nieve",
  "Other Bare Share": "Proporción de Suelo Desnudo",
  "Urban Built Share": "Proporción de Suelo Urbano Construido",
  "Water Share": "Proporción de Cuerpos de Agua",
  "Wetland Share": "Proporción de Humedales",

  // ── Relevance: poverty_rate ─────────────────────────────────────────
  "Very high poverty — prioritise low-cost, high co-benefit interventions":
    "Pobreza muy alta — prioriza intervenciones de bajo costo y altos co-beneficios",
  "High poverty → prioritise low-cost, co-benefit interventions":
    "Pobreza alta → prioriza intervenciones de bajo costo con co-beneficios",
  "Moderate poverty — balance equity and efficiency in action selection":
    "Pobreza moderada — equilibra equidad y eficiencia al seleccionar acciones",
  "Low poverty — broader range of investment-intensive actions feasible":
    "Pobreza baja — es viable una gama más amplia de acciones intensivas en inversión",
  "Very low poverty — full range of climate investments is viable":
    "Pobreza muy baja — toda la gama de inversiones climáticas es viable",

  // ── Relevance: median_household_income ──────────────────────────────
  "Very high income — strong capacity to invest in clean technology":
    "Ingresos muy altos — gran capacidad para invertir en tecnología limpia",
  "High income — good capacity to invest in clean technology":
    "Ingresos altos — buena capacidad para invertir en tecnología limpia",
  "Moderate income enables investment in clean technology":
    "Ingresos moderados permiten invertir en tecnología limpia",
  "Lower income — limited household investment capacity":
    "Ingresos más bajos — capacidad de inversión de los hogares limitada",
  "Very low income — focus on no-cost and subsidised interventions":
    "Ingresos muy bajos — enfócate en intervenciones sin costo y subsidiadas",

  // ── Relevance: unemployment_rate ────────────────────────────────────
  "Very high unemployment — green job creation is a critical co-benefit":
    "Desempleo muy alto — la creación de empleos verdes es un co-beneficio crítico",
  "High unemployment — green jobs co-benefit strengthens political viability":
    "Desempleo alto — el co-beneficio de empleos verdes fortalece la viabilidad política",
  "Moderate unemployment — green job creation remains a viable co-benefit":
    "Desempleo moderado — la creación de empleos verdes sigue siendo un co-beneficio viable",
  "Low unemployment — labour market is tight; just-transition risks are lower":
    "Desempleo bajo — el mercado laboral está ajustado; los riesgos de transición justa son menores",
  "Very low unemployment — labour constraints may affect implementation pace":
    "Desempleo muy bajo — las restricciones laborales pueden afectar el ritmo de implementación",

  // ── Relevance: renter_share ─────────────────────────────────────────
  "Very high renter share → severe split-incentive barrier for building retrofits":
    "Proporción muy alta de arrendatarios → grave barrera de incentivos divididos para renovar edificios",
  "High renter share — split-incentive problem for building retrofits":
    "Alta proporción de arrendatarios — problema de incentivos divididos para renovar edificios",
  "Mixed tenure — building retrofits viable with targeted landlord incentives":
    "Tenencia mixta — las renovaciones de edificios son viables con incentivos dirigidos a propietarios",
  "Low renter share — building retrofit programmes can reach most households":
    "Baja proporción de arrendatarios — los programas de renovación pueden llegar a la mayoría de los hogares",
  "Very low renter share — most households own; retrofit programmes are effective":
    "Proporción muy baja de arrendatarios — la mayoría de los hogares son propietarios; los programas de renovación son efectivos",

  // ── Relevance: home_ownership ───────────────────────────────────────
  "Very high ownership — retrofit programmes can directly target homeowners":
    "Propiedad muy alta — los programas de renovación pueden dirigirse directamente a los propietarios",
  "High ownership — focus retrofits on owner-occupied homes":
    "Propiedad alta — enfoca las renovaciones en viviendas ocupadas por sus dueños",
  "Moderate ownership — mix of tenure types; combined approach needed":
    "Propiedad moderada — mezcla de tipos de tenencia; se necesita un enfoque combinado",
  "Low ownership — focus retrofits on social housing and public buildings":
    "Propiedad baja — enfoca las renovaciones en vivienda social y edificios públicos",
  "Very low ownership — focus retrofits on social housing and public buildings":
    "Propiedad muy baja — enfoca las renovaciones en vivienda social y edificios públicos",

  // ── Relevance: public_transport_share ───────────────────────────────
  "Very high PT use — transit investment can deliver significant modal shift gains":
    "Uso muy alto de transporte público — la inversión en transporte puede lograr avances significativos de cambio modal",
  "High PT use — transit investment can deliver significant modal shift gains":
    "Uso alto de transporte público — la inversión en transporte puede lograr avances significativos de cambio modal",
  "Medium PT use — transit investment can shift modal split":
    "Uso medio de transporte público — la inversión en transporte puede cambiar la distribución modal",
  "Low PT use — mode shift investment is challenging but high-impact if successful":
    "Uso bajo de transporte público — invertir en cambio modal es desafiante pero de alto impacto si tiene éxito",
  "Very low PT use — significant behaviour change needed; prioritise infrastructure":
    "Uso muy bajo de transporte público — se necesita un cambio de comportamiento significativo; prioriza la infraestructura",

  // ── Relevance: employment_in_transport_and_logistics ────────────────
  "Large freight sector — just-transition risks must be carefully managed":
    "Sector de carga grande — los riesgos de transición justa deben gestionarse con cuidado",
  "Significant freight sector — just-transition planning is important":
    "Sector de carga significativo — la planificación de la transición justa es importante",
  "Moderate freight sector — just-transition considerations apply":
    "Sector de carga moderado — aplican consideraciones de transición justa",
  "Relatively small freight sector — lower just-transition risk":
    "Sector de carga relativamente pequeño — menor riesgo de transición justa",
  "Minimal freight employment — just-transition risk is negligible":
    "Empleo mínimo en carga — el riesgo de transición justa es insignificante",

  // ── Relevance: employment_construction ──────────────────────────────
  "Very large construction sector — just-transition considerations are critical":
    "Sector de construcción muy grande — las consideraciones de transición justa son críticas",
  "Large construction sector — just-transition considerations are important":
    "Sector de construcción grande — las consideraciones de transición justa son importantes",
  "Moderate construction sector — just-transition planning is recommended":
    "Sector de construcción moderado — se recomienda planificar la transición justa",
  "Small construction sector — just-transition risks are limited":
    "Sector de construcción pequeño — los riesgos de transición justa son limitados",
  "Minimal construction employment — just-transition risk is very low":
    "Empleo mínimo en construcción — el riesgo de transición justa es muy bajo",

  // ── Relevance: electricity_access_rate ──────────────────────────────
  "Near-universal access — electrification of transport and heating is highly feasible":
    "Acceso casi universal — la electrificación del transporte y la calefacción es altamente viable",
  "High electricity access — electrification actions are broadly feasible":
    "Alto acceso a electricidad — las acciones de electrificación son ampliamente viables",
  "Moderate access — extend grid before prioritising electrification actions":
    "Acceso moderado — amplía la red antes de priorizar acciones de electrificación",
  "Low electricity access — grid expansion should precede electrification actions":
    "Bajo acceso a electricidad — la expansión de la red debe preceder a las acciones de electrificación",
  "Very low access — grid expansion is a prerequisite for electrification actions":
    "Acceso muy bajo — la expansión de la red es un prerrequisito para las acciones de electrificación",

  // ── Relevance: employment_agriculture_forestry ──────────────────────
  "Very large agriculture sector — AFOLU actions have strong local labour impact":
    "Sector agrícola muy grande — las acciones AFOLU tienen un fuerte impacto laboral local",
  "Large agriculture sector — AFOLU actions have notable labour implications":
    "Sector agrícola grande — las acciones AFOLU tienen implicaciones laborales notables",
  "Moderate agricultural employment — AFOLU actions have measurable local reach":
    "Empleo agrícola moderado — las acciones AFOLU tienen un alcance local medible",
  "Small agriculture sector — limited AFOLU just-transition exposure":
    "Sector agrícola pequeño — exposición limitada a la transición justa en AFOLU",
  "Minimal agricultural employment — AFOLU just-transition risk is very low":
    "Empleo agrícola mínimo — el riesgo de transición justa en AFOLU es muy bajo",

  // ── Relevance: employment_electricity_gas ───────────────────────────
  "Very large utilities workforce — energy transition just-transition is critical":
    "Fuerza laboral de servicios básicos muy grande — la transición justa de la transición energética es crítica",
  "Significant utilities workforce — energy transition planning is important":
    "Fuerza laboral de servicios básicos significativa — planificar la transición energética es importante",
  "Moderate utilities employment — just-transition planning is advisable":
    "Empleo moderado en servicios básicos — es aconsejable planificar la transición justa",
  "Small utilities workforce — energy transition just-transition risk is limited":
    "Fuerza laboral de servicios básicos pequeña — el riesgo de transición justa de la transición energética es limitado",
  "Minimal utilities employment — energy transition risk is very low":
    "Empleo mínimo en servicios básicos — el riesgo de la transición energética es muy bajo",

  // ── Relevance: employment_manufacturing ─────────────────────────────
  "Very large manufacturing base — industrial decarbonisation is a key priority":
    "Base manufacturera muy grande — la descarbonización industrial es una prioridad clave",
  "Large manufacturing base — industrial decarbonisation has major impact":
    "Base manufacturera grande — la descarbonización industrial tiene un impacto mayor",
  "Moderate manufacturing employment — IPPU actions have measurable reach":
    "Empleo manufacturero moderado — las acciones IPPU tienen un alcance medible",
  "Small manufacturing base — IPPU actions have limited local impact":
    "Base manufacturera pequeña — las acciones IPPU tienen un impacto local limitado",
  "Minimal manufacturing employment — industrial decarbonisation has low priority":
    "Empleo manufacturero mínimo — la descarbonización industrial tiene baja prioridad",

  // ── Relevance: employment_mining ────────────────────────────────────
  "Very large mining sector — extraction emissions and just-transition are critical":
    "Sector minero muy grande — las emisiones de extracción y la transición justa son críticas",
  "Significant mining sector — just-transition considerations are important":
    "Sector minero significativo — las consideraciones de transición justa son importantes",
  "Moderate mining employment — just-transition planning is advisable":
    "Empleo minero moderado — es aconsejable planificar la transición justa",
  "Small mining sector — limited extraction sector just-transition exposure":
    "Sector minero pequeño — exposición limitada a la transición justa del sector extractivo",
  "Minimal mining employment — extraction sector just-transition risk is very low":
    "Empleo minero mínimo — el riesgo de transición justa del sector extractivo es muy bajo",

  // ── Relevance: employment_water_waste ───────────────────────────────
  "Very large water/waste sector — waste and water actions have high local impact":
    "Sector de agua/residuos muy grande — las acciones de residuos y agua tienen alto impacto local",
  "Significant water/waste workforce — waste management actions are highly relevant":
    "Fuerza laboral de agua/residuos significativa — las acciones de gestión de residuos son muy relevantes",
  "Moderate water/waste employment — waste actions have measurable local reach":
    "Empleo moderado en agua/residuos — las acciones de residuos tienen un alcance local medible",
  "Small water/waste sector — waste actions have limited labour implications":
    "Sector de agua/residuos pequeño — las acciones de residuos tienen implicaciones laborales limitadas",
  "Minimal water/waste employment — waste actions affect very few workers":
    "Empleo mínimo en agua/residuos — las acciones de residuos afectan a muy pocos trabajadores",

  // ── Relevance: disability_prevalence ────────────────────────────────
  "Very high disability prevalence — accessibility must be central to action design":
    "Prevalencia de discapacidad muy alta — la accesibilidad debe ser central en el diseño de las acciones",
  "High disability prevalence — accessibility considerations are important":
    "Prevalencia de discapacidad alta — las consideraciones de accesibilidad son importantes",
  "Moderate disability prevalence — accessibility should be addressed in design":
    "Prevalencia de discapacidad moderada — la accesibilidad debe abordarse en el diseño",
  "Low disability prevalence — standard accessibility provisions are sufficient":
    "Prevalencia de discapacidad baja — las medidas de accesibilidad estándar son suficientes",
  "Very low disability prevalence — baseline accessibility provisions apply":
    "Prevalencia de discapacidad muy baja — aplican las medidas de accesibilidad básicas",

  // ── Relevance: fixed_internet_household_share ───────────────────────
  "Near-universal internet access — smart city and digital monitoring actions are highly feasible":
    "Acceso a internet casi universal — las acciones de ciudad inteligente y monitoreo digital son altamente viables",
  "High internet access — digital infrastructure actions have strong reach":
    "Alto acceso a internet — las acciones de infraestructura digital tienen gran alcance",
  "Moderate internet access — digital actions can reach most households":
    "Acceso moderado a internet — las acciones digitales pueden llegar a la mayoría de los hogares",
  "Low internet access — digital solutions have limited penetration":
    "Bajo acceso a internet — las soluciones digitales tienen penetración limitada",
  "Very low internet access — digital monitoring and smart city actions face barriers":
    "Acceso muy bajo a internet — las acciones de monitoreo digital y ciudad inteligente enfrentan barreras",

  // ── Relevance: indigenous_identification_rate ───────────────────────
  "Very high indigenous share — FPIC and culturally appropriate co-design are essential":
    "Proporción indígena muy alta — el consentimiento libre, previo e informado y el co-diseño culturalmente apropiado son esenciales",
  "High indigenous population share — culturally inclusive engagement is critical":
    "Alta proporción de población indígena — la participación culturalmente inclusiva es crítica",
  "Moderate indigenous share — inclusive engagement should be planned":
    "Proporción indígena moderada — se debe planificar una participación inclusiva",
  "Low indigenous share — standard community engagement applies":
    "Proporción indígena baja — aplica la participación comunitaria estándar",
  "Very low indigenous share — standard community engagement applies":
    "Proporción indígena muy baja — aplica la participación comunitaria estándar",

  // ── Relevance: literacy_rate ────────────────────────────────────────
  "Very high literacy — public communication and behaviour change programmes are highly effective":
    "Alfabetización muy alta — la comunicación pública y los programas de cambio de comportamiento son altamente efectivos",
  "High literacy — public engagement and awareness campaigns are broadly effective":
    "Alfabetización alta — las campañas de participación y sensibilización pública son ampliamente efectivas",
  "Moderate literacy — multi-format communication supports broader engagement":
    "Alfabetización moderada — la comunicación en múltiples formatos favorece una participación más amplia",
  "Low literacy — visual and community-based communication is essential":
    "Alfabetización baja — la comunicación visual y comunitaria es esencial",
  "Very low literacy — text-based public communication has limited reach":
    "Alfabetización muy baja — la comunicación pública basada en texto tiene alcance limitado",

  // ── Relevance: mean_years_schooling ─────────────────────────────────
  "High education levels — technical workforce capacity for complex actions is strong":
    "Altos niveles educativos — la capacidad técnica de la fuerza laboral para acciones complejas es sólida",
  "Good education levels — capacity for technical and professional green jobs is high":
    "Buenos niveles educativos — la capacidad para empleos verdes técnicos y profesionales es alta",
  "Moderate education levels — targeted training can build capacity for green jobs":
    "Niveles educativos moderados — la capacitación dirigida puede desarrollar capacidad para empleos verdes",
  "Lower education levels — vocational training is key to green job access":
    "Niveles educativos más bajos — la formación técnica es clave para acceder a empleos verdes",
  "Low education levels — foundational skills development should accompany action delivery":
    "Niveles educativos bajos — el desarrollo de habilidades básicas debe acompañar la ejecución de las acciones",

  // ── Relevance: population ───────────────────────────────────────────
  "Very large city — actions with high per-capita impact maximise absolute emissions reductions":
    "Ciudad muy grande — las acciones con alto impacto per cápita maximizan las reducciones absolutas de emisiones",
  "Large city — broad-reach actions deliver significant total emissions reductions":
    "Ciudad grande — las acciones de amplio alcance logran reducciones totales de emisiones significativas",
  "Medium-sized city — mix of city-wide and targeted actions is effective":
    "Ciudad mediana — una mezcla de acciones a escala de ciudad y focalizadas es efectiva",
  "Small city — targeted, high-leverage actions deliver the most impact":
    "Ciudad pequeña — las acciones focalizadas y de alto apalancamiento logran el mayor impacto",
  "Very small city — highly targeted interventions maximise proportional impact":
    "Ciudad muy pequeña — las intervenciones altamente focalizadas maximizan el impacto proporcional",

  // ── Relevance: primary_forest_share ─────────────────────────────────
  "Very high primary forest cover — AFOLU conservation actions can deliver major carbon sequestration":
    "Cobertura de bosque primario muy alta — las acciones de conservación AFOLU pueden lograr una captura de carbono importante",
  "High primary forest share — forest conservation and management are high-priority AFOLU actions":
    "Alta proporción de bosque primario — la conservación y el manejo forestal son acciones AFOLU de alta prioridad",
  "Moderate primary forest — forest protection actions have meaningful sequestration potential":
    "Bosque primario moderado — las acciones de protección forestal tienen un potencial de captura significativo",
  "Low primary forest share — limited forest carbon stock; focus on restoration":
    "Baja proporción de bosque primario — reserva limitada de carbono forestal; enfócate en la restauración",
  "Minimal primary forest — afforestation and ecosystem restoration are the priority AFOLU pathway":
    "Bosque primario mínimo — la forestación y la restauración de ecosistemas son la vía AFOLU prioritaria",

  // ── Relevance: secondary_forest_share ───────────────────────────────
  "Very high secondary forest — restoration management can significantly boost carbon sequestration":
    "Bosque secundario muy alto — el manejo de restauración puede aumentar significativamente la captura de carbono",
  "High secondary forest share — active forest management can enhance carbon stocks":
    "Alta proporción de bosque secundario — el manejo forestal activo puede mejorar las reservas de carbono",
  "Moderate secondary forest — restoration programmes can build long-term carbon sinks":
    "Bosque secundario moderado — los programas de restauración pueden construir sumideros de carbono a largo plazo",
  "Low secondary forest — limited regeneration base; restoration investment needed":
    "Bosque secundario bajo — base de regeneración limitada; se necesita inversión en restauración",
  "Minimal secondary forest — afforestation from degraded land is the primary AFOLU option":
    "Bosque secundario mínimo — la forestación de tierras degradadas es la principal opción AFOLU",

  // ── Relevance: silviculture_share ───────────────────────────────────
  "Very large managed forest area — sustainable forestry practices can deliver significant carbon benefits":
    "Área de bosque manejado muy grande — las prácticas forestales sostenibles pueden generar beneficios de carbono significativos",
  "High silviculture share — sustainable timber and biomass management is a key AFOLU lever":
    "Alta proporción de silvicultura — la gestión sostenible de madera y biomasa es una palanca AFOLU clave",
  "Moderate silviculture — sustainable forestry practices have measurable carbon impact":
    "Silvicultura moderada — las prácticas forestales sostenibles tienen un impacto de carbono medible",
  "Small managed forest area — silviculture actions have limited local carbon scope":
    "Área de bosque manejado pequeña — las acciones de silvicultura tienen un alcance local de carbono limitado",
  "Minimal silviculture — managed forest carbon actions are not a primary local lever":
    "Silvicultura mínima — las acciones de carbono en bosques manejados no son una palanca local primaria",

  // ── Relevance: cropland_share ───────────────────────────────────────
  "Very large cropland area — agricultural emissions reduction and soil carbon actions are high priority":
    "Área de cultivos muy grande — la reducción de emisiones agrícolas y las acciones de carbono en suelos son de alta prioridad",
  "High cropland share — sustainable agriculture and soil carbon sequestration are key AFOLU actions":
    "Alta proporción de cultivos — la agricultura sostenible y la captura de carbono en suelos son acciones AFOLU clave",
  "Moderate cropland — agricultural emissions management has measurable local impact":
    "Cultivos moderados — la gestión de emisiones agrícolas tiene un impacto local medible",
  "Small cropland area — agricultural AFOLU actions have limited local scope":
    "Área de cultivos pequeña — las acciones AFOLU agrícolas tienen un alcance local limitado",
  "Minimal cropland — land-use emissions from agriculture are negligible locally":
    "Cultivos mínimos — las emisiones agrícolas por uso de suelo son insignificantes a nivel local",

  // ── Relevance: pasture_share ────────────────────────────────────────
  "Very large pasture area — livestock emissions and grassland carbon management are critical AFOLU priorities":
    "Área de praderas muy grande — las emisiones ganaderas y la gestión del carbono en pastizales son prioridades AFOLU críticas",
  "High pasture share — grassland and livestock management actions have significant emissions impact":
    "Alta proporción de praderas — las acciones de manejo de pastizales y ganado tienen un impacto significativo en emisiones",
  "Moderate pasture — grazing management and grassland restoration have measurable carbon potential":
    "Praderas moderadas — el manejo del pastoreo y la restauración de pastizales tienen un potencial de carbono medible",
  "Small pasture area — livestock-related AFOLU actions have limited local scope":
    "Área de praderas pequeña — las acciones AFOLU relacionadas con ganadería tienen un alcance local limitado",
  "Minimal pasture — grassland carbon and livestock emissions are negligible locally":
    "Praderas mínimas — el carbono de pastizales y las emisiones ganaderas son insignificantes a nivel local",

  // ── Relevance: grassland_share ──────────────────────────────────────
  "Very high grassland cover — grassland restoration can deliver significant soil carbon sequestration":
    "Cobertura de pastizales muy alta — la restauración de pastizales puede lograr una captura significativa de carbono en suelos",
  "High grassland share — restoration and management of grasslands can enhance carbon stocks":
    "Alta proporción de pastizales — la restauración y el manejo de pastizales pueden mejorar las reservas de carbono",
  "Moderate grassland — grassland management has some carbon sequestration potential":
    "Pastizales moderados — el manejo de pastizales tiene cierto potencial de captura de carbono",
  "Low grassland share — limited scope for grassland carbon actions":
    "Baja proporción de pastizales — alcance limitado para acciones de carbono en pastizales",
  "Minimal grassland — grassland carbon sequestration is not a significant local lever":
    "Pastizales mínimos — la captura de carbono en pastizales no es una palanca local significativa",

  // ── Relevance: shrubland_share ──────────────────────────────────────
  "Very high shrubland cover — fire risk management and restoration can protect significant carbon stocks":
    "Cobertura de matorrales muy alta — la gestión del riesgo de incendios y la restauración pueden proteger reservas de carbono significativas",
  "High shrubland share — vegetation management and wildfire prevention are relevant AFOLU actions":
    "Alta proporción de matorrales — el manejo de la vegetación y la prevención de incendios forestales son acciones AFOLU relevantes",
  "Moderate shrubland — vegetation management has some carbon and fire-risk relevance":
    "Matorrales moderados — el manejo de la vegetación tiene cierta relevancia para el carbono y el riesgo de incendios",
  "Low shrubland share — limited scope for shrubland-focused climate actions":
    "Baja proporción de matorrales — alcance limitado para acciones climáticas enfocadas en matorrales",
  "Minimal shrubland — not a significant land-use lever for local climate action":
    "Matorrales mínimos — no es una palanca de uso de suelo significativa para la acción climática local",

  // ── Relevance: beach_dune_share ─────────────────────────────────────
  "Very high coastal dune cover — dune restoration can protect carbon-rich coastal ecosystems and reduce flood risk":
    "Cobertura de dunas costeras muy alta — la restauración de dunas puede proteger ecosistemas costeros ricos en carbono y reducir el riesgo de inundaciones",
  "High beach/dune share — coastal ecosystem protection supports blue carbon and climate resilience":
    "Alta proporción de playas/dunas — la protección de ecosistemas costeros favorece el carbono azul y la resiliencia climática",
  "Moderate coastal dune area — coastal protection actions have measurable resilience benefits":
    "Área de dunas costeras moderada — las acciones de protección costera tienen beneficios de resiliencia medibles",
  "Low beach/dune share — limited scope for coastal ecosystem carbon actions":
    "Baja proporción de playas/dunas — alcance limitado para acciones de carbono en ecosistemas costeros",
  "Minimal coastal dune area — not a significant land-use lever locally":
    "Área de dunas costeras mínima — no es una palanca de uso de suelo significativa a nivel local",

  // ── Relevance: ice_snow_share ───────────────────────────────────────
  "Very high glacier/snow cover — high climate vulnerability; cryosphere loss threatens water supply and downstream flooding":
    "Cobertura de glaciares/nieve muy alta — alta vulnerabilidad climática; la pérdida de la criósfera amenaza el suministro de agua y puede causar inundaciones aguas abajo",
  "High ice/snow share — significant cryosphere area at risk from warming; water security actions are critical":
    "Alta proporción de hielo/nieve — área significativa de la criósfera en riesgo por el calentamiento; las acciones de seguridad hídrica son críticas",
  "Moderate glacier/snow cover — some climate vulnerability related to snowmelt timing and water availability":
    "Cobertura de glaciares/nieve moderada — cierta vulnerabilidad climática relacionada con el momento del deshielo y la disponibilidad de agua",
  "Low ice/snow share — limited cryosphere exposure; water supply risk from glacial retreat is moderate":
    "Baja proporción de hielo/nieve — exposición limitada de la criósfera; el riesgo para el suministro de agua por retroceso glaciar es moderado",
  "Minimal ice/snow cover — cryosphere-related climate risk is negligible locally":
    "Cobertura de hielo/nieve mínima — el riesgo climático asociado a la criósfera es insignificante a nivel local",

  // ── Relevance: other_bare_share ─────────────────────────────────────
  "Very high bare land cover — large degraded or unvegetated areas represent a significant restoration opportunity":
    "Cobertura de suelo desnudo muy alta — las grandes áreas degradadas o sin vegetación representan una oportunidad de restauración significativa",
  "High bare land share — afforestation and revegetation of degraded land can build new carbon sinks":
    "Alta proporción de suelo desnudo — la forestación y revegetación de tierras degradadas puede crear nuevos sumideros de carbono",
  "Moderate bare land area — targeted revegetation can contribute to local carbon sequestration":
    "Área de suelo desnudo moderada — la revegetación focalizada puede contribuir a la captura local de carbono",
  "Low bare land share — limited degraded land available for restoration":
    "Baja proporción de suelo desnudo — poca tierra degradada disponible para restauración",
  "Minimal bare land — land restoration is not a significant local AFOLU lever":
    "Suelo desnudo mínimo — la restauración de tierras no es una palanca AFOLU local significativa",

  // ── Relevance: urban_built_share ────────────────────────────────────
  "Very high urban density — built environment decarbonisation (buildings, transport, energy) is the primary lever":
    "Densidad urbana muy alta — la descarbonización del entorno construido (edificios, transporte, energía) es la palanca principal",
  "High urban built share — building retrofits, urban mobility, and district energy actions have broad reach":
    "Alta proporción de suelo urbano construido — las renovaciones de edificios, la movilidad urbana y la energía distrital tienen amplio alcance",
  "Moderate urban area — built environment actions complement land-use and green infrastructure approaches":
    "Área urbana moderada — las acciones en el entorno construido complementan los enfoques de uso de suelo e infraestructura verde",
  "Low urban built share — green and blue infrastructure actions may complement urban climate investments":
    "Baja proporción de suelo urbano construido — las acciones de infraestructura verde y azul pueden complementar las inversiones climáticas urbanas",
  "Minimal urban footprint — land-use and nature-based solutions may have greater relative impact than built-environment actions":
    "Huella urbana mínima — las soluciones de uso de suelo y basadas en la naturaleza pueden tener mayor impacto relativo que las acciones en el entorno construido",

  // ── Relevance: water_share ──────────────────────────────────────────
  "Very high water body share — blue carbon, wetland protection, and flood-risk management are high-priority actions":
    "Proporción de cuerpos de agua muy alta — el carbono azul, la protección de humedales y la gestión del riesgo de inundaciones son acciones de alta prioridad",
  "High water share — water ecosystem protection and blue carbon actions are locally significant":
    "Alta proporción de agua — la protección de ecosistemas acuáticos y las acciones de carbono azul son significativas a nivel local",
  "Moderate water body coverage — water ecosystem management has some climate relevance":
    "Cobertura de cuerpos de agua moderada — la gestión de ecosistemas acuáticos tiene cierta relevancia climática",
  "Low water share — water body climate actions have limited local scope":
    "Baja proporción de agua — las acciones climáticas en cuerpos de agua tienen un alcance local limitado",
  "Minimal water cover — blue carbon and water ecosystem actions are not a primary local lever":
    "Cobertura de agua mínima — el carbono azul y las acciones en ecosistemas acuáticos no son una palanca local primaria",

  // ── Relevance: wetland_share ────────────────────────────────────────
  "Very high wetland cover — wetland conservation is a critical blue carbon and biodiversity action":
    "Cobertura de humedales muy alta — la conservación de humedales es una acción crítica de carbono azul y biodiversidad",
  "High wetland share — protecting and restoring wetlands can deliver significant carbon sequestration and flood resilience":
    "Alta proporción de humedales — proteger y restaurar humedales puede lograr una captura de carbono significativa y resiliencia ante inundaciones",
  "Moderate wetland area — wetland conservation has meaningful carbon and biodiversity co-benefits":
    "Área de humedales moderada — la conservación de humedales tiene co-beneficios significativos de carbono y biodiversidad",
  "Low wetland share — limited scope for wetland-focused climate actions locally":
    "Baja proporción de humedales — alcance limitado para acciones climáticas enfocadas en humedales a nivel local",
  "Minimal wetlands — blue carbon from wetland conservation is not a significant local lever":
    "Humedales mínimos — el carbono azul de la conservación de humedales no es una palanca local significativa",

  // ── Context note ────────────────────────────────────────────────────
  "How ALM uses this data:": "Cómo usa ALM estos datos:",
  "Socioeconomic conditions feed into the mitigation feasibility component, which makes up 33% of the feasibility score, which in turn shapes 23% of the final action ranking by default. They adjust scores to account for feasibility constraints (e.g. low income limits capital-intensive actions) and amplify co-benefits (e.g. green jobs matter more where unemployment is high).":
    "Las condiciones socioeconómicas alimentan el componente de viabilidad de mitigación, que representa el 33% de la puntuación de viabilidad, la cual a su vez define el 23% del ranking final de acciones por defecto. Ajustan las puntuaciones para reflejar restricciones de viabilidad (p. ej., ingresos bajos limitan las acciones intensivas en capital) y amplifican los co-beneficios (p. ej., los empleos verdes importan más donde el desempleo es alto).",

  // ── Navigation ──────────────────────────────────────────────────────
  "Save & return to context breakdown →": "Guardar y volver al desglose de contexto →",
  "Save & return to pre-flight →": "Guardar y volver a la verificación previa →",
  "Regulations & laws →": "Regulaciones y leyes →",
};
