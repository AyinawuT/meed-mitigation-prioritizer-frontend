import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import actionNames from "@/data/actionNames.json";

interface ActionMeta { name: string; category: string; subcategory: string }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

type Strength = "high" | "medium" | "low";
type SignalType = "action" | "funding" | "governance" | "sector" | "target";

interface PlanAction { id: string; signalType: SignalType; strength: Strength }
interface Plan { name: string; scope: string; locationName: string; link: string; horizon: string; actions: PlanAction[] }
interface ActionScore { policyScore: number; natScore: number; regScore: number | null }

// API response types for the policy scores endpoint
interface PolicyApiEvidence {
  signal_type: string;
  signal_strength: string;
  document_name: string;
}
interface PolicyApiScore {
  src_action_id: string;
  policy_support_score: number;
  policy_evidence: PolicyApiEvidence[];
}
interface PolicyApiResponse {
  scores: PolicyApiScore[];
  meta?: { api_context?: { locode?: string } };
}

interface PolicyData {
  plans: Plan[];
  perActionScores: Record<string, ActionScore>;
  aggregateScores: { national: number; regional: number };
  dataSource: { locode: string };
}

const SIGNAL_TYPE_MAP: Record<string, SignalType> = {
  action: "action",
  funding: "funding",
  governance: "governance",
  target: "target",
  sector_priority: "sector",
};

function adaptPolicyApiResponse(data: PolicyApiResponse, locode: string): PolicyData {
  const docMap = new Map<string, PlanAction[]>();

  for (const score of data.scores ?? []) {
    for (const ev of score.policy_evidence ?? []) {
      const signalType = SIGNAL_TYPE_MAP[ev.signal_type];
      if (!signalType) continue; // skip unmapped signal types
      const strength = (["high", "medium", "low"].includes(ev.signal_strength)
        ? ev.signal_strength
        : "low") as Strength;
      const actions = docMap.get(ev.document_name) ?? [];
      if (!actions.some(a => a.id === score.src_action_id)) {
        actions.push({ id: score.src_action_id, signalType, strength });
      }
      docMap.set(ev.document_name, actions);
    }
  }

  const plans: Plan[] = Array.from(docMap.entries()).map(([name, actions]) => ({
    name,
    scope: "National",
    locationName: "Chile",
    link: "",
    horizon: "",
    actions,
  }));

  const perActionScores: Record<string, ActionScore> = {};
  for (const s of data.scores ?? []) {
    perActionScores[s.src_action_id] = {
      policyScore: s.policy_support_score,
      natScore:    s.policy_support_score,
      regScore:    null,
    };
  }

  const scoreValues = (data.scores ?? []).map(s => s.policy_support_score);
  const national = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : 0;

  return {
    plans,
    perActionScores,
    aggregateScores: { national, regional: 0 },
    dataSource: { locode: data.meta?.api_context?.locode ?? locode },
  };
}

const EMPTY_POLICY_DATA: Omit<PolicyData, "dataSource"> = {
  plans: [],
  perActionScores: {},
  aggregateScores: { national: 0, regional: 0 },
};

const TYPE_LABEL: Record<string, string> = {
  action: "Policy action", funding: "Funding",
  governance: "Governance", sector: "Sector plan", target: "Emissions target",
};

const STRENGTH_COLOR: Record<Strength, string> = {
  high: "#16A34A", medium: "#F9A200", low: "#9CA3AF",
};

function scoreColor(s: number | null): string {
  if (s === null) return "#9CA3AF";
  if (s >= 0.75) return "#16A34A";
  if (s >= 0.40) return "#F9A200";
  return "#9CA3AF";
}

function scoreLabel(s: number | null): string {
  if (s === null) return "No plan uploaded";
  if (s >= 0.75) return "Strong alignment";
  if (s >= 0.40) return "Moderate alignment";
  return "Limited alignment";
}

interface Props { params: { locode: string } }

