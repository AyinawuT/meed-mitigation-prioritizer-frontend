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
  units: "percent" | "CLP";
  category: Category;
  theme: "Income & Welfare" | "Housing" | "Mobility" | "Industry";
  relevance: string;
  concern: "risk" | "opportunity" | "neutral";
  source: string;
}

// Real data from city.json / city-context.csv (Iquique, 2022 census)
const IQQ_INDICATORS: Indicator[] = [
  {
    key: "poverty_rate",
    label: "Poverty Rate",
    value: 26.77,
    units: "percent",
    category: "very high",
    theme: "Income & Welfare",
    relevance: "High poverty → prioritise low-cost, co-benefit interventions",
    concern: "risk",
    source: "CASEN 2022",
  },
  {
    key: "median_household_income",
    label: "Median Household Income",
    value: 1200000,
    units: "CLP",
    category: "high",
    theme: "Income & Welfare",
    relevance: "Moderate income enables investment in clean technology",
    concern: "opportunity",
    source: "CASEN 2022",
  },
  {
    key: "unemployment_rate",
    label: "Unemployment Rate",
    value: 9.44,
    units: "percent",
    category: "high",
    theme: "Income & Welfare",
    relevance: "Green jobs co-benefits strengthen political viability",
    concern: "risk",
    source: "INE 2022",
  },
  {
    key: "renter_share",
    label: "Renter Share",
    value: 43.48,
    units: "percent",
    category: "high",
    theme: "Housing",
    relevance: "High renter share → split-incentive problem for building retrofits",
    concern: "risk",
    source: "CENSO 2017",
  },
  {
    key: "home_ownership",
    label: "Home Ownership",
    value: 40.0,
    units: "percent",
    category: "very low",
    theme: "Housing",
    relevance: "Low ownership limits household-level retrofit programmes",
    concern: "risk",
    source: "CENSO 2017",
  },
  {
    key: "public_transport_share",
    label: "Public Transport Mode Share",
    value: 31.84,
    units: "percent",
    category: "medium",
    theme: "Mobility",
    relevance: "Medium PT use — transit investment can shift modal split",
    concern: "opportunity",
    source: "EOD 2021",
  },
  {
    key: "transport_logistics_employment",
    label: "Transport & Logistics Employment",
    value: 7.35,
    units: "percent",
    category: "low",
    theme: "Mobility",
    relevance: "Relatively small freight sector — lower just-transition risk",
    concern: "neutral",
    source: "INE 2022",
  },
  {
    key: "industry_construction_employment",
    label: "Industry & Construction Employment",
    value: 22.79,
    units: "percent",
    category: "high",
    theme: "Industry",
    relevance: "Large industrial base → just-transition considerations critical",
    concern: "risk",
    source: "INE 2022",
  },
  {
    key: "electricity_access",
    label: "Electricity Access",
    value: 100.0,
    units: "percent",
    category: "very low",
    theme: "Industry",
    relevance: "Full access → electrification feasible for all households",
    concern: "opportunity",
    source: "SEC 2022",
  },
];

const CATEGORY_STYLES: Record<Category, { bg: string; color: string; label: string }> = {
  "very high": { bg: "#FEF2F2", color: "#B91C1C", label: "Very High" },
  "high":      { bg: "#FFF3E0", color: "#C05621", label: "High" },
  "medium":    { bg: "#EFF6FF", color: "#1D4ED8", label: "Medium" },
  "low":       { bg: "#F0FDF4", color: "#16A34A", label: "Low" },
  "very low":  { bg: "#F9FAFB", color: "#6B7280", label: "Very Low" },
};

const CONCERN_ICON: Record<string, string> = {
  risk: "⚠",
  opportunity: "↑",
  neutral: "→",
};

