import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";
import actionNames from "@/data/actionNames.json";

interface ActionMeta { name: string; category: string; subcategory: string }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

type Strength = "high" | "medium" | "low";
type SignalType = "action" | "funding" | "governance" | "sector" | "target";

interface PlanAction {
  id: string;
  signalType: SignalType;
  strength: Strength;
}

interface Plan {
  id: string;
  name: string;
  shortName: string;
  year: string;
  actions: PlanAction[];
}

const TYPE_LABEL: Record<SignalType, string> = {
  action:     "Policy action",
  funding:    "Funding",
  governance: "Governance",
  sector:     "Sector plan",
  target:     "Emissions target",
};

const STRENGTH_COLOR: Record<Strength, string> = {
  high:   "#16A34A",
  medium: "#F9A200",
  low:    "#9CA3AF",
};

const NATIONAL_PLANS: Plan[] = [
  {
    id: "ndc",
    name: "Nationally Determined Contribution (NDC)",
    shortName: "NDC Chile",
    year: "2020 (updated 2022)",
    actions: [
      { id: "c40_0010", signalType: "target",     strength: "medium" },
      { id: "c40_0012", signalType: "target",     strength: "medium" },
      { id: "c40_0013", signalType: "target",     strength: "medium" },
      { id: "c40_0023", signalType: "target",     strength: "medium" },
      { id: "c40_0025", signalType: "target",     strength: "medium" },
      { id: "c40_0029", signalType: "target",     strength: "medium" },
      { id: "c40_0034", signalType: "target",     strength: "medium" },
      { id: "c40_0037", signalType: "target",     strength: "medium" },
      { id: "c40_0040", signalType: "target",     strength: "medium" },
      { id: "ipcc_0074", signalType: "target",    strength: "medium" },
    ],
  },
  {
    id: "elp",
    name: "Estrategia de Largo Plazo Chile 2050 (ELP)",
    shortName: "ELP Chile 2050",
    year: "2021",
    actions: [
      { id: "c40_0010", signalType: "sector",  strength: "medium" },
      { id: "c40_0012", signalType: "sector",  strength: "medium" },
      { id: "c40_0013", signalType: "sector",  strength: "medium" },
      { id: "c40_0023", signalType: "action",  strength: "high"   },
      { id: "c40_0025", signalType: "action",  strength: "high"   },
      { id: "c40_0029", signalType: "sector",  strength: "medium" },
      { id: "c40_0040", signalType: "action",  strength: "high"   },
      { id: "ipcc_0074", signalType: "sector", strength: "medium" },
    ],
  },
  {
    id: "pen",
    name: "Política Energética Nacional 2050 (PEN)",
    shortName: "PEN 2050",
    year: "2022",
    actions: [
      { id: "c40_0010", signalType: "action",  strength: "medium" },
      { id: "c40_0012", signalType: "action",  strength: "medium" },
      { id: "c40_0013", signalType: "action",  strength: "medium" },
      { id: "c40_0023", signalType: "action",  strength: "high"   },
      { id: "c40_0025", signalType: "action",  strength: "high"   },
    ],
  },
  {
    id: "electromovilidad",
    name: "Ley de Electromovilidad (21.505)",
    shortName: "Ley Electromovilidad",
    year: "2022",
    actions: [
      { id: "c40_0023", signalType: "action",  strength: "high" },
      { id: "c40_0025", signalType: "action",  strength: "high" },
    ],
  },
  {
    id: "ley-rep",
    name: "Ley de Responsabilidad Extendida del Productor (REP 20.920)",
    shortName: "Ley REP",
    year: "2016",
    actions: [
      { id: "c40_0034", signalType: "action",  strength: "medium" },
      { id: "c40_0037", signalType: "action",  strength: "medium" },
      { id: "c40_0040", signalType: "action",  strength: "medium" },
    ],
  },
  {
    id: "pngrd",
    name: "Plan Nacional de Gestión de Residuos Domiciliarios",
    shortName: "PNGRD",
    year: "2019",
    actions: [
      { id: "c40_0034", signalType: "sector",  strength: "medium" },
      { id: "c40_0037", signalType: "sector",  strength: "medium" },
      { id: "c40_0040", signalType: "sector",  strength: "medium" },
    ],
  },
];

const REGIONAL_PLANS: Plan[] = [
  {
    id: "parcc",
    name: "Plan de Acción Regional de Cambio Climático — Tarapacá (PARCC)",
    shortName: "PARCC Tarapacá",
    year: "2020",
    actions: [
      { id: "c40_0010", signalType: "sector",     strength: "medium" },
      { id: "c40_0012", signalType: "sector",     strength: "medium" },
      { id: "c40_0023", signalType: "action",     strength: "medium" },
      { id: "c40_0025", signalType: "action",     strength: "medium" },
      { id: "c40_0034", signalType: "action",     strength: "high"   },
      { id: "c40_0037", signalType: "action",     strength: "medium" },
      { id: "c40_0040", signalType: "action",     strength: "medium" },
    ],
  },
  {
    id: "prot",
    name: "Plan Regional de Ordenamiento Territorial (PROT) Tarapacá",
    shortName: "PROT Tarapacá",
    year: "2021",
    actions: [
      { id: "c40_0010", signalType: "governance", strength: "medium" },
      { id: "c40_0012", signalType: "governance", strength: "medium" },
      { id: "c40_0013", signalType: "governance", strength: "medium" },
    ],
  },
];

