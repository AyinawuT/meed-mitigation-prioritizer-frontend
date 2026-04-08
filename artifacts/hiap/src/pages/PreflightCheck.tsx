import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { getStepProgress, type StepProgress } from "@/lib/stepProgress";
import policyPlansData from "@/data/policyPlans.json";

// ── Candidate action count from plans data ──────────────────────────────────
const CANDIDATE_ACTION_COUNT = new Set<string>(
  policyPlansData.plans.flatMap(p => p.actions.map((a: { id: string }) => a.id))
).size;

// ── Compute pilot data availability from user-entered step progress ──────────
//  Impact      = emissions data + implementation timeline (strategic)
//  Alignment   = policy alignment + sector preferences & city priorities (strategic)
//  Feasibility = regulations & laws + socioeconomic context
//
//  stepScore: not visited → 0 | partial → 0.5 | complete → 1.0
//  dim score = average of its step scores
//  dots: ≥0.9 → 3 (Excellent) | ≥0.4 → 2 (Good) | >0 → 1 (Fair) | 0 → 0 (No data)

function stepScore(prog: StepProgress | undefined): number {
  if (!prog?.visited || (prog.progress ?? 0) === 0) return 0;
  return (prog.progress ?? 0) >= 100 ? 1.0 : 0.5;
}

function dimDots(avg: number): { dots: number; label: string; color: string } {
  if (avg >= 0.9) return { dots: 3, label: "Excellent", color: "#16A34A" };
  if (avg >= 0.4) return { dots: 2, label: "Good",      color: "#16A34A" };
  if (avg >  0  ) return { dots: 1, label: "Fair",      color: "#F9A200" };
  return                  { dots: 0, label: "No data",   color: "#9CA3AF" };
}

function computePilotAvailability(progMap: Record<string, StepProgress>) {
  const em  = stepScore(progMap["emissions"]);
  const so  = stepScore(progMap["socioeconomic"]);
  const re  = stepScore(progMap["regulations"]);
  const st  = stepScore(progMap["strategic"]);
  const po  = stepScore(progMap["policy"]);

  return {
    impact:      dimDots((em + st) / 2),      // emissions + strategic (timeline)
    alignment:   dimDots((po + st) / 2),      // policy alignment + strategic (sectors/priorities)
    feasibility: dimDots((re + so) / 2),      // regulations + socioeconomic
    actionCount: CANDIDATE_ACTION_COUNT,
  };
}

interface StepDef {
  key: string;
  label: string;
  optional?: boolean;
  route: string;
}

const STEPS: StepDef[] = [
  { key: "emissions",      label: "Emissions Data",          route: "emissions" },
  { key: "socioeconomic",  label: "Socioeconomic Context",   route: "socioeconomic" },
  { key: "regulations",    label: "Regulations & Laws",      route: "regulations" },
  { key: "strategic",      label: "Strategic Preferences",   route: "strategic" },
  { key: "policy",         label: "Policy Alignment",        optional: true, route: "policy" },
];

type Status = "COMPLETE" | "PARTIAL" | "NOT ENTERED" | "OPTIONAL";

function getStatus(step: StepDef, prog: StepProgress): Status {
  if (step.optional) {
    if (prog.visited && (prog.progress ?? 0) === 100) return "COMPLETE";
    return "OPTIONAL";
  }
  if (!prog.visited || (prog.progress ?? 0) === 0) return "NOT ENTERED";
  if ((prog.progress ?? 0) < 100) return "PARTIAL";
  return "COMPLETE";
}

