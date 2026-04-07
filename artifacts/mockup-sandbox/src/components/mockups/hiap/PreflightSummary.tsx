import { Navbar } from "./_shared/Navbar";
import { Breadcrumb } from "./_shared/Breadcrumb";

const SECTIONS = [
  { name: "Emissions Data", status: "COMPLETE", detail: "3/5 sectors confirmed" },
  { name: "Socioeconomic Context", status: "PARTIAL", detail: "Not entered — may lower confidence", detailColor: "#D97706" },
  { name: "Regulations & Laws", status: "NOT ENTERED", detail: "Not entered" },
  { name: "Strategic Preferences", status: "COMPLETE", detail: "Transport, Residential, Waste" },
  { name: "Policy Alignment", status: "OPTIONAL", detail: "Optional — skipped" },
];

const STEP_COLORS = [
  "#16A34A",
  "#D97706",
  "#D97706",
  "#16A34A",
  "#9CA3AF",
  "#9CA3AF",
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    COMPLETE: { bg: "#DCFCE7", text: "#15803D" },
    PARTIAL: { bg: "#FEF9C3", text: "#854D0E" },
    "NOT ENTERED": { bg: "#F3F4F6", text: "#6B7280" },
    OPTIONAL: { bg: "#EFF6FF", text: "#1E40AF" },
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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 40px" }}>
        <Breadcrumb items={["Santiago", "City Profile", "Pre-flight Summary"]} />
        <h1 style={{ fontSize: "22px", fontWeight: "500", color: "#111827", margin: "8px 0 4px" }}>
          Pre-flight Summary
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px" }}>
          Review data completeness before generating action recommendations for Santiago.
        </p>

        {/* Progress bar strip */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
          {STEP_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                flex: "1",
                height: "6px",
                borderRadius: "4px",
                background: color,
              }}
            />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {/* Data completeness card */}
          <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: "500", color: "#111827", marginBottom: "16px" }}>
              Data completeness
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {SECTIONS.map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{s.name}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div style={{ fontSize: "12px", color: s.detailColor ?? "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
                    {s.detailColor && <span>⚠️</span>}
                    {s.detail}
                  </div>
                  {i < SECTIONS.length - 1 && (
                    <div style={{ height: "0.5px", background: "#F3F4F6", marginTop: "14px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Model confidence */}
            <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#111827", marginBottom: "12px" }}>
                Model confidence
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px" }}>
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
              <div style={{ background: "#E5E7EB", borderRadius: "4px", height: "8px", marginBottom: "12px" }}>
                <div style={{ background: "#D97706", width: "62%", height: "8px", borderRadius: "4px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "32px", fontWeight: "600", color: "#D97706" }}>62%</span>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>Moderate — sufficient to generate a rankable list of actions.</span>
              </div>
              <div
                style={{
                  background: "#FEF9C3",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#854D0E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⚠️</span>
                <span>Adding socioeconomic data would raise confidence to ~85%</span>
              </div>
            </div>

            {/* Pilot data availability */}
            <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#111827", marginBottom: "14px" }}>
                Pilot data availability
              </div>
              {[
                { label: "Impact", dots: [true, true, false], rating: "Good", color: "#16A34A" },
                { label: "Alignment", dots: [true, true, false], rating: "Good", color: "#16A34A" },
                { label: "Feasibility", dots: [true, false, false], rating: "Fair", color: "#D97706" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280", width: "80px" }}>{row.label}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {row.dots.map((filled, j) => (
                      <div
                        key={j}
                        style={{
                          width: "20px",
                          height: "8px",
                          borderRadius: "4px",
                          background: filled ? "#16A34A" : "#E5E7EB",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: row.color, fontWeight: "500" }}>{row.rating}</span>
                </div>
              ))}
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                345 actions · 1–2 min · 3 scenarios
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          style={{
            width: "100%",
            background: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "16px",
            fontSize: "15px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          ⚡ GENERATE RECOMMENDATIONS — CONFIRM YOU'RE READY
        </button>
      </div>
    </div>
  );
}
