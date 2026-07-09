import { useEffect, useState } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";

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
    label: "Agriculture & Forestry Employment", source: "", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large agriculture sector — AFOLU actions have strong local labour impact",
      "high":      "Large agriculture sector — AFOLU actions have notable labour implications",
      "medium":    "Moderate agricultural employment — AFOLU actions have measurable local reach",
      "low":       "Small agriculture sector — limited AFOLU just-transition exposure",
      "very low":  "Minimal agricultural employment — AFOLU just-transition risk is very low",
    },
  },
  employment_electricity_gas: {
    label: "Electricity & Gas Employment", source: "", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large utilities workforce — energy transition just-transition is critical",
      "high":      "Significant utilities workforce — energy transition planning is important",
      "medium":    "Moderate utilities employment — just-transition planning is advisable",
      "low":       "Small utilities workforce — energy transition just-transition risk is limited",
      "very low":  "Minimal utilities employment — energy transition risk is very low",
    },
  },
  employment_manufacturing: {
    label: "Manufacturing Employment", source: "", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large manufacturing base — industrial decarbonisation is a key priority",
      "high":      "Large manufacturing base — industrial decarbonisation has major impact",
      "medium":    "Moderate manufacturing employment — IPPU actions have measurable reach",
      "low":       "Small manufacturing base — IPPU actions have limited local impact",
      "very low":  "Minimal manufacturing employment — industrial decarbonisation has low priority",
    },
  },
  employment_mining: {
    label: "Mining Employment", source: "", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large mining sector — extraction emissions and just-transition are critical",
      "high":      "Significant mining sector — just-transition considerations are important",
      "medium":    "Moderate mining employment — just-transition planning is advisable",
      "low":       "Small mining sector — limited extraction sector just-transition exposure",
      "very low":  "Minimal mining employment — extraction sector just-transition risk is very low",
    },
  },
  employment_water_waste: {
    label: "Water & Waste Employment", source: "", theme: "Employment", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very large water/waste sector — waste and water actions have high local impact",
      "high":      "Significant water/waste workforce — waste management actions are highly relevant",
      "medium":    "Moderate water/waste employment — waste actions have measurable local reach",
      "low":       "Small water/waste sector — waste actions have limited labour implications",
      "very low":  "Minimal water/waste employment — waste actions affect very few workers",
    },
  },
  disability_prevalence: {
    label: "Disability Prevalence", source: "", theme: "Demographics", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high disability prevalence — accessibility must be central to action design",
      "high":      "High disability prevalence — accessibility considerations are important",
      "medium":    "Moderate disability prevalence — accessibility should be addressed in design",
      "low":       "Low disability prevalence — standard accessibility provisions are sufficient",
      "very low":  "Very low disability prevalence — baseline accessibility provisions apply",
    },
  },
  fixed_internet_household_share: {
    label: "Fixed Internet Household Access", source: "", theme: "Digital Infrastructure", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Near-universal internet access — smart city and digital monitoring actions are highly feasible",
      "high":      "High internet access — digital infrastructure actions have strong reach",
      "medium":    "Moderate internet access — digital actions can reach most households",
      "low":       "Low internet access — digital solutions have limited penetration",
      "very low":  "Very low internet access — digital monitoring and smart city actions face barriers",
    },
  },
  indigenous_identification_rate: {
    label: "Indigenous Population Share", source: "", theme: "Demographics", units: "percent", concern: "neutral",
    relevance: {
      "very high": "Very high indigenous share — FPIC and culturally appropriate co-design are essential",
      "high":      "High indigenous population share — culturally inclusive engagement is critical",
      "medium":    "Moderate indigenous share — inclusive engagement should be planned",
      "low":       "Low indigenous share — standard community engagement applies",
      "very low":  "Very low indigenous share — standard community engagement applies",
    },
  },
  literacy_rate: {
    label: "Literacy Rate", source: "", theme: "Demographics", units: "percent", concern: "opportunity",
    relevance: {
      "very high": "Very high literacy — public communication and behaviour change programmes are highly effective",
      "high":      "High literacy — public engagement and awareness campaigns are broadly effective",
      "medium":    "Moderate literacy — multi-format communication supports broader engagement",
      "low":       "Low literacy — visual and community-based communication is essential",
      "very low":  "Very low literacy — text-based public communication has limited reach",
    },
  },
  mean_years_schooling: {
    label: "Mean Years of Schooling", source: "", theme: "Demographics", units: "years", concern: "opportunity",
    relevance: {
      "very high": "High education levels — technical workforce capacity for complex actions is strong",
      "high":      "Good education levels — capacity for technical and professional green jobs is high",
      "medium":    "Moderate education levels — targeted training can build capacity for green jobs",
      "low":       "Lower education levels — vocational training is key to green job access",
      "very low":  "Low education levels — foundational skills development should accompany action delivery",
    },
  },
  population: {
    label: "Population", source: "", theme: "Demographics", units: "count", concern: "neutral",
    relevance: {
      "very high": "Very large city — actions with high per-capita impact maximise absolute emissions reductions",
      "high":      "Large city — broad-reach actions deliver significant total emissions reductions",
      "medium":    "Medium-sized city — mix of city-wide and targeted actions is effective",
      "low":       "Small city — targeted, high-leverage actions deliver the most impact",
      "very low":  "Very small city — highly targeted interventions maximise proportional impact",
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

const CONCERN_ICON: Record<string, string> = {
  risk:        "⚠",
  opportunity: "↑",
  neutral:     "→",
};

const THEME_ORDER = [
  "Income & Welfare", "Housing", "Mobility", "Energy", "Employment",
  "Demographics", "Digital Infrastructure", "Other",
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
      const relevance = meta?.relevance?.[category] ?? "";
      const concern = meta?.concern ?? "neutral";
      const source = meta?.source ?? "";
      return { key, label, value: field.attribute_value, units, category, theme, relevance, concern, source };
    });
}

