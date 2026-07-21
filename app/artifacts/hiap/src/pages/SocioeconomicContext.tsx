import { useEffect, useState, type ReactNode } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { useLanguage } from "@/lib/i18n";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";
import { Users, TriangleAlert } from "lucide-react";

type Category = "very high" | "high" | "medium" | "low" | "very low";

interface Indicator {
  key: string;
  label: string;
  value: number;
  units: string;
  category: Category;
  theme: string;
  relevance: string;
  concern: "risk" | "opportunity" | "neutral";
  source: string;
}

type ApiCityData = Record<string, { attribute_value: number; attribute_category: string; attribute_units?: string }>;

interface IndicatorMeta {
  label: string;
  source: string;
  theme: string;
  units: string;
  relevance?: Partial<Record<Category, string>>;
  concern?: "risk" | "opportunity" | "neutral";
}

const INDICATOR_ENRICHMENT: Record<string, IndicatorMeta> = {
  poverty_rate: {
    label: "Poverty Rate", source: "CASEN 2022", theme: "Income & Welfare", units: "percent", concern: "risk",
    relevance: {
      "very high": "Very high poverty — prioritise low-cost, high co-benefit interventions",
      "high":      "High poverty → prioritise low-cost, co-benefit interventions",
      "medium":    "Moderate poverty — balance equity and efficiency in action selection",
      "low":       "Low poverty — broader range of investment-intensive actions feasible",
      "very low":  "Very low poverty — full range of climate investments is viable",
    },
  },
  median_household_income: {
    label: "Median Household Income", source: "CASEN 2022", theme: "Income & Welfare", units: "CLP", concern: "opportunity",
    relevance: {
      "very high": "Very high income — strong capacity to invest in clean technology",
      "high":      "High income — good capacity to invest in clean technology",
      "medium":    "Moderate income enables investment in clean technology",
      "low":       "Lower income — limited household investment capacity",
      "very low":  "Very low income — focus on no-cost and subsidised interventions",
    },
  },
  unemployment_rate: {
    label: "Unemployment Rate", source: "INE 2022", theme: "Income & Welfare", units: "percent", concern: "risk",
    relevance: {
      "very high": "Very high unemployment — green job creation is a critical co-benefit",
      "high":      "High unemployment — green jobs co-benefit strengthens political viability",
      "medium":    "Moderate unemployment — green job creation remains a viable co-benefit",
      "low":       "Low unemployment — labour market is tight; just-transition risks are lower",
      "very low":  "Very low unemployment — labour constraints may affect implementation pace",
    },
  },
  renter_share: {
    label: "Renter Share", source: "CENSO 2017", theme: "Housing", units: "percent", concern: "risk",
    relevance: {
      "very high": "Very high renter share → severe split-incentive barrier for building retrofits",
      "high":      "High renter share — split-incentive problem for building retrofits",
      "medium":    "Mixed tenure — building retrofits viable with targeted landlord incentives",
      "low":       "Low renter share — building retrofit programmes can reach most households",
      "very low":  "Very low renter share — most households own; retrofit programmes are effective",
    },
  },
  home_ownership: {
    label: "Home Ownership", source: "CENSO 2017", theme: "Housing", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high ownership — retrofit programmes can directly target homeowners",
      "high":      "High ownership — focus retrofits on owner-occupied homes",
      "medium":    "Moderate ownership — mix of tenure types; combined approach needed",
      "low":       "Low ownership — focus retrofits on social housing and public buildings",
      "very low":  "Very low ownership — focus retrofits on social housing and public buildings",
    },
  },
  public_transport_share: {
    label: "Public Transport Mode Share", source: "EOD 2021", theme: "Mobility", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high PT use — transit investment can deliver significant modal shift gains",
      "high":      "High PT use — transit investment can deliver significant modal shift gains",
      "medium":    "Medium PT use — transit investment can shift modal split",
      "low":       "Low PT use — mode shift investment is challenging but high-impact if successful",
      "very low":  "Very low PT use — significant behaviour change needed; prioritise infrastructure",
    },
  },
  employment_in_transport_and_logistics: {
    label: "Transport & Logistics Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Large freight sector — just-transition risks must be carefully managed",
      "high":      "Significant freight sector — just-transition planning is important",
      "medium":    "Moderate freight sector — just-transition considerations apply",
      "low":       "Relatively small freight sector — lower just-transition risk",
      "very low":  "Minimal freight employment — just-transition risk is negligible",
    },
  },
  employment_construction: {
    label: "Construction Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large construction sector — just-transition considerations are critical",
      "high":      "Large construction sector — just-transition considerations are important",
      "medium":    "Moderate construction sector — just-transition planning is recommended",
      "low":       "Small construction sector — just-transition risks are limited",
      "very low":  "Minimal construction employment — just-transition risk is very low",
    },
  },
  electricity_access_rate: {
    label: "Electricity Access", source: "INE 2022", theme: "Energy", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Near-universal access — electrification of transport and heating is highly feasible",
      "high":      "High electricity access — electrification actions are broadly feasible",
      "medium":    "Moderate access — extend grid before prioritising electrification actions",
      "low":       "Low electricity access — grid expansion should precede electrification actions",
      "very low":  "Very low access — grid expansion is a prerequisite for electrification actions",
    },
  },
  employment_agriculture_forestry: {
    label: "Agriculture & Forestry Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large agriculture sector — AFOLU actions have strong local labour impact",
      "high":      "Large agriculture sector — AFOLU actions have notable labour implications",
      "medium":    "Moderate agricultural employment — AFOLU actions have measurable local reach",
      "low":       "Small agriculture sector — limited AFOLU just-transition exposure",
      "very low":  "Minimal agricultural employment — AFOLU just-transition risk is very low",
    },
  },
  employment_electricity_gas: {
    label: "Electricity & Gas Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large utilities workforce — energy transition just-transition is critical",
      "high":      "Significant utilities workforce — energy transition planning is important",
      "medium":    "Moderate utilities employment — just-transition planning is advisable",
      "low":       "Small utilities workforce — energy transition just-transition risk is limited",
      "very low":  "Minimal utilities employment — energy transition risk is very low",
    },
  },
  employment_manufacturing: {
    label: "Manufacturing Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large manufacturing base — industrial decarbonisation is a key priority",
      "high":      "Large manufacturing base — industrial decarbonisation has major impact",
      "medium":    "Moderate manufacturing employment — IPPU actions have measurable reach",
      "low":       "Small manufacturing base — IPPU actions have limited local impact",
      "very low":  "Minimal manufacturing employment — industrial decarbonisation has low priority",
    },
  },
  employment_mining: {
    label: "Mining Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large mining sector — extraction emissions and just-transition are critical",
      "high":      "Significant mining sector — just-transition considerations are important",
      "medium":    "Moderate mining employment — just-transition planning is advisable",
      "low":       "Small mining sector — limited extraction sector just-transition exposure",
      "very low":  "Minimal mining employment — extraction sector just-transition risk is very low",
    },
  },
  employment_water_waste: {
    label: "Water & Waste Employment", source: "INE 2022", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large water/waste sector — waste and water actions have high local impact",
      "high":      "Significant water/waste workforce — waste management actions are highly relevant",
      "medium":    "Moderate water/waste employment — waste actions have measurable local reach",
      "low":       "Small water/waste sector — waste actions have limited labour implications",
      "very low":  "Minimal water/waste employment — waste actions affect very few workers",
    },
  },
  disability_prevalence: {
    label: "Disability Prevalence", source: "ENDISC 2015", theme: "Demographics", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high disability prevalence — accessibility must be central to action design",
      "high":      "High disability prevalence — accessibility considerations are important",
      "medium":    "Moderate disability prevalence — accessibility should be addressed in design",
      "low":       "Low disability prevalence — standard accessibility provisions are sufficient",
      "very low":  "Very low disability prevalence — baseline accessibility provisions apply",
    },
  },
  fixed_internet_household_share: {
    label: "Fixed Internet Household Access", source: "SUBTEL 2022", theme: "Digital Infrastructure", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Near-universal internet access — smart city and digital monitoring actions are highly feasible",
      "high":      "High internet access — digital infrastructure actions have strong reach",
      "medium":    "Moderate internet access — digital actions can reach most households",
      "low":       "Low internet access — digital solutions have limited penetration",
      "very low":  "Very low internet access — digital monitoring and smart city actions face barriers",
    },
  },
  indigenous_identification_rate: {
    label: "Indigenous Population Share", source: "CASEN 2022", theme: "Demographics", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high indigenous share — FPIC and culturally appropriate co-design are essential",
      "high":      "High indigenous population share — culturally inclusive engagement is critical",
      "medium":    "Moderate indigenous share — inclusive engagement should be planned",
      "low":       "Low indigenous share — standard community engagement applies",
      "very low":  "Very low indigenous share — standard community engagement applies",
    },
  },
  literacy_rate: {
    label: "Literacy Rate", source: "CASEN 2022", theme: "Demographics", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high literacy — public communication and behaviour change programmes are highly effective",
      "high":      "High literacy — public engagement and awareness campaigns are broadly effective",
      "medium":    "Moderate literacy — multi-format communication supports broader engagement",
      "low":       "Low literacy — visual and community-based communication is essential",
      "very low":  "Very low literacy — text-based public communication has limited reach",
    },
  },
  mean_years_schooling: {
    label: "Mean Years of Schooling", source: "CASEN 2022", theme: "Demographics", units: "years", concern: "opportunity",
    relevance: {
      "very high": "High education levels — technical workforce capacity for complex actions is strong",
      "high":      "Good education levels — capacity for technical and professional green jobs is high",
      "medium":    "Moderate education levels — targeted training can build capacity for green jobs",
      "low":       "Lower education levels — vocational training is key to green job access",
      "very low":  "Low education levels — foundational skills development should accompany action delivery",
    },
  },
  population: {
    label: "Population", source: "CENSO 2017", theme: "Demographics", units: "count", concern: "neutral",
    relevance: {
      "very high": "Very large city — actions with high per-capita impact maximise absolute emissions reductions",
      "high":      "Large city — broad-reach actions deliver significant total emissions reductions",
      "medium":    "Medium-sized city — mix of city-wide and targeted actions is effective",
      "low":       "Small city — targeted, high-leverage actions deliver the most impact",
      "very low":  "Very small city — highly targeted interventions maximise proportional impact",
    },
  },
  primary_forest_share: {
    label: "Primary Forest Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high primary forest cover — AFOLU conservation actions can deliver major carbon sequestration",
      "high":      "High primary forest share — forest conservation and management are high-priority AFOLU actions",
      "medium":    "Moderate primary forest — forest protection actions have meaningful sequestration potential",
      "low":       "Low primary forest share — limited forest carbon stock; focus on restoration",
      "very low":  "Minimal primary forest — afforestation and ecosystem restoration are the priority AFOLU pathway",
    },
  },
  secondary_forest_share: {
    label: "Secondary Forest Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high secondary forest — restoration management can significantly boost carbon sequestration",
      "high":      "High secondary forest share — active forest management can enhance carbon stocks",
      "medium":    "Moderate secondary forest — restoration programmes can build long-term carbon sinks",
      "low":       "Low secondary forest — limited regeneration base; restoration investment needed",
      "very low":  "Minimal secondary forest — afforestation from degraded land is the primary AFOLU option",
    },
  },
  silviculture_share: {
    label: "Silviculture Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large managed forest area — sustainable forestry practices can deliver significant carbon benefits",
      "high":      "High silviculture share — sustainable timber and biomass management is a key AFOLU lever",
      "medium":    "Moderate silviculture — sustainable forestry practices have measurable carbon impact",
      "low":       "Small managed forest area — silviculture actions have limited local carbon scope",
      "very low":  "Minimal silviculture — managed forest carbon actions are not a primary local lever",
    },
  },
  cropland_share: {
    label: "Cropland Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large cropland area — agricultural emissions reduction and soil carbon actions are high priority",
      "high":      "High cropland share — sustainable agriculture and soil carbon sequestration are key AFOLU actions",
      "medium":    "Moderate cropland — agricultural emissions management has measurable local impact",
      "low":       "Small cropland area — agricultural AFOLU actions have limited local scope",
      "very low":  "Minimal cropland — land-use emissions from agriculture are negligible locally",
    },
  },
  pasture_share: {
    label: "Pasture Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large pasture area — livestock emissions and grassland carbon management are critical AFOLU priorities",
      "high":      "High pasture share — grassland and livestock management actions have significant emissions impact",
      "medium":    "Moderate pasture — grazing management and grassland restoration have measurable carbon potential",
      "low":       "Small pasture area — livestock-related AFOLU actions have limited local scope",
      "very low":  "Minimal pasture — grassland carbon and livestock emissions are negligible locally",
    },
  },
  grassland_share: {
    label: "Grassland Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high grassland cover — grassland restoration can deliver significant soil carbon sequestration",
      "high":      "High grassland share — restoration and management of grasslands can enhance carbon stocks",
      "medium":    "Moderate grassland — grassland management has some carbon sequestration potential",
      "low":       "Low grassland share — limited scope for grassland carbon actions",
      "very low":  "Minimal grassland — grassland carbon sequestration is not a significant local lever",
    },
  },
  shrubland_share: {
    label: "Shrubland Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high shrubland cover — fire risk management and restoration can protect significant carbon stocks",
      "high":      "High shrubland share — vegetation management and wildfire prevention are relevant AFOLU actions",
      "medium":    "Moderate shrubland — vegetation management has some carbon and fire-risk relevance",
      "low":       "Low shrubland share — limited scope for shrubland-focused climate actions",
      "very low":  "Minimal shrubland — not a significant land-use lever for local climate action",
    },
  },
  beach_dune_share: {
    label: "Beach Dune Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high coastal dune cover — dune restoration can protect carbon-rich coastal ecosystems and reduce flood risk",
      "high":      "High beach/dune share — coastal ecosystem protection supports blue carbon and climate resilience",
      "medium":    "Moderate coastal dune area — coastal protection actions have measurable resilience benefits",
      "low":       "Low beach/dune share — limited scope for coastal ecosystem carbon actions",
      "very low":  "Minimal coastal dune area — not a significant land-use lever locally",
    },
  },
  ice_snow_share: {
    label: "Ice Snow Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "risk",
    relevance: {
      "very high": "Very high glacier/snow cover — high climate vulnerability; cryosphere loss threatens water supply and downstream flooding",
      "high":      "High ice/snow share — significant cryosphere area at risk from warming; water security actions are critical",
      "medium":    "Moderate glacier/snow cover — some climate vulnerability related to snowmelt timing and water availability",
      "low":       "Low ice/snow share — limited cryosphere exposure; water supply risk from glacial retreat is moderate",
      "very low":  "Minimal ice/snow cover — cryosphere-related climate risk is negligible locally",
    },
  },
  other_bare_share: {
    label: "Other Bare Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high bare land cover — large degraded or unvegetated areas represent a significant restoration opportunity",
      "high":      "High bare land share — afforestation and revegetation of degraded land can build new carbon sinks",
      "medium":    "Moderate bare land area — targeted revegetation can contribute to local carbon sequestration",
      "low":       "Low bare land share — limited degraded land available for restoration",
      "very low":  "Minimal bare land — land restoration is not a significant local AFOLU lever",
    },
  },
  urban_built_share: {
    label: "Urban Built Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high urban density — built environment decarbonisation (buildings, transport, energy) is the primary lever",
      "high":      "High urban built share — building retrofits, urban mobility, and district energy actions have broad reach",
      "medium":    "Moderate urban area — built environment actions complement land-use and green infrastructure approaches",
      "low":       "Low urban built share — green and blue infrastructure actions may complement urban climate investments",
      "very low":  "Minimal urban footprint — land-use and nature-based solutions may have greater relative impact than built-environment actions",
    },
  },
  water_share: {
    label: "Water Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high water body share — blue carbon, wetland protection, and flood-risk management are high-priority actions",
      "high":      "High water share — water ecosystem protection and blue carbon actions are locally significant",
      "medium":    "Moderate water body coverage — water ecosystem management has some climate relevance",
      "low":       "Low water share — water body climate actions have limited local scope",
      "very low":  "Minimal water cover — blue carbon and water ecosystem actions are not a primary local lever",
    },
  },
  wetland_share: {
    label: "Wetland Share", source: "ESA CCI 2020", theme: "Land Use", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high wetland cover — wetland conservation is a critical blue carbon and biodiversity action",
      "high":      "High wetland share — protecting and restoring wetlands can deliver significant carbon sequestration and flood resilience",
      "medium":    "Moderate wetland area — wetland conservation has meaningful carbon and biodiversity co-benefits",
      "low":       "Low wetland share — limited scope for wetland-focused climate actions locally",
      "very low":  "Minimal wetlands — blue carbon from wetland conservation is not a significant local lever",
    },
  },
};

