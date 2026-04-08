import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";
import policyPlansData from "@/data/policyPlans.json";
import actionNames from "@/data/actionNames.json";

interface ActionMeta { name: string; category: string; subcategory: string }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

type Strength = "high" | "medium" | "low";
type SignalType = "action" | "funding" | "governance" | "sector" | "target";

interface PlanAction { id: string; signalType: SignalType; strength: Strength }
interface Plan { name: string; scope: string; locationName: string; link: string; actions: PlanAction[] }
interface ActionScore { policyScore: number; natScore: number; regScore: number | null }

const { plans, perActionScores } = policyPlansData as {
  plans: Plan[];
  perActionScores: Record<string, ActionScore>;
  aggregateScores: { national: number; regional: number };
};

const NATIONAL_PLANS = plans.filter(p => p.scope === "National");
const REGIONAL_PLANS_RAW = plans.filter(p => p.scope === "Regional");

// Pre-computed national aggregate from policy_support_score average
const NAT_SCORE = Math.round(
  Object.values(perActionScores).reduce((s, a) => s + a.policyScore, 0) /
  Object.keys(perActionScores).length * 100
) / 100;

// Regional: from actual regional signal data (scaled proportionally)
const REG_SCORE_RAW = Object.values(perActionScores).filter(a => a.regScore !== null);
const REG_SCORE = Math.round(
  (REG_SCORE_RAW.reduce((s, a) => s + (a.regScore ?? 0), 0) / REG_SCORE_RAW.length) *
  (NAT_SCORE / (Object.values(perActionScores).reduce((s, a) => s + a.natScore, 0) / Object.keys(perActionScores).length)) * 100
) / 100;

const TYPE_LABEL: Record<string, string> = {
  action: "Policy action", funding: "Funding",
  governance: "Governance", sector: "Sector plan", target: "Emissions target",
};

function scoreColor(s: number | null): string {
  if (s === null) return "#9CA3AF";
  if (s >= 0.75) return "#16A34A";
  if (s >= 0.45) return "#F9A200";
  return "#9CA3AF";
}

function scoreLabel(s: number | null): string {
  if (s === null) return "No plan uploaded";
  if (s >= 0.75) return "Strong alignment";
  if (s >= 0.45) return "Moderate alignment";
  return "Limited alignment";
}

const STRENGTH_COLOR: Record<Strength, string> = {
  high: "#16A34A", medium: "#F9A200", low: "#9CA3AF",
};

const PLAN_SHORT: Record<string, string> = {
  "Estrategia Climática de Largo Plazo": "ECLP",
  "Plan de Mitigación Sector Agricultura": "Sector Agricultura",
  "Plan de Mitigación Sector Ciudades": "Sector Ciudades",
  "Plan de Mitigación Sector Energía": "Sector Energía",
  "Plan de Mitigación Sector Infraestructura": "Sector Infraestructura",
  "Plan de Mitigación Sector Salud": "Sector Salud",
  "Plan de Mitigación Sector Transporte": "Sector Transporte",
};

const PLAN_YEAR: Record<string, string> = {
  "Estrategia Climática de Largo Plazo": "2021",
  "Plan de Mitigación Sector Agricultura": "2022",
  "Plan de Mitigación Sector Ciudades": "2022",
  "Plan de Mitigación Sector Energía": "2022",
  "Plan de Mitigación Sector Infraestructura": "2022",
  "Plan de Mitigación Sector Salud": "2022",
  "Plan de Mitigación Sector Transporte": "2022",
};

interface Props { params: { locode: string } }

