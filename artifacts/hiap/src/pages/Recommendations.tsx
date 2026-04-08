import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import type { PipelineResult, RankedAction } from "@/lib/scoringPipeline";

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { bg: "#FFEAEE", color: "#F23D33", label: "HIGH" },
  medium: { bg: "#FEF8E1", color: "#F9A200", label: "MEDIUM" },
  low:    { bg: "#EFFDE5", color: "#24BE00", label: "LOW" },
};

const TIMELINE_LABEL: Record<string, string> = {
  "<5 years":    "< 5 yrs",
  "5-10 years":  "5–10 yrs",
  ">10 years":   "> 10 yrs",
};

const COST_LABEL: Record<string, string> = {
  low:    "Low cost",
  medium: "Med cost",
  high:   "High cost",
};

function Badge({ priority }: { priority: "high" | "medium" | "low" }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: "10px", fontWeight: "800", letterSpacing: "0.06em",
      padding: "3px 8px", borderRadius: "5px",
      border: `1px solid ${c.color}22`,
    }}>
      {c.label}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: "11px", color: "#6B7280", background: "#F3F4F6",
      padding: "2px 8px", borderRadius: "4px", border: "1px solid #E5E7EB",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

// ─── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ action }: { action: RankedAction }) {
  const total = action.finalScore;
  const impW = 0.55, alnW = 0.22, feaW = 0.23;

  const impPx = (action.impactScore * impW) / (total || 1);
  const alnPx = (action.alignmentScore * alnW) / (total || 1);
  const feaPx = (action.feasibilityScore * feaW) / (total || 1);

  const segments = [
    { pct: impPx * 100, color: "#3B82F6", label: "Impact" },
    { pct: alnPx * 100, color: "#8B5CF6", label: "Alignment" },
    { pct: feaPx * 100, color: "#10B981", label: "Feasibility" },
  ];

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <div style={{ flex: 1, height: "8px", background: "#F3F4F6", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
          {segments.map(seg => (
            <div key={seg.label} style={{ width: `${seg.pct}%`, background: seg.color }} />
          ))}
        </div>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", width: "36px", textAlign: "right" }}>
          {(total * 100).toFixed(0)}
        </span>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: seg.color }} />
            <span style={{ fontSize: "10px", color: "#6B7280" }}>{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Expanded detail ───────────────────────────────────────────────────────────

function SubScore({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
        <span style={{ color: "#6B7280" }}>{label}</span>
        <span style={{ fontWeight: "600", color: "#374151" }}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: "#6366F1", borderRadius: "3px" }} />
      </div>
    </div>
  );
}

