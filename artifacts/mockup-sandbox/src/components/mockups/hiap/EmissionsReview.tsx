import { Navbar } from "./_shared/Navbar";
import { Breadcrumb } from "./_shared/Breadcrumb";
import { useState } from "react";

const SECTORS = [
  { sector: "Transportation", sub: "All road modes", ref: "II.1.1", emissions: 2450320, share: 47, source: "SECCTIVAL 2023", status: "Confirmed" },
  { sector: "Stationary Energy", sub: "Electricity & gas", ref: "I.1.1–I.1.3", emissions: 1830510, share: 35.5, source: "DEC 2023", status: "Confirmed" },
  { sector: "Waste", sub: "Solid waste & Composting", ref: "III.1.1–III.4.1", emissions: 885050, share: 17.2, source: "MRC 2022", status: "Confirmed" },
  { sector: "Industrial Processes & Product Use (IPPU)", sub: "", ref: "IV.1–IV.2", emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Agriculture, Forestry & Other Land Use (AFOLU)", sub: "", ref: "V.1", emissions: null, share: null, source: null, status: "Not mapped" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Confirmed: { bg: "#DCFCE7", text: "#15803D" },
    "Needs review": { bg: "#FEF9C3", text: "#854D0E" },
    "Not mapped": { bg: "#F3F4F6", text: "#6B7280" },
  };
  const c = map[status] ?? map["Not mapped"];
  return (
    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export function EmissionsReview() {
  const [activeTab, setActiveTab] = useState<"review" | "adjust">("review");

  const totalEmissions = SECTORS.reduce((sum, s) => sum + (s.emissions ?? 0), 0);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />

      {/* Page header */}
      <div style={{ background: "white", borderBottom: "0.5px solid #E5E7EB", padding: "16px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Breadcrumb items={["Santiago", "City Profile", "Emissions Data"]} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#111827", margin: "0 0 2px" }}>
                Emissions Data
              </h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", background: "#FEF9C3", color: "#854D0E", padding: "2px 8px", borderRadius: "4px" }}>
                  3 / 5 sectors
                </span>
                <span style={{ fontSize: "12px", color: "#16A34A" }}>MEED+ IMPACT: shapes 55% of ranking</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("review")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: activeTab === "review" ? "1.5px solid #1E3A8A" : "1px solid #E5E7EB",
                  background: activeTab === "review" ? "#EFF6FF" : "white",
                  color: activeTab === "review" ? "#1E3A8A" : "#6B7280",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Review
              </button>
              <button
                onClick={() => setActiveTab("adjust")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: activeTab === "adjust" ? "1.5px solid #1E3A8A" : "1px solid #E5E7EB",
                  background: activeTab === "adjust" ? "#1E3A8A" : "white",
                  color: activeTab === "adjust" ? "white" : "#6B7280",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Adjust
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 40px" }}>
        {activeTab === "adjust" && (
          <div
            style={{
              background: "#FEF9C3",
              border: "1px solid #F59E0B",
              borderRadius: "8px",
              padding: "10px 16px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#854D0E",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>You are in edit mode — changes will affect rankings until you save.</span>
          </div>
        )}

        {/* Summary bar */}
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "16px",
            display: "flex",
            gap: "40px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Total GHG Emissions</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              {(totalEmissions / 1000000).toFixed(2)}M tCO₂e
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Inventory Year</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>2023</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Primary Source</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>Municipal records</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Completeness</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>3 of 5 sectors</div>
          </div>
        </div>

        {/* Data source bar */}
        <div
          style={{
            background: "#EFF6FF",
            border: "0.5px solid #BFDBFE",
            borderRadius: "8px",
            padding: "10px 16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#1E3A8A",
          }}
        >
          <span>📊 Data sourced from CityCatalyst GPC inventory · Inventory year 2023 · Municipal records</span>
          <button
            style={{
              background: "white",
              border: "0.5px solid #BFDBFE",
              borderRadius: "6px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#1E3A8A",
              cursor: "pointer",
            }}
          >
            View source
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #E5E7EB", background: "#F9FAFB" }}>
                {["SECTOR", "SUB-SECTOR", "TOTAL tCO₂e", "% SHARE", "DATA SOURCE", "STATUS", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontSize: "11px",
                      color: "#9CA3AF",
                      fontWeight: "500",
                      textAlign: "left",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "0.5px solid #F3F4F6" }}
                >
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                    {row.sector}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                    {row.sub || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#111827" }}>
                    {row.emissions ? row.emissions.toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#111827" }}>
                    {row.share ? `${row.share}%` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                    {row.source || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {activeTab === "review" ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {row.status !== "Not mapped" ? (
                          <button style={{ fontSize: "12px", color: "#16A34A", background: "none", border: "none", cursor: "pointer", padding: "0", fontWeight: "500" }}>
                            Confirmed ✓
                          </button>
                        ) : (
                          <button style={{ fontSize: "12px", color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "0" }}>
                            + Add data
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "6px" }}>
                        {row.status !== "Not mapped" ? (
                          <button
                            style={{
                              fontSize: "11px",
                              color: "#1E3A8A",
                              background: "#EFF6FF",
                              border: "0.5px solid #BFDBFE",
                              borderRadius: "4px",
                              padding: "3px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            style={{
                              fontSize: "11px",
                              color: "#6B7280",
                              background: "#F3F4F6",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 10px",
                              cursor: "pointer",
                            }}
                          >
                            + Add data
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeTab === "adjust" && (
            <div style={{ padding: "12px 16px", borderTop: "0.5px solid #E5E7EB" }}>
              <button
                style={{
                  fontSize: "12px",
                  color: "#1E3A8A",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                + Add another sector
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            style={{
              background: "white",
              border: "0.5px solid #D1D5DB",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            ← City Profile
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {activeTab === "adjust" && (
              <button
                style={{
                  background: "white",
                  border: "0.5px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  color: "#DC2626",
                  cursor: "pointer",
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
                fontWeight: "500",
                cursor: "pointer",
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