export function PolicyAlignment({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    c => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Estrategia Climática de Largo Plazo": true,
  });
  const [munFile, setMunFile] = useState<File | null>(null);
  const [munDragOver, setMunDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const citySlug = city.locode.replace(" ", "-");

  // Substitute region name for Iquique display (mock data is for Antofagasta)
  const REGIONAL_PLANS: Plan[] = REGIONAL_PLANS_RAW.map(p => ({
    ...p,
    name: p.name.replace("Antofagasta", "Tarapacá"),
    locationName: p.locationName === "Antofagasta" ? "Tarapacá" : p.locationName,
  }));

  useEffect(() => {
    setStepProgress(locode, "policy", {
      visited: true,
      progress: 100,
      sub: `National ${NAT_SCORE} · Regional ${REG_SCORE} alignment scores`,
    });
  }, [locode]);

  function toggle(name: string) {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setMunDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setMunFile(f);
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
            MEED+ HIAP has assessed each candidate action against national, regional, and municipal climate policy for {city.name}. Policy alignment shapes how actions are ranked — better-backed actions score higher.
          </p>
          <p style={{ fontSize: "13px", color: "#16A34A", fontWeight: "500", margin: 0 }}>
            MEED+ ALIGNMENT: Policy alignment contributes 80% to the city's alignment score · Alignment shapes 22% of ranking
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 60px" }}>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <ScoreCard
            scope="National plan"
            score={NAT_SCORE}
            color={scoreColor(NAT_SCORE)}
            label={scoreLabel(NAT_SCORE)}
            description={`Strong alignment with Chile's ECLP and ${NATIONAL_PLANS.length} sectoral mitigation plans`}
          />
          <ScoreCard
            scope="Regional plan"
            score={REG_SCORE}
            color={scoreColor(REG_SCORE)}
            label={scoreLabel(REG_SCORE)}
            description={`Moderate alignment with PARCC Tarapacá · some sectors not covered`}
          />
          <ScoreCard
            scope="Municipal plan"
            score={munFile ? 0.28 : null}
            color={munFile ? scoreColor(0.28) : "#9CA3AF"}
            label={munFile ? "Limited coverage detected" : "No plan uploaded"}
            description={munFile
              ? `PACCC scanned · partial action coverage found`
              : `Upload your PACCC or local climate plan to add a municipal alignment score`}
          />
        </div>

        {/* National Plans */}
        <ScopeSection
          title="National Plans"
          subtitle="Chile"
          badge={{ label: `${NATIONAL_PLANS.length} plans`, bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }}
        >
          {NATIONAL_PLANS.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              shortName={PLAN_SHORT[plan.name] ?? plan.name}
              year={PLAN_YEAR[plan.name] ?? ""}
              open={!!expanded[plan.name]}
              onToggle={() => toggle(plan.name)}
              perActionScores={perActionScores}
            />
          ))}
        </ScopeSection>

        {/* Regional Plans */}
        <ScopeSection
          title="Regional Plans"
          subtitle="Tarapacá Region"
          badge={{ label: `${REGIONAL_PLANS.length} plan${REGIONAL_PLANS.length !== 1 ? "s" : ""}`, bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" }}
        >
          {REGIONAL_PLANS.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              shortName="PARCC Tarapacá"
              year="2021"
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
              onDrop={handleDrop}
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
                MEED+ HIAP will scan your PACCC, PLADECO, or local climate action plan and map its contents to the candidate actions, adding a municipal alignment score to the ranking.
              </div>
            </div>
          ) : (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{munFile.name}</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Uploaded · {(munFile.size / 1024).toFixed(0)} KB</div>
              </div>
              <button onClick={() => setMunFile(null)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#6B7280", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          )}
        </ScopeSection>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px" }}>
          <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: "13px", cursor: "pointer", padding: 0 }}>
            ← Skip this step
          </button>
          <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            Save & continue →
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

function ScoreCard({ scope, score, color, label, description }: {
  scope: string; score: number | null; color: string; label: string; description: string;
}) {
  const pct = score !== null ? Math.round(score * 100) : 0;
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", lineHeight: "1.4" }}>{scope}<br />alignment</span>
        <span style={{ fontSize: "26px", fontWeight: "700", color, lineHeight: "1" }}>{score !== null ? score.toFixed(2) : "—"}</span>
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

function PlanCard({ plan, shortName, year, open, onToggle, perActionScores }: {
  plan: Plan; shortName: string; year: string; open: boolean; onToggle: () => void;
  perActionScores: Record<string, ActionScore>;
}) {
  const highCount   = plan.actions.filter(a => a.strength === "high").length;
  const medCount    = plan.actions.filter(a => a.strength === "medium").length;

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{plan.name}</div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
            {year && `${year} · `}{plan.actions.length} action{plan.actions.length !== 1 ? "s" : ""} matched
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
          {plan.actions.map(a => {
            const meta = ACTION_NAMES[a.id];
            if (!meta) return null;
            const col = STRENGTH_COLOR[a.strength];
            const ps = perActionScores[a.id];
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#374151", flex: 1, lineHeight: "1.4" }}>{meta.name}</span>
                <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>{TYPE_LABEL[a.signalType]}</span>
                {ps && (
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", flexShrink: 0, minWidth: "38px", textAlign: "right" }}>
                    {ps.policyScore.toFixed(2)}
                  </span>
                )}
                <span style={{ fontSize: "11px", fontWeight: "600", color: col, flexShrink: 0, minWidth: "56px", textAlign: "right" }}>
                  {a.strength === "high" ? "Strong" : a.strength === "medium" ? "Moderate" : "Weak"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
