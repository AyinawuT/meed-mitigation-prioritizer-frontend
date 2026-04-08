import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";

type Tab = "review" | "adjust";
type SignalType = "authority" | "enablement" | "restriction" | "process" | "threshold";

interface Evidence {
  id: string;
  sourceName: string;
  sourceUrl: string;
  articleRef: string;
  summary: string;
}

interface LegalSignal {
  code: string;
  name: string;
  type: SignalType;
  actionAreas: string[];
  priority: "high" | "medium";
  description: string;
  value: string;
  valueDisplay: string;
  scope: string;
  evidence: Evidence[];
}

const EVIDENCE: Record<string, Evidence> = {
  ev_001: { id: "ev_001", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 3° letra d)", summary: "Municipalities have exclusive responsibility for cleanliness and upkeep of the commune." },
  ev_002: { id: "ev_002", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 20°", summary: "Municipal waste collection is an assigned internal function." },
  ev_003: { id: "ev_003", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 4° letra c)", summary: "Municipalities may carry out environmental protection functions directly or jointly with state bodies." },
  ev_004: { id: "ev_004", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 19° letra d)", summary: "Municipal works units must apply environmental protection standards." },
  ev_005: { id: "ev_005", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 3° letra a)", summary: "Municipalities have exclusive authority to apply public transport and traffic rules within the commune." },
  ev_006: { id: "ev_006", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 5° letra g)", summary: "Municipalities may grant subsidies to non-profit entities up to 7% of the municipal budget." },
  ev_007: { id: "ev_007", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 6°", summary: "Municipalities may contract private entities via public bidding to execute actions or manage assets." },
  ev_008: { id: "ev_008", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 7°", summary: "Municipal actions must comply with national and regional plans." },
  ev_009: { id: "ev_009", sourceName: "Ley 18.695", sourceUrl: "https://bcn.cl/3d2sz", articleRef: "Art. 3° letra c)", summary: "Municipalities are responsible for urban planning and the communal regulatory plan." },
};

const LEGAL_SIGNALS: LegalSignal[] = [
  {
    code: "MUNI_WASTE_AUTHORITY",
    name: "Waste management authority",
    type: "authority",
    actionAreas: ["Waste"],
    priority: "high",
    description: "Whether the municipality has exclusive or shared authority over waste collection and management",
    value: "exclusive_authority",
    valueDisplay: "Exclusive authority",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_001, EVIDENCE.ev_002],
  },
  {
    code: "MUNI_TRANSPORT_AUTHORITY",
    name: "Transport authority",
    type: "authority",
    actionAreas: ["Transport"],
    priority: "high",
    description: "Whether the municipality has authority over public transport and traffic within the commune",
    value: "exclusive_authority",
    valueDisplay: "Exclusive authority",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_005],
  },
  {
    code: "MUNI_PLANNING_AUTHORITY",
    name: "Urban planning authority",
    type: "authority",
    actionAreas: ["Land use", "Spatial planning"],
    priority: "high",
    description: "Whether the municipality has authority over urban planning and the communal regulatory plan",
    value: "planning_authority",
    valueDisplay: "Full planning authority",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_009],
  },
  {
    code: "MUNI_ENV_STANDARDS",
    name: "Environmental standards",
    type: "enablement",
    actionAreas: ["Environment", "Buildings"],
    priority: "high",
    description: "Whether the municipality may apply environmental protection standards (e.g. building efficiency)",
    value: "apply_standards",
    valueDisplay: "May apply standards",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_003, EVIDENCE.ev_004],
  },
  {
    code: "PLANS_ALIGNMENT",
    name: "Plans alignment requirement",
    type: "restriction",
    actionAreas: ["Governance"],
    priority: "high",
    description: "Municipal actions must comply with national and regional plans (cross-cutting)",
    value: "comply",
    valueDisplay: "Must comply with plans",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_008],
  },
  {
    code: "PROCUREMENT_PUBLIC_BIDDING",
    name: "Procurement via public bidding",
    type: "process",
    actionAreas: ["Procurement"],
    priority: "medium",
    description: "Whether municipalities may contract private entities via public bidding for works or services",
    value: "public_bidding",
    valueDisplay: "Via public bidding",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_007],
  },
  {
    code: "SUBSIDY_CAP_7PCT",
    name: "Subsidy cap (7%)",
    type: "threshold",
    actionAreas: ["Finance"],
    priority: "medium",
    description: "Maximum share of municipal budget that may be granted as subsidies to non-profit entities",
    value: "0.07",
    valueDisplay: "Up to 7% of budget",
    scope: "National · Chile",
    evidence: [EVIDENCE.ev_006],
  },
];

const TYPE_STYLES: Record<SignalType, { bg: string; color: string; label: string }> = {
  authority:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Authority" },
  enablement:  { bg: "#F0FDF4", color: "#16A34A", label: "Enablement" },
  restriction: { bg: "#FFF3E0", color: "#C05621", label: "Restriction" },
  process:     { bg: "#F5F3FF", color: "#7C3AED", label: "Process" },
  threshold:   { bg: "#FFF1F2", color: "#BE123C", label: "Threshold" },
};

