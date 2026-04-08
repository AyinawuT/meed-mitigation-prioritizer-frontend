import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import type { PipelineResult, RankedAction } from "@/lib/scoringPipeline";
import actionsRaw from "@/data/actions.json";

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

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIMELINE_LABEL: Record<string, string> = {
  "<5 years": "< 5 years",
  "5-10 years": "5–10 years",
  ">10 years": "> 10 years",
};

function reductionLabel(priority: string) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function reductionColor(priority: string) {
  if (priority === "high") return "#16A34A";
  if (priority === "medium") return "#F59E0B";
  return "#6B7280";
}

// ─── Score bar (panel) ─────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(Math.min(value, 1) * 100);
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

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ action, onClose }: { action: RankedAction; onClose: () => void }) {
  const cobenefits = actionCoBenefitsMap[action.actionId] ?? [];
  const barriers = actionBarriersMap[action.actionId] ?? [];
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40,
          animation: "fadeIn 0.2s ease",
        }}
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
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#001EA7", fontSize: "13px", fontWeight: "600",
              padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px",
            }}
          >
            ← GO BACK
          </button>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            {action.actionCategory}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.35" }}>
            {action.actionName}
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {action.rank === 1 && (
              <span style={{ fontSize: "10px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                Expert's Choice
              </span>
            )}
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
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>Score breakdown</div>
            <ScoreBar label="Impact" value={action.impactScore} />
            <ScoreBar label="Alignment" value={action.alignmentScore} />
            <ScoreBar label="Feasibility" value={action.feasibilityScore} />
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
            Add to action plan →
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

// ─── Top-3 card ───────────────────────────────────────────────────────────────

function TopCard({ action, onSelect }: { action: RankedAction; onSelect: (a: RankedAction) => void }) {
  return (
    <div style={{
      background: "white", border: "1px solid #EBEBEB", borderRadius: "12px",
      padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%",
          background: "#001EA7", color: "white",
          fontSize: "13px", fontWeight: "700",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          #{action.rank}
        </div>
        {action.rank === 1 && (
          <span style={{ fontSize: "10px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
            Expert's Choice
          </span>
        )}
      </div>

      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "8px", lineHeight: "1.4", flex: 1 }}>
        {action.actionName}
      </div>

      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "1.45" }}>
        {action.description.length > 90 ? action.description.slice(0, 90) + "…" : action.description}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9CA3AF" }}>Reduction potential</span>
          <span style={{ color: reductionColor(action.priority), fontWeight: "600" }}>
            {reductionLabel(action.priority)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9CA3AF" }}>Sector</span>
          <span style={{ color: "#6B7280" }}>{action.actionCategory}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9CA3AF" }}>Timeline</span>
          <span style={{ color: "#6B7280" }}>{TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9CA3AF" }}>Score</span>
          <span style={{ color: "#001EA7", fontWeight: "700" }}>{(action.finalScore * 100).toFixed(0)}</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(action)}
        style={{
          width: "100%", background: "none", border: "1px solid #EBEBEB",
          borderRadius: "6px", padding: "7px", fontSize: "12px",
          color: "#001EA7", cursor: "pointer", fontWeight: "500",
        }}
      >
        See more details
      </button>
    </div>
  );
}

// ─── Ranking table ─────────────────────────────────────────────────────────────

function RankingTable({ actions, onSelect }: { actions: RankedAction[]; onSelect: (a: RankedAction) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Mitigation actions ranking</div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            All ranked actions — click ↗ to view details.
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={{
            background: "white", border: "1px solid #DDDDE1", borderRadius: "8px",
            padding: "7px 14px", fontSize: "12px", color: "#6B7280", cursor: "pointer",
          }}>
            ↓ Download
          </button>
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
              {["RANK", "ACTION", "SECTOR", "REDUCTION POTENTIAL", ""].map((h) => (
                <th key={h} style={{
                  padding: "10px 14px", fontSize: "11px", color: "#9CA3AF",
                  fontWeight: "500", textAlign: "left", letterSpacing: "0.03em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr
                key={action.actionId}
                style={{ borderBottom: "1px solid #F5F5F5" }}
              >
                <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#001EA7", whiteSpace: "nowrap" }}>
                  #{action.rank}
                </td>
                <td style={{ padding: "10px 14px", fontSize: "12px", color: "#111827", maxWidth: "280px" }}>
                  {action.actionName}
                </td>
                <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                  {action.actionCategory}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "100px", background: "#EEF2FF", borderRadius: "3px", height: "6px" }}>
                      <div style={{
                        background: "#001EA7",
                        width: `${action.finalScore * 100}%`,
                        height: "6px", borderRadius: "3px",
                      }} />
                    </div>
                    <span style={{ fontSize: "11px", color: reductionColor(action.priority), fontWeight: "600" }}>
                      {reductionLabel(action.priority)}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <button
                    onClick={() => onSelect(action)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#001EA7", fontSize: "16px", fontWeight: "500",
                      padding: "0 4px",
                    }}
                    title="View details"
                  >
                    ↗
                  </button>
                </td>
              </tr>
            ))}
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
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find((c) => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<RankedAction | null>(null);

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
          <button
            onClick={() => navigate(`/city/${citySlug}/preflight`)}
            style={{ padding: "10px 24px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
          >
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
  const top3 = ranked.slice(0, 3);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />

      {selectedAction && (
        <DetailPanel action={selectedAction} onClose={() => setSelectedAction(null)} />
      )}

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>
            <button
              onClick={() => navigate(`/city/${citySlug}/preflight`)}
              style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", cursor: "pointer", fontSize: "12px" }}
            >
              Cities
            </button>
            {" › "}{cityName}{" › "}Mitigation actions
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
                Top mitigation actions for {cityName}
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                {ranked.length} actions ranked · {discarded.length} excluded (legal filter) · Total city emissions {(totalCityEmissions / 1_000_000).toFixed(2)} Mt CO₂e
              </p>
            </div>
            <button style={{
              background: "#001EA7", color: "white", border: "none", borderRadius: "8px",
              padding: "9px 18px", fontSize: "12px", fontWeight: "500", cursor: "pointer",
              whiteSpace: "nowrap", marginLeft: "24px",
            }}>
              ⚡ Generate Plan
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 48px 64px" }}>

        {/* Top 3 section */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Top 3 mitigation actions</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Highest-ranked actions based on {cityName}'s data and priorities.
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            {top3.map((action) => (
              <TopCard key={action.actionId} action={action} onSelect={setSelectedAction} />
            ))}
          </div>
        </div>

        {/* Full ranking table */}
        <RankingTable actions={ranked} onSelect={setSelectedAction} />

        {/* Discarded section */}
        {discarded.length > 0 && (
          <details style={{ marginTop: "32px" }}>
            <summary style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", cursor: "pointer", padding: "8px 0" }}>
              {discarded.length} actions excluded (failed mandatory legal requirements)
            </summary>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {discarded.map((d) => (
                <div key={d.actionId} style={{
                  background: "white", border: "1px solid #E5E7EB", borderRadius: "6px",
                  padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
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
