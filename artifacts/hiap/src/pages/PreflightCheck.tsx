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

// ── Default scoring weights ──────────────────────────────────────────────────
const DEFAULT_WEIGHTS = { impact: 55, alignment: 22, feasibility: 23 };
interface WeightState { impact: number; alignment: number; feasibility: number }

// ── Compute pilot data availability from user-entered step progress ──────────
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
    impact:      dimDots((em + st) / 2),
    alignment:   dimDots((po + st) / 2),
    feasibility: dimDots((re + so) / 2),
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

function confidenceLabel(pct: number, progMap: Record<string, StepProgress>): { label: string; color: string; hint: string | null } {
  const em = progMap["emissions"]?.progress ?? 0;
  const so = progMap["socioeconomic"]?.progress ?? 0;

  function buildHint(): string | null {
    if (em === 0) return "Emissions data is the most critical input — without it, recommendations are based on sector averages only. Enter your GHG inventory to unlock accurate rankings.";
    if (em > 0 && em < 100) return "Complete your emissions data by confirming all sectors to significantly improve ranking accuracy.";
    if (so < 100) return "Adding socioeconomic data would raise confidence to ~85%.";
    return null;
  }

  if (pct >= 85) return { label: "High — strong basis for a reliable ranking.", color: "#16A34A", hint: null };
  if (pct >= 60) return {
    label: "Moderate — sufficient to generate a rankable list of actions.",
    color: "#F9A200",
    hint: buildHint(),
  };
  return {
    label: "Low — rankings may be unreliable. Add more data.",
    color: "#F23D33",
    hint: buildHint(),
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

  const strategicKey = `hiap:${locode}:strategic:form`;

  const [progMap, setProgMap] = useState<Record<string, StepProgress>>({});
  const [weights, setWeights] = useState<WeightState>(() => {
    try {
      const raw = localStorage.getItem(strategicKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.weights) return parsed.weights as WeightState;
      }
    } catch {}
    return { ...DEFAULT_WEIGHTS };
  });

  useEffect(() => {
    const map: Record<string, StepProgress> = {};
    STEPS.forEach(s => { map[s.key] = getStepProgress(locode, s.key); });
    setProgMap(map);
  }, [locode]);

  function saveWeights(w: WeightState) {
    try {
      const existing = JSON.parse(localStorage.getItem(strategicKey) ?? "{}");
      localStorage.setItem(strategicKey, JSON.stringify({ ...existing, weights: w }));
    } catch {}
  }

  function handleWeightChange(key: keyof WeightState, rawVal: number) {
    const newVal = Math.min(90, Math.max(5, Math.round(rawVal)));
    const others = (["impact", "alignment", "feasibility"] as Array<keyof WeightState>).filter(k => k !== key);
    const remaining = 100 - newVal;
    const currentOtherSum = weights[others[0]] + weights[others[1]];

    let r0: number, r1: number;
    if (currentOtherSum === 0) {
      r0 = Math.floor(remaining / 2);
      r1 = remaining - r0;
    } else {
      r0 = Math.round(remaining * weights[others[0]] / currentOtherSum);
      r0 = Math.max(5, Math.min(r0, remaining - 5));
      r1 = remaining - r0;
    }

    const next = { ...weights, [key]: newVal, [others[0]]: r0, [others[1]]: r1 };
    setWeights(next);
    saveWeights(next);
  }

  function resetWeights() {
    const next = { ...DEFAULT_WEIGHTS };
    setWeights(next);
    saveWeights(next);
  }

  const isCustomWeights = weights.impact !== DEFAULT_WEIGHTS.impact ||
    weights.alignment !== DEFAULT_WEIGHTS.alignment ||
    weights.feasibility !== DEFAULT_WEIGHTS.feasibility;

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
  const { label: confLabel, color: confColor, hint: confHint } = confidenceLabel(confidence, progMap);
  const pilot = computePilotAvailability(progMap);

  const completeCount = STEPS.filter(s => !s.optional && getStatus(s, progMap[s.key] ?? { visited: false }) === "COMPLETE").length;

  let strategicDetail = progMap["strategic"]?.sub ?? "";
  try {
    const raw = localStorage.getItem(strategicKey);
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

              <div style={{ position: "relative", marginBottom: "8px" }}>
                <div style={{ height: "8px", borderRadius: "5px", background: "linear-gradient(to right, #F23D33 0%, #F9A200 40%, #16A34A 100%)", marginBottom: "4px" }} />
                <div style={{ position: "absolute", top: "-3px", left: `${confidence}%`, transform: "translateX(-50%)" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: confColor, border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>Low</span>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>Moderate</span>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>High</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "12px" }}>
                <span style={{ fontSize: "36px", fontWeight: "700", color: confColor, lineHeight: "1", flexShrink: 0 }}>{confidence}%</span>
                <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", paddingTop: "4px" }}>{confLabel}</span>
              </div>

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

        {/* ── Scoring Weights ── */}
        <div style={{ marginTop: "20px", background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>Scoring Weights</h2>
            {isCustomWeights && (
              <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "600", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "5px", padding: "2px 8px" }}>
                Custom weights active
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: "10px", background: "#F0F9FF", color: "#0369A1", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", letterSpacing: "0.03em" }}>
              OPTIONAL
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 4px" }}>
            Adjust how much each pillar contributes to the final ranking. Moving one slider redistributes the remainder proportionally across the other two.
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 20px" }}>
            Default weights follow the MEED+ HIAP methodology: Impact {DEFAULT_WEIGHTS.impact}% · Alignment {DEFAULT_WEIGHTS.alignment}% · Feasibility {DEFAULT_WEIGHTS.feasibility}%
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            <WeightSlider
              label="Impact"
              description="Emissions reduction potential & timeline"
              value={weights.impact}
              defaultValue={DEFAULT_WEIGHTS.impact}
              color="#001EA7"
              onChange={(v) => handleWeightChange("impact", v)}
            />
            <WeightSlider
              label="Alignment"
              description="Policy support, sectors & co-benefits"
              value={weights.alignment}
              defaultValue={DEFAULT_WEIGHTS.alignment}
              color="#16A34A"
              onChange={(v) => handleWeightChange("alignment", v)}
            />
            <WeightSlider
              label="Feasibility"
              description="Legal environment & socioeconomic fit"
              value={weights.feasibility}
              defaultValue={DEFAULT_WEIGHTS.feasibility}
              color="#F59E0B"
              onChange={(v) => handleWeightChange("feasibility", v)}
            />
          </div>

          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              fontSize: "12px", fontWeight: "700", color: "#16A34A",
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: "6px", padding: "4px 12px",
            }}>
              Total: {weights.impact + weights.alignment + weights.feasibility}%
            </div>
            {isCustomWeights && (
              <button
                onClick={resetWeights}
                style={{
                  fontSize: "12px", color: "#6B7280", background: "none",
                  border: "1px solid #E5E7EB", borderRadius: "6px",
                  padding: "4px 12px", cursor: "pointer",
                }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.borderColor = "#9CA3AF"; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.borderColor = "#E5E7EB"; }}
              >
                Reset to defaults
              </button>
            )}
          </div>
        </div>

        {/* ── Generate CTA ── */}
        {(() => {
          const emissionsProgress = progMap["emissions"]?.progress ?? 0;
          const canGenerate = emissionsProgress > 0;
          return (
            <div style={{ marginTop: "20px" }}>
              {!canGenerate && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#B91C1C", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, fontWeight: "700" }}>⚠</span>
                  <span><strong>Emissions data required.</strong> Confirm at least one emissions sector before generating recommendations. Without it, there is no city-specific data to rank actions against.</span>
                </div>
              )}
              <button
                disabled={!canGenerate}
                onClick={() => canGenerate && navigate(`/city/${citySlug}/processing`)}
                style={{
                  width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                  background: canGenerate ? "#16A34A" : "#D1D5DB",
                  color: canGenerate ? "white" : "#9CA3AF",
                  fontSize: "14px", fontWeight: "700",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  boxShadow: canGenerate ? "0 2px 12px rgba(22,163,74,0.30)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "16px" }}>⚡</span>
                {canGenerate ? "Generate recommendations — confirm you're ready" : "Enter emissions data to continue"}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Weight Slider ─────────────────────────────────────────────────────────────

interface WeightSliderProps {
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  color: string;
  onChange: (v: number) => void;
}

function WeightSlider({ label, description, value, defaultValue, color, onChange }: WeightSliderProps) {
  const isDefault = value === defaultValue;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
        <div>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{label}</span>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "8px" }}>
          {!isDefault && (
            <span style={{ fontSize: "11px", color: "#9CA3AF", textDecoration: "line-through" }}>{defaultValue}%</span>
          )}
          <span style={{ fontSize: "16px", fontWeight: "700", color: isDefault ? "#6B7280" : color }}>
            {value}%
          </span>
        </div>
      </div>

      <div style={{ position: "relative", height: "28px", display: "flex", alignItems: "center" }}>
        {/* Default tick */}
        <div style={{
          position: "absolute",
          left: `${defaultValue}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "2px", height: "14px",
          background: "#D1D5DB", borderRadius: "1px",
          pointerEvents: "none", zIndex: 1,
        }} />
        <input
          type="range"
          min={5}
          max={90}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%", height: "6px", borderRadius: "3px",
            outline: "none", cursor: "pointer", appearance: "none",
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
            position: "relative", zIndex: 2,
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none; width: 18px; height: 18px; border-radius: 50%;
            background: white; border: 2.5px solid ${color};
            cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          }
          input[type=range]::-moz-range-thumb {
            width: 18px; height: 18px; border-radius: 50%;
            background: white; border: 2.5px solid ${color};
            cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
        <span style={{ fontSize: "10px", color: "#D1D5DB" }}>5%</span>
        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>
          Default: {defaultValue}%{!isDefault && <span style={{ color, marginLeft: "4px" }}>· adjusted</span>}
        </span>
        <span style={{ fontSize: "10px", color: "#D1D5DB" }}>90%</span>
      </div>
    </div>
  );
}

// ─── DataRow ───────────────────────────────────────────────────────────────────

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
