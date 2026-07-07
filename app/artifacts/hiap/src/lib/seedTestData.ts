import type { PipelineResult, LegalData, LegalExcludedAction, RankedAction } from "./scoringPipeline";

function blockedLegal(
  ownershipDesc: string,
  restrictionsDesc: string,
  justification: string,
  refs: string[],
): LegalData {
  return {
    assessment_present: true,
    assessment_missing: false,
    verdict_category: "blocked",
    component_score: 0,
    ownership_category: "external_authority",
    ownership_score: 0,
    ownership_description: ownershipDesc,
    ownership_description_es: ownershipDesc,
    restrictions_category: "hard_restrictions",
    restrictions_score: 0,
    restrictions_description: restrictionsDesc,
    restrictions_description_es: restrictionsDesc,
    legal_justification: justification,
    legal_justification_en: justification,
    legal_references: refs,
  };
}

function flaggedLegal(
  ownershipDesc: string,
  restrictionsDesc: string,
  refs: string[],
): LegalData {
  return {
    assessment_present: false,
    assessment_missing: true,
    verdict_category: "conditional",
    component_score: 0.4,
    ownership_category: "shared_ownership",
    ownership_score: 0.5,
    ownership_description: ownershipDesc,
    ownership_description_es: ownershipDesc,
    restrictions_category: "soft_restrictions",
    restrictions_score: 0.5,
    restrictions_description: restrictionsDesc,
    restrictions_description_es: restrictionsDesc,
    legal_justification: null,
    legal_justification_en: null,
    legal_references: refs,
  };
}

function enabledLegal(score: number, refs: string[]): LegalData {
  return {
    assessment_present: true,
    assessment_missing: false,
    verdict_category: "enabled",
    component_score: score,
    ownership_category: "city_owned",
    ownership_score: score,
    ownership_description: "The municipality holds direct authority to implement this action under existing Chilean legislation.",
    ownership_description_es: "El municipio tiene autoridad directa para implementar esta acción bajo la legislación chilena vigente.",
    restrictions_category: "none",
    restrictions_score: 1.0,
    restrictions_description: "No legal restrictions identified. The municipality may proceed independently.",
    restrictions_description_es: "No se identificaron restricciones legales. El municipio puede proceder de forma independiente.",
    legal_justification: "This action is fully within municipal competence under the Ley Orgánica Constitucional de Municipalidades (Law 18.695) and applicable sectoral laws.",
    legal_justification_en: "This action is fully within municipal competence under the Organic Constitutional Law of Municipalities (Law 18.695) and applicable sectoral laws.",
    legal_references: refs,
  };
}

const BLOCKED_BUILDINGS = blockedLegal(
  "MINVU holds exclusive regulatory power over energy-efficiency standards for institutional buildings via the Ordenanza General de Urbanismo y Construcciones (OGUC). Municipalities cannot impose building performance standards beyond local zoning.",
  "Setting energy-efficiency standards for new institutional buildings is reserved to the national government under OGUC Art. 4.1.10. A municipal ordinance doing so would be ultra vires.",
  "The municipality cannot mandate energy-efficiency standards for institutional buildings. This authority resides exclusively with MINVU under OGUC Art. 4.1.10. The city may advocate nationally but cannot implement unilaterally.",
  [
    "Ley 18.695 — Ley Orgánica Constitucional de Municipalidades, Art. 3",
    "Ordenanza General de Urbanismo y Construcciones (OGUC) D.S. 47, Art. 4.1.10",
    "Ley 20.936 — Transmisión Eléctrica y Calificación Energética de Edificios",
  ],
);

const BLOCKED_WASTE = blockedLegal(
  "Regulating materials and banning single-use plastics is the exclusive competence of the Ministry of the Environment under the Extended Producer Responsibility Law (REP, Law 20.920). Municipalities have no market-ban authority.",
  "A municipal ordinance prohibiting materials would be struck down as ultra vires. Law 20.920 grants this power solely to the Ministry of the Environment via D.S.",
  "Municipalities in Chile may not ban materials from the market. This authority belongs exclusively to the Ministry of the Environment under the REP Law (20.920). Any municipal ordinance attempting to ban materials would be struck down as ultra vires.",
  [
    "Ley 20.920 — Marco para la Gestión de Residuos, la Responsabilidad Extendida del Productor y Fomento al Reciclaje",
    "Ley 21.100 — Prohibición de Bolsas Plásticas Comerciales",
    "Ley 18.695 — LOCM, Art. 65 (límites de la potestad ordinamental municipal)",
  ],
);