export function PolicyAlignment({ params }: Props) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    c => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [policyData, setPolicyData] = useState<PolicyData>({
    ...EMPTY_POLICY_DATA,
    dataSource: { locode },
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [munFile, setMunFile] = useState<File | null>(null);
  const [munDragOver, setMunDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = `https://ccglobal.openearth.dev/api/v1/cities/${encodeURIComponent(locode)}/action-policy-scores?top_evidence_limit=5`;
    fetch(url)
      .then(r => r.json())
      .then((json: PolicyApiResponse) => {
        const adapted = adaptPolicyApiResponse(json, locode);
        setPolicyData(adapted);
        setExpanded(adapted.plans.length > 0 ? { [adapted.plans[0].name]: true } : {});
        setStepProgress(locode, "policy", {
          visited: true,
          progress: 100,
          sub: `National ${Math.round(adapted.aggregateScores.national * 100)}% · Regional ${Math.round(adapted.aggregateScores.regional * 100)}% alignment`,
        });
      })
      .catch(() => {
        setStepProgress(locode, "policy", { visited: true, progress: 100, sub: "Policy alignment reviewed" });
      });
  }, [locode]);

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>City not found.</p>
        </div>
      </div>
    );
  }

  const { plans, perActionScores, aggregateScores, dataSource } = policyData;
  const nationalPlans = plans.filter(p => p.scope === "National");
  const regionalPlans = plans.filter(p => p.scope === "Regional");

  const citySlug = city.locode.replace(" ", "-");
  const regLocation = regionalPlans[0]?.locationName ?? "Region";

  function toggle(name: string) {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={4} citySlug={citySlug} />

      {/* Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Breadcrumb items={[
            { label: "Cities", onClick: () => navigate("/") },
            { label: city.name, onClick: () => navigate(`/city/${citySlug}`) },
            { label: "Policy Alignment" },
          ]} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Policy Alignment</h1>
            <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontWeight: "500" }}>Optional</span>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
            MEED+ HIAP has assessed each candidate action against national, regional, and municipal climate policy. Policy alignment shapes how actions are ranked — better-backed actions score higher.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: "6px", padding: "5px 12px",
            fontSize: "11px", color: "#15803D", fontWeight: "600",
          }}>
            <span>⚖</span>
            <span>MEED+ ALIGNMENT: Policy alignment contributes 75% to the city's alignment score · Alignment shapes 22% of ranking</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 60px" }}>

        {/* Data source note */}
        <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#F5F7FF", borderRadius: "8px", border: "1px solid #C7D2FE", fontSize: "11px", color: "#4338CA" }}>
          Policy signals sourced from {nationalPlans.length} national and {regionalPlans.length} regional plans for <strong>{dataSource.locode}</strong> · Scores reflect signal strength across {Object.keys(perActionScores).length} candidate actions
        </div>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <ScoreCard
            scope="National plan"
            score={aggregateScores.national}
            color={scoreColor(aggregateScores.national)}
            label={scoreLabel(aggregateScores.national)}
            description={`Average policy support score across ${nationalPlans.length} national mitigation plans · ${Object.keys(perActionScores).length} actions assessed`}
          />
          <ScoreCard
            scope="Regional plan"
            score={aggregateScores.regional}
            color={scoreColor(aggregateScores.regional)}
            label={scoreLabel(aggregateScores.regional)}
            description={`Average signal strength across ${regionalPlans.length} regional plan · ${Object.values(perActionScores).filter(a => a.regScore !== null).length} of ${Object.keys(perActionScores).length} actions with regional coverage`}
          />
          <ScoreCard
            scope="Municipal plan"
            score={null}
            color="#9CA3AF"
            label={munFile ? "Uploaded — awaiting processing" : "No plan uploaded"}
            description={munFile
              ? `${munFile.name} received · municipal alignment score will be added when processed`
              : `Upload your PACCC or local climate plan to add a municipal alignment score`}
            munFile={munFile}
            onRemoveMunFile={() => setMunFile(null)}
          />
        </div>

        {/* National Plans */}
        <ScopeSection
          title="National Plans"
          subtitle="Chile"
          badge={{ label: `${nationalPlans.length} plans`, bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }}
        >
          {nationalPlans.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              open={!!expanded[plan.name]}
              onToggle={() => toggle(plan.name)}
              perActionScores={perActionScores}
            />
          ))}
        </ScopeSection>

        {/* Regional Plans */}
        <ScopeSection
          title="Regional Plans"
          subtitle={regLocation}
          badge={{ label: `${regionalPlans.length} plan${regionalPlans.length !== 1 ? "s" : ""}`, bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" }}
        >
          {regionalPlans.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              open={!!expanded[plan.name]}
              onToggle={() => toggle(plan.name)}
              perActionScores={perActionScores}
            />
          ))}
        </ScopeSection>

        {/* Municipal Plans */}
        <ScopeSection
          title="Municipal Plans"
          subtitle={city.name}
          badge={munFile
            ? { label: "1 plan uploaded", bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }
            : { label: "No data", bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" }
          }
        >
          {!munFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setMunDragOver(true); }}
              onDragLeave={() => setMunDragOver(false)}
              onDrop={e => { e.preventDefault(); setMunDragOver(false); const f = e.dataTransfer.files[0]; if (f) setMunFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${munDragOver ? "#16A34A" : "#D1D5DB"}`,
                borderRadius: "12px", background: munDragOver ? "#F0FDF4" : "#FAFAFA",
                padding: "36px 24px", textAlign: "center", transition: "all 0.15s", cursor: "pointer",
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setMunFile(f); }} />
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F3F4F6", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📄</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Upload your municipal climate plan</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>Drag and drop or click to browse · PDF or Word document</div>
              <div style={{ fontSize: "11px", color: "#6B7280", background: "#F3F4F6", borderRadius: "6px", padding: "8px 14px", display: "inline-block", textAlign: "left", maxWidth: "420px" }}>
                Upload your PACCC, PLADECO, or local climate action plan. Our team will download and process the document to extract policy signals, which will then be added to the ranking in a future update — it will not be reflected immediately.
              </div>
            </div>
          ) : (
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{munFile.name}</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Uploaded · {(munFile.size / 1024).toFixed(0)} KB · Awaiting processing</div>
              </div>
              <button onClick={() => setMunFile(null)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#6B7280", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          )}
        </ScopeSection>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px" }}>
          <button onClick={() => navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/financial-feasibility`)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: "13px", cursor: "pointer", padding: 0 }}>
            {fromPreflight ? "← Back to pre-flight" : "← Skip this step"}
          </button>
          <button onClick={() => { confirmStep(locode, "policy"); navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/financial-feasibility`); }} style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            {fromPreflight ? "Save & return to pre-flight →" : "Save & continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span>›</span>}
          {item.onClick
            ? <button onClick={item.onClick} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{item.label}</button>
            : <span style={{ color: "#374151" }}>{item.label}</span>
          }
        </span>
      ))}
    </div>
  );
}

function ScoreCard({ scope, score, color, label, description, munFile, onRemoveMunFile }: {
  scope: string; score: number | null; color: string; label: string; description: string;
  munFile?: File | null; onRemoveMunFile?: () => void;
}) {
  const pct = score !== null ? Math.round(score * 100) : 0;
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", lineHeight: "1.4" }}>{scope}<br />alignment</span>
        <span style={{ fontSize: "26px", fontWeight: "700", color, lineHeight: "1" }}>
          {score !== null ? `${Math.round(score * 100)}%` : "—"}
        </span>
      </div>
      <div style={{ height: "6px", background: "#F3F4F6", borderRadius: "4px", marginBottom: "10px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
      </div>
      <div style={{ fontSize: "11px", fontWeight: "600", color, marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: "1.5" }}>{description}</div>
    </div>
  );
}

function ScopeSection({ title, subtitle, badge, children }: {
  title: string; subtitle: string; badge: { label: string; bg: string; text: string; border: string }; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>{title}</h2>
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>·</span>
        <span style={{ fontSize: "12px", color: "#6B7280" }}>{subtitle}</span>
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "5px", background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontWeight: "600" }}>{badge.label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
    </div>
  );
}

function PlanCard({ plan, open, onToggle, perActionScores }: {
  plan: Plan; open: boolean; onToggle: () => void;
  perActionScores: Record<string, ActionScore>;
}) {
  const highCount = plan.actions.filter(a => a.strength === "high").length;
  const medCount  = plan.actions.filter(a => a.strength === "medium").length;

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{plan.name}</span>
            {plan.link && (
              <a
                href={plan.link} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize: "10px", color: "#001EA7", textDecoration: "none", flexShrink: 0, border: "1px solid #C7D2FE", borderRadius: "3px", padding: "1px 5px", background: "#F5F7FF" }}
              >
                ↗ source
              </a>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
            {plan.horizon ? `Horizon: ${plan.horizon} · ` : ""}{plan.actions.length} action{plan.actions.length !== 1 ? "s" : ""} matched
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px", flexShrink: 0 }}>
          {highCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: "600" }}>{highCount} strong</span>
          )}
          {medCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", fontWeight: "600" }}>{medCount} moderate</span>
          )}
          <span style={{ fontSize: "16px", color: "#9CA3AF", marginLeft: "4px" }}>{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Column legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "6px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ width: "8px", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", color: "#9CA3AF", flex: 1, fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>Action</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0, minWidth: "80px", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>Signal type</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0, minWidth: "110px", textAlign: "right", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>Policy support</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0, minWidth: "56px", textAlign: "right", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>Strength</span>
          </div>
          {plan.actions.map(a => {
            const meta = ACTION_NAMES[a.id];
            if (!meta) return null;
            const col = STRENGTH_COLOR[a.strength];
            const ps  = perActionScores[a.id];
            const pct = ps ? Math.round(ps.policyScore * 100) : 0;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#374151", flex: 1, lineHeight: "1.4" }}>{meta.name}</span>
                <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0, minWidth: "80px" }}>{TYPE_LABEL[a.signalType]}</span>
                {ps ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, minWidth: "110px", justifyContent: "flex-end" }}>
                    <div style={{ width: "48px", height: "5px", background: "#F3F4F6", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: "3px" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", minWidth: "30px", textAlign: "right" }}>{pct}%</span>
                  </div>
                ) : (
                  <span style={{ flexShrink: 0, minWidth: "110px" }} />
                )}
                <span style={{ fontSize: "11px", fontWeight: "600", color: col, flexShrink: 0, minWidth: "56px", textAlign: "right" }}>
                  {a.strength === "high" ? "Strong" : a.strength === "medium" ? "Moderate" : "Weak"}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#C0C0C0", paddingTop: "6px", borderTop: "1px solid #F9F9F9" }}>
            Policy support score: how well this plan's provisions explicitly cover the action (0% = no coverage · 100% = full explicit coverage)
          </div>
        </div>
      )}
    </div>
  );
}
