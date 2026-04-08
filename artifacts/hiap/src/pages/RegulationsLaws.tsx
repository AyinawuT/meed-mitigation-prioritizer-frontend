import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import actionsLegal from "@/data/actionsLegal.json";

type Tab = "review" | "adjust";
type AlignmentStatus = "aligns" | "not_aligned" | "no_evidence";
type Strength = "mandatory" | "required" | "recommended" | "optional" | "informational";
type OverallStatus = "all_aligns" | "partially_aligned" | "all_not_aligned" | "all_no_evidence" | "mixed";

interface Requirement {
  signal_code: string;
  signal_name: string;
  operator: string;
  required_value: string;
  legal_signal_value: string | null;
  strength: Strength;
  alignment_status: AlignmentStatus;
  location_scope: string | null;
  location_name: string | null;
  evidence_ids: string[];
  evidence_count: number;
}

interface ActionLegal {
  action_id: string;
  requirements: Requirement[];
}

const SIGNAL_META: Record<string, { description: string; source: string; articleRef: string; sourceUrl: string }> = {
  MUNI_WASTE_AUTHORITY:       { description: "Exclusive authority over waste collection and management", source: "Ley 18.695", articleRef: "Art. 3° d), 20°", sourceUrl: "https://bcn.cl/3d2sz" },
  MUNI_TRANSPORT_AUTHORITY:   { description: "Exclusive authority over public transport and traffic within the commune", source: "Ley 18.695", articleRef: "Art. 3° a)", sourceUrl: "https://bcn.cl/3d2sz" },
  MUNI_PLANNING_AUTHORITY:    { description: "Full authority over urban planning and the communal regulatory plan", source: "Ley 18.695", articleRef: "Art. 3° c)", sourceUrl: "https://bcn.cl/3d2sz" },
  MUNI_ENV_STANDARDS:         { description: "May apply environmental protection standards (e.g. building efficiency)", source: "Ley 18.695", articleRef: "Art. 4° c), 19° d)", sourceUrl: "https://bcn.cl/3d2sz" },
  PLANS_ALIGNMENT:            { description: "Municipal actions must comply with national and regional plans", source: "Ley 18.695", articleRef: "Art. 7°", sourceUrl: "https://bcn.cl/3d2sz" },
  PROCUREMENT_PUBLIC_BIDDING: { description: "Municipalities may contract private entities via public bidding", source: "Ley 18.695", articleRef: "Art. 6°", sourceUrl: "https://bcn.cl/3d2sz" },
  SUBSIDY_CAP_7PCT:           { description: "Subsidies to non-profits capped at 7% of the municipal budget", source: "Ley 18.695", articleRef: "Art. 5° g)", sourceUrl: "https://bcn.cl/3d2sz" },
};

const VALUE_DISPLAY: Record<string, string> = {
  exclusive_authority: "Exclusive authority",
  apply_standards:     "May apply standards",
  planning_authority:  "Full planning authority",
  comply:              "Must comply",
  public_bidding:      "Via public bidding",
  direct_award:        "Direct award",
  restricted:          "Restricted",
  shared_authority:    "Shared authority",
  "0.07":              "7% cap",
  "0.12":              "12% cap (exceeds)",
  "0.05":              "5% (within cap)",
};

const STRENGTH_STYLES: Record<Strength, { bg: string; color: string }> = {
  mandatory:     { bg: "#FEE2E2", color: "#DC2626" },
  required:      { bg: "#FFF3E0", color: "#C05621" },
  recommended:   { bg: "#FEF9C3", color: "#A16207" },
  optional:      { bg: "#F0FDF4", color: "#16A34A" },
  informational: { bg: "#F3F4F6", color: "#6B7280" },
};