const FLAGGED_INDUSTRIAL = flaggedLegal(
  "Implementation of industrial building efficiency standards involves both municipal competencies (land use, building permits) and sectoral regulations from the Ministry of Energy and SEREMI. Detailed enabling analysis is required.",
  "Possible restrictions arising from overlap between municipal territorial planning authority (PRC) and sectoral energy-industrial regulation. Compatibility analysis has not been completed.",
  [
    "Ley 18.695 — LOCM, Art. 3(b)",
    "D.S. 47 OGUC — Permisos de Edificación",
    "Ley 20.936 — Eficiencia Energética en Edificios",
  ],
);

const FLAGGED_VOLUME = flaggedLegal(
  "Volume-based waste tariffs may require Regional Government authorisation and coordination with the municipal rights charging system (Ley de Rentas Municipales). The municipal legal basis exists but the charging modalities are subject to interpretation.",
  "The waste tariff regime is partially regulated by D.F.L. 1-3.063 (Ley de Rentas Municipales). Adopting variable volume-based charges could require modification of the communal tariff instrument and/or SUBDERE authorisation.",
  [
    "D.F.L. 1-3.063 — Ley de Rentas Municipales, Art. 7",
    "Ley 18.695 — LOCM, Art. 65",
    "Ley 20.920 — Gestión de Residuos, Art. 15",
  ],
);

function makeRanked(
  rank: number,
  actionId: string,
  actionName: string,
  actionCategory: string,
  actionSubcategory: string,
  costInvestmentNeeded: string,
  timelineForImplementation: string,
  description: string,
  gpcRefs: string[],
  sectorTag: string,
  finalScore: number,
  legalData: LegalData,
  legalFlag: boolean,
): RankedAction {
  const priority: "high" | "medium" | "low" =
    finalScore >= 0.65 ? "high" : finalScore >= 0.40 ? "medium" : "low";
  return {
    rank, actionId, actionName, actionCategory, actionSubcategory,
    costInvestmentNeeded, timelineForImplementation, description, gpcRefs,
    finalScore,
    impactScore: finalScore * 0.9,
    alignmentScore: finalScore * 0.85,
    feasibilityScore: finalScore * 0.7,
    reductionShare: finalScore * 0.3,
    timelineScore: 0.7,
    policyComponent: 0.75,
    sectorComponent: 0.8,
    otherComponent: 0.5,
    timeframeComponent: 0.6,
    softLegalComponent: legalFlag ? 0.4 : 0.85,
    socioeconomicComponent: 0.6,
    matchedEmissions: Math.round(finalScore * 80000),
    legalPassed: true,
    legalFlag,
    legalData,
    sectorTag,
    priority,
    explanation: `Ranked #${rank} with a final score of ${finalScore.toFixed(2)}.`,
  };
}