const RELEVANCE: Record<string, Record<string, string>> = {
  poverty_rate: {
    "very high": "Very high poverty — prioritise low-cost, high co-benefit interventions",
    "high":      "High poverty → prioritise low-cost, co-benefit interventions",
    "medium":    "Moderate poverty — balance equity and efficiency in action selection",
    "low":       "Low poverty — broader range of investment-intensive actions feasible",
    "very low":  "Very low poverty — full range of climate investments is viable",
  },
  median_household_income: {
    "very high": "Very high income — strong capacity to invest in clean technology",
    "high":      "High income enables significant investment in clean technology",
    "medium":    "Moderate income enables investment in clean technology",
    "low":       "Low income — prioritise affordable, high co-benefit actions",
    "very low":  "Very low income — focus on no-cost and subsidised interventions",
  },
  unemployment_rate: {
    "very high": "Very high unemployment — green jobs co-benefits are critical for political viability",
    "high":      "High unemployment — green jobs co-benefits strengthen political viability",
    "medium":    "Moderate unemployment — green job creation remains a viable co-benefit",
    "low":       "Low unemployment — just-transition risks are minimal",
    "very low":  "Very low unemployment — labour market is stable; transition risks minimal",
  },
  renter_share: {
    "very high": "Very high renter share → severe split-incentive barrier for building retrofits",
    "high":      "High renter share → split-incentive problem for building retrofits",
    "medium":    "Mixed tenure — building retrofits viable with targeted landlord incentives",
    "low":       "Low renter share — household-level retrofit programmes are largely feasible",
    "very low":  "Very low renter share — building retrofit programmes face minimal tenure barriers",
  },
  home_ownership: {
    "very high": "Very high ownership — household-level retrofit programmes are highly feasible",
    "high":      "High ownership — retrofit programmes have broad potential reach",
    "medium":    "Moderate ownership — targeted retrofit support recommended",
    "low":       "Low ownership limits household-level retrofit programmes",
    "very low":  "Very low ownership — focus retrofits on social housing and public buildings",
  },
  public_transport_share: {
    "very high": "Very high PT use — investment in transit quality delivers large co-benefits",
    "high":      "High PT use — transit investment can deliver significant modal shift gains",
    "medium":    "Medium PT use — transit investment can shift modal split meaningfully",
    "low":       "Low PT use — mode shift investment is challenging but high-impact if successful",
    "very low":  "Very low PT use — significant behaviour change needed; prioritise infrastructure",
  },
  transport_logistics_employment: {
    "very high": "Large freight sector — just-transition risks must be carefully managed",
    "high":      "Significant freight sector — just-transition planning is important",
    "medium":    "Moderate freight sector — just-transition considerations apply",
    "low":       "Relatively small freight sector — lower just-transition risk",
    "very low":  "Minimal freight employment — just-transition risk is negligible",
  },
  industry_construction_employment: {
    "very high": "Very large industrial base → just-transition considerations are critical",
    "high":      "Large industrial base → just-transition considerations critical",
    "medium":    "Moderate industrial base — just-transition planning is recommended",
    "low":       "Small industrial base — just-transition risks are limited",
    "very low":  "Minimal industrial employment — just-transition risk is very low",
  },
  electricity_access: {
    "very high": "Near-universal access — electrification of transport and heating is highly feasible",
    "high":      "High electricity access — electrification actions are broadly feasible",
    "medium":    "Moderate access — extend grid before prioritising electrification actions",
    "low":       "Low electricity access — grid expansion should precede electrification actions",
    "very low":  "Full access confirmed — electrification is feasible for all households",
  },
};

function buildRelevance(key: string, category: Category): string {
  return RELEVANCE[key]?.[category] ?? "—";
}

function formatValue(ind: Indicator): string {
  if (ind.units === "CLP") {
    return `CLP ${(ind.value / 1_000_000).toFixed(1)}M`;
  }
  return `${ind.value}%`;
}

// Maps UI indicator keys → API city_attributes keys where the names differ
const API_ATTRIBUTE_KEY: Record<string, string> = {
  electricity_access:            "electricity_access_rate",
  transport_logistics_employment: "employment_in_transport_and_logistics",
  industry_construction_employment: "employment_construction",
};

type ApiCityData = Record<string, { attribute_value: number; attribute_category: string }>;

function buildIndicators(
  _city: CityData,
  apiData: ApiCityData | null
): Indicator[] {
  return IQQ_INDICATORS.map((ind) => {
    const apiKey = API_ATTRIBUTE_KEY[ind.key] ?? ind.key;
    const field = apiData?.[apiKey];
    const category = (field?.attribute_category as Category | undefined) ?? ind.category;
    const value = field?.attribute_value ?? ind.value;
    return {
      ...ind,
      value,
      category,
      relevance: buildRelevance(ind.key, category),
    };
  });
}

const THEMES = ["Income & Welfare", "Housing", "Mobility", "Industry"] as const;

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

  const indicators = city ? buildIndicators(city, apiCityData) : [];

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

  const keyIndicators = [
    indicators.find((i) => i.key === "poverty_rate")!,
    indicators.find((i) => i.key === "unemployment_rate")!,
    indicators.find((i) => i.key === "home_ownership")!,
    indicators.find((i) => i.key === "public_transport_share")!,
  ].filter(Boolean);

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
              <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>
                MEED+ FEASIBILITY: Mitigation feasibility shapes 50% of feasibility score · Feasibility shapes 23% of ranking
              </span>
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
              {THEMES.map((theme) => {
                const rows = indicators.filter((ind) => ind.theme === theme);
                return rows.map((ind, rowIdx) => {
                  const style = CATEGORY_STYLES[ind.category];
                  const icon = CONCERN_ICON[ind.concern];
                  const isFirstInGroup = rowIdx === 0;
                  const isLastInGroup = rowIdx === rows.length - 1;
                  const isLastTheme = theme === THEMES[THEMES.length - 1];
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
            <strong>How MEED+ HIAP uses this data:</strong> Socioeconomic conditions feed into the mitigation feasibility component, which makes up 50% of the
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