const CATEGORY_STYLES: Record<Category, { bg: string; color: string; label: string }> = {
  "very high": { bg: "#FEF2F2", color: "#B91C1C", label: "Very High" },
  "high":      { bg: "#FFF3E0", color: "#C05621", label: "High" },
  "medium":    { bg: "#EFF6FF", color: "#1D4ED8", label: "Medium" },
  "low":       { bg: "#F0FDF4", color: "#16A34A", label: "Low" },
  "very low":  { bg: "#F9FAFB", color: "#6B7280", label: "Very Low" },
};

const CONCERN_ICON: Record<string, ReactNode> = {
  risk:        <TriangleAlert size={13} style={{ flexShrink: 0 }} />,
  opportunity: "↑",
  neutral:     "→",
};

const THEME_ORDER = [
  "Income & Welfare", "Housing", "Mobility", "Energy", "Employment",
  "Demographics", "Digital Infrastructure", "Land Use", "Other",
];

function formatValue(ind: Indicator): string {
  if (ind.units === "CLP") return `CLP ${(ind.value / 1_000_000).toFixed(1)}M`;
  if (ind.units === "years") return `${ind.value.toFixed(1)} yrs`;
  if (ind.units === "count") return ind.value.toLocaleString();
  return `${ind.value}%`;
}

