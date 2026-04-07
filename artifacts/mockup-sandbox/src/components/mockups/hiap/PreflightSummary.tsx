import { Navbar } from "./_shared/Navbar";

const SECTIONS = [
  { name: "Emissions Data", status: "COMPLETE", detail: "3/5 sectors confirmed" },
  { name: "Socioeconomic Context", status: "PARTIAL", detail: "Not entered — may lower confidence", detailAmber: true },
  { name: "Regulations & Laws", status: "NOT ENTERED", detail: "Not entered" },
  { name: "Strategic Preferences", status: "COMPLETE", detail: "Transport, Residential, Waste" },
  { name: "Policy Alignment", status: "OPTIONAL", detail: "Optional — skipped" },
];

const SEGMENT_COLORS = ["#16A34A", "#F59E0B", "#F59E0B", "#16A34A", "#9CA3AF", "#BFBFBF"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    COMPLETE: { bg: "#D1FAE5", text: "#065F46" },
    PARTIAL: { bg: "#FEF3C7", text: "#92400E" },
    "NOT ENTERED": { bg: "#F5F5F5", text: "#6B7280" },
    OPTIONAL: { bg: "#EDE9FE", text: "#6D28D9" },
  };
  const c = map[status] ?? map["NOT ENTERED"];
  return (
    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "500" }}>
      {status}
    </span>
  );
}

export function PreflightSummary() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* White header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>
            Santiago / City Profile / Pre-flight Summary
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
            Pre-flight Summary
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>
            Review data completeness before generating action recommendations for Santiago.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 48px" }}>
        {/* Progress bar strip */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
          {SEGMENT_COLORS.map((color, i) => (
            <div key={i} style={{ flex: "1", height: "5px", borderRadius: "3px", background: color }} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {/* Data completeness */}
          <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
              Data completeness
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {SECTIONS.map((s, i) => (
                <div key={i}>
                  <div style={{ paddingTop: i === 0 ? "0" : "14px", paddingBottom: "14px", borderBottom: i < SECTIONS.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{s.name}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div style={{ fontSize: "12px", color: s.detailAmber ? "#C05621" : "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      {s.detailAmber && <span>⚠️</span>}
                      {s.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Model confidence */}
            <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Model confidence
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>
                <span>Low</span><span>Moderate</span><span>High</span>
              </div>
              <div style={{ background: "#E5E7EB", borderRadius: "4px", height: "8px", marginBottom: "14px" }}>
                <div style={{ background: "#F59E0B", width: "62%", height: "8px", borderRadius: "4px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "32px", fontWeight: "700", color: "#F59E0B" }}>62%</span>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>Moderate — sufficient to generate a rankable list of actions.</span>
              </div>
              <div style={{ background: "#FFFBEB", borderRadius: "8px", padding: "10px 14px", marginTop: "12px", fontSize: "12px", color: "#92400E", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠️</span>
                <span>Adding socioeconomic data would raise confidence to ~85%</span>
              </div>
            </div>

            {/* Pilot data availability */}
            <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "14px" }}>
                Pilot data availability
              </div>
              {[
                { label: "Impact", dots: [true, true, false], rating: "Good", color: "#16A34A" },
                { label: "Alignment", dots: [true, true, false], rating: "Good", color: "#16A34A" },
                { label: "Feasibility", dots: [true, false, false], rating: "Fair", color: "#F59E0B" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280", width: "80px" }}>{row.label}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {row.dots.map((filled, j) => (
                      <div key={j} style={{ width: "22px", height: "8px", borderRadius: "4px", background: filled ? "#16A34A" : "#E5E7EB" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: row.color, fontWeight: "500" }}>{row.rating}</span>
                </div>
              ))}
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
                345 actions · 1–2 min · 3 scenarios
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button style={{
          width: "100%",
          background: "#16A34A",
          color: "white",
          border: "none",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          letterSpacing: "0.03em",
          boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
        }}>
          ⚡ GENERATE RECOMMENDATIONS — CONFIRM YOU'RE READY
        </button>
      </div>
    </div>
  );
}