interface RegulationsLawsProps {
  params: { locode: string };
}

export function RegulationsLaws({ params }: RegulationsLawsProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("review");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

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
  const signals = LEGAL_SIGNALS;
  const typeCounts = signals.reduce((acc, s) => { acc[s.type] = (acc[s.type] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const totalEvidence = signals.reduce((sum, s) => sum + s.evidence.length, 0);

  const GROUPS: { type: SignalType; label: string }[] = [
    { type: "authority",   label: "Authorities" },
    { type: "enablement",  label: "Enablements" },
    { type: "restriction", label: "Restrictions" },
    { type: "process",     label: "Processes" },
    { type: "threshold",   label: "Thresholds" },
  ];

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
                  {signals.length} signals identified
                </span>
                <span style={{ fontSize: "11px", background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
                  {totalEvidence} legal references
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
                  onClick={() => { setActiveTab(tab); setExpandedCode(null); }}
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

        {/* Summary bar */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          padding: "14px 24px",
          marginBottom: "14px",
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {[
            { label: "Scope", value: "National · Chile" },
            { label: "Primary Source", value: "Ley 18.695 (LOCM)" },
            { label: "Coverage", value: "100% national" },
            { label: "Last updated", value: "March 2026" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{s.value}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {(Object.entries(typeCounts) as [SignalType, number][]).map(([type, count]) => {
              const s = TYPE_STYLES[type];
              return (
                <span key={type} style={{ fontSize: "11px", background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                  {count} {TYPE_STYLES[type].label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Regulations table */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {GROUPS.map((group) => {
            const rows = signals.filter((s) => s.type === group.type);
            if (rows.length === 0) return null;
            return (
              <div key={group.type}>
                {/* Group header */}
                <div style={{
                  padding: "8px 20px",
                  background: "#FAFAFA",
                  borderBottom: "1px solid #F0F0F0",
                  borderTop: group.type !== "authority" ? "2px solid #F0F0F0" : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: TYPE_STYLES[group.type].color,
                    background: TYPE_STYLES[group.type].bg,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>
                    {TYPE_STYLES[group.type].label}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {rows.length === 1 ? "1 regulation" : `${rows.length} regulations`}
                  </span>
                </div>

                {rows.map((sig, idx) => {
                  const isExpanded = expandedCode === sig.code;
                  const isLast = idx === rows.length - 1;
                  return (
                    <div key={sig.code}>
                      {/* Main row */}
                      <div
                        style={{
                          padding: "14px 20px",
                          display: "grid",
                          gridTemplateColumns: "1fr 180px 180px 80px",
                          gap: "16px",
                          alignItems: "center",
                          borderBottom: (!isLast || isExpanded) ? "1px solid #F5F5F5" : "none",
                          cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onClick={() => setExpandedCode(isExpanded ? null : sig.code)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Name + description */}
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "2px" }}>
                            {sig.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            {sig.description}
                          </div>
                        </div>

                        {/* Action areas */}
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {sig.actionAreas.map((area) => (
                            <span key={area} style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>
                              {area}
                            </span>
                          ))}
                        </div>

                        {/* Value */}
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{sig.valueDisplay}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{sig.scope}</div>
                        </div>

                        {/* Evidence count + expand */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>
                            {sig.evidence.length} {sig.evidence.length === 1 ? "ref" : "refs"}
                          </span>
                          <span style={{ fontSize: "14px", color: "#9CA3AF", transition: "transform 0.15s", display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                            ›
                          </span>
                        </div>
                      </div>

                      {/* Expanded evidence panel */}
                      {isExpanded && (
                        <div style={{
                          background: "#F8FAFF",
                          borderBottom: isLast ? "none" : "1px solid #E5E7EB",
                          borderTop: "1px solid #E5E7EB",
                          padding: "12px 20px 16px 36px",
                        }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                            Legal evidence
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {sig.evidence.map((ev) => (
                              <div key={ev.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  color: "#1D4ED8",
                                  background: "#EFF6FF",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}>
                                  {ev.articleRef}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "12px", color: "#374151" }}>{ev.summary}</div>
                                  <a
                                    href={ev.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: "11px", color: "#6B7280", textDecoration: "none" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {ev.sourceName} ↗
                                  </a>
                                </div>
                              </div>
                            ))}
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
            <div style={{ padding: "12px 20px", borderTop: "2px solid #F0F0F0" }}>
              <button style={{ fontSize: "12px", color: "#001EA7", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
                + Add local regulation
              </button>
            </div>
          )}
        </div>

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
            <strong>How MEED+ HIAP uses this data:</strong> These legal signals determine which climate
            actions are legally permitted, required, or restricted for {city.name}. Regulations that
            align with an action mark it as legally feasible; restrictions or missing authorities
            reduce its score or flag it as blocked. Click any row to view the supporting legal references.
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
