import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import type { PipelineResult, RankedAction } from "@/lib/scoringPipeline";
import actionsRaw from "@/data/actions.json";
import { useLanguage } from "@/lib/i18n";

// ─── Co-benefits lookup ────────────────────────────────────────────────────────

type CoBenefitEntry = {
  impact_relationship: "positive" | "negative";
  impact_text: string;
};

const actionCoBenefitsMap: Record<string, string[]> = {};
const actionBarriersMap: Record<string, string[]> = {};

const rawActions = (actionsRaw as { actions: Record<string, { actionId: string; coBenefits?: Record<string, CoBenefitEntry> }> }).actions;
Object.values(rawActions).forEach((a) => {
  if (!a.coBenefits) return;
  const pos: string[] = [];
  const neg: string[] = [];
  Object.entries(a.coBenefits).forEach(([key, val]) => {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (val.impact_relationship === "positive") pos.push(label);
    else neg.push(label);
  });
  if (pos.length) actionCoBenefitsMap[a.actionId] = pos;
  if (neg.length) actionBarriersMap[a.actionId] = neg;
});

// ─── GPC sector mapping ─────────────────────────────────────────────────────

function gpcSectorName(gpcRefs: string[]): string {
  if (!gpcRefs.length) return "Cross-sector";
  const prefix = gpcRefs[0].split(".")[0];
  switch (prefix) {
    case "I":   return "Stationary Energy";
    case "II":  return "Transportation";
    case "III": return "Waste";
    case "IV":  return "IPPU";
    case "V":   return "AFOLU";
    default:    return "Cross-sector";
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIMELINE_LABEL: Record<string, string> = {
  "<5 years":   "Less than 5 years",
  "5-10 years": "5–10 years",
  ">10 years":  "More than 10 years",
};

function reductionLabel(priority: string) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function reductionColor(priority: string) {
  if (priority === "high") return "#16A34A";
  if (priority === "medium") return "#F59E0B";
  return "#9CA3AF";
}

function reductionSegments(priority: string) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

// ─── Reduction potential bar (segmented) ────────────────────────────────────

function ReductionBar({ priority }: { priority: string }) {
  const filled = reductionSegments(priority);
  const color = reductionColor(priority);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: "5px",
            flex: 1,
            borderRadius: "3px",
            background: i < filled ? color : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

// ─── Score bar (detail panel) ─────────────────────────────────────────────────

type PopoverItem = {
  label: string;
  rawValue: number;  // 0–1
  weight: number;    // 0–1 (sub-weight within this score)
  note?: string;
};

function ScoreBar({
  label,
  value,
  weight,
  barColor,
  description,
  popoverItems,
}: {
  label: string;
  value: number;
  weight: number;
  barColor: string;
  description: string;
  popoverItems?: PopoverItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pct = Math.min(value, 1) * 100;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ marginBottom: "14px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", width: "118px", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{label}</span>
          {popoverItems && (
            <button
              onClick={() => setOpen((v) => !v)}
              title="How this score is calculated"
              style={{
                background: open ? "#EEF2FF" : "none",
                border: `1px solid ${open ? "#C7D2FE" : "#E5E7EB"}`,
                borderRadius: "50%",
                width: "15px", height: "15px",
                cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: open ? "#4338CA" : "#9CA3AF",
                fontSize: "9px", fontWeight: "700", lineHeight: 1,
                flexShrink: 0, transition: "all 0.12s",
              }}
            >i</button>
          )}
        </div>
        <div style={{ flex: 1, background: "#EBEBEB", borderRadius: "4px", height: "7px" }}>
          <div style={{ background: barColor, width: `${pct}%`, height: "7px", borderRadius: "4px" }} />
        </div>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827", minWidth: "34px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {value.toFixed(2)}
        </span>
        <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: "44px", fontVariantNumeric: "tabular-nums" }}>
          × {weight.toFixed(2)}
        </span>
      </div>
      <div style={{ paddingLeft: "123px", marginTop: "4px", fontSize: "11px", color: "#6B7280", lineHeight: "1.55" }}>
        {description}
      </div>

      {open && popoverItems && (
        <div style={{
          position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 100,
          background: "white", border: "1px solid #E5E7EB", borderRadius: "12px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.13)", padding: "16px 18px",
          width: "340px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#111827", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            How {label} is calculated
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 40px 52px", gap: "0 4px", marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #F0F0F4" }}>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase" }}>Factor</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "right", textTransform: "uppercase" }}>Score</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "center", textTransform: "uppercase" }}>Wt.</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "right", textTransform: "uppercase" }}>Adds</span>
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {popoverItems.map((item) => {
              const contribution = item.rawValue * item.weight;
              return (
                <div key={item.label}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 40px 52px", gap: "0 4px", alignItems: "baseline" }}>
                    <span style={{ fontSize: "12px", color: "#374151" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{item.rawValue.toFixed(2)}</span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>×{(item.weight * 100).toFixed(0)}%</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: barColor, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{contribution.toFixed(2)}</span>
                  </div>
                  {item.note && (
                    <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "1px", gridColumn: "1 / -1" }}>{item.note}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1.5px solid #F0F0F4", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#111827", fontWeight: "700" }}>{label} =</span>
            <span style={{ fontSize: "15px", fontWeight: "800", color: barColor, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail panel (right drawer) ──────────────────────────────────────────────

function DetailPanel({
  action,
  onClose,
  weights,
}: {
  action: RankedAction;
  onClose: () => void;
  weights: { impact: number; alignment: number; feasibility: number };
}) {
  const cobenefits = actionCoBenefitsMap[action.actionId] ?? [];
  const barriers = actionBarriersMap[action.actionId] ?? [];
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;

  const timelineDesc =
    action.timelineScore === 1.0 ? "< 5 yr (1.0)"
    : action.timelineScore === 0.5 ? "5–10 yr (0.5)"
    : "> 10 yr (0.0)";

  const impactDesc =
    `Reduction share: ${(action.reductionShare * 100).toFixed(1)}% of city emissions` +
    ` · timeline: ${timelineDesc}`;

  const sectorMatchDesc = action.sectorComponent === 1.0 ? "yes" : "no";
  const alignmentDesc =
    `Policy support: ${action.policyComponent.toFixed(2)}` +
    ` · sector match: ${sectorMatchDesc}` +
    ` · strategic priorities: ${action.otherComponent.toFixed(2)}`;

  const feasibilityDesc =
    `Soft legal compliance: ${action.softLegalComponent.toFixed(2)}` +
    ` · socioeconomic context: ${action.socioeconomicComponent.toFixed(2)}`;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40, animation: "fadeIn 0.2s ease" }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
      }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "600", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}
          >
            ← GO BACK
          </button>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
            {gpcSectorName(action.gpcRefs)}
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>
            {action.actionCategory}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.35" }}>
            {action.actionName}
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {action.gpcRefs.map((ref) => (
              <span key={ref} style={{ fontSize: "10px", background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
                GPC {ref}
              </span>
            ))}
            <span style={{ fontSize: "10px", background: "#F5F5F7", color: "#6B7280", padding: "2px 8px", borderRadius: "4px" }}>
              ⏱ {tl}
            </span>
          </div>
        </div>

        <div style={{ padding: "24px 28px", flexGrow: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Action description</div>
            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{action.description}</p>
          </div>

          {action.explanation && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Why this ranking</div>
              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0, fontStyle: "italic" }}>{action.explanation}</p>
            </div>
          )}

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>Score breakdown</div>
            <ScoreBar
              label="Impact score"
              value={action.impactScore}
              weight={weights.impact}
              barColor="#3B82F6"
              description={impactDesc}
              popoverItems={[
                {
                  label: "Emission coverage",
                  rawValue: action.reductionShare,
                  weight: 0.8,
                  note: "Share of city's total emissions matched by this action",
                },
                {
                  label: "Timeline factor",
                  rawValue: action.timelineScore,
                  weight: 0.2,
                  note: action.timelineScore === 1.0 ? "Fast implementation (< 5 years)" : action.timelineScore === 0.5 ? "Medium implementation (5–10 years)" : "Long implementation (> 10 years)",
                },
              ]}
            />
            <ScoreBar
              label="Alignment score"
              value={action.alignmentScore}
              weight={weights.alignment}
              barColor="#8B5CF6"
              description={alignmentDesc}
              popoverItems={[
                {
                  label: "Policy support",
                  rawValue: action.policyComponent,
                  weight: 0.8,
                  note: "How well this action is backed by national and regional policy plans",
                },
                {
                  label: "Sector match",
                  rawValue: action.sectorComponent,
                  weight: 0.15,
                  note: action.sectorComponent === 1.0 ? "Matches your selected priority sectors" : "Does not match selected priority sectors",
                },
                {
                  label: "Strategic priorities",
                  rawValue: action.otherComponent,
                  weight: 0.05,
                  note: "Co-benefit overlap with your stated strategic priorities",
                },
              ]}
            />
            <ScoreBar
              label="Feasibility score"
              value={action.feasibilityScore}
              weight={weights.feasibility}
              barColor="#16A34A"
              description={feasibilityDesc}
              popoverItems={[
                {
                  label: "Soft legal compliance",
                  rawValue: action.softLegalComponent,
                  weight: 0.5,
                  note: "Alignment with recommended and optional legal requirements",
                },
                {
                  label: "Socioeconomic context",
                  rawValue: action.socioeconomicComponent,
                  weight: 0.5,
                  note: "How well city conditions support this action",
                },
              ]}
            />

            {/* Final score formula */}
            <div style={{
              marginTop: "6px",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "11px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{ fontSize: "12px", color: "#4B5563", fontVariantNumeric: "tabular-nums", lineHeight: "1.5" }}>
                Final score = ({action.impactScore.toFixed(2)}×{weights.impact.toFixed(2)}) + ({action.alignmentScore.toFixed(2)}×{weights.alignment.toFixed(2)}) + ({action.feasibilityScore.toFixed(2)}×{weights.feasibility.toFixed(2)})
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#16A34A", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {action.finalScore.toFixed(3)}
              </span>
            </div>
          </div>

          {cobenefits.length > 0 && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Co-benefits</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {cobenefits.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <span style={{ color: "#16A34A", fontWeight: "700" }}>✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {barriers.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Trade-offs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {barriers.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <span style={{ color: "#F59E0B", fontWeight: "700" }}>⚠</span> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {action.legalFlag && (
            <div style={{ fontSize: "12px", color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", padding: "8px 12px", marginBottom: "16px" }}>
              ⚠ One or more mandatory legal requirements have no evidence — flagged for review.
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button style={{
            width: "100%", background: "#001EA7", color: "white", border: "none",
            borderRadius: "8px", padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}>
            ✦ Generate Plan
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

// ─── Top Pick card ────────────────────────────────────────────────────────────

function TopPickCard({
  action,
  index,
  total,
  onDetail,
  onMoveUp,
  onMoveDown,
  onRemove,
  isUserPick,
}: {
  action: RankedAction;
  index: number;
  total: number;
  onDetail: (a: RankedAction) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  isUserPick: boolean;
}) {
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;
  const sector = gpcSectorName(action.gpcRefs);

  return (
    <div style={{
      background: "white", border: "1px solid #E5E7EB", borderRadius: "14px",
      padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      display: "flex", flexDirection: "column", position: "relative",
    }}>
      {/* Top row: TOP PICK badge + reorder controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", color: "#001EA7" }}>🔖</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.06em" }}>
            TOP PICK
          </span>
        </div>
        {isUserPick && (
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "5px", width: "24px", height: "24px", cursor: index === 0 ? "default" : "pointer", color: index === 0 ? "#D1D5DB" : "#6B7280", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "5px", width: "24px", height: "24px", cursor: index === total - 1 ? "default" : "pointer", color: index === total - 1 ? "#D1D5DB" : "#6B7280", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Move down"
            >
              ↓
            </button>
            <button
              onClick={onRemove}
              style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "5px", width: "24px", height: "24px", cursor: "pointer", color: "#9CA3AF", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Remove from picks"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: "1.35", marginBottom: "8px" }}>
        {action.actionName.length > 65 ? action.actionName.slice(0, 65) + "…" : action.actionName}
      </div>

      {/* Description */}
      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", marginBottom: "14px", flex: 1 }}>
        {action.description.length > 100 ? action.description.slice(0, 100) + "…" : action.description}
      </div>

      {/* Reduction bar */}
      <div style={{ marginBottom: "6px" }}>
        <ReductionBar priority={action.priority} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Reduction potential</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: reductionColor(action.priority) }}>
          {reductionLabel(action.priority)}
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #F0F0F4", marginBottom: "14px" }} />

      {/* Metadata rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Sector</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{sector}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Timeline</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{tl}</span>
        </div>
      </div>

      {/* See more details */}
      <button
        onClick={() => onDetail(action)}
        style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#001EA7", fontWeight: "600", textDecoration: "underline", textDecorationColor: "#BFDBFE", marginBottom: "12px" }}
      >
        See more details
      </button>

      {/* Generate Plan button */}
      <button style={{
        width: "100%", background: "white", border: "1.5px solid #E5E7EB",
        borderRadius: "8px", padding: "10px", fontSize: "12px", fontWeight: "700",
        color: "#001EA7", cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "6px", letterSpacing: "0.04em",
        textTransform: "uppercase", transition: "all 0.12s",
      }}
        onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#001EA7"; (e.currentTarget as HTMLElement).style.background = "#F5F7FF"; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.background = "white"; }}
      >
        <span>✦</span> Generate Plan
      </button>
    </div>
  );
}

// ─── Ranking table ─────────────────────────────────────────────────────────────

function RankingTable({
  actions,
  onSelect,
  pickedIds,
  onTogglePick,
  pickMode,
  onTogglePickMode,
}: {
  actions: RankedAction[];
  onSelect: (a: RankedAction) => void;
  pickedIds: string[];
  onTogglePick: (id: string) => void;
  pickMode: boolean;
  onTogglePickMode: () => void;
}) {
  const [showDownload, setShowDownload] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) {
        setShowDownload(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function exportCsv() {
    const header = ["Rank", "Action", "GPC Sector", "Reduction Potential", "Impact Score", "Alignment Score", "Feasibility Score", "Final Score"];
    const rows = actions.map(a => [
      a.rank,
      `"${a.actionName.replace(/"/g, '""')}"`,
      gpcSectorName(a.gpcRefs),
      reductionLabel(a.priority),
      (a.impactScore * 100).toFixed(0),
      (a.alignmentScore * 100).toFixed(0),
      (a.feasibilityScore * 100).toFixed(0),
      (a.finalScore * 100).toFixed(0),
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hiap-ranked-actions.csv";
    a.click();
    URL.revokeObjectURL(url);
    setShowDownload(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Ranked actions</div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            Here are the climate initiatives that our model has ranked by impact for your city.{" "}
            {pickMode ? "Select actions to add to your top picks." : "Click ↗ to view details."}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Pick top actions */}
          <button
            onClick={onTogglePickMode}
            style={{
              background: pickMode ? "#EEF2FF" : "white",
              border: `1px solid ${pickMode ? "#6366F1" : "#DDDDE1"}`,
              borderRadius: "8px", padding: "7px 14px",
              fontSize: "12px", color: pickMode ? "#4338CA" : "#6B7280",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              fontWeight: pickMode ? "600" : "400",
            }}
          >
            <span>☑</span> Pick top actions
          </button>

          {/* Download dropdown */}
          <div ref={dlRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowDownload(v => !v)}
              style={{
                background: showDownload ? "#F5F5F7" : "white",
                border: "1px solid #DDDDE1", borderRadius: "8px",
                padding: "7px 14px", fontSize: "12px", color: "#6B7280",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              ↓ Download <span style={{ fontSize: "10px" }}>▾</span>
            </button>
            {showDownload && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 20,
                background: "white", border: "1px solid #E5E7EB", borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: "150px",
              }}>
                <button
                  onClick={() => { alert("PDF export coming soon."); setShowDownload(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", fontSize: "12px", color: "#374151", cursor: "pointer", fontWeight: "500" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#F5F5F7")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  Export as PDF
                </button>
                <button
                  onClick={exportCsv}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", fontSize: "12px", color: "#374151", cursor: "pointer", fontWeight: "500", borderTop: "1px solid #F0F0F4" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#F5F5F7")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
              {pickMode && <th style={{ padding: "10px 14px", width: "40px" }} />}
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>RANK</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>ACTION</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>SECTOR</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>REDUCTION POTENTIAL</th>
              <th style={{ padding: "10px 14px", width: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => {
              const isPicked = pickedIds.includes(action.actionId);
              return (
                <tr
                  key={action.actionId}
                  style={{
                    borderBottom: "1px solid #F5F5F5",
                    background: isPicked ? "#F0F9FF" : "white",
                    transition: "background 0.1s",
                  }}
                >
                  {pickMode && (
                    <td style={{ padding: "10px 14px" }}>
                      <button
                        onClick={() => onTogglePick(action.actionId)}
                        style={{
                          width: "18px", height: "18px", borderRadius: "4px",
                          border: `2px solid ${isPicked ? "#001EA7" : "#D1D5DB"}`,
                          background: isPicked ? "#001EA7" : "white",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0, flexShrink: 0,
                        }}
                      >
                        {isPicked && <span style={{ color: "white", fontSize: "11px", fontWeight: "700", lineHeight: 1 }}>✓</span>}
                      </button>
                    </td>
                  )}
                  <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#001EA7", whiteSpace: "nowrap" }}>
                    #{action.rank}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: "#111827", maxWidth: "280px" }}>
                    {action.actionName}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {gpcSectorName(action.gpcRefs)}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "3px", width: "80px" }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i < reductionSegments(action.priority) ? "#001EA7" : "#EEF2FF" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "11px", color: reductionColor(action.priority), fontWeight: "600" }}>
                        {reductionLabel(action.priority)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => onSelect(action)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "16px", padding: "0 4px" }}
                      title="View details"
                    >
                      ↗
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function Recommendations({ params }: Props) {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find((c) => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<RankedAction | null>(null);

  // Read scoring weights from localStorage (stored as integers, default 55/22/23)
  const effectiveWeights = (() => {
    try {
      const form = JSON.parse(localStorage.getItem(`hiap:${locode}:strategic:form`) ?? "{}");
      const raw = form.weights ?? { impact: 55, alignment: 22, feasibility: 23 };
      const sum = raw.impact + raw.alignment + raw.feasibility;
      return {
        impact: raw.impact / sum,
        alignment: raw.alignment / sum,
        feasibility: raw.feasibility / sum,
      };
    } catch {
      return { impact: 0.55, alignment: 0.22, feasibility: 0.23 };
    }
  })();

  // Pick top actions state
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pickMode, setPickMode] = useState(false);

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
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
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
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <div style={{ maxWidth: "760px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>Loading results…</p>
        </div>
      </div>
    );
  }

  const { ranked, discarded, totalCityEmissions } = result;

  // Determine top picks: user-selected (in order) or pipeline top 3
  const pickedActions = pickedIds
    .map(id => ranked.find(a => a.actionId === id))
    .filter(Boolean) as RankedAction[];
  const displayTop = pickedActions.length > 0 ? pickedActions : ranked.slice(0, 3);
  const isUserPick = pickedActions.length > 0;

  function togglePick(id: string) {
    setPickedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPickedIds(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setPickedIds(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function removeFromPicks(id: string) {
    setPickedIds(prev => prev.filter(x => x !== id));
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />

      {selectedAction && (
        <DetailPanel action={selectedAction} onClose={() => setSelectedAction(null)} weights={effectiveWeights} />
      )}

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>
            <button onClick={() => navigate(`/city/${citySlug}/preflight`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", cursor: "pointer", fontSize: "12px" }}>
              {t("Cities")}
            </button>
            {" › "}{cityName}{" › "}{t("Mitigation actions")}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
                {t("Top mitigation actions for {name}", { name: cityName })}
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                {ranked.length} {t("actions ranked")} · {discarded.length} {t("excluded (legal filter)")} · {t("Total city emissions")} {(totalCityEmissions / 1_000_000).toFixed(2)} Mt CO₂e
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 48px 64px" }}>

        {/* Top picks section */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                {isUserPick ? t("My top picks") : t("Top 3 mitigation actions")}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                {isUserPick
                  ? t("{n} action{s} selected — use arrows to reorder.", { n: String(pickedActions.length), s: pickedActions.length !== 1 ? "s" : "" })
                  : t("Highest-ranked actions based on {name}'s data and priorities.", { name: cityName })}
              </div>
            </div>
            {isUserPick && (
              <button
                onClick={() => setPickedIds([])}
                style={{ fontSize: "12px", color: "#6B7280", background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "5px 12px", cursor: "pointer" }}
              >
                {t("Clear picks")}
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(displayTop.length, 3)}, 1fr)`, gap: "14px" }}>
            {displayTop.map((action, i) => (
              <TopPickCard
                key={action.actionId}
                action={action}
                index={i}
                total={displayTop.length}
                onDetail={setSelectedAction}
                onMoveUp={isUserPick ? () => moveUp(i) : undefined}
                onMoveDown={isUserPick ? () => moveDown(i) : undefined}
                onRemove={isUserPick ? () => removeFromPicks(action.actionId) : undefined}
                isUserPick={isUserPick}
              />
            ))}
          </div>
        </div>

        {/* Full ranking table */}
        <RankingTable
          actions={ranked}
          onSelect={setSelectedAction}
          pickedIds={pickedIds}
          onTogglePick={togglePick}
          pickMode={pickMode}
          onTogglePickMode={() => setPickMode(v => !v)}
        />

        {/* Discarded */}
        {discarded.length > 0 && (
          <details style={{ marginTop: "32px" }}>
            <summary style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", cursor: "pointer", padding: "8px 0" }}>
              {discarded.length} {t("actions excluded (failed mandatory legal requirements)")}
            </summary>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {discarded.map((d) => (
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