function buildIndicatorsFromApi(apiData: ApiCityData): Indicator[] {
  return Object.entries(apiData)
    .filter(([, field]) =>
      typeof field === "object" && field !== null &&
      "attribute_value" in field && "attribute_category" in field
    )
    .map(([key, field]) => {
      const meta = INDICATOR_ENRICHMENT[key];
      const category = (field.attribute_category as Category) ?? "medium";
      const units = meta?.units ?? field.attribute_units ?? "percent";
      const label = meta?.label ?? key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const theme = meta?.theme ?? "Other";
      const concern = meta?.concern ?? "neutral";
      const source = meta?.source || "ccglobal API";
      const fallbackRelevance: Record<Category, string> = {
        "very high": `Very high ${label.toLowerCase()} relative to comparable cities`,
        "high":      `High ${label.toLowerCase()} relative to comparable cities`,
        "medium":    `Moderate ${label.toLowerCase()} — close to the national average`,
        "low":       `Low ${label.toLowerCase()} relative to comparable cities`,
        "very low":  `Very low ${label.toLowerCase()} relative to comparable cities`,
      };
      const relevance = meta?.relevance?.[category] || fallbackRelevance[category];
      return { key, label, value: field.attribute_value, units, category, theme, relevance, concern, source };
    });
}

