import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import actionNames from "@/data/actionNames.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionMeta { name: string; category: string; subcategory: string }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

type FeasibilityRow = {
  action_id: string;
  financial_feasibility: number;
  route: string | null;
  reason: string | null;
  sector: string | null;
  inputs?: Record<string, unknown> | null;
  links?: Record<string, string> | null;
};

type Opportunity = {
  id?: string;
  name?: string;
  funder?: string;
  instrument?: string;
  sectors?: string[];
  description?: string;
  url?: string;
  amount_usd?: number | null;
  deadline?: string | null;
};

type Project = {
  id?: string;
  name?: string;
  description?: string;
  sector?: string;
  status?: string;
  amount_usd?: number | null;
  funder?: string;
  url?: string;
};

// ─── Route metadata ───────────────────────────────────────────────────────────

const ROUTE_META: Record<string, { label: string; color: string; bg: string; description: string }> = {
  grant_finance:   { label: "Grant Finance",   color: "#16A34A", bg: "#F0FDF4", description: "Non-repayable funds from governments or foundations, ideal for high-impact public benefit actions." },
  debt_finance:    { label: "Debt Finance",    color: "#2563EB", bg: "#EFF6FF", description: "Loans and bonds from banks or capital markets, suitable for actions with predictable revenue streams." },
  equity_finance:  { label: "Equity Finance",  color: "#7C3AED", bg: "#F5F3FF", description: "Investment in exchange for ownership, works best for commercially viable low-carbon ventures." },
  blended_finance: { label: "Blended Finance", color: "#B45309", bg: "#FFFBEB", description: "Combines public grants with private investment to reduce risk and unlock larger capital flows." },
  carbon_market:   { label: "Carbon Markets",  color: "#0D9488", bg: "#F0FDFA", description: "Revenue from selling verified carbon credits for measurable emissions reductions." },
  mixed:           { label: "Mixed Routes",    color: "#6B7280", bg: "#F9FAFB", description: "Multiple financing mechanisms may apply; a tailored strategy is recommended." },
};