export function seedValdivia(): void {
  const LOCODE = "CL LD";

  const legalExcluded: LegalExcludedAction[] = [
    {
      actionId: "c40_0012",
      actionName: "Introduce energy-efficiency standards for new institutional buildings",
      sectorTag: "buildings",
      legalData: BLOCKED_BUILDINGS,
    },
    {
      actionId: "c40_0034",
      actionName: "Enact and enforce material bans to restrict single-use and non-recyclable materials",
      sectorTag: "waste",
      legalData: BLOCKED_WASTE,
    },
  ];

  const legalFlagged: LegalExcludedAction[] = [
    {
      actionId: "c40_0013",
      actionName: "Support implementation of industrial building efficiency standards",
      sectorTag: "buildings",
      legalData: FLAGGED_INDUSTRIAL,
    },
    {
      actionId: "c40_0040",
      actionName: "Implement volume-based collection policy",
      sectorTag: "waste",
      legalData: FLAGGED_VOLUME,
    },
  ];

  const ranked: RankedAction[] = [
    makeRanked(1, "icare_0012", "Expand solar energy generation on municipal facilities and public spaces",
      "Projects & Physical Actions", "Energy & Building Retrofits",
      "medium", "<5 years",
      "Install photovoltaic systems on municipal rooftops and public infrastructure to reduce grid dependency and demonstrate renewable energy leadership.",
      ["I.4.4"], "stationary_energy", 0.78,
      enabledLegal(0.95, ["Ley 20.936 — Eficiencia Energética", "Ley 20.571 — Net Billing para PMGD"]),
      false),

    makeRanked(2, "c40_0017", "Retrofit municipal buildings for energy efficiency",
      "Projects & Physical Actions", "Energy & Building Retrofits",
      "medium", "<5 years",
      "Improve insulation, glazing, HVAC, and lighting in city-owned buildings to reduce energy consumption and operational costs.",
      ["I.2.1", "I.2.2"], "buildings", 0.74,
      enabledLegal(0.92, ["Ley 18.695 — LOCM, Art. 5", "Ley 20.936 — Calificación Energética"]),
      false),

    makeRanked(3, "c40_0023", "Adopt zero-emission bus fleets for public transport",
      "Projects & Physical Actions", "Mobility & Transport Projects",
      "high", "5-10 years",
      "Replace diesel-powered buses with electric or hydrogen buses to reduce transport emissions and improve urban air quality.",
      ["II.1.1"], "transportation", 0.71,
      enabledLegal(0.88, ["Ley 18.696 — Transporte Público", "Ley 21.305 — Eficiencia Energética en Flotas Públicas"]),
      false),

    makeRanked(4, "c40_0013", "Support implementation of industrial building efficiency standards",
      "Policies, Plans & Programs", "Regulation & Standards",
      "low", "<5 years",
      "Promote the adoption of energy efficiency standards for industrial buildings through technical assistance and incentive programmes.",
      ["I.3.1", "I.3.2"], "buildings", 0.63,
      FLAGGED_INDUSTRIAL, true),

    makeRanked(5, "c40_0015", "Retrofit residential buildings for energy efficiency",
      "Projects & Physical Actions", "Energy & Building Retrofits",
      "medium", "5-10 years",
      "Provide subsidies and technical support for homeowners to retrofit existing residential buildings with improved insulation and efficient appliances.",
      ["I.1.1", "I.1.2"], "buildings", 0.61,
      enabledLegal(0.80, ["Ley 18.695 — LOCM", "Programa de Eficiencia Energética en Viviendas MINVU"]),
      false),

    makeRanked(6, "c40_0035", "Optimize waste management systems",
      "Policies, Plans & Programs", "Strategic Plans",
      "low", "<5 years",
      "Redesign waste collection routes, implement source-separation campaigns, and upgrade waste processing facilities.",
      ["III.1.1"], "waste", 0.58,
      enabledLegal(0.82, ["Ley 18.695 — LOCM, Art. 3(f)", "Ley 20.920 — Gestión de Residuos"]),
      false),

    makeRanked(7, "c40_0040", "Implement volume-based collection policy",
      "Policies, Plans & Programs", "Regulation & Standards",
      "low", "<5 years",
      "Introduce differentiated tariffs for waste collection based on volume generated to incentivize waste reduction at source.",
      ["III.1.1"], "waste", 0.52,
      FLAGGED_VOLUME, true),

    makeRanked(8, "c40_0042", "Expand urban and peri-urban green spaces",
      "Projects & Physical Actions", "Nature-Based Solutions",
      "low", "<5 years",
      "Develop new parks, greenways, and urban forests to sequester carbon, reduce urban heat islands, and improve biodiversity.",
      ["V.2"], "nature", 0.50,
      enabledLegal(0.78, ["Ley 18.695 — LOCM, Art. 5(d)", "Ley 19.300 — Bases Generales del Medio Ambiente"]),
      false),

    makeRanked(9, "c40_0025", "Promote deployment of zero-emission freight fleets",
      "Policies, Plans & Programs", "Public Programs / Incentives",
      "medium", "5-10 years",
      "Develop incentive programmes and local purchasing policies to accelerate transition to electric and hydrogen freight vehicles.",
      ["II.1.1"], "transportation", 0.47,
      enabledLegal(0.72, ["Ley 18.695 — LOCM", "Ley 21.305 — Eficiencia Energética"]),
      false),

    makeRanked(10, "c40_0036", "Upgrade landfills to engineered sanitary landfills with gas capture",
      "Projects & Physical Actions", "Infrastructure Development",
      "high", "5-10 years",
      "Retrofit existing disposal sites with engineered liner systems and landfill gas collection infrastructure to capture methane.",
      ["III.1.1"], "waste", 0.42,
      enabledLegal(0.65, ["Ley 20.920 — Gestión de Residuos", "D.S. 189/2008 MINSAL — Rellenos Sanitarios"]),
      false),
  ];

  const result: PipelineResult = {
    ranked,
    discarded: [],
    legalExcluded,
    legalFlagged,
    totalCityEmissions: 130000,
    cityEmissionsByGpc: { "I.1.1": 30000, "I.2.1": 20000, "II.1.1": 80000 },
    locode: LOCODE,
    topN: 20,
  };

  localStorage.setItem(`hiap:${LOCODE}:results`, JSON.stringify(result));
}
