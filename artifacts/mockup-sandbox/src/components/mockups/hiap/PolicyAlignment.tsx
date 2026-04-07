import { Navbar } from "./_shared/Navbar";
import { StepBar } from "./_shared/StepBar";
import { useState } from "react";

const PLAN_CARDS = [
  {
    scope: "National", scopeColor: "#1E40AF", scopeBg: "#EFF6FF",
    planName: "Chile's NDC 2020–2030", signals: 12, score: 0.78, rating: "High", ratingColor: "#16A34A",
    signals_list: [
      { type: "Emissions target", desc: "45% emissions reduction by 2030 vs 2016 baseline", strength: "Strong" },
      { type: "Sector priority", desc: "Energy transition as key pillar of climate action", strength: "Strong" },
      { type: "Action alignment", desc: "Transport electrification supported by national strategy", strength: "Moderate" },
    ],
  },
  {
    scope: "Regional", scopeColor: "#6D28D9", scopeBg: "#F5F3FF",
    planName: "Tarapacá Regional Climate Strategy 2023", signals: 7, score: 0.52, rating: "Moderate", ratingColor: "#F59E0B",
    signals_list: [
      { type: "Sector priority", desc: "Mining sector decarbonization as regional priority", strength: "Moderate" },
      { type: "Funding signal", desc: "Regional FNDR funds available for clean energy projects", strength: "Weak" },
    ],
  },
  {
    scope: "Municipal", scopeColor: "#065F46", scopeBg: "#D1FAE5",
    planName: "Iquique Municipal Climate Action Plan (PACCC)", signals: 3, score: 0.28, rating: "Low", ratingColor: "#9CA3AF",
    signals_list: [
      { type: "Action alignment", desc: "Limited municipal policy framework for climate action", strength: "Weak" },
    ],
  },
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: "1", background: "#EBEBEB", borderRadius: "4px", height: "7px" }}>
        <div style={{ background: color, width: `${value * 100}%`, height: "7px", borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", color, fontWeight: "600" }}>{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function StrengthPill({ strength }: { strength: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Strong: { bg: "#D1FAE5", text: "#065F46" },
    Moderate: { bg: "#FEF3C7", text: "#92400E" },
    Weak: { bg: "#F5F5F5", text: "#6B7280" },
  };
  const c = map[strength] ?? map.Weak;
  return <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "500" }}>{strength}</span>;
}

type Plan = typeof PLAN_CARDS[0];

function PlanCard({ plan }: { plan: Plan }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => setExpanded((e) => !e)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: "1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: plan.scopeBg, color: plan.scopeColor, fontWeight: "500" }}>{plan.scope}</span>
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
            <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #F0F0F0", padding: "12px 16px", background: "#FAFAFA" }}>
          {plan.signals_list.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", paddingBottom: "10px", borderBottom: i < plan.signals_list.length - 1 ? "1px solid #EBEBEB" : "none" }}>
              <div>
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ background: "#EFF6FF", color: "#1E40AF", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{s.type}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#111827", lineHeight: "1.4" }}>{s.desc}</div>
              </div>
              <div style={{ marginLeft: "16px", flexShrink: 0 }}>
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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />
      <StepBar activeStep={4} />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>Santiago / City Profile / Policy Alignment</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>Policy alignment</h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>Review policy signals from national, regional, and municipal plans. These shape the alignment score.</p>
            </div>
            <div style={{ display: "flex", gap: "6px", alignSelf: "center" }}>
              <span style={{ fontSize: "11px", background: "#E8F5E9", color: "#2E7D32", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>LOW</span>
              <span style={{ fontSize: "11px", background: "#EDE9FE", color: "#6D28D9", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>OPTIONAL</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 48px" }}>
        {/* Data source */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "10px 16px", marginBottom: "14px", fontSize: "12px", color: "#1E40AF" }}>
          📋 Policy signals sourced from policy-signals-api · CL IQQ · Tarapacá region
        </div>

        {/* Score summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
          {[
            { label: "National plan alignment", score: 0.78, color: "#16A34A" },
            { label: "Regional plan alignment", score: 0.52, color: "#F59E0B" },
            { label: "Municipal plan alignment", score: 0.28, color: "#9CA3AF" },
          ].map((card) => (
            <div key={card.label} style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "10px" }}>{card.label}</div>
              <ScoreBar value={card.score} color={card.color} />
            </div>
          ))}
        </div>

        {/* Plan cards */}
        {PLAN_CARDS.map((plan) => <PlanCard key={plan.planName} plan={plan} />)}

        {/* Municipal coverage note */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px 16px", marginBottom: "14px", fontSize: "12px", color: "#92400E" }}>
          ⚠️ Limited PACCC data available for this city. Upload a PACCC or municipal climate strategy to improve alignment accuracy.
        </div>

        {/* PDF upload */}
        <button style={{ width: "100%", background: "white", border: "1.5px dashed #BFDBFE", borderRadius: "8px", padding: "14px", fontSize: "13px", color: "#2563EB", cursor: "pointer", marginBottom: "14px", textAlign: "center" }}>
          📄 Upload Iquique PACCC or municipal climate strategy (PDF)
        </button>

        {/* MEED+ bar */}
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", fontSize: "12px", color: "#15803D" }}>
          ✦ Policy signals shape the alignment pillar — weighted 30% of final score by default
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>← Back</button>
          <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Continue to pre-flight check →
          </button>
        </div>
      </div>
    </div>
  );
}
