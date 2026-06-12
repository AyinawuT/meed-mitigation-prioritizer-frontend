import { Navbar } from "./_shared/Navbar";

const ACTION = {
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
};

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

export function ResultsPanel() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh", position: "relative" }}>
      <Navbar />

      {/* Dimmed background */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }} />

      {/* Side panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "600", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}>
            ← GO BACK
          </button>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            {ACTION.sector}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.35" }}>
            {ACTION.title}
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>Expert's Choice</span>
            <span style={{ fontSize: "10px", background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>GPC {ACTION.gpc}</span>
            <span style={{ fontSize: "10px", background: "#F5F5F7", color: "#6B7280", padding: "2px 8px", borderRadius: "4px" }}>⏱ {ACTION.time}</span>
          </div>
        </div>

        <div style={{ padding: "24px 28px", flexGrow: 1 }}>
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Action description</div>
            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{ACTION.description}</p>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Explanation</div>
            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{ACTION.explanation}</p>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>Score breakdown</div>
            <ScoreBar label="Impact" value={ACTION.scores.impact} />
            <ScoreBar label="Alignment" value={ACTION.scores.alignment} />
            <ScoreBar label="Feasibility" value={ACTION.scores.feasibility} />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Co-benefits</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {ACTION.cobenefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                  <span style={{ color: "#16A34A", fontWeight: "700" }}>✓</span> {b}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Implementation barriers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {ACTION.barriers.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                  <span style={{ color: "#F59E0B", fontWeight: "700" }}>⚠</span> {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button style={{ width: "100%", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Add to action plan →
          </button>
        </div>
      </div>
    </div>
  );
}