interface SocioeconomicContextProps {
  params: { locode: string };
}

export function SocioeconomicContext({ params }: SocioeconomicContextProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");
  const fromRecommendations = search.includes("from=recommendations");

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [apiCityData, setApiCityData] = useState<ApiCityData | null>(null);

  useEffect(() => {
    const url = `https://ccglobal.openearth.dev/api/v0/city_attributes/${encodeURIComponent(locode)}`;
    fetch(url)
      .then(r => r.json())
      .then((json: { city?: ApiCityData }) => {
        if (json.city) setApiCityData(json.city);
      })
      .catch(() => { /* keep hardcoded fallback values */ });
  }, [locode]);

  const indicators = apiCityData ? buildIndicatorsFromApi(apiCityData) : [];

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>{t("City not found.")}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>
            {t("← Back to cities")}
          </button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");

  useEffect(() => {
    setStepProgress(locode, "socioeconomic", {
      visited: true,
      progress: 100,
      sub: `${indicators.length} indicators reviewed`,
    });
  }, [locode, indicators.length]);

  const themes = [...new Set(indicators.map((i) => i.theme))].sort((a, b) => {
    const ai = THEME_ORDER.indexOf(a);
    const bi = THEME_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const keyIndicators = [
    indicators.find((i) => i.key === "poverty_rate"),
    indicators.find((i) => i.key === "unemployment_rate"),
    indicators.find((i) => i.key === "home_ownership"),
    indicators.find((i) => i.key === "public_transport_share"),
  ].filter((i): i is Indicator => i !== undefined);

  function handleConfirm() {
    confirmStep(locode, "socioeconomic");
    if (fromRecommendations) navigate(`/city/${citySlug}/recommendations?tab=context`);
    else if (fromPreflight) navigate(`/city/${citySlug}/preflight`);
    else navigate(`/city/${citySlug}/regulations`);
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={1} citySlug={citySlug} />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {t("Cities")}
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {city.name}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>{t("Socioeconomic Context")}</span>
          </div>

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
              {t("Socioeconomic Context")}
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
              {t("Aceleradora Local de Mitigación uses socioeconomic indicators to assess how feasible each climate action is for {city}. Indicators such as income levels, employment, and urban density shape which actions are realistically deliverable.", { city: city.name })}
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", background: "#F0FDF4", color: "#16A34A", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                {t("{n} indicators loaded", { n: String(indicators.length) })}
              </span>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "6px", padding: "5px 12px",
                fontSize: "11px", color: "#15803D", fontWeight: "600",
              }}>
                <Users size={14} color="#15803D" style={{ flexShrink: 0 }} />
                <span>{t("ALM FEASIBILITY: Mitigation feasibility shapes 33% of feasibility score · Feasibility shapes 23% of ranking")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 40px" }}>

        {/* Key indicators bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}>
          {keyIndicators.map((ind) => {
            const style = CATEGORY_STYLES[ind.category];
            return (
              <div key={ind.key} style={{
                background: "white",
                border: "1px solid #EBEBEB",
                borderRadius: "10px",
                padding: "14px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t(ind.label)}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
                  {formatValue(ind)}
                </div>
                <span style={{
                  fontSize: "11px",
                  background: style.bg,
                  color: style.color,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}>
                  {t(style.label)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Indicators table by theme */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                {["INDICATOR", "VALUE", "RELATIVE LEVEL", "ALM CLIMATE RELEVANCE"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px",
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: "500",
                    textAlign: "left",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}>
                    {t(h)}
                    {h === "RELATIVE LEVEL" && <InfoTip text={DEFS.relativeLevel} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {themes.map((theme) => {
                const rows = indicators.filter((ind) => ind.theme === theme);
                return rows.map((ind, rowIdx) => {
                  const style = CATEGORY_STYLES[ind.category];
                  const icon = CONCERN_ICON[ind.concern];
                  const isFirstInGroup = rowIdx === 0;
                  const isLastInGroup = rowIdx === rows.length - 1;
                  const isLastTheme = theme === themes[themes.length - 1];
                  const rowBorder = isLastInGroup && !isLastTheme ? "2px solid #F0F0F0" : "1px solid #F5F5F5";

                  return (
                    <tr key={ind.key} style={{ borderBottom: rowBorder }}>
                      <td style={{ padding: "12px 16px", minWidth: "200px" }}>
                        {isFirstInGroup && (
                          <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                            {t(theme)}
                          </div>
                        )}
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                          {t(ind.label)}
                        </div>
                        <div style={{ fontSize: "11px", color: "#C4C4C4", marginTop: "2px" }}>
                          {ind.source}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#111827", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {formatValue(ind)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "11px", background: style.bg, color: style.color, padding: "3px 10px", borderRadius: "4px", fontWeight: "600", whiteSpace: "nowrap" }}>
                          {t(style.label)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                        <span style={{ marginRight: "6px", fontSize: "13px" }}>{icon}</span>
                        {t(ind.relevance)}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Context note */}
        <div style={{
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#0369A1",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "14px", flexShrink: 0 }}>ℹ</span>
          <span>
            <strong>{t("How ALM uses this data:")}</strong>{" "}
            {t("Socioeconomic conditions feed into the mitigation feasibility component, which makes up 33% of the feasibility score, which in turn shapes 23% of the final action ranking by default. They adjust scores to account for feasibility constraints (e.g. low income limits capital-intensive actions) and amplify co-benefits (e.g. green jobs matter more where unemployment is high).")}
          </span>
        </div>

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/emissions`)}
            style={{
              background: "white",
              border: "1px solid #DDDDE1",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              color: "#6B7280",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ← {t("Emissions Data")}
          </button>

          <button
            onClick={handleConfirm}
            style={{
              background: "#16A34A",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
            }}
          >
            {fromRecommendations ? t("Save & return to context breakdown →") : fromPreflight ? t("Save & return to pre-flight →") : t("Regulations & laws →")}
          </button>
        </div>
      </div>
    </div>
  );
}