function ActionDetail({ action }: { action: RankedAction }) {
  return (
    <div style={{ padding: "14px 16px 16px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
      <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.6", marginBottom: "16px" }}>
        {action.description}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* Impact */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#3B82F6", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Impact</div>
          <SubScore label="Reduction share" value={Math.min(action.reductionShare, 1)} />
          <SubScore label="Timeline score" value={action.timelineScore} />
          <SubScore label="Impact score" value={Math.min(action.impactScore, 1)} />
        </div>

        {/* Alignment */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#8B5CF6", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Alignment</div>
          <SubScore label="Policy support" value={action.policyComponent} />
          <SubScore label="Sector match" value={action.sectorComponent} />
          <SubScore label="Alignment score" value={action.alignmentScore} />
        </div>

        {/* Feasibility */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#10B981", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Feasibility</div>
          <SubScore label="Soft legal fit" value={action.softLegalComponent} />
          <SubScore label="Socioeconomic fit" value={action.socioeconomicComponent} />
          <SubScore label="Feasibility score" value={action.feasibilityScore} />
        </div>
      </div>

      {action.legalFlag && (
        <div style={{ marginTop: "12px", fontSize: "11px", color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", padding: "6px 10px" }}>
          ⚠ One or more mandatory legal requirements have no evidence — flagged for review
        </div>
      )}

      <div style={{ marginTop: "12px", fontSize: "11px", color: "#9CA3AF", lineHeight: "1.5", fontStyle: "italic" }}>
        {action.explanation}
      </div>

      {action.gpcRefs.length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {action.gpcRefs.map(ref => (
            <span key={ref} style={{ fontSize: "10px", color: "#6366F1", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "1px 6px", borderRadius: "4px" }}>
              GPC {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ action, expanded, onToggle }: {
  action: RankedAction;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;
  const cost = COST_LABEL[action.costInvestmentNeeded] ?? action.costInvestmentNeeded;

  return (
    <div style={{
      background: "white", borderRadius: "10px", border: "1px solid #E5E7EB",
      boxShadow: expanded ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
      overflow: "hidden", transition: "box-shadow 0.2s",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          padding: "14px 16px", cursor: "pointer",
          display: "flex", alignItems: "flex-start", gap: "12px",
        }}
      >
        {/* Rank */}
        <div style={{
          flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%",
          background: action.priority === "high" ? "#FFF1F2" : action.priority === "medium" ? "#FFFBEB" : "#F0FDF4",
          border: `1.5px solid ${action.priority === "high" ? "#F23D33" : action.priority === "medium" ? "#F9A200" : "#24BE00"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: "800",
          color: action.priority === "high" ? "#F23D33" : action.priority === "medium" ? "#F9A200" : "#24BE00",
        }}>
          {action.rank}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", lineHeight: "1.3" }}>
              {action.actionName}
            </span>
            <Badge priority={action.priority} />
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "2px" }}>
            <Pill>{action.actionSubcategory}</Pill>
            <Pill>{tl}</Pill>
            <Pill>{cost}</Pill>
          </div>
          <ScoreBar action={action} />
        </div>

        {/* Chevron */}
        <div style={{ flexShrink: 0, color: "#9CA3AF", fontSize: "14px", marginTop: "6px", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          ▾
        </div>
      </button>

      {expanded && <ActionDetail action={action} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function Recommendations({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find(c => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterSubcat, setFilterSubcat] = useState<string>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`hiap:${locode}:results`);
      if (!raw) {
        setError("No results found. Please complete the pre-flight check and generate recommendations.");
        return;
      }
      setResult(JSON.parse(raw) as PipelineResult);
    } catch {
      setError("Could not load results. Please try generating recommendations again.");
    }
  }, [locode]);

  if (error) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <div style={{ maxWidth: "760px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "#6B7280", marginBottom: "16px" }}>{error}</p>
          <button onClick={() => navigate(`/city/${citySlug}/preflight`)} style={{ padding: "10px 24px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            ← Back to pre-flight
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <div style={{ maxWidth: "760px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>Loading results…</p>
        </div>
      </div>
    );
  }

  const { ranked, discarded, totalCityEmissions } = result;

  // Filters
  const subcats = [...new Set(ranked.map(a => a.actionSubcategory).filter(Boolean))].sort();
  const filtered = ranked.filter(a => {
    if (filterPriority !== "all" && a.priority !== filterPriority) return false;
    if (filterSubcat !== "all" && a.actionSubcategory !== filterSubcat) return false;
    return true;
  });

  const highCount = ranked.filter(a => a.priority === "high").length;
  const medCount = ranked.filter(a => a.priority === "medium").length;
  const lowCount = ranked.filter(a => a.priority === "low").length;

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/preflight`)}
            style={{ background: "none", border: "none", color: "#6B7280", fontSize: "12px", cursor: "pointer", padding: "0", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            ← Pre-flight check
          </button>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 4px" }}>
            Action Recommendations — {cityName}
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            {ranked.length} actions ranked · {discarded.length} excluded (legal) · Total city emissions {(totalCityEmissions / 1_000_000).toFixed(2)} Mt CO₂e
          </p>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { label: `${highCount} High priority`, color: "#F23D33", bg: "#FFEAEE", key: "high" },
            { label: `${medCount} Medium priority`, color: "#F9A200", bg: "#FEF8E1", key: "medium" },
            { label: `${lowCount} Low priority`, color: "#24BE00", bg: "#EFFDE5", key: "low" },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setFilterPriority(filterPriority === p.key ? "all" : p.key)}
              style={{
                padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${p.color}44`,
                background: filterPriority === p.key ? p.bg : "white",
                color: p.color, fontSize: "12px", fontWeight: "700", cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}

          {/* Subcategory filter */}
          <select
            value={filterSubcat}
            onChange={e => setFilterSubcat(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E7EB",
              background: "white", fontSize: "12px", color: "#374151", cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            <option value="all">All types</option>
            {subcats.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Score legend */}
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid #E5E7EB", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#374151" }}>Score breakdown key:</span>
          {[
            { color: "#3B82F6", label: "Impact (55%)" },
            { color: "#8B5CF6", label: "Alignment (22%)" },
            { color: "#10B981", label: "Feasibility (23%)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: s.color }} />
              <span style={{ fontSize: "11px", color: "#6B7280" }}>{s.label}</span>
            </div>
          ))}
          <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "auto" }}>Score out of 100</span>
        </div>

        {/* Action cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", fontSize: "13px" }}>
              No actions match the selected filters.
            </div>
          )}
          {filtered.map(action => (
            <ActionCard
              key={action.actionId}
              action={action}
              expanded={expandedId === action.actionId}
              onToggle={() => setExpandedId(expandedId === action.actionId ? null : action.actionId)}
            />
          ))}
        </div>

        {/* Discarded section */}
        {discarded.length > 0 && (
          <details style={{ marginTop: "32px" }}>
            <summary style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", cursor: "pointer", padding: "8px 0" }}>
              {discarded.length} actions excluded (failed mandatory legal requirements)
            </summary>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {discarded.map(d => (
                <div key={d.actionId} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{d.actionName}</span>
                  <span style={{ fontSize: "11px", color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: "4px" }}>
                    {d.reason.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