interface SocioeconomicContextProps {
  params: { locode: string };
}

export function SocioeconomicContext({ params }: SocioeconomicContextProps) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");

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
          <p style={{ color: "#6B7280" }}>City not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>
            ← Back to cities
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
    navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/regulations`);
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
              Cities
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {city.name}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Socioeconomic Context</span>
          </div>

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
              Socioeconomic Context
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
              MEED+ HIAP uses socioeconomic indicators to assess how feasible each climate action is for {city.name}. Indicators such as income levels, employment, and urban density shape which actions are realistically deliverable.
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", background: "#F0FDF4", color: "#16A34A", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                {indicators.length} indicators loaded
              </span>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "6px", padding: "5px 12px",
                fontSize: "11px", color: "#15803D", fontWeight: "600",
              }}>
                <span>👥</span>
                <span>MEED+ FEASIBILITY: Mitigation feasibility shapes 33% of feasibility score · Feasibility shapes 23% of ranking</span>
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
                  {ind.label}
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
                  {style.label}
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
                {["INDICATOR", "VALUE", "RELATIVE LEVEL", "MEED+ CLIMATE RELEVANCE"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px",
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: "500",
                    textAlign: "left",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
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
                            {theme}
                          </div>
                        )}
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                          {ind.label}
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
                          {style.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                        <span style={{ marginRight: "6px", fontSize: "13px" }}>{icon}</span>
                        {ind.relevance}
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
            <strong>How MEED+ HIAP uses this data:</strong> Socioeconomic conditions feed into the mitigation feasibility component, which makes up 33% of the
            feasibility score, which in turn shapes 23% of the final action ranking by default.
            They adjust scores to account for feasibility constraints (e.g. low income limits
            capital-intensive actions) and amplify co-benefits (e.g. green jobs matter more
            where unemployment is high).
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
            ← Emissions Data
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
            {fromPreflight ? "Save & return to pre-flight →" : "Regulations & laws →"}
          </button>
        </div>
      </div>
    </div>
  );
}
