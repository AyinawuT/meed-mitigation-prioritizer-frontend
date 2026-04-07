import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

const TOP_ACTIONS = [
  {
    rank: 1,
    expert: true,
    title: "Integrate renewables into municipal water systems",
    sector: "Stationary energy",
    cost: "Medium",
    time: ">5 years",
    reduction: "High",
    reductionWidth: "85%",
  },
  {
    rank: 2,
    expert: false,
    title: "Encourage renewable energy policies at the municipal level",
    sector: "Waste",
    cost: "Medium",
    time: ">5 years",
    reduction: "Medium",
    reductionWidth: "60%",
  },
  {
    rank: 3,
    expert: false,
    title: "Implementation of urban tail",
    sector: "Stationary energy",
    cost: "Medium",
    time: ">5 years",
    reduction: "Low",
    reductionWidth: "35%",
  },
];

const TABLE_ACTIONS = [
  { rank: 1, title: "Encourage renewable energy policies at the municipal level", sector: "Stationary energy", reduction: 0.85, alignment: 0.78, feasibility: 0.82, final: 0.83 },
  { rank: 2, title: "Integrate renewables into municipal water systems", sector: "Stationary energy", reduction: 0.79, alignment: 0.65, feasibility: 0.74, final: 0.74 },
  { rank: 3, title: "Implementation of urban soil", sector: "Transportation", reduction: 0.72, alignment: 0.81, feasibility: 0.66, final: 0.73 },
  { rank: 4, title: "Incentivize e-bike sharing programs in urban areas, with a focus on electric bikes", sector: "Transportation", reduction: 0.68, alignment: 0.72, feasibility: 0.71, final: 0.70 },
  { rank: 5, title: "Deploy on-demand transport systems with 100% electric fleets", sector: "Transportation", reduction: 0.65, alignment: 0.69, feasibility: 0.68, final: 0.67 },
  { rank: 6, title: "Implementation of free public transportation programs during peak hours to reduce the...", sector: "Transportation", reduction: 0.62, alignment: 0.71, feasibility: 0.64, final: 0.65 },
  { rank: 7, title: "Adoption of low-emission in public fleets", sector: "Transportation", reduction: 0.60, alignment: 0.66, feasibility: 0.62, final: 0.63 },
  { rank: 8, title: "Promote community solar farms", sector: "Stationary energy", reduction: 0.58, alignment: 0.63, feasibility: 0.60, final: 0.60 },
  { rank: 9, title: "Install biodigesters in rural properties", sector: "Stationary energy", reduction: 0.55, alignment: 0.60, feasibility: 0.57, final: 0.58 },
  { rank: 10, title: "Adopt policies for fossil fuel-free buildings", sector: "Stationary energy", reduction: 0.53, alignment: 0.58, feasibility: 0.55, final: 0.55 },
];

function ScoreBar({ value, color = "#1E3A8A" }: { value: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "80px", background: "#E5E7EB", borderRadius: "4px", height: "6px" }}>
        <div style={{ background: color, width: `${value * 100}%`, height: "6px", borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "11px", color: "#6B7280" }}>{(value * 100).toFixed(0)}</span>
    </div>
  );
}

export function Results() {
  const [activeTab, setActiveTab] = useState("mitigation");

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero / results header */}
      <div style={{ background: "white", borderBottom: "0.5px solid #E5E7EB", padding: "28px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
            Climate Actions
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
                Top actions for your city
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>
                Discover the ranking of your city's climate actions according to their effectiveness, costs and benefits, helping you to prioritize those with the greatest potential for impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 40px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "0.5px solid #E5E7EB", marginBottom: "20px" }}>
          {[
            { key: "mitigation", label: "Mitigation" },
            { key: "adaptation", label: "Adaptation", disabled: true },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              style={{
                padding: "10px 20px",
                borderRadius: "0",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #1E3A8A" : "2px solid transparent",
                background: "none",
                fontSize: "13px",
                fontWeight: activeTab === tab.key ? "500" : "400",
                color: tab.disabled ? "#9CA3AF" : activeTab === tab.key ? "#1E3A8A" : "#6B7280",
                cursor: tab.disabled ? "not-allowed" : "pointer",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
              {tab.disabled && (
                <span style={{ fontSize: "10px", marginLeft: "6px", color: "#9CA3AF" }}>(coming soon)</span>
              )}
            </button>
          ))}
        </div>

        {/* Top 3 */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#111827" }}>Top mitigation climate actions</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                Here are your top climate actions, initially prioritized by our experts. Reorder the table below to set new priorities in this Section. You can generate a complete implementation plan for your top 5 actions at any time.
              </div>
            </div>
            <button
              style={{
                background: "#1E3A8A",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              ⚡ Generate Plan
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {TOP_ACTIONS.map((action) => (
              <div
                key={action.rank}
                style={{
                  background: "white",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#1E3A8A",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: "0",
                    }}
                  >
                    #{action.rank}
                  </div>
                  {action.expert && (
                    <span
                      style={{
                        fontSize: "10px",
                        background: "#DCFCE7",
                        color: "#15803D",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Expert's Choice
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginBottom: "8px", lineHeight: "1.4" }}>
                  {action.title}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "1.4" }}>
                  Lorem ipsum dolor sit amet consectetur. Aliquam leo amet in leo. Dignissim vivamus tincidunt.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                  {[
                    { label: "Reduction potential", value: action.reduction, color: action.reduction === "High" ? "#16A34A" : action.reduction === "Medium" ? "#D97706" : "#6B7280" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ color: "#9CA3AF" }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: "500" }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#9CA3AF" }}>Sector</span>
                    <span style={{ color: "#6B7280" }}>{action.sector}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#9CA3AF" }}>Estimated cost</span>
                    <span style={{ color: "#6B7280" }}>{action.cost}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#9CA3AF" }}>Implementation time</span>
                    <span style={{ color: "#6B7280" }}>{action.time}</span>
                  </div>
                </div>
                <button
                  style={{
                    width: "100%",
                    background: "none",
                    border: "0.5px solid #E5E7EB",
                    borderRadius: "6px",
                    padding: "7px",
                    fontSize: "12px",
                    color: "#1E3A8A",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  See more details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking table */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#111827" }}>Climate actions ranking</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                Apply your local expertise to customize action priorities. Reorder based on your city's specific needs, feasibility, and potential impacts. You can also download the complete table to share with stakeholders.
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  background: "white",
                  border: "0.5px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                ⟳ Modify ranking
              </button>
              <button
                style={{
                  background: "white",
                  border: "0.5px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                ↓ Download
              </button>
            </div>
          </div>

          <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "0.5px solid #E5E7EB" }}>
                  {["RANK", "ACTION", "SECTOR", "REDUCTION POTENTIAL", "ALIGNMENT", "FEASIBILITY", "SCORE", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontSize: "11px",
                        color: "#9CA3AF",
                        fontWeight: "500",
                        textAlign: "left",
                        letterSpacing: "0.03em",
                        cursor: h !== "" ? "pointer" : "default",
                      }}
                    >
                      {h} {h !== "" && h !== "RANK" && "↕"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ACTIONS.map((action, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "600", color: "#1E3A8A" }}>
                      #{action.rank}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "#111827", maxWidth: "260px" }}>
                      {action.title}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B7280" }}>
                      {action.sector}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <ScoreBar value={action.reduction} />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <ScoreBar value={action.alignment} color="#16A34A" />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <ScoreBar value={action.feasibility} color="#D97706" />
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: "600", color: "#111827" }}>
                      {(action.final * 100).toFixed(0)}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9CA3AF",
                          fontSize: "14px",
                        }}
                      >
                        ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