const ALIGNMENT_CONFIG: Record<AlignmentStatus, { bg: string; color: string; border: string; label: string; icon: string }> = {
  aligns:      { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Aligns",      icon: "✓" },
  not_aligned: { bg: "#FFF3E0", color: "#C05621", border: "#FED7AA", label: "Not aligned", icon: "✗" },
  no_evidence: { bg: "#F3F4F6", color: "#9CA3AF", border: "#E5E7EB", label: "No evidence", icon: "?" },
};

function getOverallStatus(reqs: Requirement[]): OverallStatus {
  const statuses = reqs.map((r) => r.alignment_status);
  const allAlign = statuses.every((s) => s === "aligns");
  const allNotAligned = statuses.every((s) => s === "not_aligned");
  const allNoEvidence = statuses.every((s) => s === "no_evidence");
  if (allAlign) return "all_aligns";
  if (allNotAligned) return "all_not_aligned";
  if (allNoEvidence) return "all_no_evidence";
  return "partially_aligned";
}

const OVERALL_CONFIG: Record<OverallStatus, { bg: string; color: string; border: string; label: string; icon: string }> = {
  all_aligns:       { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Legally clear",    icon: "✓" },
  partially_aligned:{ bg: "#FFF3E0", color: "#C05621", border: "#FED7AA", label: "Partial alignment", icon: "~" },
  all_not_aligned:  { bg: "#FEE2E2", color: "#DC2626", border: "#FCA5A5", label: "Not aligned",       icon: "✗" },
  all_no_evidence:  { bg: "#F3F4F6", color: "#9CA3AF", border: "#E5E7EB", label: "No evidence",       icon: "?" },
  mixed:            { bg: "#FFF3E0", color: "#C05621", border: "#FED7AA", label: "Mixed",              icon: "~" },
};

const OPERATOR_DISPLAY: Record<string, string> = {
  equals:                "=",
  less_than_or_equal:    "≤",
  greater_than_or_equal: "≥",
};

interface RegulationsLawsProps {
  params: { locode: string };
}

export function RegulationsLaws({ params }: RegulationsLawsProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("review");
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>City not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>
            ← Back to cities
          </button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");
  const actions = actionsLegal.legal_requirements as ActionLegal[];

  const totalReqs = actions.reduce((s, a) => s + a.requirements.length, 0);
  const totalAligns = actions.reduce((s, a) => s + a.requirements.filter((r) => r.alignment_status === "aligns").length, 0);
  const totalNotAligned = actions.reduce((s, a) => s + a.requirements.filter((r) => r.alignment_status === "not_aligned").length, 0);
  const totalNoEvidence = actions.reduce((s, a) => s + a.requirements.filter((r) => r.alignment_status === "no_evidence").length, 0);

  const clearCount = actions.filter((a) => getOverallStatus(a.requirements) === "all_aligns").length;
  const blockedCount = actions.filter((a) => getOverallStatus(a.requirements) === "all_not_aligned").length;
  const partialCount = actions.length - clearCount - blockedCount;

  const GROUPS: { status: OverallStatus; label: string; actions: ActionLegal[] }[] = [
    { status: "all_aligns",        label: "Legally clear",     actions: actions.filter((a) => getOverallStatus(a.requirements) === "all_aligns") },
    { status: "partially_aligned", label: "Partial alignment", actions: actions.filter((a) => getOverallStatus(a.requirements) === "partially_aligned" || getOverallStatus(a.requirements) === "mixed") },
    { status: "all_not_aligned",   label: "Not aligned",       actions: actions.filter((a) => getOverallStatus(a.requirements) === "all_not_aligned") },
    { status: "all_no_evidence",   label: "No evidence",       actions: actions.filter((a) => getOverallStatus(a.requirements) === "all_no_evidence") },
  ].filter((g) => g.actions.length > 0);

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={2} />

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Regulations & Laws</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "40px" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
                Regulations & Laws
              </h1>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", background: "#F0FDF4", color: "#16A34A", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                  {actions.length} actions assessed
                </span>
                <span style={{ fontSize: "11px", background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
                  {totalReqs} legal checks
                </span>
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>
                  MEED+ LEGAL: Determines which actions are legally permitted for {city.name}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {(["review", "adjust"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpandedAction(null); }}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === tab ? "#001EA7" : "white",
                    color: activeTab === tab ? "white" : "#9CA3AF",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    outline: activeTab === tab ? "none" : "1px solid #DDDDE1",
                    transition: "background 0.15s",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 40px" }}>

        {/* KPI bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "14px",
        }}>
          {[
            { label: "Actions assessed",   value: actions.length,   bg: "white",   color: "#111827" },
            { label: "Legally clear",       value: clearCount,       bg: "#F0FDF4", color: "#16A34A" },
            { label: "Partial / flagged",   value: partialCount,     bg: "#FFF3E0", color: "#C05621" },
            { label: "Blocked",             value: blockedCount,     bg: "#FEF2F2", color: "#DC2626" },
          ].map((k) => (
            <div key={k.label} style={{
              background: k.bg,
              border: "1px solid #EBEBEB",
              borderRadius: "10px",
              padding: "14px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Check summary bar */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          padding: "14px 24px",
          marginBottom: "14px",
          display: "flex",
          gap: "32px",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Legal checks</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{totalReqs} total</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Aligns</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#16A34A" }}>{totalAligns}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Not aligned</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#C05621" }}>{totalNotAligned}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>No evidence</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#9CA3AF" }}>{totalNoEvidence}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Source:</div>
            <a href="https://bcn.cl/3d2sz" target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#001EA7", fontWeight: "500", textDecoration: "none" }}>
              Ley 18.695 (LOCM) ↗
            </a>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>· National · March 2026</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", padding: "14px 24px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Legal check breakdown — {totalReqs} checks across {actions.length} actions
          </div>
          <div style={{ display: "flex", borderRadius: "6px", overflow: "hidden", height: "12px", gap: "2px" }}>
            {totalAligns > 0 && (
              <div title={`${totalAligns} aligns`} style={{ flex: totalAligns, background: "#16A34A", transition: "flex 0.3s" }} />
            )}
            {totalNotAligned > 0 && (
              <div title={`${totalNotAligned} not aligned`} style={{ flex: totalNotAligned, background: "#F97316", transition: "flex 0.3s" }} />
            )}
            {totalNoEvidence > 0 && (
              <div title={`${totalNoEvidence} no evidence`} style={{ flex: totalNoEvidence, background: "#E5E7EB", transition: "flex 0.3s" }} />
            )}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
            {[
              { label: "Aligns",      count: totalAligns,     color: "#16A34A" },
              { label: "Not aligned", count: totalNotAligned, color: "#F97316" },
              { label: "No evidence", count: totalNoEvidence, color: "#9CA3AF" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#6B7280" }}>{l.label}</span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#374151" }}>{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action groups */}
        {GROUPS.map((group) => {
          const cfg = OVERALL_CONFIG[group.status];
          return (
            <div key={group.status} style={{
              background: "white",
              border: "1px solid #EBEBEB",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {/* Group header */}
              <div style={{
                padding: "10px 20px",
                background: "#FAFAFA",
                borderBottom: "1px solid #F0F0F0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: cfg.color, background: cfg.bg, padding: "2px 10px", borderRadius: "4px", border: `1px solid ${cfg.border}` }}>
                  {cfg.icon} {cfg.label}
                </span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {group.actions.length} {group.actions.length === 1 ? "action" : "actions"}
                </span>
              </div>

              {group.actions.map((action, idx) => {
                const isExpanded = expandedAction === action.action_id;
                const isLast = idx === group.actions.length - 1;
                const overall = getOverallStatus(action.requirements);
                const overallCfg = OVERALL_CONFIG[overall];
                const mandatoryFails = action.requirements.filter(
                  (r) => r.alignment_status !== "aligns" && (r.strength === "mandatory" || r.strength === "required")
                );

                return (
                  <div key={action.action_id}>
                    {/* Action row */}
                    <div
                      style={{
                        padding: "14px 20px",
                        display: "grid",
                        gridTemplateColumns: "180px 1fr auto auto",
                        gap: "16px",
                        alignItems: "center",
                        borderBottom: (!isLast || isExpanded) ? "1px solid #F5F5F5" : "none",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onClick={() => setExpandedAction(isExpanded ? null : action.action_id)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Action ID */}
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", fontWeight: "600", color: "#001EA7" }}>
                        {action.action_id}
                      </div>

                      {/* Requirement chips */}
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {action.requirements.map((req) => {
                          const ac = ALIGNMENT_CONFIG[req.alignment_status];
                          const sc = STRENGTH_STYLES[req.strength];
                          return (
                            <div key={req.signal_code} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              background: ac.bg,
                              border: `1px solid ${ac.border}`,
                              borderRadius: "4px",
                              padding: "2px 6px",
                              fontSize: "10px",
                            }}>
                              <span style={{ color: sc.color, fontWeight: "700", fontSize: "8px", background: sc.bg, padding: "0 3px", borderRadius: "2px", textTransform: "uppercase" }}>
                                {req.strength.slice(0, 3)}
                              </span>
                              <span style={{ color: "#374151", fontWeight: "500" }}>{req.signal_name.split(" ").slice(-1)[0]}</span>
                              <span style={{ color: ac.color, fontWeight: "700" }}>{ac.icon}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mandatory fail warning */}
                      <div style={{ minWidth: "120px", textAlign: "right" }}>
                        {mandatoryFails.length > 0 && (
                          <span style={{ fontSize: "11px", background: "#FEE2E2", color: "#DC2626", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                            {mandatoryFails.length} mandatory {mandatoryFails.length === 1 ? "issue" : "issues"}
                          </span>
                        )}
                      </div>

                      {/* Overall badge + expand */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", background: overallCfg.bg, color: overallCfg.color, border: `1px solid ${overallCfg.border}`, padding: "2px 8px", borderRadius: "4px", fontWeight: "600", whiteSpace: "nowrap" }}>
                          {overallCfg.icon} {overallCfg.label}
                        </span>
                        <span style={{ fontSize: "14px", color: "#9CA3AF", transition: "transform 0.15s", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "none" }}>
                          ›
                        </span>
                      </div>
                    </div>

                    {/* Expanded requirement detail */}
                    {isExpanded && (
                      <div style={{
                        background: "#F8FAFF",
                        borderBottom: isLast ? "none" : "1px solid #E5E7EB",
                        borderTop: "1px solid #E5E7EB",
                        padding: "16px 20px 16px 36px",
                      }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                          Legal requirements checked
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {action.requirements.map((req) => {
                            const ac = ALIGNMENT_CONFIG[req.alignment_status];
                            const sc = STRENGTH_STYLES[req.strength];
                            const meta = SIGNAL_META[req.signal_code];
                            return (
                              <div key={req.signal_code} style={{
                                display: "grid",
                                gridTemplateColumns: "220px 1fr 110px",
                                gap: "12px",
                                alignItems: "start",
                                padding: "10px 14px",
                                background: "white",
                                borderRadius: "8px",
                                border: `1px solid ${ac.border}`,
                              }}>
                                {/* Signal info */}
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>{req.signal_name}</div>
                                  {meta && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{meta.description}</div>}
                                  {meta && (
                                    <a href={meta.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#6B7280", textDecoration: "none" }}>
                                      {meta.source} · {meta.articleRef} ↗
                                    </a>
                                  )}
                                </div>

                                {/* Check detail */}
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Requires</div>
                                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", background: "#F3F4F6", padding: "2px 6px", borderRadius: "4px" }}>
                                    {OPERATOR_DISPLAY[req.operator] ?? req.operator} {VALUE_DISPLAY[req.required_value] ?? req.required_value}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Found</div>
                                  <div style={{ fontSize: "12px", fontWeight: "600", color: ac.color, background: ac.bg, padding: "2px 6px", borderRadius: "4px", border: `1px solid ${ac.border}` }}>
                                    {req.legal_signal_value !== null
                                      ? (VALUE_DISPLAY[req.legal_signal_value] ?? req.legal_signal_value)
                                      : "—"}
                                  </div>
                                  {req.evidence_count > 0 && (
                                    <span style={{ fontSize: "11px", color: "#6B7280" }}>· {req.evidence_count} {req.evidence_count === 1 ? "ref" : "refs"}</span>
                                  )}
                                </div>

                                {/* Strength + status */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                                  <span style={{ fontSize: "10px", fontWeight: "700", color: sc.color, background: sc.bg, padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase" }}>
                                    {req.strength}
                                  </span>
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: ac.color }}>
                                    {ac.icon} {ac.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {activeTab === "adjust" && (
          <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", padding: "14px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <button style={{ fontSize: "12px", color: "#001EA7", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
              + Add local regulation override
            </button>
          </div>
        )}

        {/* Info note */}
        <div style={{
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#0369A1",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "14px", flexShrink: 0 }}>ℹ</span>
          <span>
            <strong>How MEED+ HIAP uses this data:</strong> Each action is checked against the legal signals
            applicable to {city.name}. Actions with mandatory or required mismatches receive a lower legal
            feasibility score or are flagged as blocked. Actions with no evidence are marked uncertain.
            Click any action to see the full requirement breakdown with sources from Ley 18.695.
          </span>
        </div>

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/socioeconomic`)}
            style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer", fontWeight: "500" }}
          >
            ← Socioeconomic Context
          </button>

          <button
            onClick={() => navigate(`/city/${citySlug}/strategic`)}
            style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(22,163,74,0.3)" }}
          >
            Strategic preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