function routeMeta(route: string | null) {
  if (!route) return { label: "Unknown", color: "#9CA3AF", bg: "#F9FAFB", description: "No financing route identified yet." };
  return ROUTE_META[route] ?? { label: route.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), color: "#6B7280", bg: "#F9FAFB", description: "" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(v: number) {
  if (v >= 0.7) return "#16A34A";
  if (v >= 0.4) return "#F59E0B";
  return "#9CA3AF";
}

function scorePct(v: number) { return `${Math.round(v * 100)}%`; }

function ScorePill({ value }: { value: number }) {
  const color = scoreColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, background: "#EBEBEB", borderRadius: "4px", height: "6px", minWidth: "60px" }}>
        <div style={{ background: color, width: scorePct(value), height: "6px", borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: "700", color, minWidth: "32px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function RouteBadge({ route }: { route: string | null }) {
  const m = routeMeta(route);
  return (
    <span style={{ fontSize: "11px", fontWeight: "600", color: m.color, background: m.bg, padding: "3px 9px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
      {children}
    </div>
  );
}

// ─── Detail Pane ─────────────────────────────────────────────────────────────

function DetailPane({
  row,
  opportunities,
  projects,
  onClose,
}: {
  row: FeasibilityRow;
  opportunities: Opportunity[];
  projects: Project[];
  onClose: () => void;
}) {
  const meta = ACTION_NAMES[row.action_id];
  const rm = routeMeta(row.route);

  const matchedOpps = opportunities.filter(o => {
    if (!o.sectors || o.sectors.length === 0) return true;
    return o.sectors.some(s => s.toLowerCase().includes((row.sector ?? "").toLowerCase()));
  }).slice(0, 4);

  const matchedProjects = projects.filter(p => {
    if (!p.sector) return true;
    return p.sector.toLowerCase().includes((row.sector ?? "").toLowerCase());
  }).slice(0, 4);

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.22)", zIndex: 40 }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
        background: "white", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        animation: "slideIn 0.22s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #EBEBEB", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#001EA7", fontSize: "13px", fontWeight: "600", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}
          >
            ← GO BACK
          </button>
          {row.sector && (
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#001EA7", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
              {row.sector}
            </div>
          )}
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#111827", margin: "0 0 12px", lineHeight: "1.4" }}>
            {meta?.name ?? row.action_id}
          </h2>
          <RouteBadge route={row.route} />
        </div>

        <div style={{ padding: "24px 28px", flexGrow: 1, overflowY: "auto" }}>

          {/* Feasibility score */}
          <div style={{ marginBottom: "22px" }}>
            <SectionHead>Financial feasibility score</SectionHead>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, background: "#EBEBEB", borderRadius: "6px", height: "10px" }}>
                <div style={{ background: scoreColor(row.financial_feasibility), width: scorePct(row.financial_feasibility), height: "10px", borderRadius: "6px" }} />
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800", color: scoreColor(row.financial_feasibility), minWidth: "44px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {row.financial_feasibility.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Route & reason */}
          <div style={{ marginBottom: "22px", background: rm.bg, border: `1px solid ${rm.color}22`, borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: rm.color, flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: rm.color }}>{rm.label}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#4B5563", lineHeight: "1.65", margin: "0 0 8px" }}>
              {rm.description}
            </p>
            {row.reason && (
              <p style={{ fontSize: "12px", color: "#374151", lineHeight: "1.65", margin: 0, fontStyle: "italic", borderTop: `1px solid ${rm.color}22`, paddingTop: "8px" }}>
                {row.reason}
              </p>
            )}
          </div>

          {/* Fund access */}
          <div style={{ marginBottom: "22px" }}>
            <SectionHead>Fund access opportunities</SectionHead>
            {matchedOpps.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>No matching opportunities found for this sector.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {matchedOpps.map((opp, i) => (
                  <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      {opp.name ?? "Funding Opportunity"}
                    </div>
                    {opp.funder && (
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>
                        Funder: {opp.funder}
                      </div>
                    )}
                    {opp.instrument && (
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>
                        Instrument: {opp.instrument}
                      </div>
                    )}
                    {opp.description && (
                      <p style={{ fontSize: "12px", color: "#4B5563", lineHeight: "1.55", margin: "4px 0 0" }}>
                        {opp.description.length > 180 ? opp.description.slice(0, 180) + "…" : opp.description}
                      </p>
                    )}
                    {opp.url && (
                      <a href={opp.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#001EA7", marginTop: "6px", display: "inline-block", fontWeight: "600" }}>
                        Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matched projects */}
          <div style={{ marginBottom: "12px" }}>
            <SectionHead>Matched projects</SectionHead>
            {matchedProjects.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>No matching projects found for this sector.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {matchedProjects.map((proj, i) => (
                  <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                        {proj.name ?? "Project"}
                      </div>
                      {proj.status && (
                        <span style={{ fontSize: "10px", color: "#6B7280", background: "#F3F4F6", padding: "2px 7px", borderRadius: "4px", flexShrink: 0, fontWeight: "600" }}>
                          {proj.status}
                        </span>
                      )}
                    </div>
                    {proj.funder && (
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>
                        {proj.funder}
                      </div>
                    )}
                    {proj.description && (
                      <p style={{ fontSize: "12px", color: "#4B5563", lineHeight: "1.55", margin: "4px 0 0" }}>
                        {proj.description.length > 160 ? proj.description.slice(0, 160) + "…" : proj.description}
                      </p>
                    )}
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#001EA7", marginTop: "6px", display: "inline-block", fontWeight: "600" }}>
                        View project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </>
  );
}

// ─── Action row ───────────────────────────────────────────────────────────────

function ActionRow({
  row,
  onSelect,
}: {
  row: FeasibilityRow;
  onSelect: () => void;
}) {
  const meta = ACTION_NAMES[row.action_id];

  return (
    <div
      onClick={onSelect}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 110px 160px 34px",
        alignItems: "center",
        gap: "12px",
        padding: "13px 16px",
        background: "white",
        borderBottom: "1px solid #F3F4F6",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
      onMouseLeave={e => (e.currentTarget.style.background = "white")}
    >
      <div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "2px" }}>
          {meta?.name ?? row.action_id}
        </div>
        {row.sector && (
          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{row.sector}</div>
        )}
      </div>
      <RouteBadge route={row.route} />
      <ScorePill value={row.financial_feasibility} />
      <span style={{ color: "#D1D5DB", fontSize: "16px" }}>›</span>
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "18px 20px" }}>
      <div style={{ fontSize: "22px", fontWeight: "800", color: color ?? "#111827", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function FinancialFeasibility({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    c => c.locode.toLowerCase() === locode.toLowerCase()
  );
  const citySlug = urlLocode;
  const cityName = city?.name ?? locode;
  const countryCode = locode.slice(0, 2).toUpperCase();

  const [feasibility, setFeasibility] = useState<FeasibilityRow[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FeasibilityRow | null>(null);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  useEffect(() => {
    setStepProgress(locode, "financial-feasibility", { visited: true });

    const baseUrl = "https://ccglobal.openearth.dev";
    const encodedLocode = encodeURIComponent(locode);

    const feasUrl = `${baseUrl}/api/v1/cities/${encodedLocode}/climate-finance/feasibility?country_code=${countryCode}`;
    const oppUrl  = `${baseUrl}/api/v1/climate-finance/opportunities?country_code=${countryCode}&limit=100&offset=0`;
    const projUrl = `${baseUrl}/api/v1/climate-finance/projects?country_code=${countryCode}&limit=50&offset=0`;

    Promise.all([
      fetch(feasUrl).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(oppUrl).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(projUrl).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([feasRes, oppRes, projRes]) => {
      const rows: FeasibilityRow[] = (feasRes?.data ?? []).filter(
        (r: FeasibilityRow) => typeof r.financial_feasibility === "number"
      );
      rows.sort((a, b) => b.financial_feasibility - a.financial_feasibility);
      setFeasibility(rows);
      setOpportunities(oppRes?.data ?? []);
      setProjects(projRes?.data ?? []);
      if (rows.length > 0) {
        setStepProgress(locode, "financial-feasibility", { visited: true, progress: 100, sub: `${rows.length} actions assessed` });
      }
    }).catch(() => {
      setError("Could not load financial feasibility data. Please check your connection.");
    }).finally(() => {
      setLoading(false);
    });
  }, [locode, countryCode]);

  const routes = Array.from(new Set(feasibility.map(r => r.route ?? "unknown"))).sort();

  const filtered = activeRoute
    ? feasibility.filter(r => (r.route ?? "unknown") === activeRoute)
    : feasibility;

  const avgScore = feasibility.length > 0
    ? feasibility.reduce((s, r) => s + r.financial_feasibility, 0) / feasibility.length
    : 0;

  const routeCounts: Record<string, number> = {};
  for (const r of feasibility) {
    const key = r.route ?? "unknown";
    routeCounts[key] = (routeCounts[key] ?? 0) + 1;
  }
  const topRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const highCount = feasibility.filter(r => r.financial_feasibility >= 0.7).length;

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <StepBar activeStep={5} citySlug={citySlug} />
        <div style={{ maxWidth: "900px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>Loading financial feasibility data…</p>
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
          opportunities={opportunities}
          projects={projects}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", cursor: "pointer", fontSize: "12px" }}>Cities</button>
            {" › "}
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", cursor: "pointer", fontSize: "12px" }}>{cityName}</button>
            {" › "}Financial feasibility
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
            Financial feasibility — {cityName}
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            Climate finance routes and funding readiness for each candidate mitigation action.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 48px 64px" }}>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: "#DC2626" }}>
            {error}
          </div>
        )}

        {/* Summary cards */}
        {feasibility.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
            <SummaryCard label="Actions assessed" value={feasibility.length} sub="with climate finance data" />
            <SummaryCard label="Average score" value={avgScore.toFixed(2)} sub="city-wide feasibility" color={scoreColor(avgScore)} />
            <SummaryCard label="High readiness" value={highCount} sub="score ≥ 0.70" color="#16A34A" />
            <SummaryCard
              label="Primary route"
              value={topRoute ? routeMeta(topRoute).label : "—"}
              sub={topRoute ? `${routeCounts[topRoute]} actions` : ""}
              color={topRoute ? routeMeta(topRoute).color : "#9CA3AF"}
            />
          </div>
        )}

        {/* Route legend */}
        {routes.length > 1 && (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
              Financing routes in this city
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {routes.map(route => {
                const m = routeMeta(route);
                const isActive = activeRoute === route;
                const count = routeCounts[route] ?? 0;
                return (
                  <button
                    key={route}
                    onClick={() => setActiveRoute(isActive ? null : route)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: isActive ? m.bg : "#F9FAFB",
                      border: `1.5px solid ${isActive ? m.color : "#E5E7EB"}`,
                      borderRadius: "20px", padding: "5px 12px",
                      cursor: "pointer", transition: "all 0.1s",
                    }}
                  >
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: isActive ? m.color : "#374151" }}>
                      {m.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{count}</span>
                  </button>
                );
              })}
              {activeRoute && (
                <button
                  onClick={() => setActiveRoute(null)}
                  style={{ fontSize: "11px", color: "#6B7280", background: "none", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "5px 12px", cursor: "pointer" }}
                >
                  Clear filter ×
                </button>
              )}
            </div>
            {activeRoute && (
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "10px 0 0", lineHeight: "1.6" }}>
                {routeMeta(activeRoute).description}
              </p>
            )}
          </div>
        )}

        {/* Action list */}
        {feasibility.length === 0 && !error ? (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
              No financial feasibility data is available for {cityName} yet.
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "8px 0 0" }}>
              You can continue to the pre-flight check — feasibility data will be incorporated when available.
            </p>
          </div>
        ) : (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 110px 160px 34px",
              gap: "12px",
              padding: "10px 16px",
              background: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
            }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Action {activeRoute ? `· ${routeMeta(activeRoute).label}` : `· ${filtered.length} shown`}
              </span>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Route</span>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Feasibility score</span>
              <span />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                No actions match the selected route.
              </div>
            ) : (
              filtered.map(row => (
                <ActionRow key={row.action_id} row={row} onSelect={() => setSelected(row)} />
              ))
            )}
          </div>
        )}

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/policy`)}
            style={{ background: "none", border: "none", color: "#6B7280", fontSize: "13px", cursor: "pointer", padding: 0 }}
          >
            ← Back to policy alignment
          </button>
          <button
            onClick={() => { confirmStep(locode, "financial-feasibility"); navigate(`/city/${citySlug}/preflight`); }}
            style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
          >
            Continue to pre-flight check →
          </button>
        </div>

      </div>
    </div>
  );
}
