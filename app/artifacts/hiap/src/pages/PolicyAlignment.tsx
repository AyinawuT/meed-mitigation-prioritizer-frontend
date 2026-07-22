import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLanguage } from "@/lib/i18n";
import { InfoTip } from "@/components/InfoTip";
import { ClipboardList, FileText } from "lucide-react";
import { DEFS } from "@/lib/definitions";
import actionNames from "@/data/actionNames.json";
import { loadActionCatalog, type CatalogAction } from "@/lib/actionCatalog";
import { localizedActionName } from "@/lib/actionDisplay";

interface ActionMeta { name: string; category: string; subcategory: string }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

type Strength = "high" | "medium" | "low";
type SignalType = "action" | "funding" | "governance" | "sector" | "target";

interface PlanAction { id: string; signalType: SignalType; strength: Strength }
type Scope = "National" | "Regional" | "Municipal";

interface Plan { name: string; scope: Scope; locationName: string; link: string; horizon: string; actions: PlanAction[] }
interface ActionScore { policyScore: number; natScore: number | null; regScore: number | null; munScore: number | null }

// API response types for the policy scores endpoint
interface PolicyApiEvidence {
  signal_type: string;
  signal_strength: string;
  document_name: string;
  document_type?: string;
  evidence_strength?: number;
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
  aggregateScores: { national: number; regional: number | null; municipal: number | null };
  dataSource: { locode: string };
}

const SIGNAL_TYPE_MAP: Record<string, SignalType> = {
  action: "action",
  funding: "funding",
  governance: "governance",
  target: "target",
  sector_priority: "sector",
};

// The API tags each policy document with a scope via document_type:
//   parcc → regional plan, paccc → municipal plan, everything else
//   (ndc, framework, sector_plan, …) → national.
function docScope(docType?: string): Scope {
  if (docType === "parcc") return "Regional";
  if (docType === "paccc") return "Municipal";
  return "National";
}

const SIGNAL_STRENGTH_NUM: Record<string, number> = { high: 0.7, medium: 0.4, low: 0.2 };