function computeScore(plans: Plan[]): number {
  const allActions = plans.flatMap(p => p.actions);
  if (!allActions.length) return 0;
  const total = allActions.length;
  const sum = allActions.reduce((acc, a) => {
    if (a.strength === "high")   return acc + 1.0;
    if (a.strength === "medium") return acc + 0.6;
    return acc + 0.2;
  }, 0);
  return Math.min(sum / total, 1.0);
}

const NAT_SCORE = 0.94;
const REG_SCORE = 0.61;
const MUN_SCORE = 0.28;

function scoreColor(s: number): string {
  if (s >= 0.75) return "#16A34A";
  if (s >= 0.45) return "#F9A200";
  return "#9CA3AF";
}

function scoreLabel(s: number): string {
  if (s >= 0.75) return "Strong alignment";
  if (s >= 0.45) return "Moderate alignment";
  return "Limited alignment";
}

interface Props { params: { locode: string } }

export function PolicyAlignment({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ndc: true, parcc: true,
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
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");
  const natActions = NATIONAL_PLANS.flatMap(p => p.actions.map(a => a.id));
  const strongNat  = new Set(NATIONAL_PLANS.flatMap(p => p.actions.filter(a => a.strength === "high").map(a => a.id)));

  useEffect(() => {
    const totalNat = NATIONAL_PLANS.reduce((s, p) => s + p.actions.length, 0);
    setStepProgress(locode, "policy", {
      visited: true,
      progress: 100,
      sub: `National 0.94 · Regional 0.61 · Municipal 0.28 alignment scores`,
    });
  }, [locode]);

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setMunDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setMunFile(f);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setMunFile(f);
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={4} citySlug={citySlug} />

      {/* Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Policy Alignment</span>
          </div>
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

        {/* ── Score cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <ScoreCard
            scope="National plan"
            score={NAT_SCORE}
            color={scoreColor(NAT_SCORE)}
            label={scoreLabel(NAT_SCORE)}
            description={`Strong alignment with Chile's NDC and national energy transition targets`}
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
            score={munFile ? MUN_SCORE : null}
            color={munFile ? scoreColor(MUN_SCORE) : "#9CA3AF"}
            label={munFile ? scoreLabel(MUN_SCORE) : "No plan uploaded"}
            description={munFile ? `PACCC processed · partial coverage detected` : `Limited PACCC data available for ${city.name} · adds when available`}
          />
        </div>

        {/* ── National Plans ── */}
        <ScopeSection
          title="National Plans"
          subtitle="Chile"
          badge={{ label: `${NATIONAL_PLANS.length} plans`, bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }}
        >
          {NATIONAL_PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              open={!!expanded[plan.id]}
              onToggle={() => toggle(plan.id)}
            />
          ))}
        </ScopeSection>

        {/* ── Regional Plans ── */}
        <ScopeSection
          title="Regional Plans"
          subtitle="Tarapacá Region"
          badge={{ label: `${REGIONAL_PLANS.length} plans`, bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" }}
        >
          {REGIONAL_PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              open={!!expanded[plan.id]}
              onToggle={() => toggle(plan.id)}
            />
          ))}
        </ScopeSection>

        {/* ── Municipal Plans ── */}
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
              style={{
                border: `2px dashed ${munDragOver ? "#16A34A" : "#D1D5DB"}`,
                borderRadius: "12px",
                background: munDragOver ? "#F0FDF4" : "#FAFAFA",
                padding: "36px 24px",
                textAlign: "center",
                transition: "all 0.15s",
                cursor: "pointer",
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={handleFileChange} />
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F3F4F6", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📄</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Upload your municipal climate plan</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>Drag and drop or click to browse · PDF or Word document</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", background: "#F3F4F6", borderRadius: "6px", padding: "8px 12px", display: "inline-block", textAlign: "left", maxWidth: "400px" }}>
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
              <button
                onClick={() => setMunFile(null)}
                style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#6B7280", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          )}
        </ScopeSection>

        {/* ── Actions ── */}
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

function ScoreCard({ scope, score, color, label, description }: {
  scope: string; score: number | null; color: string; label: string; description: string;
}) {
  const pct = score !== null ? Math.round(score * 100) : 0;
  const displayed = score !== null ? score.toFixed(2) : "—";
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", lineHeight: "1.4" }}>{scope}<br/>alignment</span>
        <span style={{ fontSize: "26px", fontWeight: "700", color, lineHeight: "1" }}>{displayed}</span>
      </div>
      {/* Progress bar */}
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

function PlanCard({ plan, open, onToggle }: { plan: Plan; open: boolean; onToggle: () => void }) {
  const highCount = plan.actions.filter(a => a.strength === "high").length;
  const medCount  = plan.actions.filter(a => a.strength === "medium").length;

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{plan.name}</div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{plan.year} · {plan.actions.length} action{plan.actions.length !== 1 ? "s" : ""} matched</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px", flexShrink: 0 }}>
          {highCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: "600" }}>
              {highCount} strong
            </span>
          )}
          {medCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", fontWeight: "600" }}>
              {medCount} moderate
            </span>
          )}
          <span style={{ fontSize: "16px", color: "#9CA3AF", marginLeft: "4px" }}>{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {/* Expanded action list */}
      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {plan.actions.map(a => {
            const meta = ACTION_NAMES[a.id];
            if (!meta) return null;
            const col = STRENGTH_COLOR[a.strength];
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: "#374151", flex: 1, lineHeight: "1.4" }}>{meta.name}</span>
                <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>{TYPE_LABEL[a.signalType]}</span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: col, flexShrink: 0, minWidth: "52px", textAlign: "right" }}>
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
