import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";

type Tab = "review" | "adjust";

interface SectorRow {
  sector: string;
  sub: string;
  ref: string;
  emissions: number | null;
  share: number | null;
  source: string | null;
  status: "Confirmed" | "Not mapped";
}

// Computed from prioritizer-request.json (inventoryYear: 2022)
const IQQ_SECTORS: SectorRow[] = [
  {
    sector: "Stationary Energy",
    sub: "I.1.1 Residential combustion · I.1.2 Residential electricity",
    ref: "I.1–I.3",
    emissions: 8779938,
    share: 96.7,
    source: "GPC Inventory 2022",
    status: "Confirmed",
  },
  {
    sector: "Transportation",
    sub: "II.1.1 On-road transport",
    ref: "II.1",
    emissions: 27588,
    share: 0.3,
    source: "GPC Inventory 2022",
    status: "Confirmed",
  },
  {
    sector: "Waste",
    sub: "III.4.1 Wastewater treatment & discharge",
    ref: "III.1–III.4",
    emissions: 236604,
    share: 2.6,
    source: "GPC Inventory 2022",
    status: "Confirmed",
  },
  {
    sector: "Industrial Processes & Product Use (IPPU)",
    sub: "IV.1 Industrial processes · IV.2 Product use",
    ref: "IV.1–IV.2",
    emissions: 32167,
    share: 0.4,
    source: "GPC Inventory 2022",
    status: "Confirmed",
  },
  {
    sector: "Agriculture, Forestry & Other Land Use (AFOLU)",
    sub: "V.1 Livestock",
    ref: "V.1–V.3",
    emissions: 130,
    share: 0.0,
    source: "GPC Inventory 2022",
    status: "Confirmed",
  },
];

function buildSectors(city: CityData): SectorRow[] {
  if (city.locode === "CL IQQ") return IQQ_SECTORS;

  const mapped = parseFloat(city.emissions.replace(/,/g, "").replace(/[^0-9.]/g, ""));
  return [
    {
      sector: "Transportation",
      sub: "II.1.1 On-road · II.1.2 Railways · II.1.3 Waterborne",
      ref: "II.1",
      emissions: Math.round(mapped * 0.47),
      share: 47,
      source: "SECCTIVAL " + city.emissionsYear,
      status: "Confirmed",
    },
    {
      sector: "Stationary Energy",
      sub: "I.1.1 Residential · I.2.1 Commercial & institutional · I.3.1 Manufacturing",
      ref: "I.1–I.3",
      emissions: Math.round(mapped * 0.355),
      share: 35.5,
      source: "DEC " + city.emissionsYear,
      status: "Confirmed",
    },
    {
      sector: "Waste",
      sub: "III.1.1 Solid waste disposal · III.3.1 Wastewater treatment",
      ref: "III.1–III.3",
      emissions: Math.round(mapped * 0.172),
      share: 17.2,
      source: "MRC " + String(parseInt(city.emissionsYear) - 1),
      status: "Confirmed",
    },
    {
      sector: "Industrial Processes & Product Use (IPPU)",
      sub: "IV.1 Industrial processes · IV.2 Product use",
      ref: "IV.1–IV.2",
      emissions: null,
      share: null,
      source: null,
      status: "Not mapped",
    },
    {
      sector: "Agriculture, Forestry & Other Land Use (AFOLU)",
      sub: "V.1 Livestock · V.2 Land · V.3 Aggregate sources",
      ref: "V.1–V.3",
      emissions: null,
      share: null,
      source: null,
      status: "Not mapped",
    },
  ];
}

interface EmissionsReviewProps {
  params: { locode: string };
}

export function EmissionsReview({ params }: EmissionsReviewProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("review");
  const [discarded, setDiscarded] = useState(false);

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

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
  const sectors = buildSectors(city);
  const confirmedCount = sectors.filter((s) => s.status === "Confirmed").length;
  const totalEmissions = sectors.reduce((sum, s) => sum + (s.emissions ?? 0), 0);
  const totalMillions = (totalEmissions / 1e6).toFixed(2);
  const inventoryYear = city.locode === "CL IQQ" ? "2022" : city.emissionsYear;

  function handleDiscard() {
    setDiscarded(true);
    setActiveTab("review");
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={0} />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              Cities
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {city.name}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Emissions Data</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
                Emissions Data
              </h1>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px",
                  background: confirmedCount === sectors.length ? "#F0FDF4" : "#FFF3E0",
                  color: confirmedCount === sectors.length ? "#16A34A" : "#C05621",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}>
                  {confirmedCount} / {sectors.length} sectors confirmed
                </span>
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>
                  MEED+ IMPACT: shapes 55% of ranking
                </span>
              </div>
            </div>

            {/* Review / Adjust toggle */}
            <div style={{ display: "flex", gap: "6px" }}>
              {(["review", "adjust"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setDiscarded(false); }}
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
        {/* Adjust mode warning */}
        {activeTab === "adjust" && !discarded && (
          <div style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "8px",
            padding: "10px 16px",
            marginBottom: "14px",
            fontSize: "13px",
            color: "#92400E",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>⚠️</span>
            <span>You are in edit mode. Changes will not affect rankings until you save.</span>
          </div>
        )}

        {/* Summary bar */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          padding: "16px 24px",
          marginBottom: "14px",
          display: "flex",
          gap: "40px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          flexWrap: "wrap",
        }}>
          {[
            { label: "Total GHG Emissions", value: `${totalMillions}M tCO₂e` },
            { label: "Inventory Year", value: inventoryYear },
            { label: "Primary Source", value: "Municipal records" },
            { label: "Completeness", value: `${confirmedCount} of ${sectors.length} sectors` },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Sector table */}
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
                {["SECTOR", "SUB-SECTORS", "TOTAL tCO₂e", "% SHARE", "DATA SOURCE", "STATUS", ""].map((h) => (
                  <th key={h} style={{
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
              {sectors.map((row, i) => {
                const isConfirmed = row.status === "Confirmed";
                return (
                  <tr key={i} style={{ borderBottom: i < sectors.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{row.sector}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px", fontFamily: "monospace" }}>{row.ref}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#6B7280", maxWidth: "220px" }}>
                      {row.sub}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: isConfirmed ? "#111827" : "#D1D5DB", fontVariantNumeric: "tabular-nums" }}>
                      {row.emissions ? row.emissions.toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: isConfirmed ? "#111827" : "#D1D5DB" }}>
                      {row.share ? `${row.share}%` : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#6B7280" }}>
                      {row.source ?? "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {isConfirmed ? (
                        <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>✓ Confirmed</span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Not mapped</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {activeTab === "review" ? (
                        isConfirmed ? (
                          <span style={{ fontSize: "13px", color: "#16A34A" }}>✓</span>
                        ) : null
                      ) : (
                        isConfirmed ? (
                          <button style={{
                            fontSize: "12px",
                            color: "#001EA7",
                            background: "#EFF6FF",
                            border: "none",
                            borderRadius: "5px",
                            padding: "4px 12px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}>
                            Edit
                          </button>
                        ) : (
                          <button style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            background: "#F5F5F5",
                            border: "none",
                            borderRadius: "5px",
                            padding: "4px 12px",
                            cursor: "pointer",
                          }}>
                            + Add data
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {activeTab === "adjust" && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0F0" }}>
              <button style={{
                fontSize: "12px",
                color: "#001EA7",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
              }}>
                + Add another sector
              </button>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}`)}
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
            ← City Profile
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
              {activeTab === "adjust" ? "Save & continue →" : "Socioeconomic context →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
