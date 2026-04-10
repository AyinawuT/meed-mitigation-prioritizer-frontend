import { useState, useEffect } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import citiesMock from "@/data/citiesMock.json";

type Tab = "review" | "adjust";
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

function formatValue(ind: Indicator): string {
  if (ind.units === "CLP") {
    return `CLP ${(ind.value / 1_000_000).toFixed(1)}M`;
  }
  return `${ind.value}%`;
}

function buildIndicators(city: CityData): Indicator[] {
  if (city.locode === "CL IQQ") return IQQ_INDICATORS;
  const mockCity = (citiesMock as { cities: Record<string, { attribute_value: number; attribute_category: string }>[]; }).cities
    ?.find((c) => (c as unknown as { locode: string }).locode?.toUpperCase() === city.locode.toUpperCase());
  if (!mockCity) {
    return IQQ_INDICATORS.map((ind) => ({ ...ind, value: 0, category: "medium" as Category }));
  }
  return IQQ_INDICATORS.map((ind) => {
    const field = (mockCity as Record<string, { attribute_value: number; attribute_category: string } | unknown>)[ind.key] as { attribute_value: number; attribute_category: string } | undefined;
    if (!field || typeof field !== "object") return { ...ind, value: 0, category: "medium" as Category };
    return {
      ...ind,
      value: field.attribute_value,
      category: field.attribute_category as Category,
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
  const [activeTab, setActiveTab] = useState<Tab>("review");

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const original = city ? buildIndicators(city) : [];
  const [indicators, setIndicators] = useState<Indicator[]>(original);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [draftSource, setDraftSource] = useState("");
  const [hasEdits, setHasEdits] = useState(false);

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

  function startEdit(key: string) {
    const ind = indicators.find((i) => i.key === key)!;
    setEditingKey(key);
    setDraftValue(ind.units === "CLP" ? String(ind.value / 1_000_000) : String(ind.value));
    setDraftSource(ind.source);
  }

  function commitEdit(key: string): boolean {
    const ind = indicators.find((i) => i.key === key)!;
    const parsed = parseFloat(draftValue.replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 0) return false;
    const actualValue = ind.units === "CLP" ? parsed * 1_000_000 : parsed;
    setIndicators(indicators.map((i) =>
      i.key === key
        ? { ...i, value: actualValue, source: draftSource.trim() || i.source }
        : i
    ));
    setEditingKey(null);
    setHasEdits(true);
    return true;
  }

  function cancelEdit() {
    setEditingKey(null);
  }

  function handleDiscard() {
    setIndicators(buildIndicators(city));
    setEditingKey(null);
    setHasEdits(false);
    setActiveTab("review");
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "review") setEditingKey(null);
  }

  const keyIndicators = [
    indicators.find((i) => i.key === "poverty_rate")!,
    indicators.find((i) => i.key === "unemployment_rate")!,
    indicators.find((i) => i.key === "home_ownership")!,
    indicators.find((i) => i.key === "public_transport_share")!,
  ].filter(Boolean);

  const inputStyle: React.CSSProperties = {
    border: "1px solid #CBD5E1",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    color: "#111827",
  };

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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "40px" }}>
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
                  MEED+ FEASIBILITY: Socioeconomic context shapes 50% of feasibility score · Feasibility shapes 23% of ranking
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {(["review", "adjust"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === tab ? "#001EA7" : "white",
                    color: activeTab === tab ? "white" : "#9CA3AF",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    outline: activeTab === tab ? "none" : "1px solid #DDDDE1",
                    transition: "background 0.15s",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
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
                {["INDICATOR", "VALUE", "RELATIVE LEVEL", "MEED+ CLIMATE RELEVANCE", activeTab === "adjust" ? "" : ""].map((h, i) => (
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
                  const isEditing = editingKey === ind.key && activeTab === "adjust";
                  const rowBorder = isLastInGroup && !isLastTheme ? "2px solid #F0F0F0" : "1px solid #F5F5F5";

                  if (isEditing) {
                    return (
                      <tr key={ind.key} style={{ borderBottom: rowBorder, background: "#F8FAFF" }}>
                        <td style={{ padding: "12px 16px", minWidth: "200px" }}>
                          {isFirstInGroup && (
                            <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                              {theme}
                            </div>
                          )}
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
                            {ind.label}
                          </div>
                          <input
                            type="text"
                            value={draftSource}
                            onChange={(e) => setDraftSource(e.target.value)}
                            placeholder="Data source"
                            style={{ ...inputStyle, fontSize: "11px", padding: "3px 8px", width: "150px" }}
                          />
                        </td>
                        <td style={{ padding: "12px 16px", width: "120px" }}>
                          <input
                            type="text"
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            placeholder={ind.units === "CLP" ? "e.g. 1.2" : "e.g. 26.77"}
                            style={{ ...inputStyle, width: "100px" }}
                            autoFocus
                          />
                          <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "3px" }}>
                            {ind.units === "CLP" ? "CLP millions" : "%"}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "11px", background: style.bg, color: style.color, padding: "3px 10px", borderRadius: "4px", fontWeight: "600" }}>
                            {style.label}
                          </span>
                        </td>
                        <td colSpan={2} style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                            <span style={{ fontSize: "12px", color: "#6B7280" }}>{ind.relevance}</span>
                            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                              <button
                                onClick={() => commitEdit(ind.key)}
                                style={{ fontSize: "12px", color: "white", background: "#16A34A", border: "none", borderRadius: "5px", padding: "4px 12px", cursor: "pointer", fontWeight: "500" }}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{ fontSize: "12px", color: "#6B7280", background: "#F5F5F5", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

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
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", maxWidth: "280px" }}>
                        <span style={{ marginRight: "6px", color: ind.concern === "risk" ? "#B91C1C" : ind.concern === "opportunity" ? "#16A34A" : "#9CA3AF", fontWeight: "600" }}>
                          {icon}
                        </span>
                        {ind.relevance}
                      </td>
                      {activeTab === "adjust" && (
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => startEdit(ind.key)}
                            disabled={editingKey !== null}
                            style={{
                              fontSize: "12px",
                              color: "#001EA7",
                              background: "#EFF6FF",
                              border: "none",
                              borderRadius: "5px",
                              padding: "4px 12px",
                              cursor: editingKey !== null ? "not-allowed" : "pointer",
                              fontWeight: "500",
                              opacity: editingKey !== null && editingKey !== ind.key ? 0.5 : 1,
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      )}
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
            <strong>How MEED+ HIAP uses this data:</strong> Socioeconomic indicators make up 50% of the
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

          <div style={{ display: "flex", gap: "8px" }}>
            {activeTab === "adjust" && (
              <button
                onClick={handleDiscard}
                style={{
                  background: "white",
                  border: "1px solid #DDDDE1",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  color: "#DC2626",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Discard changes
              </button>
            )}
            <button
              onClick={() => {
                if (activeTab === "adjust") {
                  if (editingKey !== null) {
                    const saved = commitEdit(editingKey);
                    if (!saved) cancelEdit();
                  }
                  setHasEdits(false);
                  setEditingKey(null);
                  setActiveTab("review");
                } else {
                  confirmStep(locode, "socioeconomic");
                  navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/regulations`);
                }
              }}
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
              {activeTab === "adjust" ? "Save & continue →" : fromPreflight ? "Save & return to pre-flight →" : "Regulations & laws →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
