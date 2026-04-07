import { Navbar } from "./_shared/Navbar";
import { StepBar } from "./_shared/StepBar";
import { Breadcrumb } from "./_shared/Breadcrumb";
import { useState } from "react";

const PLAN_CARDS = [
  {
    scope: "National",
    scopeColor: "#1E40AF",
    scopeBg: "#EFF6FF",
    planName: "Chile's NDC 2020–2030",
    signals: 12,
    score: 0.78,
    rating: "High",
    ratingColor: "#16A34A",
    signals_list: [
      { type: "Emissions target", desc: "45% emissions reduction by 2030 vs 2016 baseline", strength: "Strong" },
      { type: "Sector priority", desc: "Energy transition as key pillar of climate action", strength: "Strong" },
      { type: "Action alignment", desc: "Transport electrification supported by national strategy", strength: "Moderate" },
    ],
  },
  {
    scope: "Regional",
    scopeColor: "#6D28D9",
    scopeBg: "#F5F3FF",
    planName: "Tarapacá Regional Climate Strategy 2023",
    signals: 7,
    score: 0.52,
    rating: "Moderate",
    ratingColor: "#D97706",
    signals_list: [
      { type: "Sector priority", desc: "Mining sector decarbonization as regional priority", strength: "Moderate" },
      { type: "Funding signal", desc: "Regional FNDR funds available for clean energy projects", strength: "Weak" },
    ],
  },
  {
    scope: "Municipal",
    scopeColor: "#065F46",
    scopeBg: "#DCFCE7",
    planName: "Iquique Municipal Climate Action Plan (PACCC)",
    signals: 3,
    score: 0.28,
    rating: "Low",
    ratingColor: "#9CA3AF",
    signals_list: [
      { type: "Action alignment", desc: "Limited municipal policy framework for climate action", strength: "Weak" },
    ],
  },
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: "1", background: "#E5E7EB", borderRadius: "4px", height: "8px" }}>
        <div style={{ background: color, width: `${value * 100}%`, height: "8px", borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", color, fontWeight: "600" }}>{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function StrengthPill({ strength }: { strength: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Strong: { bg: "#DCFCE7", text: "#15803D" },
    Moderate: { bg: "#FEF9C3", text: "#854D0E" },
    Weak: { bg: "#F3F4F6", text: "#6B7280" },
  };
  const c = map[strength] ?? map.Weak;
  return (
    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "500" }}>
      {strength}
    </span>
  );
}

type PlanCard = typeof PLAN_CARDS[0];

function PlanCard({ plan }: { plan: PlanCard }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
      <div
        style={{ padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: "1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: plan.scopeBg, color: plan.scopeColor, fontWeight: "500" }}>
                {plan.scope}
              </span>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{plan.signals} signals</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>{plan.planName}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px" }}>Alignment score</div>
              <div style={{ width: "120px" }}>
                <ScoreBar value={plan.score} color={plan.ratingColor} />
              </div>
            </div>
            <span style={{ color: "#9CA3AF", fontSize: "14px" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "0.5px solid #E5E7EB", padding: "12px 16px", background: "#F9FAFB" }}>
          {plan.signals_list.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", paddingBottom: "10px", borderBottom: i < plan.signals_list.length - 1 ? "0.5px solid #E5E7EB" : "none" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "500", color: "#6B7280", marginBottom: "2px" }}>
                  <span style={{ background: "#EFF6FF", color: "#1E40AF", padding: "1px 6px", borderRadius: "4px" }}>{s.type}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#111827", lineHeight: "1.4" }}>{s.desc}</div>
              </div>
              <div style={{ marginLeft: "16px", flexShrink: "0" }}>
                <StrengthPill strength={s.strength} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PolicyAlignment() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />
      <StepBar activeStep={4} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 40px" }}>
        <Breadcrumb items={["Santiago", "City Profile", "Policy Alignment"]} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "8px 0 16px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#111827", margin: "0 0 4px" }}>
              Policy alignment
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>
              Review policy signals from national, regional, and municipal plans. These shape the alignment score.
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignSelf: "center" }}>
            <span style={{ fontSize: "11px", background: "#DCFCE7", color: "#166634", padding: "2px 8px", borderRadius: "4px" }}>LOW</span>
            <span style={{ fontSize: "11px", background: "#EFF6FF", color: "#1E40AF", padding: "2px 8px", borderRadius: "4px" }}>OPTIONAL</span>
          </div>
        </div>

        {/* Data source */}
        <div style={{ background: "#EFF6FF", border: "0.5px solid #BFDBFE", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "12px", color: "#1E3A8A" }}>
          📋 Policy signals sourced from policy-signals-api · CL IQQ · Tarapacá region
        </div>

        {/* Score summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "National plan alignment", score: 0.78, color: "#16A34A" },
            { label: "Regional plan alignment", score: 0.52, color: "#D97706" },
            { label: "Municipal plan alignment", score: 0.28, color: "#9CA3AF" },
          ].map((card) => (
            <div key={card.label} style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "10px" }}>{card.label}</div>
              <ScoreBar value={card.score} color={card.color} />
            </div>
          ))}
        </div>

        {/* Plan cards */}
        {PLAN_CARDS.map((plan) => (
          <PlanCard key={plan.planName} plan={plan} />
        ))}

        {/* Municipal coverage note */}
        <div style={{ background: "#FEF9C3", border: "0.5px solid #F59E0B", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "12px", color: "#854D0E" }}>
          ⚠️ Limited PACCC data available for this city. Upload a PACCC or municipal climate strategy to improve alignment accuracy.
        </div>

        {/* PDF upload */}
        <button
          style={{
            width: "100%",
            background: "white",
            border: "1px dashed #BFDBFE",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "13px",
            color: "#2563EB",
            cursor: "pointer",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          📄 Upload Iquique PACCC or municipal climate strategy (PDF)
        </button>

        {/* MEED+ bar */}
        <div style={{ background: "#DCFCE7", border: "0.5px solid #86EFAC", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", fontSize: "12px", color: "#166634" }}>
          ✦ Policy signals shape the alignment pillar — weighted 30% of final score by default
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "0.5px solid #D1D5DB", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>
            ← Back
          </button>
          <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Continue to pre-flight check →
          </button>
        </div>
      </div>
    </div>
  );
}