function mean(vals: number[]): number | null {
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function adaptPolicyApiResponse(
  data: PolicyApiResponse,
  locode: string,
  cityName: string,
  regionName: string,
): PolicyData {
  const docMap = new Map<string, { scope: Scope; actions: PlanAction[] }>();
  const perActionScores: Record<string, ActionScore> = {};

  for (const score of data.scores ?? []) {
    const id = score.src_action_id;
    // Strongest supporting evidence per scope for this action.
    const scopeMax: Record<Scope, number | null> = { National: null, Regional: null, Municipal: null };

    for (const ev of score.policy_evidence ?? []) {
      const scope = docScope(ev.document_type);
      const strengthNum = typeof ev.evidence_strength === "number"
        ? ev.evidence_strength
        : (SIGNAL_STRENGTH_NUM[ev.signal_strength] ?? 0.2);
      scopeMax[scope] = Math.max(scopeMax[scope] ?? 0, strengthNum);

      const signalType = SIGNAL_TYPE_MAP[ev.signal_type];
      if (!signalType) continue; // unmapped signals still count toward coverage, but not the plan chips
      const strength = (["high", "medium", "low"].includes(ev.signal_strength)
        ? ev.signal_strength
        : "low") as Strength;
      const entry = docMap.get(ev.document_name) ?? { scope, actions: [] };
      if (!entry.actions.some(a => a.id === id)) {
        entry.actions.push({ id, signalType, strength });
      }
      docMap.set(ev.document_name, entry);
    }

    perActionScores[id] = {
      policyScore: score.policy_support_score,
      natScore: scopeMax.National,
      regScore: scopeMax.Regional,
      munScore: scopeMax.Municipal,
    };
  }

  const plans: Plan[] = Array.from(docMap.entries()).map(([name, { scope, actions }]) => ({
    name,
    scope,
    locationName: scope === "Regional" ? (regionName || "Region") : scope === "Municipal" ? (cityName || "City") : "Chile",
    link: "",
    horizon: "",
    actions,
  }));

  const nationalAvg = mean((data.scores ?? []).map(s => s.policy_support_score)) ?? 0;
  const regional = mean(Object.values(perActionScores).map(a => a.regScore).filter((v): v is number => v !== null));
  const municipal = mean(Object.values(perActionScores).map(a => a.munScore).filter((v): v is number => v !== null));

  return {
    plans,
    perActionScores,
    aggregateScores: { national: nationalAvg, regional, municipal },
    dataSource: { locode: data.meta?.api_context?.locode ?? locode },
  };
}

const EMPTY_POLICY_DATA: Omit<PolicyData, "dataSource"> = {
  plans: [],
  perActionScores: {},
  aggregateScores: { national: 0, regional: null, municipal: null },
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
  const { t } = useLanguage();
  const fromPreflight = search.includes("from=preflight");
  const fromRecommendations = search.includes("from=recommendations");
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

  // Live action catalog — used to render Spanish action names (nameI18n).
  const [catalog, setCatalog] = useState<Map<string, CatalogAction>>(new Map());
  useEffect(() => {
    loadActionCatalog().then(setCatalog).catch(() => {});
  }, []);

  useEffect(() => {
    const url = `https://ccglobal.openearth.dev/api/v1/cities/${encodeURIComponent(locode)}/action-policy-scores?top_evidence_limit=5`;
    fetch(url)
      .then(r => r.json())
      .then((json: PolicyApiResponse) => {
        const adapted = adaptPolicyApiResponse(json, locode, city?.name ?? "", city?.region ?? "");
        setPolicyData(adapted);
        setExpanded(adapted.plans.length > 0 ? { [adapted.plans[0].name]: true } : {});
        setStepProgress(locode, "policy", {
          visited: true,
          progress: 100,
          sub: `National ${Math.round(adapted.aggregateScores.national * 100)}% · Regional ${Math.round((adapted.aggregateScores.regional ?? 0) * 100)}% · Municipal ${Math.round((adapted.aggregateScores.municipal ?? 0) * 100)}% alignment`,
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
          <p style={{ color: "#6B7280" }}>{t("City not found.")}</p>
        </div>
      </div>
    );
  }

  const { plans, perActionScores, aggregateScores, dataSource } = policyData;
  const nationalPlans = plans.filter(p => p.scope === "National");
  const regionalPlans = plans.filter(p => p.scope === "Regional");
  const municipalPlans = plans.filter(p => p.scope === "Municipal");
  const hasMunicipal = municipalPlans.length > 0;
  const totalActions = Object.keys(perActionScores).length;
  const munCoverage = Object.values(perActionScores).filter(a => a.munScore !== null).length;

  const citySlug = city.locode.replace(" ", "-");
  const regLocation = regionalPlans[0]?.locationName ?? t("Region");

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
            { label: t("Cities"), onClick: () => navigate("/") },
            { label: city.name, onClick: () => navigate(`/city/${citySlug}`) },
            { label: t("Policy Alignment") },
          ]} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>{t("Policy Alignment")}</h1>
            <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontWeight: "500" }}>{t("Optional")}</span>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
            {t("Aceleradora Local de Mitigación has assessed each candidate action against national, regional, and municipal climate policy. Policy alignment shapes how actions are ranked — better-backed actions score higher.")}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: "6px", padding: "5px 12px",
            fontSize: "11px", color: "#15803D", fontWeight: "600",
          }}>
            <ClipboardList size={14} color="#15803D" style={{ flexShrink: 0 }} />
            <span>{t("ALM ALIGNMENT: Policy alignment contributes 75% to the city's alignment score · Alignment shapes 22% of ranking")}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 60px" }}>

        {/* Data source note */}
        <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#F5F7FF", borderRadius: "8px", border: "1px solid #C7D2FE", fontSize: "11px", color: "#4338CA" }}>
          {t("Policy signals sourced from {n} national, {r} regional and {m} municipal plans for", { n: String(nationalPlans.length), r: String(regionalPlans.length), m: String(municipalPlans.length) })} <strong>{city.name}</strong> {t("· {n} candidate actions checked for policy backing", { n: String(totalActions) })}
        </div>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <ScoreCard
            scope={t("National plan")}
            score={aggregateScores.national}
            color={scoreColor(aggregateScores.national)}
            label={t(scoreLabel(aggregateScores.national))}
            description={t("Average policy support score across {n} national mitigation plans · {a} actions assessed", { n: String(nationalPlans.length), a: String(Object.keys(perActionScores).length) })}
          />
          <ScoreCard
            scope={t("Regional plan")}
            score={aggregateScores.regional}
            color={scoreColor(aggregateScores.regional)}
            label={t(scoreLabel(aggregateScores.regional))}
            description={t("Average signal strength across {n} regional plan · {c} of {total} actions with regional coverage", { n: String(regionalPlans.length), c: String(Object.values(perActionScores).filter(a => a.regScore !== null).length), total: String(Object.keys(perActionScores).length) })}
          />
          {hasMunicipal ? (
            <ScoreCard
              scope={t("Municipal plan")}
              score={aggregateScores.municipal}
              color={scoreColor(aggregateScores.municipal)}
              label={t(scoreLabel(aggregateScores.municipal))}
              description={t("Average signal strength across {n} municipal plan · {c} of {total} actions with municipal coverage", { n: String(municipalPlans.length), c: String(munCoverage), total: String(totalActions) })}
            />
          ) : (
            <ScoreCard
              scope={t("Municipal plan")}
              score={null}
              color="#9CA3AF"
              label={munFile ? t("Uploaded — awaiting processing") : t("No plan uploaded")}
              description={munFile
                ? t("{file} received · municipal alignment score will be added when processed", { file: munFile.name })
                : t("Upload your PACCC or local climate plan to add a municipal alignment score")}
              munFile={munFile}
              onRemoveMunFile={() => setMunFile(null)}
            />
          )}
        </div>

        {/* National Plans */}
        <ScopeSection
          title={t("National Plans")}
          subtitle="Chile"
          badge={{ label: t("{n} plans", { n: String(nationalPlans.length) }), bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }}
        >
          {nationalPlans.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              open={!!expanded[plan.name]}
              onToggle={() => toggle(plan.name)}
              perActionScores={perActionScores}
              catalog={catalog}
            />
          ))}
        </ScopeSection>

        {/* Regional Plans */}
        <ScopeSection
          title={t("Regional Plans")}
          subtitle={regLocation}
          badge={{ label: t(regionalPlans.length !== 1 ? "{n} plans" : "{n} plan", { n: String(regionalPlans.length) }), bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" }}
        >
          {regionalPlans.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              open={!!expanded[plan.name]}
              onToggle={() => toggle(plan.name)}
              perActionScores={perActionScores}
              catalog={catalog}
            />
          ))}
        </ScopeSection>

        {/* Municipal Plans */}
        <ScopeSection
          title={t("Municipal Plans")}
          subtitle={city.name}
          badge={hasMunicipal
            ? { label: t(municipalPlans.length !== 1 ? "{n} plans" : "{n} plan", { n: String(municipalPlans.length) }), bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }
            : munFile
            ? { label: t("1 plan uploaded"), bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }
            : { label: t("No data"), bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" }
          }
        >
          {hasMunicipal ? (
            municipalPlans.map(plan => (
              <PlanCard
                key={plan.name}
                plan={plan}
                open={!!expanded[plan.name]}
                onToggle={() => toggle(plan.name)}
                perActionScores={perActionScores}
                catalog={catalog}
              />
            ))
          ) : !munFile ? (
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
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F3F4F6", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={22} color="#6B7280" style={{ flexShrink: 0 }} /></div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>{t("Upload your municipal climate plan")}</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>{t("Drag and drop or click to browse · PDF or Word document")}</div>
              <div style={{ fontSize: "11px", color: "#6B7280", background: "#F3F4F6", borderRadius: "6px", padding: "8px 14px", display: "inline-block", textAlign: "left", maxWidth: "420px" }}>
                {t("Upload your PACCC, PLADECO, or local climate action plan. Our team will download and process the document to extract policy signals, which will then be added to the ranking in a future update — it will not be reflected immediately.")}
              </div>
            </div>
          ) : (
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={22} color="#B45309" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{munFile.name}</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{t("Uploaded · {kb} KB · Awaiting processing", { kb: (munFile.size / 1024).toFixed(0) })}</div>
              </div>
              <button onClick={() => setMunFile(null)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#6B7280", cursor: "pointer" }}>
                {t("Remove")}
              </button>
            </div>
          )}
        </ScopeSection>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px" }}>
          <button onClick={() => navigate(fromRecommendations ? `/city/${citySlug}/recommendations?tab=context` : fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/financial-feasibility`)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: "13px", cursor: "pointer", padding: 0 }}>
            {t(fromRecommendations ? "← Back to context breakdown" : fromPreflight ? "← Back to pre-flight" : "← Skip this step")}
          </button>
          <button onClick={() => { confirmStep(locode, "policy"); navigate(fromRecommendations ? `/city/${citySlug}/recommendations?tab=context` : fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/financial-feasibility`); }} style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            {t(fromRecommendations ? "Save & return to context breakdown →" : fromPreflight ? "Save & return to pre-flight →" : "Save & continue →")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ColHeader({ label, tip, minWidth, align }: { label: string; tip: string; minWidth: string; align?: "right" }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", flexShrink: 0, minWidth, textAlign: align ?? "left", display: "inline-flex", alignItems: "center", gap: "3px", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ background: "none", border: "none", padding: 0, cursor: "default", color: "#C4C9D4", fontSize: "10px", lineHeight: 1, flexShrink: 0 }}
      >ⓘ</button>
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", [align === "right" ? "right" : "left"]: 0,
          background: "white", color: "#374151", fontSize: "11px", lineHeight: "1.5",
          borderRadius: "6px", padding: "8px 10px", width: "220px", zIndex: 100,
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: "1px solid #E5E7EB", pointerEvents: "none",
        }}>
          {tip}
        </div>
      )}
    </span>
  );
}

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
  const { t } = useLanguage();
  const pct = score !== null ? Math.round(score * 100) : 0;
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", lineHeight: "1.4" }}>{scope}<br />{t("alignment")}</span>
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

