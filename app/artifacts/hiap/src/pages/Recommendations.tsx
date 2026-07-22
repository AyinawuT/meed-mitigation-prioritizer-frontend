import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import {
  Inbox, Sparkles, Bookmark, Folder, SquareCheck, Factory, Users, Scale,
  Wallet, ClipboardList, Globe, BarChart3, MapPin, TriangleAlert, Star, Wind, HeartPulse, Bird, Leaf,
  HardHat, TrendingUp, HeartHandshake, BatteryCharging, Waves, Droplet,
  VolumeX, Sun, Wheat, Mountain, GraduationCap, Lightbulb, Building2, Home,
  Handshake, Bike, Trees, Brain, Recycle, CircleCheck, type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import type { PipelineResult, RankedAction } from "@/lib/scoringPipeline";
import { PIPELINE_RESULT_SCHEMA_VERSION, deriveEmissions } from "@/lib/scoringPipeline";
import { getInventoryAsEmissionsData } from "@/lib/cityInventory";
import actionsRaw from "@/data/actions.json";
import { useLanguage } from "@/lib/i18n";
import { callTranslateExplanations } from "@/lib/hiapApi";
import { callReportOutputPlan, loadSnapshot } from "@/lib/reportApi";
import { generateAndDownloadPdf } from "@/lib/reportGenerator";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";
import {
  localizedActionName, localizedActionDescription,
  reductionLevel, reductionLevelLabel, reductionLevelColor, REDUCTION_SEGMENTS,
} from "@/lib/actionDisplay";
import { computePolicyAggregates, type PolicyAggregates } from "@/lib/policyAggregates";

// Pick the timeline definition matching an action's implementation horizon.
function timelineDef(score: number | null | undefined): string {
  if (score === 1.0) return DEFS.timelineShort;
  if (score === 0.5) return DEFS.timelineMedium;
  return DEFS.timelineLong;
}

// ─── ccglobal types ────────────────────────────────────────────────────────────

type FeasibilityInputs = {
  action?: { capital_intensity?: number; preparation_complexity?: number };
  city?: { profile?: string };
  finance?: { fund_access?: string; n_reachable_opportunities?: number };
  evidence?: { n_existing_projects?: number };
};

type FeasibilityRow = {
  action_id: string;
  action_name?: string;
  sector: string | null;
  financial_feasibility: number;
  route: string | null;
  reason: string | null;
  inputs?: FeasibilityInputs | null;
  links?: { detail?: string; opportunities?: string; projects?: string } | null;
};

type Opportunity = {
  opportunity_name?: string;
  funder_name?: string;
  funder_level?: string;
  instrument?: string;
  status?: string;
  gpc_sectors?: string[];
  eligible_actor?: string[];
  source_url?: string;
  amount?: number | null;
  amount_currency?: string | null;
  amount_note?: string | null;
  notes?: string;
};

type FundingSource = {
  cycle?: string | number;
  amount?: number | null;
  amount_unit?: string;
  funder_name?: string;
};

type ActionMatch = { action_id: string; confidence?: string };

type Project = {
  project_name?: string;
  project_name_i18n?: { en?: string; es?: string };
  sector?: string;
  jurisdiction?: string;
  lifecycle_stage?: string;
  funding_channel?: string;
  cost_total?: number | null;
  amount_unit?: string;
  funding_sources?: FundingSource[];
  action_matches?: ActionMatch[];
};

// ─── Route metadata ───────────────────────────────────────────────────────────

type RouteMeta = { label: string; prefix: string; color: string; bg: string; border: string; tagline: string };

const ROUTE_DEFS: RouteMeta[] = [
  { label: "Self-deliverable",        prefix: "★", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", tagline: "Low-cost — the city can fund and run it alone." },
  { label: "Needs co-finance",        prefix: "●", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", tagline: "Cost exceeds the budget — outside funds can cover the gap." },
  { label: "Needs finance & support", prefix: "●", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", tagline: "High cost and complexity — needs funding plus outside expertise." },
];

function getRouteMeta(route: string | null): RouteMeta {
  if (!route) return { label: "Unknown", prefix: "●", color: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB", tagline: "" };
  const k = route.toLowerCase().trim();
  if (k === "self-deliverable") return ROUTE_DEFS[0];
  if (k.includes("co-finance") || k === "needs external co-finance") return ROUTE_DEFS[1];
  if (k.includes("pooling") || k.includes("ta /") || k.includes("support")) return ROUTE_DEFS[2];
  return { label: route.replace(/\b\w/g, c => c.toUpperCase()), prefix: "●", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", tagline: "" };
}

function profileToAttrs(profile: string | undefined) {
  const p = (profile ?? "").toLowerCase().replace(/_/g, "-");
  if (p.includes("delivery-ready")) return { label: "Delivery-ready city", fa: "lower", dc: "high" };
  if (p.includes("financially-strong") || p.includes("self-sufficient")) return { label: "Financially strong city", fa: "high", dc: "high" };
  if (p.includes("revenue-strong")) return { label: "Revenue-strong city", fa: "high", dc: "lower" };
  if (p.includes("capacity-rich")) return { label: "Capacity-rich city", fa: "lower", dc: "higher" };
  if (p.includes("support-ready")) return { label: "Support-ready city", fa: undefined, dc: undefined };
  return { label: profile ? `${profile.replace(/[_-]/g, " ")} city` : "City profile", fa: undefined, dc: undefined };
}

// ─── Co-benefits lookup ────────────────────────────────────────────────────────

type CoBenefitEntry = {
  impact_relationship: "positive" | "negative";
  impact_text: string;
};

type ActionCoBenefitRecord = {
  actionId: string;
  coBenefits?: Record<string, CoBenefitEntry>;
};

const actionCoBenefitsMap: Record<string, string[]> = {};
const actionBarriersMap: Record<string, string[]> = {};

// Humanize a snake_case key into a Title Case label, keeping minor words
// lowercase (e.g. cost_of_living → "Cost of Living") so the result matches the
// exact-match keys in the ES dictionary. Blindly upper-casing every word
// produced "Cost Of Living", which missed the dictionary and rendered English.
const LABEL_STOP_WORDS = new Set(["of", "and", "to", "the", "in", "for", "a", "an", "or"]);
function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w, i) => (i > 0 && LABEL_STOP_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

const rawActions = (actionsRaw as { actions: ActionCoBenefitRecord[] }).actions;
rawActions.forEach((a) => {
  if (!a.coBenefits) return;
  const pos: string[] = [];
  const neg: string[] = [];
  Object.entries(a.coBenefits).forEach(([key, val]) => {
    const label = humanizeKey(key);
    if (val.impact_relationship === "positive") pos.push(label);
    else neg.push(label);
  });
  if (pos.length) actionCoBenefitsMap[a.actionId] = pos;
  if (neg.length) actionBarriersMap[a.actionId] = neg;
});

const CO_BENEFIT_ICONS: Record<string, LucideIcon> = {
  "air quality": Wind,
  "public health": HeartPulse,
  "biodiversity": Bird,
  "habitat": Leaf,
  "employment": HardHat,
  "economic development": TrendingUp,
  "social equity": HeartHandshake,
  "energy security": BatteryCharging,
  "water management": Waves,
  "water quality": Droplet,
  "noise reduction": VolumeX,
  "urban heat": Sun,
  "food security": Wheat,
  "resilience": Mountain,
  "climate resilience": Globe,
  "gender equity": Users,
  "education": GraduationCap,
  "innovation": Lightbulb,
  "community wellbeing": Building2,
  "housing": Home,
  "cost of living": Wallet,
  "stakeholder engagement": Handshake,
  "mobility": Bike,
  "green spaces": Trees,
  "mental health": Brain,
  "waste reduction": Recycle,
};

function getCoBenefitIcon(label: string): LucideIcon {
  const lower = label.toLowerCase();
  return CO_BENEFIT_ICONS[lower] ?? CircleCheck;
}

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

function levelLabel(l: string | undefined) {
  if (!l) return "—";
  return l.charAt(0).toUpperCase() + l.slice(1);
}

function levelColor(l: string | undefined, dir: "needs" | "has") {
  const s = l?.toLowerCase() ?? "";
  if (dir === "needs") {
    if (s === "low" || s === "lower") return "#16A34A";
    if (s === "medium") return "#D97706";
    return "#DC2626";
  }
  if (s === "high" || s === "higher") return "#16A34A";
  if (s === "medium") return "#D97706";
  return "#D97706";
}

function confidenceStyle(c?: string) {
  const l = c?.toLowerCase() ?? "";
  if (l.includes("strong")) return { bg: "#D1FAE5", color: "#065F46", label: "Strong match" };
  if (l.includes("goal")) return { bg: "#CCFBF1", color: "#0F766E", label: "Goal aligned" };
  return { bg: "#DBEAFE", color: "#1D4ED8", label: "Matched" };
}

function formatClpMillions(val: number | null | undefined) {
  if (!val || val <= 0) return null;
  if (val >= 1_000_000) return `CLP ${(val / 1_000_000).toFixed(1)}T`;
  if (val >= 1_000) return `CLP ${(val / 1_000).toFixed(1)}B`;
  return `CLP ${Math.round(val)}M`;
}

function instrumentStyle(s?: string) {
  if (!s) return null;
  const l = s.toLowerCase();
  if (l.includes("technical") || l.includes(" ta")) return { bg: "#E0F2FE", color: "#0369A1", label: s };
  if (l.includes("blend")) return { bg: "#F5F3FF", color: "#7C3AED", label: s };
  if (l.includes("grant")) return { bg: "#DCFCE7", color: "#15803D", label: s };
  if (l.includes("loan") || l.includes("debt")) return { bg: "#EFF6FF", color: "#2563EB", label: s };
  return { bg: "#F3F4F6", color: "#6B7280", label: s };
}

function lifecycleStyle(s?: string) {
  const l = s?.toLowerCase() ?? "";
  if (l.includes("execut") || l.includes("progress") || l.includes("ongoing")) return { bg: "#FEF3C7", color: "#D97706" };
  if (l.includes("complet") || l.includes("finish")) return { bg: "#DCFCE7", color: "#15803D" };
  if (l.includes("plan") || l.includes("formul")) return { bg: "#DBEAFE", color: "#1D4ED8" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

// ─── Reduction potential bar (segmented) ────────────────────────────────────

function ReductionBar({ level }: { level: number }) {
  const color = reductionLevelColor(level);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: REDUCTION_SEGMENTS }, (_, i) => (
        <div
          key={i}
          style={{
            height: "5px",
            flex: 1,
            borderRadius: "3px",
            background: i < level ? color : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

// ─── Score bar (detail panel) ─────────────────────────────────────────────────

type PopoverItem = {
  label: string;
  rawValue: number;
  weight: number;
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
  const { t } = useLanguage();
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
              title={t("How this score is calculated")}
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
            {t("How {label} is calculated", { label })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 40px 52px", gap: "0 4px", marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #F0F0F4" }}>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase" }}>{t("Factor")}</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "right", textTransform: "uppercase" }}>{t("Score")}</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "center", textTransform: "uppercase" }}>{t("Wt.")}</span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "600", textAlign: "right", textTransform: "uppercase" }}>{t("Adds")}</span>
          </div>
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
                    <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "1px" }}>{item.note}</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1.5px solid #F0F0F4", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#111827", fontWeight: "700" }}>{label} =</span>
            <span style={{ fontSize: "15px", fontWeight: "800", color: barColor, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: "1px solid #F3F4F6", borderRadius: "8px", padding: "28px 20px", textAlign: "center" }}>
      <Inbox size={24} color="#D1D5DB" style={{ margin: "0 auto 8px", display: "block" }} />
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: "1.6", maxWidth: "280px", margin: "0 auto" }}>{body}</div>
    </div>
  );
}

// ─── Detail panel (right drawer) ──────────────────────────────────────────────

function DetailPanel({
  action,
  onClose,
  weights,
  feasibilityMap,
  onGenerate,
  isGenerating,
}: {
  action: RankedAction;
  onClose: () => void;
  weights: { impact: number; alignment: number; feasibility: number };
  feasibilityMap: Map<string, FeasibilityRow>;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const { t, lang } = useLanguage();
  const cobenefits = actionCoBenefitsMap[action.actionId] ?? [];
  const barriers = actionBarriersMap[action.actionId] ?? [];
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;

  const feasRow = feasibilityMap.get(action.actionId);
  const rm = getRouteMeta(action.financialFeasibilityRoute ?? feasRow?.route ?? null);

  // Fetch projects for this action from ccglobal
  const [projects, setProjects] = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(false);
  const [actionOpps, setActionOpps] = useState<Opportunity[]>([]);
  const [showAllOpps, setShowAllOpps] = useState(false);
  const [showAllProj, setShowAllProj] = useState(false);

  useEffect(() => {
    const relUrl = feasRow?.links?.projects;
    if (!relUrl) return;
    setProjLoading(true);
    fetch(`https://ccglobal.openearth.dev${relUrl}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => setProjects(res?.data ?? []))
      .catch(() => {})
      .finally(() => setProjLoading(false));
  }, [feasRow?.links?.projects]);

  // Fetch opportunities for this specific action
  useEffect(() => {
    setActionOpps([]);
    const relUrl = feasRow?.links?.opportunities;
    if (!relUrl) return;
    fetch(`https://ccglobal.openearth.dev${relUrl}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => setActionOpps(res?.data ?? []))
      .catch(() => {});
  }, [feasRow?.links?.opportunities]);

  const visibleOpps = showAllOpps ? actionOpps : actionOpps.slice(0, 2);
  const visibleProjs = showAllProj ? projects : projects.slice(0, 3);

  const timelineDesc =
    action.timelineScore === 1.0 ? t("< 5 yr (1.0)")
    : action.timelineScore === 0.5 ? t("5–10 yr (0.5)")
    : t("> 10 yr (0.0)");

  const impactDesc = t("Reduction share: {pct}% of city emissions · timeline: {timeline}", {
    pct: (action.reductionShare * 100).toFixed(1),
    timeline: timelineDesc,
  });

  const sectorMatchDesc = action.sectorComponent === 1.0 ? t("yes") : t("no");
  const alignmentDesc = t("Policy support: {policy} · sector match: {match} · strategic priorities: {priorities} · timeframe fit: {timeframe}", {
    policy: action.policyComponent.toFixed(2),
    match: sectorMatchDesc,
    priorities: action.otherComponent.toFixed(2),
    timeframe: action.timeframeComponent.toFixed(2),
  });

  const feasibilityDesc = t("Legal verdict: {legal} · mitigation feasibility: {mitigation} · financial feasibility: {financial}", {
    legal: action.softLegalComponent.toFixed(2),
    mitigation: action.socioeconomicComponent.toFixed(2),
    financial: action.financialFeasibilityComponent.toFixed(2),
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40, animation: "fadeIn 0.2s ease" }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "460px",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "600", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}
          >
            {t("← GO BACK")}
          </button>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
            {t(gpcSectorName(action.gpcRefs))}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.35" }}>
            {localizedActionName(action, lang)}
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {action.gpcRefs.map((ref) => (
              <span key={ref} style={{ fontSize: "10px", background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
                GPC {ref}
              </span>
            ))}
            <span style={{ fontSize: "10px", background: "#F5F5F7", color: "#6B7280", padding: "2px 8px", borderRadius: "4px" }}>
              ⏱ {t(tl)}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "24px 28px", flexGrow: 1, overflowY: "auto" }}>

          {/* Description */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{t("Action description")}</div>
            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0 }}>{localizedActionDescription(action, lang)}</p>
          </div>

          {/* Why this ranking */}
          {action.explanation && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{t("Why this ranking")}</div>
              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0, fontStyle: "italic" }}>{action.explanation}</p>
            </div>
          )}

          {/* Score breakdown */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>{t("Score breakdown")}</div>
            <ScoreBar
              label={t("Impact score")}
              value={action.impactScore}
              weight={weights.impact}
              barColor="#3B82F6"
              description={impactDesc}
              popoverItems={[
                { label: t("Emission coverage"), rawValue: action.reductionShare, weight: 0.8, note: t("Share of city's total emissions matched by this action") },
                { label: t("Timeline factor"), rawValue: action.timelineScore, weight: 0.2, note: action.timelineScore === 1.0 ? t("Fast implementation (< 5 years)") : action.timelineScore === 0.5 ? t("Medium implementation (5–10 years)") : t("Long implementation (> 10 years)") },
              ]}
            />
            <ScoreBar
              label={t("Alignment score")}
              value={action.alignmentScore}
              weight={weights.alignment}
              barColor="#8B5CF6"
              description={alignmentDesc}
              popoverItems={[
                { label: t("Policy support"), rawValue: action.policyComponent, weight: 0.75, note: t("How well this action is backed by national and regional policy plans") },
                { label: t("Sector match"), rawValue: action.sectorComponent, weight: 0.15, note: action.sectorComponent === 1.0 ? t("Matches your selected priority sectors") : t("Does not match selected priority sectors") },
                { label: t("Strategic priorities"), rawValue: action.otherComponent, weight: 0.05, note: t("Co-benefit overlap with your stated strategic priorities") },
                { label: t("Timeframe fit"), rawValue: action.timeframeComponent, weight: 0.05, note: action.timeframeComponent === 1.0 ? t("Action timeline exactly matches the city's preferred horizon") : action.timeframeComponent === 0.5 ? t("Action timeline is adjacent to or no preference was set") : t("Action timeline does not match the city's preferred horizon") },
              ]}
            />
            <ScoreBar
              label={t("Feasibility score")}
              value={action.feasibilityScore}
              weight={weights.feasibility}
              barColor="#16A34A"
              description={feasibilityDesc}
              popoverItems={[
                { label: t("Legal verdict"), rawValue: action.softLegalComponent, weight: 0.34, note: t("Legal verdict score from regulatory assessment") },
                { label: t("Mitigation feasibility"), rawValue: action.socioeconomicComponent, weight: 0.33, note: t("City-specific mitigation feasibility score") },
                { label: t("Financial feasibility"), rawValue: action.financialFeasibilityComponent, weight: 0.33, note: action.financialFeasibilityComponent > 0 ? t("Route: {route}", { route: (action.financialFeasibilityRoute ?? "—").replace(/_/g, " ") }) : t("No financial feasibility score available (neutral 0.5 used)") },
              ]}
            />
            <div style={{ marginTop: "6px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "#4B5563", fontVariantNumeric: "tabular-nums", lineHeight: "1.5" }}>
                {t("Final score = ({i}×{wi}) + ({a}×{wa}) + ({f}×{wf})", {
                  i: action.impactScore.toFixed(2), wi: weights.impact.toFixed(2),
                  a: action.alignmentScore.toFixed(2), wa: weights.alignment.toFixed(2),
                  f: action.feasibilityScore.toFixed(2), wf: weights.feasibility.toFixed(2),
                })}
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#16A34A", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {action.finalScore.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Co-benefits */}
          {cobenefits.length > 0 && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{t("Co-benefits")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {cobenefits.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <CircleCheck size={15} color="#16A34A" style={{ flexShrink: 0 }} /> {t(b)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade-offs */}
          {barriers.length > 0 && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{t("Trade-offs")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {barriers.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4B5563" }}>
                    <TriangleAlert size={15} color="#F59E0B" style={{ flexShrink: 0 }} /> {t(b)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 0 20px" }} />

          {/* Financial Feasibility */}
          {(action.financialFeasibilityRoute || feasRow?.route) && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                {t("Financial Feasibility")}
              </div>
              <div style={{ background: rm.bg, border: `1px solid ${rm.border}`, borderRadius: "8px", padding: "10px 14px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: rm.color, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    {rm.prefix === "★" ? <Star size={13} fill="currentColor" style={{ flexShrink: 0 }} /> : rm.prefix} {t(rm.label)}
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: rm.color, fontVariantNumeric: "tabular-nums" }}>
                    {action.financialFeasibilityComponent > 0 ? action.financialFeasibilityComponent.toFixed(2) : feasRow?.financial_feasibility?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#4B5563" }}>
                  {action.financialFeasibilityReason ?? feasRow?.reason ?? (rm.tagline ? t(rm.tagline) : "")}
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 0 20px" }} />

          {/* Fund Access */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("Fund Access")}</div>
              {actionOpps.length > 0 && (
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>
                  {t("{n} DIRECT", { n: String(feasRow?.inputs?.finance?.n_reachable_opportunities ?? actionOpps.length) })}
                </div>
              )}
            </div>

            {actionOpps.length === 0 ? (
              <EmptyState
                title={t("No direct fund matches")}
                body={t("No funding opportunities currently match this action's sector in the climate finance database. Check back as new rounds open.")}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {visibleOpps.map((opp, i) => {
                  const instrColor = instrumentStyle(opp.instrument);
                  const statusColor = opp.status === "ongoing" ? { bg: "#D1FAE5", color: "#065F46" }
                    : opp.status === "open" ? { bg: "#DBEAFE", color: "#1D4ED8" }
                    : { bg: "#F3F4F6", color: "#6B7280" };
                  const snippet = opp.amount_note ?? (opp as Record<string, unknown>).notes as string ?? "";
                  return (
                    <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "3px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0D9488", lineHeight: "1.35" }}>
                          {opp.opportunity_name ?? t("Funding opportunity")}
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          {opp.status && <span style={{ fontSize: "10px", fontWeight: "600", color: statusColor.color, background: statusColor.bg, padding: "2px 6px", borderRadius: "4px", textTransform: "capitalize" }}>{opp.status}</span>}
                          {instrColor && <span style={{ fontSize: "10px", fontWeight: "600", color: instrColor.color, background: instrColor.bg, padding: "2px 6px", borderRadius: "4px" }}>{opp.instrument}</span>}
                        </div>
                      </div>
                      {opp.funder_name && <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: snippet ? "4px" : 0 }}>{opp.funder_name}</div>}
                      {snippet && (
                        <p style={{ fontSize: "11px", color: "#4B5563", lineHeight: "1.55", margin: "0" }}>
                          {snippet.length > 160 ? snippet.slice(0, 160) + "…" : snippet}
                        </p>
                      )}
                      {opp.source_url && (
                        <a href={opp.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-block", marginTop: "8px", fontSize: "11px", fontWeight: "600", color: "#001EA7", background: "#EEF2FF", padding: "3px 8px", borderRadius: "4px", textDecoration: "none" }}>
                          {t("View fund ↗")}
                        </a>
                      )}
                    </div>
                  );
                })}
                {actionOpps.length > 2 && (
                  <button onClick={() => setShowAllOpps(v => !v)}
                    style={{ marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showAllOpps ? t("Show fewer funds") : t("Show all {n} matched funds >", { n: String(actionOpps.length) })}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 0 20px" }} />

          {/* Matched Projects */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("Matched Projects")}</div>
              {!projLoading && projects.length > 0 && (
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>
                  {t("{n} TOTAL", { n: String(projects.length) })}
                </div>
              )}
            </div>

            {projLoading ? (
              <div style={{ fontSize: "12px", color: "#9CA3AF", padding: "12px 0" }}>{t("Loading matched projects…")}</div>
            ) : !feasRow?.links?.projects ? (
              <EmptyState
                title={t("No matched projects yet")}
                body={t("No catalogued projects in the national investment system currently match this action. This updates automatically as new delivery rounds are added.")}
              />
            ) : projects.length === 0 ? (
              <EmptyState
                title={t("No matched projects yet")}
                body={t("No catalogued projects in the national investment system (BIP/SNI) or award records currently match this action. This will update automatically as new delivery rounds are added.")}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {visibleProjs.map((proj, i) => {
                  const topMatch = proj.action_matches?.[0];
                  const conf = topMatch ? confidenceStyle(topMatch.confidence) : null;
                  const lc = lifecycleStyle(proj.lifecycle_stage);
                  const cost = formatClpMillions(proj.cost_total);
                  const nameEs = proj.project_name_i18n?.es;
                  const funder = proj.funding_sources?.[0]?.funder_name;
                  return (
                    <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "2px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", lineHeight: "1.35" }}>
                          {proj.project_name ?? t("Project")}
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          {conf && <span style={{ fontSize: "10px", fontWeight: "600", color: conf.color, background: conf.bg, padding: "2px 6px", borderRadius: "4px" }}>{t(conf.label)}</span>}
                          {proj.lifecycle_stage && <span style={{ fontSize: "10px", fontWeight: "600", color: lc.color, background: lc.bg, padding: "2px 6px", borderRadius: "4px", textTransform: "capitalize" }}>{proj.lifecycle_stage.replace(/-/g, " ")}</span>}
                        </div>
                      </div>
                      {nameEs && nameEs !== proj.project_name && (
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "3px" }}>{nameEs}</div>
                      )}
                      {proj.jurisdiction && (
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} style={{ flexShrink: 0 }} /> {proj.jurisdiction}</div>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: "11px", color: "#6B7280", marginTop: "5px" }}>
                        {cost && <span>{t("Cost:")} <strong style={{ color: "#374151" }}>{cost}</strong></span>}
                        {proj.sector && <span>{t("Sector:")} <strong style={{ color: "#374151" }}>{proj.sector}</strong></span>}
                        {proj.funding_channel && <span>{t("Channel:")} <strong style={{ color: "#374151" }}>{proj.funding_channel}</strong></span>}
                        {funder && <span>{t("Funder:")} <strong style={{ color: "#374151" }}>{funder}</strong></span>}
                        {proj.funding_sources?.[0]?.cycle && <span>{t("Cycle:")} <strong style={{ color: "#374151" }}>{proj.funding_sources[0].cycle}</strong></span>}
                      </div>
                    </div>
                  );
                })}
                {projects.length > 3 && (
                  <button onClick={() => setShowAllProj(v => !v)}
                    style={{ marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showAllProj ? t("Show fewer projects") : t("Show all {n} matched projects >", { n: String(projects.length) })}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            style={{
              width: "100%", background: isGenerating ? "#6B7280" : "#001EA7", color: "white", border: "none",
              borderRadius: "8px", padding: "12px", fontSize: "13px", fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: isGenerating ? 0.85 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <span style={{ display: "inline-block", width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                {t("Generating report…")}
              </>
            ) : (
              <><Sparkles size={13} style={{ marginRight: "4px", flexShrink: 0 }} /> {t("Generate action report")}</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}

// ─── Top Pick card ────────────────────────────────────────────────────────────

function TopPickCard({
  action,
  onDetail,
  isPicked,
  onTogglePick,
  matchedProjectCount,
  onGenerate,
  isGenerating,
}: {
  action: RankedAction;
  onDetail: (a: RankedAction) => void;
  isPicked: boolean;
  onTogglePick: (id: string) => void;
  matchedProjectCount: number;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const { t, lang } = useLanguage();
  const tl = TIMELINE_LABEL[action.timelineForImplementation] ?? action.timelineForImplementation;
  const sector = gpcSectorName(action.gpcRefs);
  const displayName = localizedActionName(action, lang);
  const displayDesc = localizedActionDescription(action, lang);

  return (
    <div style={{
      background: isPicked ? "#EEF2FF" : "white", border: `1.5px solid ${isPicked ? "#001EA7" : "#E5E7EB"}`,
      borderRadius: "14px", padding: "18px 20px",
      boxShadow: isPicked ? "0 0 0 3px rgba(0,30,167,0.08)" : "0 1px 6px rgba(0,0,0,0.05)",
      display: "flex", flexDirection: "column", position: "relative",
      transition: "border-color 0.15s, box-shadow 0.15s",
    }}>
      {/* Top row: TOP PICK badge + checkbox */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Bookmark size={14} color="#001EA7" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.06em" }}>{t("TOP PICK")}</span>
        </div>
        {/* Checkbox */}
        <button
          onClick={() => onTogglePick(action.actionId)}
          title={isPicked ? t("Remove from selection") : t("Add to selection")}
          style={{
            width: "20px", height: "20px", borderRadius: "5px",
            border: `2px solid ${isPicked ? "#001EA7" : "#D1D5DB"}`,
            background: isPicked ? "#001EA7" : "white",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, flexShrink: 0,
          }}
        >
          {isPicked && <span style={{ color: "white", fontSize: "11px", fontWeight: "700", lineHeight: 1 }}>✓</span>}
        </button>
      </div>

      {/* Title */}
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", lineHeight: "1.35", marginBottom: "8px" }}>
        {displayName.length > 70 ? displayName.slice(0, 70) + "…" : displayName}
      </div>

      {/* Description */}
      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", marginBottom: "14px" }}>
        {displayDesc.length > 110 ? displayDesc.slice(0, 110) + "…" : displayDesc}
      </div>

      {/* Spacer — absorbs extra height so the bar row aligns across cards */}
      <div style={{ flex: 1 }} />

      {/* Reduction bar — 5-level scale from the action's emissions impact */}
      {(() => {
        const level = reductionLevel(action);
        return (
          <>
            <div style={{ marginBottom: "6px" }}>
              <ReductionBar level={level} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{t("Reduction potential")}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: reductionLevelColor(level) }}>
                {t(reductionLevelLabel(level))}
              </span>
            </div>
          </>
        );
      })()}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #F0F0F4", marginBottom: "12px" }} />

      {/* Metadata rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{t("Sector")}</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{t(sector)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF", display: "inline-flex", alignItems: "center" }}>{t("Timeline")}<InfoTip text={timelineDef(action.timelineScore)} /></span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{t(tl)}</span>
        </div>
      </div>

      {/* Matched projects badge — always reserves same height so footer aligns */}
      <div style={{ minHeight: "27px", marginBottom: "10px" }}>
        {matchedProjectCount > 0 && (
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#1D4ED8", background: "#EFF6FF", padding: "3px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Folder size={12} style={{ flexShrink: 0, marginRight: "2px", verticalAlign: "-1px" }} />{matchedProjectCount === 1 ? t("{n} matched project", { n: "1" }) : t("{n} matched projects", { n: String(matchedProjectCount) })}
          </span>
        )}
      </div>

      {/* See more details */}
      <button
        onClick={() => onDetail(action)}
        style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#001EA7", fontWeight: "600", textDecoration: "underline", textDecorationColor: "#BFDBFE", marginBottom: "10px" }}
      >
        {t("See more details")}
      </button>

      {/* Generate Plan button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          width: "100%",
          background: isGenerating ? "#F5F7FF" : "white",
          border: `1.5px solid ${isGenerating ? "#001EA7" : "#E5E7EB"}`,
          borderRadius: "8px", padding: "9px", fontSize: "12px", fontWeight: "700",
          color: "#001EA7", cursor: isGenerating ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "6px", letterSpacing: "0.04em",
          textTransform: "uppercase", opacity: isGenerating ? 0.8 : 1,
        }}
        onMouseOver={(e) => { if (!isGenerating) { (e.currentTarget as HTMLElement).style.borderColor = "#001EA7"; (e.currentTarget as HTMLElement).style.background = "#F5F7FF"; } }}
        onMouseOut={(e) => { if (!isGenerating) { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.background = "white"; } }}
      >
        {isGenerating ? (
          <>
            <span style={{ display: "inline-block", width: "11px", height: "11px", border: "2px solid rgba(0,30,167,0.25)", borderTopColor: "#001EA7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            {t("Generating…")}
          </>
        ) : (
          <><Sparkles size={14} style={{ flexShrink: 0 }} /> {t("Generate action report")}</>
        )}
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
  const { t, lang } = useLanguage();
  const [showDownload, setShowDownload] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setShowDownload(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function exportCsv() {
    const header = [t("Rank"), t("Action"), t("GPC Sector"), t("Reduction Potential"), t("Impact Score"), t("Alignment Score"), t("Feasibility Score"), t("Final Score")];
    const rows = actions.map(a => [
      a.rank,
      `"${localizedActionName(a, lang).replace(/"/g, '""')}"`,
      gpcSectorName(a.gpcRefs),
      t(reductionLevelLabel(reductionLevel(a))),
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
    a.download = "alm-ranked-actions.csv";
    a.click();
    URL.revokeObjectURL(url);
    setShowDownload(false);
  }

  return (
    <div id="full-ranking">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>{t("Ranked actions")}</div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            {t("All {count} actions. Select multiple for a combined concept note, or click an action name for full detail.", { count: String(actions.length) })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
            <SquareCheck size={15} style={{ flexShrink: 0 }} /> {t("Pick top actions")}
          </button>

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
              ↓ {t("Download")} <span style={{ fontSize: "10px" }}>▾</span>
            </button>
            {showDownload && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 20,
                background: "white", border: "1px solid #E5E7EB", borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: "150px",
              }}>
                <button
                  onClick={() => { alert(t("PDF export coming soon.")); setShowDownload(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", fontSize: "12px", color: "#374151", cursor: "pointer", fontWeight: "500" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#F5F5F7")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  {t("Export as PDF")}
                </button>
                <button
                  onClick={exportCsv}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", fontSize: "12px", color: "#374151", cursor: "pointer", fontWeight: "500", borderTop: "1px solid #F0F0F4" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#F5F5F7")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  {t("Export as CSV")}
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
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>{t("RANK")}</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>{t("ACTION")}</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>{t("SECTOR")}</th>
              <th style={{ padding: "10px 14px", fontSize: "11px", color: "#9CA3AF", fontWeight: "500", textAlign: "left", letterSpacing: "0.03em" }}>{t("REDUCTION POTENTIAL")}</th>
              <th style={{ padding: "10px 14px", width: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => {
              const isPicked = pickedIds.includes(action.actionId);
              return (
                <tr
                  key={action.actionId}
                  style={{ borderBottom: "1px solid #F5F5F5", background: isPicked ? "#F0F9FF" : "white", transition: "background 0.1s" }}
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
                    {localizedActionName(action, lang)}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {t(gpcSectorName(action.gpcRefs))}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {(() => {
                      const level = reductionLevel(action);
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "3px", width: "80px" }}>
                            {Array.from({ length: REDUCTION_SEGMENTS }, (_, i) => (
                              <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i < level ? reductionLevelColor(level) : "#EEF2FF" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: "11px", color: reductionLevelColor(level), fontWeight: "600" }}>
                            {t(reductionLevelLabel(level))}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => onSelect(action)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "16px", padding: "0 4px" }}
                      title={t("View details")}
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

// ─── Context Breakdown Tab ─────────────────────────────────────────────────────

function ContextBreakdownTab({
  result,
  cityName,
  citySlug,
  locode,
  feasibilityRows,
  natPolicyScore,
  policyAggregates,
  policyScoresByAction,
  navigate,
}: {
  result: PipelineResult;
  cityName: string;
  citySlug: string;
  locode: string;
  feasibilityRows: FeasibilityRow[];
  natPolicyScore: number | null;
  policyAggregates: PolicyAggregates | null;
  policyScoresByAction: Record<string, number>;
  navigate: (to: string) => void;
}) {
  const { t } = useLanguage();
  const { legalExcluded, legalFlagged, totalCityEmissions } = result;

  // Fetch city attributes for socioeconomic section
  const [cityAttrs, setCityAttrs] = useState<Record<string, { attribute_value?: number; attribute_units?: string }> | null>(null);
  useEffect(() => {
    const url = `https://ccglobal.openearth.dev/api/v0/city_attributes/${encodeURIComponent(locode)}`;
    fetch(url)
      .then(r => r.json())
      .then((json: { city?: Record<string, { attribute_value?: number; attribute_units?: string }> }) => {
        if (json.city) setCityAttrs(json.city);
      })
      .catch(() => {});
  }, [locode]);

  // Sector emissions — prefer pipeline result; fall back to local inventory (stale localStorage cache)
  const localInventoryForFallback = getInventoryAsEmissionsData(locode);
  const sectorEmissions = Object.keys(result.cityEmissionsByGpc ?? {}).length > 0
    ? result.cityEmissionsByGpc
    : localInventoryForFallback
      ? deriveEmissions(localInventoryForFallback.gpcData as Parameters<typeof deriveEmissions>[0]).byRef
      : {};
  const topGpcEntry = Object.entries(sectorEmissions).sort(([, a], [, b]) => b - a)[0];
  const topGpcSector = topGpcEntry ? t(gpcSectorName([topGpcEntry[0]])) : "—";

  // Inventory year — use pipeline result if set, else fall back to local inventory year
  const inventoryYearDisplay = result.inventoryYear
    ? String(result.inventoryYear)
    : localInventoryForFallback?.inventoryYear
      ? String(localInventoryForFallback.inventoryYear)
      : "—";

  // Socioeconomic indicators
  const indicatorCount = cityAttrs ? Object.values(cityAttrs).filter(
    (f) => typeof f === "object" && f !== null && "attribute_value" in f
  ).length : null;
  const povertyRateRaw = cityAttrs?.poverty_rate?.attribute_value;
  const populationRaw = cityAttrs?.population?.attribute_value;

  // City financial profile from feasibility rows
  const cityProfileStr = feasibilityRows[0]?.inputs?.city?.profile;
  const profAttrs = profileToAttrs(cityProfileStr);

  const statCard = (label: string, value: string | number, sub?: string, valueColor?: string) => (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "800", color: valueColor ?? "#111827", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>{sub}</div>}
    </div>
  );

  const divider = <div style={{ height: "1px", background: "#E5E7EB" }} />;

  const sectionHead = (Icon: LucideIcon, title: string) => (
    <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
      <Icon size={18} color="#001EA7" style={{ flexShrink: 0 }} /> {title}
    </div>
  );

  const viewLink = (label: string, to: string) => (
    <div style={{ marginTop: "12px" }}>
      <button onClick={() => navigate(to)}
        style={{ fontSize: "12px", color: "#001EA7", fontWeight: "600", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        {label} →
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Emissions Profile */}
      <div>
        {sectionHead(Factory, t("Emissions Profile"))}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {statCard(t("Total emissions"), `${(totalCityEmissions / 1_000_000).toFixed(2)} Mt CO₂e`)}
          {statCard(t("Top sector"), topGpcSector)}
          {statCard(t("Inventory year"), inventoryYearDisplay)}
        </div>
        {viewLink(t("View emissions data"), `/city/${citySlug}/emissions?from=recommendations`)}
      </div>

      {divider}

      {/* Socioeconomic Context */}
      <div>
        {sectionHead(Users, t("Socioeconomic Context"))}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {statCard(t("Indicators loaded"), indicatorCount !== null ? String(indicatorCount) : "—")}
          {statCard(t("Poverty rate"),
            povertyRateRaw !== undefined ? `${povertyRateRaw.toFixed(2)}%` : "—"
          )}
          {statCard(t("Population"),
            populationRaw !== undefined ? populationRaw.toLocaleString() : "—"
          )}
        </div>
        {viewLink(t("View socioeconomic data"), `/city/${citySlug}/socioeconomic?from=recommendations`)}
      </div>

      {divider}

      {/* Regulations & Laws */}
      <div>
        {sectionHead(Scale, t("Regulations & Laws"))}
        <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px", lineHeight: "1.5" }}>
          {t("Each candidate action checked against Chilean laws. Actions failing a mandatory or required check are excluded from the ranking.")}<InfoTip text={DEFS.legalStrength} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#15803D", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
              {result.validActionsCount ?? result.ranked.length}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#15803D" }}>{t("Included in ranking")}</div>
            <div style={{ fontSize: "11px", color: "#16A34A", marginTop: "2px" }}>{t("Passed legal review")}</div>
          </div>
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#DC2626", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
              {legalExcluded.length}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#DC2626" }}>{t("Excluded from ranking")}</div>
            <div style={{ fontSize: "11px", color: "#EF4444", marginTop: "2px" }}>{t("Removed before scoring")}</div>
          </div>
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#D97706", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
              {legalFlagged.length}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#D97706" }}>{t("Flagged — evidence missing")}</div>
            <div style={{ fontSize: "11px", color: "#F59E0B", marginTop: "2px" }}>{t("Included in ranking, assessment pending")}</div>
          </div>
        </div>
        {viewLink(t("View legal analysis"), `/city/${citySlug}/regulations?from=recommendations`)}
      </div>

      {divider}

      {/* Financial Feasibility */}
      <div>
        {sectionHead(Wallet, t("Financial Feasibility"))}
        {feasibilityRows.length === 0 ? (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "20px", fontSize: "13px", color: "#9CA3AF", textAlign: "center" }}>
            {t("Loading financial profile…")}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>{t("City profile")}</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>{t(profAttrs.label)}</div>
            </div>
            {profAttrs.fa && (
              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>{t("Financial autonomy")}</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: levelColor(profAttrs.fa, "has") }}>{t(levelLabel(profAttrs.fa))}</div>
              </div>
            )}
            {profAttrs.dc && (
              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>{t("Delivery capacity")}</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: levelColor(profAttrs.dc, "has") }}>{t(levelLabel(profAttrs.dc))}</div>
              </div>
            )}
          </div>
        )}
        {viewLink(t("View full financial analysis"), `/city/${citySlug}/financial-feasibility?from=recommendations`)}
      </div>

      {divider}

      {/* Policy Alignment */}
      {(() => {
        const ranked = result.ranked;
        const hasPolicyData = Object.keys(policyScoresByAction).length > 0;
        const strongBacking = hasPolicyData
          ? ranked.filter(a => (policyScoresByAction[a.actionId] ?? 0) >= 0.75).length
          : ranked.filter(a => a.policyComponent >= 0.75).length;
        const moderateBacking = hasPolicyData
          ? ranked.filter(a => { const s = policyScoresByAction[a.actionId] ?? 0; return s >= 0.5 && s < 0.75; }).length
          : ranked.filter(a => a.policyComponent >= 0.5 && a.policyComponent < 0.75).length;
        const pct = (v: number | null | undefined) =>
          v !== null && v !== undefined ? `${(v * 100).toFixed(0)}%` : "—";
        const nationalScore = policyAggregates?.national ?? natPolicyScore;
        const regionalScore = policyAggregates?.regional ?? null;
        const municipalScore = policyAggregates?.municipal ?? null;
        return (
          <div>
            {sectionHead(ClipboardList, t("Policy Alignment"))}
            <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px", lineHeight: "1.5" }}>
              {t("How well ranked actions are backed by existing national, regional and municipal policy frameworks.")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
              {statCard(t("Avg. national alignment"), pct(nationalScore), t("city-wide · all assessed actions"))}
              {statCard(t("Avg. regional alignment"), pct(regionalScore),
                regionalScore !== null ? t("across actions with regional plan coverage") : t("no regional plan coverage"))}
              {statCard(t("Avg. municipal alignment"), pct(municipalScore),
                municipalScore !== null ? t("across actions with municipal plan coverage") : t("no municipal plan coverage"))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {statCard(t("Strongly backed"), String(strongBacking), t("of {n} ranked actions · score above 75%", { n: String(ranked.length) }))}
              {statCard(t("Moderate backing"), String(moderateBacking), t("of {n} ranked actions · score 50–75%", { n: String(ranked.length) }))}
            </div>
            {viewLink(t("View policy alignment"), `/city/${citySlug}/policy?from=recommendations`)}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function Recommendations({ params }: Props) {
  const [, navigate] = useLocation();
  const { t, lang } = useLanguage();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find((c) => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;
  const countryCode = locode.slice(0, 2).toUpperCase();

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<RankedAction | null>(null);

  // Tab state — honour ?tab=context when returning from a detail page
  const search = useSearch();
  const [activeTab, setActiveTab] = useState<"results" | "context">(
    search.includes("tab=context") ? "context" : "results"
  );
  const [showFullRanking, setShowFullRanking] = useState(false);
  const rankingRef = useRef<HTMLDivElement>(null);

  // ccglobal data
  const [feasibilityRows, setFeasibilityRows] = useState<FeasibilityRow[]>([]);
  const [natPolicyScore, setNatPolicyScore] = useState<number | null>(null);
  const [policyScoresByAction, setPolicyScoresByAction] = useState<Record<string, number>>({});
  const [policyAggregates, setPolicyAggregates] = useState<PolicyAggregates | null>(null);
  const [indicatorCount, setIndicatorCount] = useState<number | null>(null);
  useEffect(() => {
    fetch(`https://ccglobal.openearth.dev/api/v0/city_attributes/${encodeURIComponent(locode)}`)
      .then(r => r.json())
      .then((json: { city?: Record<string, { attribute_value?: number }> }) => {
        if (json.city) {
          setIndicatorCount(Object.values(json.city).filter(
            f => typeof f === "object" && f !== null && "attribute_value" in f
          ).length);
        }
      })
      .catch(() => {});
  }, [locode]);

  // Read scoring weights from localStorage
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

  // Report generation state
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerateOutput(action: RankedAction) {
    const snapshot = loadSnapshot(locode);
    if (!snapshot) {
      setGenerateError("No prioritization snapshot found. Please re-run the analysis before generating a report.");
      return;
    }

    setGenerateError(null);
    setGeneratingIds(prev => [...prev, action.actionId]);

    try {
      const report = await callReportOutputPlan({
        locode,
        actionId: action.actionId,
        language: lang,
        prioritizationSnapshot: snapshot,
      });
      await generateAndDownloadPdf({
        cityName,
        actionName: localizedActionName(action, lang),
        chapters: report.chapters,
        lang,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGenerateError(msg);
    } finally {
      setGeneratingIds(prev => prev.filter(id => id !== action.actionId));
    }
  }

  async function handleGenerateMultiple() {
    const actions = pickedIds.length > 0
      ? result?.ranked.filter(a => pickedIds.includes(a.actionId)) ?? []
      : [];
    if (actions.length === 0) {
      setGenerateError("Select at least one action using the checkboxes before generating.");
      return;
    }
    for (const action of actions) {
      await handleGenerateOutput(action);
    }
  }

  // Load pipeline result from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`hiap:${locode}:results`);
      if (!raw) {
        setError("No results found. Please complete the pre-flight check and generate recommendations.");
        return;
      }
      const parsed = JSON.parse(raw) as PipelineResult;
      if ((parsed.schemaVersion ?? 0) < PIPELINE_RESULT_SCHEMA_VERSION) {
        localStorage.removeItem(`hiap:${locode}:results`);
        setError("No results found. Please complete the pre-flight check and generate recommendations.");
        return;
      }
      setResult(parsed);
    } catch {
      setError("Could not load results. Please try generating recommendations again.");
    }
  }, [locode]);

  // Fetch ccglobal opportunities + feasibility data + policy scores
  useEffect(() => {
    const base = "https://ccglobal.openearth.dev";
    const enc = encodeURIComponent(locode);
    const feasUrl   = `${base}/api/v1/cities/${enc}/climate-finance/feasibility?country_code=${countryCode}`;
    const policyUrl = `${base}/api/v1/cities/${enc}/action-policy-scores?top_evidence_limit=5`;

    Promise.all([
      fetch(feasUrl).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(policyUrl).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([feasRes, polRes]) => {
      const rows: FeasibilityRow[] = (feasRes?.data ?? []).filter(
        (r: FeasibilityRow) => typeof r.financial_feasibility === "number"
      );
      setFeasibilityRows(rows);
      if (polRes?.scores?.length) {
        const rawScores = polRes.scores as { src_action_id: string; policy_support_score: number }[];
        const byAction: Record<string, number> = {};
        for (const s of rawScores) byAction[s.src_action_id] = s.policy_support_score;
        setPolicyScoresByAction(byAction);
        const vals = rawScores.map(s => s.policy_support_score);
        setNatPolicyScore(vals.reduce((a, b) => a + b, 0) / vals.length);
        // Regional/municipal aggregates from per-action scope evidence.
        setPolicyAggregates(computePolicyAggregates(polRes.scores));
      }
    }).catch(() => {});
  }, [locode, countryCode]);

  // Translate explanations
  useEffect(() => {
    if (!result || lang === "en") return;
    const actionsWithExplanations = result.ranked.filter(a => a.explanation);
    if (actionsWithExplanations.length === 0) return;
    callTranslateExplanations(
      actionsWithExplanations.map(a => ({ actionId: a.actionId, canonicalExplanation: a.explanation })),
      [lang]
    ).then(translations => {
      const byId = new Map(translations.map(t => [t.actionId, t.explanations]));
      setResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ranked: prev.ranked.map(a => {
            const translated = byId.get(a.actionId)?.[lang];
            return translated ? { ...a, explanation: translated } : a;
          }),
        };
      });
    }).catch(() => {});
  }, [result?.ranked.length, lang]);

  // Build feasibility map for fast lookup
  const feasibilityMap = useMemo(() => {
    const m = new Map<string, FeasibilityRow>();
    for (const row of feasibilityRows) m.set(row.action_id, row);
    return m;
  }, [feasibilityRows]);

  if (error) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <div style={{ maxWidth: "760px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "#6B7280", marginBottom: "16px" }}>{t(error)}</p>
          <button onClick={() => navigate(`/city/${citySlug}/preflight`)} style={{ padding: "10px 24px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            {t("← Back to pre-flight")}
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
          <p style={{ color: "#6B7280" }}>{t("Loading results…")}</p>
        </div>
      </div>
    );
  }

  const { ranked, discarded, legalExcluded, totalCityEmissions } = result;
  const legalFlagged = result.legalFlagged ?? [];

  // Top 3 always come from the pipeline ranking
  const displayTop = ranked.slice(0, 3);

  function togglePick(id: string) {
    setPickedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  }

  function handleBrowseFullRanking() {
    setShowFullRanking(true);
    setTimeout(() => {
      rankingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  // Aggregate co-benefits across top picks
  const cobMap: Record<string, number> = {};
  for (const action of displayTop) {
    const cbs = actionCoBenefitsMap[action.actionId] ?? [];
    for (const cb of cbs) {
      cobMap[cb] = (cobMap[cb] ?? 0) + 1;
    }
  }
  const topCoBenefits = Object.entries(cobMap).sort(([, a], [, b]) => b - a).slice(0, 6);

  // Context cards data
  const topGpcEntry = Object.entries(result.cityEmissionsByGpc ?? {}).sort(([, a], [, b]) => b - a)[0];
  const topGpcSector = topGpcEntry ? gpcSectorName([topGpcEntry[0]]) : null;

  const genCount = pickedIds.length > 0 ? pickedIds.length : displayTop.length;

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <Navbar cityName={cityName} />

      {/* Generate-output error banner */}
      {generateError && (
        <div style={{
          position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
          background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
          padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
          zIndex: 100, maxWidth: "580px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <TriangleAlert size={16} color="#991B1B" style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>{t(generateError)}</span>
          <button
            onClick={() => setGenerateError(null)}
            style={{ marginLeft: "auto", flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "#991B1B", fontSize: "16px", padding: "0 0 0 8px", lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {selectedAction && (
        <DetailPanel
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          weights={effectiveWeights}
          feasibilityMap={feasibilityMap}
          onGenerate={() => handleGenerateOutput(selectedAction)}
          isGenerating={generatingIds.includes(selectedAction.actionId)}
        />
      )}

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", cursor: "pointer", fontSize: "12px" }}>
              {t("Cities")}
            </button>
            {" › "}{cityName}{" › "}{t("Mitigation actions")}
          </div>

          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
                {t("Top mitigation actions for {name}", { name: cityName })}
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                {ranked.length} {t("actions ranked")} · {legalExcluded.length} {t("excluded (legal filter)")} · {t("Total city emissions")} {(totalCityEmissions / 1_000_000).toFixed(2)} Mt CO₂e
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={handleGenerateMultiple}
                disabled={generatingIds.length > 0 || pickedIds.length === 0}
                style={{
                  background: (generatingIds.length > 0 || pickedIds.length === 0) ? "#6B7280" : "#001EA7",
                  color: "white", border: "none", borderRadius: "8px",
                  padding: "10px 20px", fontSize: "12px", fontWeight: "700",
                  cursor: (generatingIds.length > 0 || pickedIds.length === 0) ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: "8px",
                  opacity: pickedIds.length === 0 ? 0.5 : 1,
                }}
              >
                {generatingIds.length > 0 ? (
                  <>
                    <span style={{ display: "inline-block", width: "11px", height: "11px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    {generatingIds.length > 1 ? t("Generating {n} reports…", { n: String(generatingIds.length) }) : t("Generating report…")}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                    {t("Generate multi-action report")}
                  </>
                )}
              </button>
              {pickedIds.length === 0 && (
                <span style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "right", maxWidth: "220px", lineHeight: "1.4" }}>
                  {t("Select multiple actions from the list to create a combined report.")}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", marginTop: "20px", borderBottom: "none" }}>
            {(["results", "context"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px", fontSize: "13px", fontWeight: "600",
                  background: "none", border: "none", cursor: "pointer",
                  color: activeTab === tab ? "#001EA7" : "#6B7280",
                  borderBottom: `2px solid ${activeTab === tab ? "#001EA7" : "transparent"}`,
                  marginBottom: "-1px",
                  letterSpacing: "0.01em",
                }}
              >
                {tab === "results" ? t("Results overview") : t("Context breakdown")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 48px 64px" }}>

        {/* ─── Results overview tab ─────────────────────────────────────────── */}
        {activeTab === "results" && (
          <>
            {/* Top picks section */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                    {t("Top actions for {name}", { name: cityName })}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px" }}>
                    {t("Highest-ranked actions based on {name}'s data and priorities. Check a card to select it for output generation.", { name: cityName })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={handleBrowseFullRanking}
                    style={{ fontSize: "12px", color: "#001EA7", fontWeight: "600", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {t("See full ranking ↓")}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(displayTop.length, 3)}, 1fr)`, gap: "14px" }}>
                {displayTop.map((action) => (
                  <TopPickCard
                    key={action.actionId}
                    action={action}
                    onDetail={setSelectedAction}
                    isPicked={pickedIds.includes(action.actionId)}
                    onTogglePick={togglePick}
                    matchedProjectCount={feasibilityMap.get(action.actionId)?.inputs?.evidence?.n_existing_projects ?? 0}
                    onGenerate={() => handleGenerateOutput(action)}
                    isGenerating={generatingIds.includes(action.actionId)}
                  />
                ))}
              </div>
            </div>

            {/* Top co-benefits section */}
            {topCoBenefits.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                    {t("Top co-benefits across these actions")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {t("What these top picks deliver beyond emissions reduction.")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {topCoBenefits.map(([cb, count]) => (
                    <div key={cb} style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "8px", background: "white", border: "1px solid #E5E7EB",
                      borderRadius: "10px", padding: "16px 12px", textAlign: "center",
                    }}>
                      {(() => { const CbIcon = getCoBenefitIcon(cb); return <CbIcon size={26} color="#001EA7" strokeWidth={1.75} />; })()}
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{t(cb)}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                        {t("{count} of {total} top actions", { count: String(count), total: String(displayTop.length) })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* City context used for this ranking */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {t("City context used for this ranking")}
                </div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {t("The data behind every score. Click any card to see the full breakdown.")}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {/* Emissions profile */}
                <button
                  onClick={() => setActiveTab("context")}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><Globe size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Emissions profile")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>{t("{v} Mt CO₂e total · {n} sectors", { v: (totalCityEmissions / 1_000_000).toFixed(2), n: String(new Set(Object.keys(result.cityEmissionsByGpc ?? {}).map(k => k.split('.')[0])).size) })}</div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>

                {/* Socioeconomic */}
                <button
                  onClick={() => setActiveTab("context")}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><Users size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Socioeconomic indicators")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>{indicatorCount !== null ? t("{n} indicators loaded", { n: String(indicatorCount) }) : t("Loading…")}</div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>

                {/* Legal context */}
                <button
                  onClick={() => setActiveTab("context")}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><Scale size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Legal context")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>{t("{a} included · {b} excluded · {c} flagged", { a: String(result.validActionsCount ?? ranked.length), b: String(legalExcluded.length), c: String(legalFlagged.length) })}</div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>

                {/* Financial context */}
                <button
                  onClick={() => setActiveTab("context")}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><Wallet size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Financial context")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>
                    {feasibilityRows.length > 0 ? t(profileToAttrs(feasibilityRows[0]?.inputs?.city?.profile).label) : t("Loading…")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>

                {/* Policy alignment */}
                <button
                  onClick={() => setActiveTab("context")}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><ClipboardList size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Policy alignment")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>
                    {natPolicyScore !== null ? t("{n}% national alignment", { n: String(Math.round(natPolicyScore * 100)) }) : t("Loading…")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>

                {/* Full ranking */}
                <button
                  onClick={handleBrowseFullRanking}
                  style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.1s", display: "flex", flexDirection: "column" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#001EA7")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                >
                  <div style={{ marginBottom: "8px" }}><BarChart3 size={20} color="#001EA7" /></div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{t("Full ranking")}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>{t("{n} actions ranked", { n: String(ranked.length) })}</div>
                  <div style={{ fontSize: "11px", color: "#001EA7", fontWeight: "600", marginTop: "auto" }}>{t("View details →")}</div>
                </button>
              </div>
            </div>

            {/* Next steps banner */}
            <div style={{
              background: "#001EA7", borderRadius: "12px", padding: "24px 28px",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px",
              marginBottom: "36px",
            }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "white", marginBottom: "6px" }}>{t("Next steps")}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.55", maxWidth: "520px" }}>
                  {pickedIds.length >= 2
                    ? t("{n} actions selected for a combined generated output. Use \"Generate action report\" on any single card for a one-off note instead.", { n: String(pickedIds.length) })
                    : t("Select more than one action for a combined generated output, or use \"Generate action report\" on any single card for a one-off note instead.")}
                </div>
              </div>
              <button
                onClick={handleBrowseFullRanking}
                style={{
                  background: "white", color: "#001EA7", border: "none", borderRadius: "8px",
                  padding: "10px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {t("Browse full ranking ↓")}
              </button>
            </div>

            {/* Full ranking table (toggled) */}
            {showFullRanking && (
              <div ref={rankingRef}>
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
                  <details style={{ marginTop: "28px" }}>
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
            )}
          </>
        )}

        {/* ─── Context breakdown tab ────────────────────────────────────────── */}
        {activeTab === "context" && (
          <ContextBreakdownTab
            result={result}
            cityName={cityName}
            citySlug={citySlug}
            locode={locode}
            feasibilityRows={feasibilityRows}
            natPolicyScore={natPolicyScore}
            policyAggregates={policyAggregates}
            policyScoresByAction={policyScoresByAction}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
