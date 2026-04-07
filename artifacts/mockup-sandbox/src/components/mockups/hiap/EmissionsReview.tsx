import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

const SECTORS = [
  { sector: "Transportation", sub: "All road modes", ref: "II.1.1", emissions: 2450320, share: 47, source: "SECCTIVAL 2023", status: "Confirmed" },
  { sector: "Stationary Energy", sub: "Electricity & gas", ref: "I.1.1–I.1.3", emissions: 1830510, share: 35.5, source: "DEC 2023", status: "Confirmed" },
  { sector: "Waste", sub: "Solid waste & Composting", ref: "III.1.1–III.4.1", emissions: 885050, share: 17.2, source: "MRC 2022", status: "Confirmed" },
  { sector: "Industrial Processes & Product Use (IPPU)", sub: "", ref: "IV.1–IV.2", emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Agriculture, Forestry & Other Land Use (AFOLU)", sub: "", ref: "V.1", emissions: null, share: null, source: null, status: "Not mapped" },
];

export function EmissionsReview() {
  const [activeTab, setActiveTab] = useState<"review" | "adjust">("review");

  const totalEmissions = SECTORS.reduce((sum, s) => sum + (s.emissions ?? 0), 0);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 48px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>Santiago / City Profile / Emissions Data</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                Emissions Data
              </h1>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                  4 / 5 sectors
                </span>
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>MEED+ IMPACT: shapes 55% of ranking</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("review")}
                style={{
                  padding: "7px 18px",
                  borderRadius: "6px",
                  border: activeTab === "review" ? "1.5px solid #001EA7" : "1px solid #DDDDE1",
                  background: activeTab === "review" ? "#EFF6FF" : "white",
                  color: activeTab === "review" ? "#001EA7" : "#9CA3AF",
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
                  padding: "7px 18px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "adjust" ? "#001EA7" : "white",
                  color: activeTab === "adjust" ? "white" : "#9CA3AF",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  outline: activeTab === "adjust" ? "none" : "1px solid #DDDDE1",
                }}
              >
                Adjust
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 48px" }}>
        {activeTab === "adjust" && (
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
            <span>You are in edit mode — changes will affect rankings until you save.</span>
          </div>
        )}

        {/* Summary bar */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "14px",
          display: "flex",
          gap: "40px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {[
            { label: "Total GHG Emissions", value: `${(totalEmissions / 1e6).toFixed(2)}M tCO₂e` },
            { label: "Inventory Year", value: "2023" },
            { label: "Primary Source", value: "Municipal records" },
            { label: "Completeness", value: "3 of 5 sectors" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>{s.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                {["SECTOR", "SUB-SECTOR", "TOTAL tCO₂e", "% SHARE", "DATA SOURCE", "STATUS", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{row.sector}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{row.sub}</div>
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
                    {row.status === "Confirmed" ? (
                      <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>Confirmed</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Not mapped</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {activeTab === "review" ? (
                      row.status !== "Not mapped" && (
                        <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>✓</span>
                      )
                    ) : (
                      row.status !== "Not mapped" ? (
                        <button style={{ fontSize: "12px", color: "#001EA7", background: "#EFF6FF", border: "none", borderRadius: "5px", padding: "4px 12px", cursor: "pointer" }}>
                          Edit
                        </button>
                      ) : (
                        <button style={{ fontSize: "12px", color: "#6B7280", background: "#F5F5F5", border: "none", borderRadius: "5px", padding: "4px 12px", cursor: "pointer" }}>
                          + Add data
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeTab === "adjust" && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0F0" }}>
              <button style={{ fontSize: "12px", color: "#001EA7", background: "none", border: "none", cursor: "pointer" }}>
                + Add another sector
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>
            ← City Profile
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {activeTab === "adjust" && (
              <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#DC2626", cursor: "pointer" }}>
                Discard changes
              </button>
            )}
            <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
              {activeTab === "adjust" ? "Save & continue →" : "Socioeconomic context →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
