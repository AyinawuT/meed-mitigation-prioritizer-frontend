import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Info, Inbox, Star, Landmark, MapPin, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLanguage } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

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

function RoutePrefix({ prefix, size = 12 }: { prefix: string; size?: number }) {
  if (prefix === "★") return <Star size={size} fill="currentColor" style={{ flexShrink: 0, verticalAlign: "middle" }} />;
  return <>{prefix}</>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectorLabel(s: string | null | undefined) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function scoreColor(v: number) {
  if (v >= 0.7) return "#16A34A";
  if (v >= 0.4) return "#D97706";
  return "#9CA3AF";
}

function numericToLevel(v: number | undefined): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (v <= 0.33) return "low";
  if (v <= 0.67) return "medium";
  return "high";
}

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

function levelPct(l: string | undefined) {
  const map: Record<string, number> = { low: 20, lower: 30, medium: 50, high: 80, higher: 95 };
  return map[l?.toLowerCase() ?? ""] ?? 50;
}

// Map city profile string from API to display attributes
function profileToAttrs(profile: string | undefined) {
  // Normalise: lowercase + replace underscores with hyphens so "delivery_ready" == "delivery-ready"
  const p = (profile ?? "").toLowerCase().replace(/_/g, "-");
  if (p.includes("delivery-ready") || p === "delivery-ready") {
    return { type: "delivery-ready" as const, label: "Delivery-ready city", fa: "lower", dc: "high", desc: "{city} relies more on central transfers than its own revenue, but has the staff and track record to run projects well once funded." };
  }
  if (p.includes("financially-strong") || p.includes("self-sufficient")) {
    return { type: "financially-strong" as const, label: "Financially strong city", fa: "high", dc: "high", desc: "{city} generates strong local revenue and has the institutional capacity to plan and deliver most projects independently." };
  }
  if (p.includes("revenue-strong")) {
    return { type: "revenue-strong" as const, label: "Revenue-strong city", fa: "high", dc: "lower", desc: "{city} generates significant local revenue but may need to build delivery capacity to implement more complex projects." };
  }
  if (p.includes("capacity-rich")) {
    return { type: "capacity-rich" as const, label: "Capacity-rich city", fa: "lower", dc: "higher", desc: "{city} has strong institutional capacity but depends heavily on central transfers to fund project delivery." };
  }
  return { type: "other" as const, label: profile ? `${profile} city` : "Transitioning city", fa: undefined, dc: undefined, desc: "{city} is building its financial and delivery capacity, and may need external support for larger-scale projects." };
}

// cost_total is in CLP millions per the API (amount_unit: "CLP_millions")
function formatClpMillions(val: number | null | undefined) {
  if (!val || val <= 0) return null;
  if (val >= 1_000_000) return `CLP ${(val / 1_000_000).toFixed(1)}T`;
  if (val >= 1_000) return `CLP ${(val / 1_000).toFixed(1)}B`;
  return `CLP ${Math.round(val)}M`;
}

function confidenceStyle(c?: string) {
  const l = c?.toLowerCase() ?? "";
  if (l.includes("strong")) return { bg: "#D1FAE5", color: "#065F46", label: "Strong match" };
  if (l.includes("goal")) return { bg: "#CCFBF1", color: "#0F766E", label: "Goal aligned" };
  return { bg: "#DBEAFE", color: "#1D4ED8", label: "Matched" };
}

function lifecycleStyle(s?: string) {
  const l = s?.toLowerCase() ?? "";
  if (l.includes("execut") || l.includes("progress") || l.includes("ongoing")) return { bg: "#FEF3C7", color: "#D97706" };
  if (l.includes("complet") || l.includes("finish")) return { bg: "#DCFCE7", color: "#15803D" };
  if (l.includes("plan") || l.includes("formul")) return { bg: "#DBEAFE", color: "#1D4ED8" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function instrumentStyle(s?: string) {
  if (!s) return null;
  const l = s.toLowerCase();
  if (l.includes("technical") || l.includes(" ta")) return { bg: "#E0F2FE", color: "#0369A1", label: s };
  if (l.includes("blend")) return { bg: "#F5F3FF", color: "#7C3AED", label: s };
  if (l.includes("grant")) return { bg: "#DCFCE7", color: "#15803D", label: s };
  if (l.includes("loan") || l.includes("debt")) return { bg: "#EFF6FF", color: "#2563EB", label: s };
  return { bg: "#F3F4F6", color: "#6B7280", label: s };
}

// ─── InfoTooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  }
  function hide() { setPos(null); }

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", marginLeft: "4px", cursor: "default" }}
    >
      <Info size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />
      {pos && (
        <span style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          transform: "translate(-50%, -100%)",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "10px 12px",
          width: "260px",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          fontSize: "12px",
          color: "#374151",
          lineHeight: "1.6",
          fontWeight: "400",
          pointerEvents: "none",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: "1px solid #F3F4F6", borderRadius: "8px", padding: "32px 20px", textAlign: "center" }}>
      <Inbox size={28} color="#D1D5DB" style={{ margin: "0 auto 10px", display: "block" }} />
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>{body}</div>
    </div>
  );
}

