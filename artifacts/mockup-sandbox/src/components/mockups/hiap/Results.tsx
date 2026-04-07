import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

type Action = {
  rank: number;
  expert?: boolean;
  title: string;
  sector: string;
  time: string;
  reduction: string | number;
  gpc?: string;
  description?: string;
  explanation?: string;
  scores?: { impact: number; alignment: number; feasibility: number };
  cobenefits?: string[];
  barriers?: string[];
};

const TOP_ACTIONS: Action[] = [
  {
    rank: 1,
    expert: true,
    title: "Integrate renewables into municipal water systems",
    sector: "Stationary Energy",
    time: ">5 years",
    reduction: "High",
    gpc: "I.4.1",
    description:
      "This action involves retrofitting pumping stations, treatment plants, and distribution infrastructure with solar PV or small wind installations. By decarbonising energy-intensive water operations, cities can reduce both operational emissions and utility costs simultaneously.",
    explanation:
      "Ranked #1 because Santiago's water utility is responsible for 18% of municipal electricity consumption. High reduction potential combined with strong policy alignment (National Water Strategy 2030) and moderate implementation feasibility pushed this to the top.",
    scores: { impact: 0.88, alignment: 0.76, feasibility: 0.62 },
    cobenefits: ["Reduced utility bills", "Energy security", "Lower operational costs"],
    barriers: ["High upfront capital", "Regulatory procurement rules"],
  },
  {
    rank: 2,
    expert: false,
    title: "Encourage renewable energy policies at the municipal level",
    sector: "Stationary Energy",
    time: ">5 years",
    reduction: "Medium",
    gpc: "I.1.1 · I.2.1",
    description:
      "This action covers the development of local ordinances, tax incentives, and fast-track permitting to accelerate residential and commercial solar adoption. It sets the regulatory foundation for decentralised clean energy generation.",
    explanation:
      "Ranked #2 due to its broad sectoral coverage across residential and commercial buildings, which together account for 35% of Santiago's stationary energy emissions. Policy actions of this type have high alignment with Chile's national electrification goals.",
    scores: { impact: 0.79, alignment: 0.84, feasibility: 0.70 },
    cobenefits: ["Household energy savings", "Job creation in green sector"],
    barriers: ["Political will required", "Long legislative timelines"],
  },
  {
    rank: 3,
    expert: false,
    title: "Implementation of urban toll pricing on high-emission corridors",
    sector: "Transportation",
    time: "2–5 years",
    reduction: "Low",
    gpc: "II.1.1",
    description:
      "Congestion pricing on high-traffic corridors discourages private vehicle use during peak hours, reducing idling emissions and shifting demand toward public transport. Revenue can be ring-fenced for transit improvements.",
    explanation:
      "Ranked #3 because transportation is Santiago's largest emission source (47%). While reduction potential is lower than energy actions, the implementation timeline is shorter and co-benefits — including air quality and congestion — are well-documented.",
    scores: { impact: 0.65, alignment: 0.72, feasibility: 0.58 },
    cobenefits: ["Improved air quality", "Reduced congestion", "Public transport revenue"],
    barriers: ["Public acceptance", "Equity concerns for low-income commuters"],
  },
];