function PlanCard({ plan, open, onToggle, perActionScores, catalog }: {
  plan: Plan; open: boolean; onToggle: () => void;
  perActionScores: Record<string, ActionScore>;
  catalog: Map<string, CatalogAction>;
}) {
  const { t, lang } = useLanguage();
  const knownActions = plan.actions.filter(a => !!ACTION_NAMES[a.id]);
  // Prefer the live catalog's localized name; fall back to the English bundle.
  const nameOf = (id: string) => {
    const c = catalog.get(id);
    return c ? localizedActionName(c, lang) : (ACTION_NAMES[id]?.name ?? id);
  };
  const highCount = knownActions.filter(a => a.strength === "high").length;
  const medCount  = knownActions.filter(a => a.strength === "medium").length;

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "10px 10px 0 0" }}
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
                {t("↗ source")}
              </a>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
            {plan.horizon ? t("Horizon: {h} · ", { h: plan.horizon }) : ""}{t(knownActions.length !== 1 ? "{n} actions matched" : "{n} action matched", { n: String(knownActions.length) })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px", flexShrink: 0 }}>
          {highCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: "600" }}>{t("{n} strong", { n: String(highCount) })}</span>
          )}
          {medCount > 0 && (
            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "4px", background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", fontWeight: "600" }}>{t("{n} moderate", { n: String(medCount) })}</span>
          )}
          <span style={{ fontSize: "16px", color: "#9CA3AF", marginLeft: "4px" }}>{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Column legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "6px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ width: "8px", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", color: "#9CA3AF", flex: 1, fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("Action")}</span>
            <ColHeader label={t("Signal type")} tip={t("The kind of policy backing found — e.g. a direct mandate (Policy action), budget allocation (Funding), institutional responsibility (Governance), inclusion in a sector strategy (Sector plan), or a link to an emissions target.")} minWidth="80px" />
            <ColHeader label={t("Policy support")} tip={t("How explicitly this plan covers the action, from 0% (no mention) to 100% (full, direct mandate). Scores above 75% are considered strong.")} minWidth="110px" align="right" />
            <ColHeader label={t("Strength")} tip={t("Overall signal quality: Strong = explicit, high-confidence coverage · Moderate = indirect or partial reference · Weak = incidental mention.")} minWidth="56px" align="right" />
            <InfoTip text={DEFS.policyStrength} />
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
                <span style={{ fontSize: "12px", color: "#374151", flex: 1, lineHeight: "1.4" }}>{nameOf(a.id)}</span>
                <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0, minWidth: "80px" }}>{t(TYPE_LABEL[a.signalType])}</span>
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
                  {t(a.strength === "high" ? "Strong" : a.strength === "medium" ? "Moderate" : "Weak")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