const STATUS_STYLE: Record<Status, { bg: string; text: string; border: string }> = {
  "COMPLETE":    { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  "PARTIAL":     { bg: "#FEF8E1", text: "#B45309", border: "#FDE68A" },
  "NOT ENTERED": { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  "OPTIONAL":    { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
};

function computeConfidence(progMap: Record<string, StepProgress>): number {
  let score = 40;
  const em  = progMap["emissions"]?.progress ?? 0;
  const so  = progMap["socioeconomic"]?.progress ?? 0;
  const re  = progMap["regulations"]?.progress ?? 0;
  const st  = progMap["strategic"]?.progress ?? 0;
  const po  = progMap["policy"]?.progress ?? 0;
  if (em === 100) score += 25; else if (em > 0) score += 12;
  if (so === 100) score += 18; else if (so > 0) score += 9;
  if (re === 100) score += 10; else if (re > 0) score += 5;
  if (st === 100) score += 5;
  if (po === 100) score += 5;
  return Math.min(score, 98);
}

function confidenceLabel(pct: number): { label: string; color: string; hint: string | null } {
  if (pct >= 85) return { label: "High — strong basis for a reliable ranking.", color: "#16A34A", hint: null };
  if (pct >= 60) return {
    label: "Moderate — sufficient to generate a rankable list of actions.",
    color: "#F9A200",
    hint: "Adding socioeconomic data would raise confidence to ~85%",
  };
  return {
    label: "Low — rankings may be unreliable. Add more data.",
    color: "#F23D33",
    hint: "Complete emissions and socioeconomic data to improve confidence.",
  };
}

interface Props { params: { locode: string } }

export function PreflightCheck({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    c => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [progMap, setProgMap] = useState<Record<string, StepProgress>>({});

  useEffect(() => {
    const map: Record<string, StepProgress> = {};
    STEPS.forEach(s => { map[s.key] = getStepProgress(locode, s.key); });
    setProgMap(map);
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

  const citySlug = city.locode.replace(" ", "-");
  const confidence = computeConfidence(progMap);
  const { label: confLabel, color: confColor, hint: confHint } = confidenceLabel(confidence);
  const pilot = computePilotAvailability(progMap);

  const completeCount = STEPS.filter(s => !s.optional && getStatus(s, progMap[s.key] ?? { visited: false }) === "COMPLETE").length;
  const canGenerate = true; // always enabled for pilot — mock data covers all steps

  // Strategic sectors from form storage
  let strategicDetail = progMap["strategic"]?.sub ?? "";
  try {
    const raw = localStorage.getItem(`hiap:${locode}:strategic:form`);
    if (raw) {
      const form = JSON.parse(raw);
      if (form.sectors?.length) strategicDetail = form.sectors.join(", ");
    }
  } catch {}

  const stepDetail: Record<string, string> = {
    emissions:     progMap["emissions"]?.sub ?? "",
    socioeconomic: progMap["socioeconomic"]?.sub ?? "",
    regulations:   progMap["regulations"]?.sub ?? "",
    strategic:     strategicDetail,
    policy:        progMap["policy"]?.sub ?? "Optional — skipped",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={5} citySlug={citySlug} />

      {/* Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Pre-flight Check</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Pre-flight Summary</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            Review data completeness before generating action recommendations for {city.name}.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>

          {/* ── Left: Data completeness ── */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 18px" }}>Data completeness</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {STEPS.map((step, i) => {
                const prog = progMap[step.key] ?? { visited: false };
                const status = getStatus(step, prog);
                const ss = STATUS_STYLE[status];
                const detail = stepDetail[step.key];
                const isPartial = status === "PARTIAL";
                const isNotEntered = status === "NOT ENTERED";

                return (
                  <div key={step.key} style={{
                    display: "flex", alignItems: "flex-start", gap: "14px",
                    padding: "14px 0",
                    borderBottom: i < STEPS.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "5px" }}>{step.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, letterSpacing: "0.04em" }}>
                          {status}
                        </span>
                        {detail && (
                          <span style={{ fontSize: "12px", color: isPartial ? "#B45309" : isNotEntered ? "#9CA3AF" : "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            {isPartial && <span style={{ fontSize: "13px" }}>⚠</span>}
                            {detail}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/city/${citySlug}/${step.route}?from=preflight`)}
                      style={{ fontSize: "11px", color: "#001EA7", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, marginTop: "2px", textDecoration: "underline", textDecorationColor: "#C7D2FE" }}
                    >
                      {status === "COMPLETE" ? "Edit" : "Enter data"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Model confidence */}
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 14px" }}>Model confidence</h2>

              {/* Bar */}
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <div style={{ height: "8px", borderRadius: "5px", background: "linear-gradient(to right, #F23D33 0%, #F9A200 40%, #16A34A 100%)", marginBottom: "4px" }} />
                {/* Pointer */}
                <div style={{ position: "absolute", top: "-3px", left: `${confidence}%`, transform: "translateX(-50%)" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: confColor, border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>Low</span>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>Moderate</span>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>High</span>
                </div>
              </div>

              {/* Score + label */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "12px" }}>
                <span style={{ fontSize: "36px", fontWeight: "700", color: confColor, lineHeight: "1", flexShrink: 0 }}>{confidence}%</span>
                <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", paddingTop: "4px" }}>{confLabel}</span>
              </div>

              {/* Hint */}
              {confHint && (
                <div style={{ marginTop: "12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "7px", padding: "10px 12px", fontSize: "12px", color: "#B45309", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0 }}>⚠</span>
                  <span>{confHint}</span>
                </div>
              )}
            </div>

            {/* Pilot data availability */}
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 14px" }}>Pilot data availability</h2>
              <DataRow label="Impact"      dots={pilot.impact.dots}      total={3} ratingLabel={pilot.impact.label}      color={pilot.impact.color} />
              <DataRow label="Alignment"   dots={pilot.alignment.dots}   total={3} ratingLabel={pilot.alignment.label}   color={pilot.alignment.color} />
              <DataRow label="Feasibility" dots={pilot.feasibility.dots} total={3} ratingLabel={pilot.feasibility.label} color={pilot.feasibility.color} />
            </div>
          </div>
        </div>

        {/* ── Generate CTA ── */}
        <div style={{ marginTop: "24px" }}>
          {completeCount === 0 && (
            <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "8px", padding: "10px 16px", fontSize: "12px", color: "#4338CA", marginBottom: "12px", display: "flex", gap: "6px" }}>
              <span>ℹ</span>
              <span>No steps completed — recommendations will use pre-loaded pilot data for Iquique.</span>
            </div>
          )}
          <button
            onClick={() => navigate(`/city/${citySlug}/processing`)}
            style={{
              width: "100%", padding: "16px", borderRadius: "10px", border: "none",
              background: "#16A34A",
              color: "white", fontSize: "14px", fontWeight: "700",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              letterSpacing: "0.05em", textTransform: "uppercase",
              boxShadow: "0 2px 12px rgba(22,163,74,0.30)",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚡</span>
            Generate recommendations — confirm you're ready
          </button>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, dots, total, ratingLabel, color }: {
  label: string; dots: number; total: number; ratingLabel: string; color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
      <span style={{ fontSize: "13px", color: "#374151", width: "80px", flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{ width: "14px", height: "14px", borderRadius: "50%", background: i < dots ? color : "#E5E7EB", display: "inline-block" }} />
        ))}
      </div>
      <span style={{ fontSize: "13px", fontWeight: "600", color }}>{ratingLabel}</span>
    </div>
  );
}