// ─── CityProfileCard ──────────────────────────────────────────────────────────

function CityProfileCard({ cityName, profileLabel, profileDesc, profileType, fa, dc }: {
  cityName: string; profileLabel: string; profileDesc: string;
  profileType?: string; fa?: string; dc?: string;
}) {
  const { t } = useLanguage();
  const isDeliveryReady = profileType === "delivery-ready";
  const bg       = isDeliveryReady ? "#F0FDF4" : "#EFF6FF";
  const iconBg   = isDeliveryReady ? "#DCFCE7" : "#DBEAFE";
  const titleColor = isDeliveryReady ? "#15803D" : "#1D4ED8";
  const descColor  = isDeliveryReady ? "#166534" : "#1E40AF";

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px 24px", marginBottom: "32px" }}>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
        {t("{city}'s financial profile", { city: cityName })}
      </div>

      {/* City type */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: bg, borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Landmark size={18} color={titleColor} style={{ flexShrink: 0 }} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: titleColor, marginBottom: "4px" }}>{t(profileLabel)}</div>
          <div style={{ fontSize: "12px", color: descColor, lineHeight: "1.55" }}>{profileDesc}</div>
        </div>
      </div>

      {/* Factors */}
      <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
        {t("Four factors determine an action's financial route")}
      </div>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
        {t("Each action's cost and complexity are weighed against what {city} can fund and deliver.", { city: cityName })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
        {/* Headers */}
        <div style={{ padding: "8px 14px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("What the action needs")}</span>
        </div>
        <div style={{ padding: "8px 14px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("What {city} has", { city: cityName })}</span>
        </div>

        {/* Row 1 */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "2px", display: "flex", alignItems: "center" }}>
            {t("Capital intensity")}
            <InfoTooltip text={t("How much money the action typically requires to implement, based on similar actions delivered elsewhere. Varies per action.")} />
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{t("Varies per action")}</div>
        </div>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "flex", alignItems: "center" }}>
            {t("Financial autonomy")}
            <InfoTooltip text={t("Share of {city}'s budget raised locally rather than received from national transfers. Lower autonomy means less room to self-fund.", { city: cityName })} />
          </div>
          {fa ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, background: "#EBEBEB", borderRadius: "4px", height: "6px" }}>
                <div style={{ background: levelColor(fa, "has"), width: `${levelPct(fa)}%`, height: "6px", borderRadius: "4px" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: levelColor(fa, "has"), minWidth: "46px" }}>{t(levelLabel(fa))}</span>
            </div>
          ) : (
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{t("Varies per city")}</div>
          )}
        </div>

        {/* Row 2 */}
        <div style={{ padding: "12px 14px", borderRight: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "2px", display: "flex", alignItems: "center" }}>
            {t("Preparation complexity")}
            <InfoTooltip text={t("How much planning, technical design, or specialist input the action needs before it can start. Varies by action.")} />
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{t("Varies per action")}</div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "flex", alignItems: "center" }}>
            {t("Delivery capacity")}
            <InfoTooltip text={t("Whether {city} has enough qualified staff to plan, procure and run a project once it's financed.", { city: cityName })} />
          </div>
          {dc ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, background: "#EBEBEB", borderRadius: "4px", height: "6px" }}>
                <div style={{ background: levelColor(dc, "has"), width: `${levelPct(dc)}%`, height: "6px", borderRadius: "4px" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: levelColor(dc, "has"), minWidth: "46px" }}>{t(levelLabel(dc))}</span>
            </div>
          ) : (
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{t("Varies per city")}</div>
          )}
        </div>
      </div>

      {/* What this means */}
      <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
        {t("What this means for actions")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        {ROUTE_DEFS.map((r, i) => (
          <div key={i} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: r.color, marginBottom: "4px" }}><RoutePrefix prefix={r.prefix} size={12} /> {t(r.label)}</div>
            <div style={{ fontSize: "11px", color: "#4B5563", lineHeight: "1.5" }}>{t(r.tagline)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Pane ──────────────────────────────────────────────────────────────

function DetailPane({ row, cityName, onClose }: {
  row: FeasibilityRow;
  cityName: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const rm = getRouteMeta(row.route);
  const inp = row.inputs ?? {};
  const ciLevel = numericToLevel(inp.action?.capital_intensity);
  const pcLevel = numericToLevel(inp.action?.preparation_complexity);
  const profAttrs = profileToAttrs(inp.city?.profile);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(true);
  const [actionOpps, setActionOpps] = useState<Opportunity[]>([]);
  const [showAllOpps, setShowAllOpps] = useState(false);
  const [showAllProj, setShowAllProj] = useState(false);

  // Fetch projects for this specific action
  useEffect(() => {
    setProjLoading(true);
    setProjects([]);
    const relUrl = row.links?.projects;
    if (!relUrl) { setProjLoading(false); return; }
    fetch(`https://ccglobal.openearth.dev${relUrl}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => setProjects(res?.data ?? []))
      .catch(() => {})
      .finally(() => setProjLoading(false));
  }, [row.action_id]);

  // Fetch opportunities for this specific action
  useEffect(() => {
    setActionOpps([]);
    const relUrl = row.links?.opportunities;
    if (!relUrl) return;
    fetch(`https://ccglobal.openearth.dev${relUrl}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => setActionOpps(res?.data ?? []))
      .catch(() => {});
  }, [row.action_id]);

  const visibleOpps = showAllOpps ? actionOpps : actionOpps.slice(0, 2);
  const visibleProjs = showAllProj ? projects : projects.slice(0, 3);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 40 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(560px, 56vw)",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 32px rgba(0,0,0,0.14)",
        fontFamily: "Inter, system-ui, sans-serif",
        animation: "slideIn 0.2s ease",
      }}>
        <div style={{ padding: "20px 28px 40px" }}>

          {/* Close */}
          <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", color: "#374151", background: "none", border: "none", cursor: "pointer", padding: "0 0 16px 0" }}>
            {t("← Close")}
          </button>

          {/* Sector + title */}
          {row.sector && (
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              {sectorLabel(row.sector)}
            </div>
          )}
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 16px", lineHeight: "1.3" }}>
            {row.action_name ?? row.action_id}
          </h2>

          {/* Route card */}
          <div style={{ background: rm.bg, border: `1px solid ${rm.border}`, borderRadius: "8px", padding: "10px 14px 12px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: rm.color }}><RoutePrefix prefix={rm.prefix} size={13} /> {t(rm.label)}</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: rm.color, fontVariantNumeric: "tabular-nums" }}>
                {row.financial_feasibility.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#4B5563" }}>{row.reason ?? t(rm.tagline)}</div>
          </div>

          {/* Factor breakdown */}
          {(ciLevel || pcLevel || profAttrs.fa || profAttrs.dc) && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                {t("What determined this route")}
              </div>

              {(ciLevel || pcLevel) && (
                <>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px" }}>{t("What the action needs")}</div>
                  {ciLevel && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "inline-flex", alignItems: "center" }}>
                        {t("Capital intensity")}
                        <InfoTooltip text={t("How much money the action typically requires to implement, based on similar actions delivered elsewhere. Varies per action.")} />
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: levelColor(ciLevel, "needs") }}>{t(levelLabel(ciLevel))}</span>
                    </div>
                  )}
                  {pcLevel && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "inline-flex", alignItems: "center" }}>
                        {t("Preparation complexity")}
                        <InfoTooltip text={t("How much planning, technical design, or specialist input the action needs before it can start. Varies by action.")} />
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: levelColor(pcLevel, "needs") }}>{t(levelLabel(pcLevel))}</span>
                    </div>
                  )}
                </>
              )}

              {(profAttrs.fa || profAttrs.dc) && (
                <>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px" }}>{t("What {city} has", { city: cityName })}</div>
                  {profAttrs.fa && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "inline-flex", alignItems: "center" }}>
                        {t("Financial autonomy")}
                        <InfoTooltip text={t("Share of {city}'s budget raised locally rather than received from national transfers. Lower autonomy means less room to self-fund.", { city: cityName })} />
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: levelColor(profAttrs.fa, "has") }}>{t(levelLabel(profAttrs.fa))}</span>
                    </div>
                  )}
                  {profAttrs.dc && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "inline-flex", alignItems: "center" }}>
                        {t("Delivery capacity")}
                        <InfoTooltip text={t("Whether {city} has enough qualified staff to plan, procure and run a project once it's financed.", { city: cityName })} />
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: levelColor(profAttrs.dc, "has") }}>{t(levelLabel(profAttrs.dc))}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 0 20px" }} />

          {/* Fund access */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("Fund Access")}</div>
              {actionOpps.length > 0 && (
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>
                  {t("{n} DIRECT", { n: String(inp.finance?.n_reachable_opportunities ?? actionOpps.length) })}
                </div>
              )}
            </div>

            {actionOpps.length === 0 ? (
              <EmptyState
                title={t("No matched funds yet")}
                body={t("No catalogued funds in the national investment system (BIP/SNI) or award records currently match this action. This will update automatically as new delivery rounds are added.")}
              />
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {visibleOpps.map((opp, i) => {
                    const statusColor = opp.status === "ongoing" ? { bg: "#D1FAE5", color: "#065F46" }
                      : opp.status === "open" ? { bg: "#DBEAFE", color: "#1D4ED8" }
                      : { bg: "#F3F4F6", color: "#6B7280" };
                    const instrColor = instrumentStyle(opp.instrument);
                    const snippet = opp.amount_note ?? opp.notes ?? "";
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
                </div>
                {actionOpps.length > 2 && (
                  <button onClick={() => setShowAllOpps(v => !v)}
                    style={{ marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showAllOpps ? t("Show fewer funds") : t("Show all {n} matched funds >", { n: String(actionOpps.length) })}
                  </button>
                )}
              </>
            )}
          </div>

          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 0 20px" }} />

          {/* Matched projects */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("Matched Projects")}</div>
              {!projLoading && projects.length > 0 && (
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>
                  {t("{n} TOTAL", { n: String(projects.length) })}
                </div>
              )}
            </div>

            {projLoading ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "12px" }}>{t("Loading…")}</div>
            ) : projects.length === 0 ? (
              <EmptyState
                title={t("No matched projects yet")}
                body={t("No catalogued projects in the national investment system (BIP/SNI) or award records currently match this action. This will update automatically as new delivery rounds are added.")}
              />
            ) : (
              <>
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
                          <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}><MapPin size={12} color="#6B7280" style={{ flexShrink: 0 }} /> {proj.jurisdiction}</div>
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
                </div>
                {projects.length > 3 && (
                  <button onClick={() => setShowAllProj(v => !v)}
                    style={{ marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showAllProj ? t("Show fewer projects") : t("Show all {n} matched projects >", { n: String(projects.length) })}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function TableRow({ row, onView }: { row: FeasibilityRow; onView: () => void }) {
  const { t } = useLanguage();
  const rm = getRouteMeta(row.route);
  const fc = row.inputs?.finance?.n_reachable_opportunities ?? 0;
  return (
    <tr style={{ borderBottom: "1px solid #F3F4F6" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: "500", color: "#111827", lineHeight: "1.4", verticalAlign: "middle" }}>
        {row.action_name ?? row.action_id}
      </td>
      <td style={{ padding: "11px 12px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap", verticalAlign: "middle" }}>
        {sectorLabel(row.sector)}
      </td>
      <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: rm.color, background: rm.bg, border: `1px solid ${rm.border}`, padding: "3px 9px", borderRadius: "20px", whiteSpace: "nowrap" }}>
          <RoutePrefix prefix={rm.prefix} size={11} /> {t(rm.label)}
        </span>
      </td>
      <td style={{ padding: "11px 12px", fontSize: "13px", fontWeight: "700", color: scoreColor(row.financial_feasibility), textAlign: "right", fontVariantNumeric: "tabular-nums", verticalAlign: "middle" }}>
        {row.financial_feasibility.toFixed(2)}
      </td>
      <td style={{ padding: "11px 12px", fontSize: "12px", verticalAlign: "middle" }}>
        {fc > 0 ? <><strong style={{ color: "#374151" }}>{fc}</strong> <span style={{ color: "#9CA3AF" }}>{t("direct")}</span></> : <span style={{ color: "#D1D5DB" }}>—</span>}
      </td>
      <td style={{ padding: "11px 16px", verticalAlign: "middle" }}>
        <button onClick={onView} style={{ fontSize: "12px", fontWeight: "600", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
          {t("View ↗")}
        </button>
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function Pagination({ total, page, onChange }: { total: number; page: number; onChange: (p: number) => void }) {
  const { t } = useLanguage();
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;

  const getPages = (): (number | "…")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", pages];
    if (page >= pages - 3) return [1, "…", pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, "…", page - 1, page, page + 1, "…", pages];
  };

  const base: React.CSSProperties = { fontSize: "12px", fontWeight: "600", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "5px 10px", minWidth: "32px", background: "none" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "14px 0" }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ ...base, color: page === 1 ? "#D1D5DB" : "#374151", cursor: page === 1 ? "default" : "pointer" }}>{t("Prev")}</button>
      {getPages().map((p, i) => (
        <button key={i} onClick={() => typeof p === "number" && onChange(p)} disabled={p === "…"}
          style={{ ...base, color: p === page ? "white" : p === "…" ? "#9CA3AF" : "#374151", background: p === page ? "#001EA7" : "none", border: p === page ? "1px solid #001EA7" : "1px solid #E5E7EB", cursor: p === "…" ? "default" : "pointer" }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        style={{ ...base, color: page === pages ? "#D1D5DB" : "#374151", cursor: page === pages ? "default" : "pointer" }}>{t("Next")}</button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function FinancialFeasibility({ params }: Props) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromRecommendations = search.includes("from=recommendations");
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(c => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = urlLocode;
  const cityName = city?.name ?? locode;
  const countryCode = locode.slice(0, 2).toUpperCase();

  const [feasibility, setFeasibility] = useState<FeasibilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FeasibilityRow | null>(null);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setStepProgress(locode, "financial-feasibility", { visited: true });
    const base = "https://ccglobal.openearth.dev";
    const enc = encodeURIComponent(locode);
    const feasUrl = `${base}/api/v1/cities/${enc}/climate-finance/feasibility?country_code=${countryCode}`;

    fetch(feasUrl).then(r => r.ok ? r.json() : null).catch(() => null)
      .then((feasRes) => {
        const rows: FeasibilityRow[] = (feasRes?.data ?? []).filter(
          (r: FeasibilityRow) => typeof r.financial_feasibility === "number"
        );
        rows.sort((a, b) => b.financial_feasibility - a.financial_feasibility);
        setFeasibility(rows);
        if (rows.length > 0) setStepProgress(locode, "financial-feasibility", { visited: true, progress: 100, sub: `${rows.length} actions assessed` });
      }).catch(() => setError("Could not load financial feasibility data."))
        .finally(() => setLoading(false));
  }, [locode, countryCode]);

  // City profile (from first row's inputs)
  const cityProfileStr = feasibility[0]?.inputs?.city?.profile;
  const profAttrs = profileToAttrs(cityProfileStr);

  const routeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of feasibility) { const k = r.route ?? ""; if (k) m[k] = (m[k] ?? 0) + 1; }
    return m;
  }, [feasibility]);

  const routes = useMemo(() => Array.from(new Set(feasibility.map(r => r.route ?? "").filter(Boolean))), [feasibility]);

  const sectors = useMemo(() =>
    Array.from(new Set(feasibility.map(r => r.sector ?? "").filter(Boolean))).sort(),
    [feasibility]
  );

  const filtered = useMemo(() => feasibility.filter(r =>
    (!activeRoute  || r.route   === activeRoute) &&
    (!activeSector || r.sector  === activeSector)
  ), [feasibility, activeRoute, activeSector]);

  useEffect(() => { setPage(1); }, [activeRoute, activeSector]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <StepBar activeStep={5} citySlug={citySlug} />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 48px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>{t("Loading financial feasibility data…")}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />
      <StepBar activeStep={5} citySlug={citySlug} />

      {selected && (
        <DetailPane
          row={selected}
          cityName={cityName}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {t("Cities")}
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {cityName}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>{t("Financial Feasibility")}</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 8px" }}>{t("Financial Feasibility")}</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 10px", maxWidth: "720px", lineHeight: "1.65" }}>
            {t("For every action, the tool compares what the action needs (capital and preparation) against what {city} has (budget autonomy and delivery capacity) to estimate how realistically the city can finance and deliver it — and which funds could help close the gap.", { city: cityName })}
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: "6px", padding: "5px 12px",
              fontSize: "11px", color: "#15803D", fontWeight: "600",
            }}>
              <Wallet size={14} color="#15803D" style={{ flexShrink: 0 }} />
              <span>{t("ALM FEASIBILITY: Financial feasibility shapes 33% of feasibility score · Feasibility shapes 23% of ranking")}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 48px 64px" }}>
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: "#DC2626" }}>
            {t(error)}
          </div>
        )}

        {/* City profile */}
        {feasibility.length > 0 && (
          <CityProfileCard
            cityName={cityName}
            profileLabel={profAttrs.label}
            profileDesc={t(profAttrs.desc, { city: cityName })}
            profileType={profAttrs.type}
            fa={profAttrs.fa}
            dc={profAttrs.dc}
          />
        )}

        {/* Section */}
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>
          {t("What's financially aligned — and what isn't")}
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px", lineHeight: "1.6" }}>
          {t("Filter by financial route to see what's feasible now versus what needs outside support, or narrow by sector. Click View for full reasoning per action.")}
        </p>

        {/* Filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <button onClick={() => setActiveRoute(null)}
            style={{ fontSize: "13px", fontWeight: "600", color: activeRoute === null ? "white" : "#374151", background: activeRoute === null ? "#001EA7" : "white", border: `1.5px solid ${activeRoute === null ? "#001EA7" : "#E5E7EB"}`, borderRadius: "20px", padding: "5px 14px", cursor: "pointer" }}>
            {t("All")}
          </button>
          {routes.map(route => {
            const rm = getRouteMeta(route);
            const isActive = activeRoute === route;
            const cnt = routeCounts[route] ?? 0;
            return (
              <button key={route} onClick={() => setActiveRoute(isActive ? null : route)}
                style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "600", color: isActive ? "white" : rm.color, background: isActive ? rm.color : rm.bg, border: `1.5px solid ${isActive ? rm.color : rm.border}`, borderRadius: "20px", padding: "5px 14px", cursor: "pointer" }}>
                <span><RoutePrefix prefix={rm.prefix} size={13} /></span><span>{t(rm.label)}</span><span style={{ opacity: 0.8 }}>{cnt}</span>
              </button>
            );
          })}
          {sectors.length > 0 && (
            <select
              value={activeSector ?? ""}
              onChange={e => setActiveSector(e.target.value || null)}
              style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "600", color: activeSector ? "#001EA7" : "#374151", backgroundColor: activeSector ? "#EEF2FF" : "white", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", border: `1.5px solid ${activeSector ? "#001EA7" : "#E5E7EB"}`, borderRadius: "20px", padding: "5px 28px 5px 14px", cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none" }}
            >
              <option value="">{t("All sectors")}</option>
              {sectors.map(s => (
                <option key={s} value={s}>{sectorLabel(s)}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px" }}>{t("Sorted by score, highest first")}</div>

        {/* Table */}
        {feasibility.length === 0 && !error ? (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>{t("No financial feasibility data is available for {city} yet.", { city: cityName })}</p>
          </div>
        ) : (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {(["Action", "Sector", "Route", "Score", "Fund Access", "Detail"] as const).map((h, i) => (
                    <th key={h} style={{ padding: `10px ${i === 0 || i === 5 ? "16px" : "12px"}`, textAlign: i === 3 ? "right" : "left", fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>{t("No actions match the selected route.")}</td></tr>
                ) : (
                  pageRows.map((row, i) => (
                    <TableRow key={`${row.action_id}-${i}`} row={row} onView={() => setSelected(row)} />
                  ))
                )}
              </tbody>
            </table>
            <Pagination total={filtered.length} page={page} onChange={setPage} />
          </div>
        )}

        {/* Score note */}
        {feasibility.length > 0 && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "14px 18px", marginTop: "16px", fontSize: "12px", color: "#1D4ED8", lineHeight: "1.65" }}>
            <strong>{t("How this is calculated:")}</strong> {t("Each score weighs the action's cost and complexity against {city}'s profile above, plus the funds catalogued for its sector. It estimates financing difficulty — not the odds of winning a specific fund.", { city: cityName })}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
          <button onClick={() => navigate(`/city/${citySlug}/policy`)}
            style={{ background: "white", border: "1px solid #DDDDE1", color: "#374151", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            {t("← Policy alignment")}
          </button>
          <button
            onClick={() => {
              confirmStep(locode, "financial-feasibility");
              navigate(fromRecommendations ? `/city/${citySlug}/recommendations?tab=context` : `/city/${citySlug}/preflight`);
            }}
            style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(22,163,74,0.3)" }}>
            {fromRecommendations ? t("Save & return to context breakdown →") : t("Pre-flight check →")}
          </button>
        </div>
      </div>
    </div>
  );
}
