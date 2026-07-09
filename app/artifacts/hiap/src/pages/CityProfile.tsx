import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES, type CityData } from "@/data/cities";
import { getStepProgress } from "@/lib/stepProgress";
import { getFormattedTotalEmissions, getInventoryYear } from "@/lib/cityInventory";
import { useCityAttributes } from "@/hooks/use-city-attributes";
import { useLanguage } from "@/lib/i18n";

const STEP_ROUTES: Record<string, string> = {
  emissions:              "emissions",
  socioeconomic:          "socioeconomic",
  regulations:            "regulations",
  preferences:            "strategic",
  policy:                 "policy",
  "financial-feasibility": "financial-feasibility",
};

interface SectionDef {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  desc: string;
  progressKey: string;
}

const SECTION_DEFS: SectionDef[] = [
  {
    id: "emissions",
    priority: "HIGH",
    title: "Emissions Data",
    desc: "Your city's GHG inventory by sector. The primary input for action prioritisation.",
    progressKey: "emissions",
  },
  {
    id: "socioeconomic",
    priority: "HIGH",
    title: "Socioeconomic Context",
    desc: "Population, GDP, and key socioeconomic indicators to improve ranking accuracy.",
    progressKey: "socioeconomic",
  },
  {
    id: "regulations",
    priority: "HIGH",
    title: "Regulations & Laws",
    desc: "Local legislation and policies that determine which actions are feasible.",
    progressKey: "regulations",
  },
  {
    id: "preferences",
    priority: "LOW",
    title: "Strategic Preferences",
    desc: "Sector priorities, city political priorities, and implementation timeline.",
    progressKey: "strategic",
  },
  {
    id: "policy",
    priority: "LOW",
    title: "Policy Alignment",
    desc: "Optional: align recommendations with national, regional and local climate frameworks.",
    progressKey: "policy",
  },
  {
    id: "financial-feasibility",
    priority: "HIGH",
    title: "Financial Feasibility",
    desc: "Financing routes and fund access for each action, based on the city's budget profile.",
    progressKey: "financial-feasibility",
  },
];

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: "#FFEAEE", text: "#F23D33" },
  MEDIUM: { bg: "#FEF8E1", text: "#F9A200" },
  LOW:    { bg: "#EFFDE5", text: "#24BE00" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "IN PROGRESS":  { bg: "#FFF3E0", text: "#C05621" },
  "NOT STARTED":  { bg: "#F5F5F5", text: "#9CA3AF" },
  "COMPLETE":     { bg: "#F0FDF4", text: "#16A34A" },
  "NEEDS REVIEW": { bg: "#EEF2FF", text: "#4338CA" },
};

interface SectionState {
  status: "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "NEEDS REVIEW";
  progress: number | null;
  sub: string | null;
  cta: string;
}

function computeSections(locode: string): SectionState[] {
  return SECTION_DEFS.map((def) => {
    const p = getStepProgress(locode, def.progressKey);
    const pct = p.progress ?? 0;
    if (!p.visited || pct === 0) {
      return { status: "NOT STARTED", progress: null, sub: null, cta: "Start →" };
    }
    if (pct >= 100) {
      if (p.confirmed) {
        return { status: "COMPLETE", progress: pct, sub: p.sub ?? null, cta: "Continue →" };
      }
      return { status: "NEEDS REVIEW", progress: pct, sub: p.sub ?? null, cta: "Review →" };
    }
    return { status: "IN PROGRESS", progress: pct, sub: p.sub ?? null, cta: "Continue →" };
  });
}

interface SectionCardProps {
  def: SectionDef;
  state: SectionState;
  onClick?: () => void;
}