const TABLE_ACTIONS: Action[] = [
  { rank: 1, title: "Encourage renewable energy policies at the municipal level", sector: "Stationary energy", reduction: 0.85, time: ">5 years" },
  { rank: 2, title: "Integrate renewables into municipal water systems", sector: "Stationary energy", reduction: 0.79, time: ">5 years" },
  { rank: 3, title: "Implementation of urban toll pricing on high-emission corridors", sector: "Transportation", reduction: 0.72, time: "2–5 years" },
  { rank: 4, title: "Incentivize e-bike sharing programs in urban areas, with a focus on electric bikes", sector: "Transportation", reduction: 0.65, time: "1–2 years" },
  { rank: 5, title: "Deploy on-demand transport systems with 100% electric fleets", sector: "Transportation", reduction: 0.62, time: ">5 years" },
  { rank: 6, title: "Implementation of free public transportation programs during peak hours", sector: "Transportation", reduction: 0.58, time: "2–5 years" },
  { rank: 7, title: "Adoption of low-emission vehicles in public fleets", sector: "Transportation", reduction: 0.55, time: "2–5 years" },
  { rank: 8, title: "Promote community solar farms", sector: "Stationary energy", reduction: 0.52, time: ">5 years" },
  { rank: 9, title: "Install biodigesters in rural properties", sector: "Stationary energy", reduction: 0.49, time: "2–5 years" },
  { rank: 10, title: "Adopt policies for fossil fuel-free buildings", sector: "Stationary energy", reduction: 0.46, time: ">5 years" },
  { rank: 11, title: "Expand cycling infrastructure and accessible sidewalks", sector: "Transportation", reduction: 0.44, time: "1–2 years" },
  { rank: 12, title: "Adopt solar-powered street lighting in rural areas", sector: "Stationary energy", reduction: 0.41, time: "1–2 years" },
  { rank: 13, title: "Reduce vehicle idling emissions through municipal ordinance", sector: "Transportation", reduction: 0.38, time: "<1 year" },
  { rank: 14, title: "Adoption of electric vehicles for last-mile solutions", sector: "Transportation", reduction: 0.36, time: "1–2 years" },
  { rank: 15, title: "Support distributed energy generation in residences and businesses", sector: "Stationary energy", reduction: 0.34, time: ">5 years" },
  { rank: 16, title: "Expansion of metro-rail systems and BRT corridors", sector: "Transportation", reduction: 0.32, time: ">5 years" },
  { rank: 17, title: "Create conditions for residential and community wind energy projects", sector: "Stationary energy", reduction: 0.30, time: ">5 years" },
  { rank: 18, title: "Prioritize procurement of locally produced agroecological products", sector: "AFOLU", reduction: 0.28, time: "<1 year" },
  { rank: 19, title: "Provide tax incentives for renewable energy in residential projects", sector: "Stationary energy", reduction: 0.26, time: "1–2 years" },
  { rank: 20, title: "Reduce technical losses in energy distribution networks", sector: "Stationary energy", reduction: 0.24, time: "2–5 years" },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "#16A34A" : pct >= 55 ? "#F59E0B" : "#6B7280";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#6B7280" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: "600", color }}>{pct}</span>
      </div>
      <div style={{ background: "#F0F0F4", borderRadius: "3px", height: "6px" }}>
        <div style={{ background: color, width: `${pct}%`, height: "6px", borderRadius: "3px" }} />
      </div>
    </div>
  );
}

function DetailPanel({ action, onClose }: { action: Action; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "600", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}
          >
            ← GO BACK
          </button>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            {action.sector}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.35" }}>
            {action.title}
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {action.expert && (
              <span style={{ fontSize: "10px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>Expert's Choice</span>
            )}
            {action.gpc && (
              <span style={{ fontSize: "10px", background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>GPC {action.gpc}</span>
            )}
            <span style={{ fontSize: "10px", background: "#F5F5F7", color: "#6B7280", padding: "2px 8px", borderRadius: "4px" }}>⏱ {action.time}</span>
          </div>
        </div>

        <div style={{ padding: "24px 28px", flexGrow: 1 }}>
          {action.description && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Action description</div>
              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{action.description}</p>
            </div>
          )}

          {action.explanation && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Explanation</div>
              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{action.explanation}</p>
            </div>
          )}

          {action.scores && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>Score breakdown</div>
              <ScoreBar label="Impact" value={action.scores.impact} />
              <ScoreBar label="Alignment" value={action.scores.alignment} />
              <ScoreBar label="Feasibility" value={action.scores.feasibility} />
            </div>
          )}

          {action.cobenefits && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Co-benefits</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {action.cobenefits.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <span style={{ color: "#16A34A", fontWeight: "700" }}>✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {action.barriers && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Implementation barriers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {action.barriers.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <span style={{ color: "#F59E0B", fontWeight: "700" }}>⚠</span> {b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button style={{ width: "100%", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Add to action plan →
          </button>
        </div>
      </div>
    </>
  );
}

export function Results() {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {selectedAction && <DetailPanel action={selectedAction} onClose={() => setSelectedAction(null)} />}

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
                  {action.description ? action.description.slice(0, 90) + "…" : "Click to view details about this action."}
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
                    <span style={{ color: "#9CA3AF" }}>Implementation time</span><span style={{ color: "#6B7280" }}>{action.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAction(action)}
                  style={{ width: "100%", background: "none", border: "1px solid #EBEBEB", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#001EA7", cursor: "pointer", fontWeight: "500" }}
                >
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
                          <div style={{ background: "#001EA7", width: `${(action.reduction as number) * 100}%`, height: "6px", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <button
                        onClick={() => setSelectedAction(action)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "500" }}
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
