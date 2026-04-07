import { Navbar } from "./_shared/Navbar";

const TOP_ACTIONS = [
  {
    rank: 1,
    expert: true,
    title: "Integrate renewables into municipal water systems",
    sector: "Transport",
    cost: "Medium",
    time: ">5 years",
    reduction: "High",
  },
  {
    rank: 2,
    expert: false,
    title: "Encourage renewable energy policies at the municipal level",
    sector: "Waste",
    cost: "Medium",
    time: ">5 years",
    reduction: "Medium",
  },
  {
    rank: 3,
    expert: false,
    title: "Implementation of urban tail",
    sector: "Stationary energy",
    cost: "Medium",
    time: ">5 years",
    reduction: "Low",
  },
];

const TABLE_ACTIONS = [
  { rank: 1, title: "Encourage renewable energy policies at the municipal level", sector: "Stationary energy", reduction: 0.85 },
  { rank: 2, title: "Integrate renewables into municipal water systems", sector: "Stationary energy", reduction: 0.79 },
  { rank: 3, title: "Implementation of urban soil", sector: "Transportation", reduction: 0.72 },
  { rank: 4, title: "Incentivize e-bike sharing programs in urban areas, with a focus on electric bikes", sector: "Transportation", reduction: 0.65 },
  { rank: 5, title: "Deploy on-demand transport systems with 100% electric fleets", sector: "Transportation", reduction: 0.62 },
  { rank: 6, title: "Implementation of free public transportation programs during peak hours", sector: "Transportation", reduction: 0.58 },
  { rank: 7, title: "Adoption of low-emission in public fleets", sector: "Transportation", reduction: 0.55 },
  { rank: 8, title: "Promote community solar farms", sector: "Stationary energy", reduction: 0.52 },
  { rank: 9, title: "Install biodigesters in rural properties", sector: "Stationary energy", reduction: 0.49 },
  { rank: 10, title: "Adopt policies for fossil fuel-free buildings", sector: "Stationary energy", reduction: 0.46 },
  { rank: 11, title: "Expand cycling infrastructure and solid public walkways and accessible sidewalks", sector: "Transportation", reduction: 0.44 },
  { rank: 12, title: "Adopt large-powered street lighting in rural areas", sector: "Stationary energy", reduction: 0.41 },
  { rank: 13, title: "Vanday Emissions", sector: "Transportation", reduction: 0.38 },
  { rank: 14, title: "Adoption of electric drivers for last-mile solutions", sector: "Transportation", reduction: 0.36 },
  { rank: 15, title: "Support Distributed Energy Generation in Residences and Businesses", sector: "Stationary energy", reduction: 0.34 },
  { rank: 16, title: "Expansion of metro-rail systems to safe metros, UPT, and monorails", sector: "Transportation", reduction: 0.32 },
  { rank: 17, title: "Create conditions for residential and community wind energy projects", sector: "Stationary energy", reduction: 0.30 },
  { rank: 18, title: "Prioritize Procurement of Locally Produced Agroecological Products in Public Purchases", sector: "AFOLU", reduction: 0.28 },
  { rank: 19, title: "Provide tax incentives for renewable energy in residential projects", sector: "Stationary energy", reduction: 0.26 },
  { rank: 20, title: "Reduce technical losses in energy distribution networks", sector: "Stationary energy", reduction: 0.24 },
];

export function Results() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* White header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>Santiago / Mitigation actions</div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
            Top mitigation actions for your city
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>
            Ranked by reduction potential, feasibility, and alignment with your city's priorities. Apply your local expertise to reorder as needed.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 48px" }}>
        {/* Top 3 */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Top 3 mitigation actions</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Highest-ranked actions based on your city's data and preferences. Reorder the table below to adjust priorities.
              </div>
            </div>
            <button style={{ background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
              ⚡ Generate Plan
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            {TOP_ACTIONS.map((action) => (
              <div key={action.rank} style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#001EA7", color: "white", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    #{action.rank}
                  </div>
                  {action.expert && (
                    <span style={{ fontSize: "10px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                      Expert's Choice
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "8px", lineHeight: "1.4" }}>
                  {action.title}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "1.4" }}>
                  Lorem ipsum dolor sit amet consectetur. Aliquam leo amet in leo.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9CA3AF" }}>Reduction potential</span>
                    <span style={{ color: action.reduction === "High" ? "#16A34A" : action.reduction === "Medium" ? "#F59E0B" : "#6B7280", fontWeight: "600" }}>{action.reduction}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9CA3AF" }}>Sector</span><span style={{ color: "#6B7280" }}>{action.sector}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9CA3AF" }}>Estimated cost</span><span style={{ color: "#6B7280" }}>{action.cost}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9CA3AF" }}>Implementation time</span><span style={{ color: "#6B7280" }}>{action.time}</span>
                  </div>
                </div>
                <button style={{ width: "100%", background: "none", border: "1px solid #EBEBEB", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#001EA7", cursor: "pointer", fontWeight: "500" }}>
                  See more details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking table */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Mitigation actions ranking</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Apply your local expertise to adjust priorities. Reorder based on your city's specific needs.
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", color: "#6B7280", cursor: "pointer" }}>
                ⟳ Modify ranking
              </button>
              <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", color: "#6B7280", cursor: "pointer" }}>
                ↓ Download
              </button>
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
                  {["RANK", "ACTION", "SECTOR", "REDUCTION POTENTIAL", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ACTIONS.map((action, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#001EA7" }}>#{action.rank}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "#111827", maxWidth: "300px" }}>{action.title}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B7280" }}>{action.sector}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "100px", background: "#EEF2FF", borderRadius: "3px", height: "6px" }}>
                          <div style={{ background: "#001EA7", width: `${action.reduction * 100}%`, height: "6px", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "14px" }}>↗</button>
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