function SectionCard({ def, state, onClick }: SectionCardProps) {
  const { t } = useLanguage();
  const ps = PRIORITY_STYLES[def.priority];
  const ss = STATUS_STYLES[state.status];

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #EBEBEB",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s, border-color 0.15s",
        cursor: onClick ? "pointer" : "default",
        minHeight: "160px",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#CBD5E1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#EBEBEB";
      }}
    >
      {/* Priority + status row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: ps.bg, color: ps.text, fontWeight: "700", letterSpacing: "0.04em" }}>
          {t(def.priority)}
        </span>
        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: ss.bg, color: ss.text, fontWeight: "500" }}>
          {t(state.status)}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
        {t(def.title)}
      </div>

      {/* Sub (progress detail) */}
      {state.sub && (
        <div style={{ fontSize: "11px", color: "#F9A200", marginBottom: "4px", fontWeight: "500" }}>
          {state.sub}
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.55", marginBottom: "14px", flex: 1 }}>
        {t(def.desc)}
      </div>

      {/* CTA + progress bar */}
      <div>
        <div style={{ fontSize: "12px", color: "#001EA7", fontWeight: "600", marginBottom: state.progress !== null ? "6px" : "0" }}>
          {t(state.cta)}
        </div>
        {state.progress !== null && (
          <div style={{ background: "#E5E7EB", borderRadius: "3px", height: "3px" }}>
            <div style={{
              background: state.progress >= 100 ? "#16A34A" : "#C05621",
              width: `${state.progress}%`,
              height: "3px",
              borderRadius: "3px",
              transition: "width 0.4s ease",
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function KeyStat({ label, value, sub }: { label: string; value: string | null; sub?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: value ? "18px" : "13px", fontWeight: value ? "700" : "400", color: value ? "#111827" : "#9CA3AF", lineHeight: "1.2" }}>
        {value ?? "No data available"}
      </div>
      {value && sub && <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px" }}>{sub}</div>}
    </div>
  );
}

interface CityProfileProps {
  params: { locode: string };
}

export function CityProfile({ params }: CityProfileProps) {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [tick, setTick] = useState(0);

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const cityAttrs = useCityAttributes(locode);

  useEffect(() => {
    setTick((t) => t + 1);
  }, [locode]);

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 8px" }}>City not found</h2>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px" }}>We couldn't find a city with the locode "{urlLocode}".</p>
          <button onClick={() => navigate("/")} style={{ background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            ← Back to cities
          </button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");
  const sectionStates = computeSections(locode);
  const completeCount   = sectionStates.filter((s) => s.status === "COMPLETE").length;
  const progressCount   = sectionStates.filter((s) => s.status === "IN PROGRESS").length;
  const notStarted      = sectionStates.filter((s) => s.status === "NOT STARTED" || s.status === "NEEDS REVIEW").length;
  const emissionsIdx    = SECTION_DEFS.findIndex((d) => d.id === "emissions");
  const emissionsState  = sectionStates[emissionsIdx];
  const emissionsReady  = emissionsState.status === "COMPLETE" || emissionsState.status === "IN PROGRESS";
  const canGenerate     = emissionsReady && completeCount >= 3;

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />

      {/* White header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 64px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {t("Cities")}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>{city.name}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>{city.name}</h1>
              <div style={{ fontSize: "13px", color: "#6B7280", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{city.region}</span>
                {cityAttrs.population && (
                  <>
                    <span style={{ color: "#D1D5DB" }}>·</span>
                    <span>{cityAttrs.population} {t("residents")}</span>
                  </>
                )}
              </div>
            </div>

            <button
              disabled={!canGenerate}
              onClick={canGenerate ? () => navigate(`/city/${citySlug}/preflight`) : undefined}
              style={{
                background: canGenerate ? "#16A34A" : "#E5E7EB",
                color: canGenerate ? "white" : "#9CA3AF",
                border: "none",
                borderRadius: "8px",
                padding: "11px 20px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: canGenerate ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title={canGenerate ? t("Generate recommendations") : t("Complete at least 3 sections to unlock recommendations")}
            >
              <span>⚡</span>
              <span>{t("Generate recommendations")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div style={{ background: "#FAFAFA", borderBottom: "1px solid #EBEBEB", padding: "14px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          <KeyStat label={t("Total Emissions")} value={getFormattedTotalEmissions(locode)} />
          <KeyStat label={t("Population")} value={cityAttrs.population} sub={city.region} />
          <KeyStat label={t("Land Area")} value={cityAttrs.area} />
          <KeyStat label={t("Pop. Density")} value={cityAttrs.populationDensity} sub={t("inhabitants per km²")} />
        </div>
      </div>

      {/* Section cards */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 64px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>{t("City Profile")}</h2>
        </div>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px", lineHeight: "1.5" }}>
          {t("Complete each section to build the foundation for your action recommendations. Sections marked")}{" "}
          <strong style={{ color: "#F23D33" }}>{t("HIGH")}</strong> {t("have the greatest impact on ranking accuracy. Start with")}{" "}
          <strong>{t("Emissions Data")}</strong>{t(".")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "16px" }}>
          {SECTION_DEFS.map((def, i) => {
            const route = STEP_ROUTES[def.id];
            return (
              <SectionCard
                key={def.id}
                def={def}
                state={sectionStates[i]}
                onClick={route ? () => navigate(`/city/${citySlug}/${route}`) : undefined}
              />
            );
          })}
        </div>

        {/* Status bar */}
        <div style={{
          background: "white", border: "1px solid #EBEBEB", borderRadius: "10px",
          padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            {completeCount > 0 && `${completeCount} ${t("complete")} · `}
            {progressCount > 0 && `${progressCount} ${t("in progress")} · `}
            {notStarted > 0 && `${notStarted} ${t("not started")}`}
            {completeCount === 0 && progressCount === 0 && notStarted === 0 && t("No sections started yet")}
          </span>
          {!canGenerate && !emissionsReady && (
            <span style={{ fontSize: "13px", color: "#F23D33", fontWeight: "500" }}>
              Emissions Data required · enter your GHG inventory to unlock recommendations →
            </span>
          )}
          {!canGenerate && emissionsReady && (
            <span style={{ fontSize: "13px", color: "#F9A200", fontWeight: "500" }}>
              {t("{n} more section{s} needed to unlock recommendations →", {
                n: String(3 - completeCount),
                s: 3 - completeCount !== 1 ? "s" : "",
              })}
            </span>
          )}
          {canGenerate && (
            <span style={{ fontSize: "13px", color: "#16A34A", fontWeight: "600" }}>
              ✓ {t("Ready to generate recommendations")}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#001EA7", padding: "20px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#16A34A", borderRadius: "5px", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>M+</div>
            <span style={{ color: "#93C5FD", fontSize: "13px" }}>MEED+ · HIAP</span>
          </div>
          <span style={{ color: "#3B5FA0", fontSize: "12px" }}>High Impact Action Prioritizer — Climate Solutions for Chilean Cities</span>
        </div>
      </div>
    </div>
  );
}
