import { Navbar } from "./_shared/Navbar";
import { StepBar } from "./_shared/StepBar";
import { Breadcrumb } from "./_shared/Breadcrumb";
import { useState } from "react";

const BLOCKED_ACTIONS = [
  {
    id: "ACT-042",
    name: "Ban on new coal-fired power plants",
    signal: "CL-ENV-001",
    desc: "Environmental regulation requiring phased elimination of coal",
    strength: "mandatory",
    status: "not_aligned",
    required: "Phase out by 2025",
    actual: "No phase-out plan submitted",
  },
  {
    id: "ACT-087",
    name: "Industrial waste heat recovery mandate",
    signal: "CL-IND-014",
    desc: "Industrial efficiency standards for large facilities",
    strength: "required",
    status: "not_aligned",
    required: "ISO 50001 certified",
    actual: "No certification",
  },
];

const ALIGNED_ACTIONS = [
  {
    id: "ACT-001",
    name: "Renewable energy feed-in tariff",
    signal: "CL-EN-003",
    desc: "National renewable energy promotion law",
    strength: "required",
    status: "aligns",
    required: "NCRE compliant",
    actual: "NCRE compliant",
  },
  {
    id: "ACT-002",
    name: "Municipal EV fleet transition",
    signal: "CL-TRANS-007",
    desc: "National electromobility strategy",
    strength: "recommended",
    status: "aligns",
    required: "30% EV by 2030",
    actual: "Plan submitted 2023",
  },
];

const MISSING_EVIDENCE = [
  {
    id: "ACT-019",
    name: "Green building certification scheme",
    signal: "CL-BUILD-002",
    desc: "Building energy efficiency standard",
    strength: "mandatory",
    status: "no_evidence",
    required: "Class A certification",
    actual: "Not documented",
  },
];

function StrengthPill({ strength }: { strength: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    mandatory: { bg: "#FEE2E2", text: "#991B1B" },
    required: { bg: "#FFEDD5", text: "#9A3412" },
    recommended: { bg: "#FEF9C3", text: "#854D0E" },
    optional: { bg: "#F3F4F6", text: "#6B7280" },
    informational: { bg: "#EFF6FF", text: "#1E40AF" },
  };
  const c = map[strength] ?? map.optional;
  return (
    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "500" }}>
      {strength}
    </span>
  );
}

function AlignmentBadge({ status }: { status: string }) {
  if (status === "not_aligned") return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#FEE2E2", color: "#DC2626", fontWeight: "500" }}>Blocked</span>;
  if (status === "aligns") return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#DCFCE7", color: "#16A34A", fontWeight: "500" }}>Aligned</span>;
  return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#F3F4F6", color: "#6B7280", fontWeight: "500" }}>No evidence</span>;
}

type Action = { id: string; name: string; signal: string; desc: string; strength: string; status: string; required: string; actual: string };

function SignalCard({ action }: { action: Action }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid #E5E7EB",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div style={{ flex: "1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "#EFF6FF", color: "#1E40AF", fontWeight: "500" }}>
              National · Chile
            </span>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{action.id}</span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{action.name}</div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{action.desc}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AlignmentBadge status={action.status} />
          <span style={{ color: "#9CA3AF", fontSize: "14px" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "0.5px solid #E5E7EB", padding: "12px 16px", background: "#F9FAFB" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "12px" }}>
            <div>
              <div style={{ color: "#9CA3AF", marginBottom: "2px" }}>Signal code</div>
              <div style={{ color: "#111827", fontWeight: "500" }}>{action.signal}</div>
            </div>
            <div>
              <div style={{ color: "#9CA3AF", marginBottom: "2px" }}>Required value</div>
              <div style={{ color: "#111827" }}>{action.required}</div>
            </div>
            <div>
              <div style={{ color: "#9CA3AF", marginBottom: "2px" }}>Actual value</div>
              <div style={{ color: "#111827" }}>{action.actual}</div>
            </div>
          </div>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Strength:</span>
            <StrengthPill strength={action.strength} />
          </div>
        </div>
      )}
    </div>
  );
}

export function Regulations() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />
      <StepBar activeStep={2} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 40px" }}>
        <Breadcrumb items={["Santiago", "City Profile", "Regulations & Laws"]} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "8px 0 16px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#111827", margin: "0 0 4px" }}>
              Regulations & laws
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>
              Review legal signals for Chile that affect what your city can implement. These determine which actions are removed before ranking begins.
            </p>
          </div>
          <span style={{ fontSize: "11px", background: "#FEF9C3", color: "#854D0E", padding: "2px 8px", borderRadius: "4px", alignSelf: "center" }}>MEDIUM</span>
        </div>

        {/* Data source bar */}
        <div style={{ background: "#EFF6FF", border: "0.5px solid #BFDBFE", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "12px", color: "#1E3A8A" }}>
          ⚖️ Legal signals sourced from legal-api · National Chile scope
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "Fully aligned", value: "298", bg: "#DCFCE7", text: "#15803D" },
            { label: "Partially aligned", value: "34", bg: "#FEF9C3", text: "#854D0E" },
            { label: "Blocked by hard filter", value: "2", bg: "#FEE2E2", text: "#DC2626" },
            { label: "No legal requirements", value: "11", bg: "#F3F4F6", text: "#6B7280" },
          ].map((card) => (
            <div key={card.label} style={{ background: "white", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "22px", fontWeight: "600", color: "#111827" }}>{card.value}</div>
              <div style={{ fontSize: "11px", marginTop: "4px" }}>
                <span style={{ background: card.bg, color: card.text, padding: "1px 6px", borderRadius: "4px", fontWeight: "500" }}>
                  {card.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Hard filter alert */}
        <div style={{ background: "#FEE2E2", border: "0.5px solid #FCA5A5", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", fontSize: "13px", color: "#DC2626", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🚫</span>
          <span>2 actions have been automatically removed from ranking because they fail a mandatory or required legal requirement for Chile.</span>
        </div>

        {/* Blocked section */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#DC2626", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            🚫 Blocked actions <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: "12px", padding: "1px 8px", fontSize: "11px" }}>2</span>
          </div>
          {BLOCKED_ACTIONS.map((a) => <SignalCard key={a.id} action={a} />)}
        </div>

        {/* Fully aligned */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#16A34A", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            ✓ Fully aligned actions <span style={{ background: "#DCFCE7", color: "#15803D", borderRadius: "12px", padding: "1px 8px", fontSize: "11px" }}>298</span>
          </div>
          {ALIGNED_ACTIONS.map((a) => <SignalCard key={a.id} action={a} />)}
        </div>

        {/* Missing evidence */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            ○ Actions with missing evidence <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: "12px", padding: "1px 8px", fontSize: "11px" }}>19</span>
          </div>
          {MISSING_EVIDENCE.map((a) => <SignalCard key={a.id} action={a} />)}
        </div>

        {/* MEED+ impact bar */}
        <div style={{ background: "#FEF9C3", border: "0.5px solid #F59E0B", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", fontSize: "12px", color: "#854D0E" }}>
          ⚖️ Legal alignment removes ineligible actions before ranking — 2 actions blocked
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "0.5px solid #D1D5DB", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>
            ← Back
          </button>
          <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Save & continue to strategic preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
