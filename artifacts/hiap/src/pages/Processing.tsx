import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import actionsData from "@/data/actions.json";
import cityApiData from "@/data/cityData.json";
import mockRequest from "@/data/prioritizerRequestMock.json";
import { runPipeline, type PipelineResult, type CityIndicators } from "@/lib/scoringPipeline";

const ACTION_COUNT = (actionsData as { actions: unknown[] }).actions.length;

// Stage boundaries in overall progress (0–100)
const BOUNDARIES = [0, 10, 62, 84, 100];

const STAGES = [
  {
    id: "validation",
    label: "Data validation",
    desc: "Emissions + context data verified",
  },
  {
    id: "impact",
    label: "Impact Analysis",
    desc: `Scoring ${ACTION_COUNT} actions on emissions reduction potential & implementation timeline`,
  },
  {
    id: "alignment",
    label: "Alignment Analysis",
    desc: "Matching actions to national, regional and local frameworks and strategic preferences",
  },
  {
    id: "feasibility",
    label: "Feasibility Analysis",
    desc: "Assessing socioeconomic context and regulations & laws",
  },
];

type StageStatus = "pending" | "running" | "complete";

function stageStatus(idx: number, overall: number): StageStatus {
  if (overall >= BOUNDARIES[idx + 1]) return "complete";
  if (overall >= BOUNDARIES[idx]) return "running";
  return "pending";
}

function stageProgress(idx: number, overall: number): number {
  const start = BOUNDARIES[idx];
  const end = BOUNDARIES[idx + 1];
  if (overall >= end) return 100;
  if (overall < start) return 0;
  return Math.round(((overall - start) / (end - start)) * 100);
}

function currentStageName(overall: number): string {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (overall >= BOUNDARIES[i]) return STAGES[i].label;
  }
  return STAGES[0].label;
}

// Map StrategicPreferences display labels → pipeline sector keys
const SECTOR_NAME_MAP: Record<string, string[]> = {
  "Stationary Energy": ["buildings", "energy"],
  "Transportation": ["transportation"],
  "Waste": ["waste"],
  "Industrial Processes & Product Use (IPPU)": ["industry"],
  "Agriculture, Forestry & Other Land Use (AFOLU)": ["nature", "agriculture"],
};

// Extract city indicators from city API data
function extractCityIndicators(): CityIndicators {
  const city = (cityApiData as { city: Record<string, { attribute_value?: number; attribute_category: string }> }).city;
  const indicators: CityIndicators = {};
  for (const [key, val] of Object.entries(city)) {
    if (val && typeof val === "object" && "attribute_category" in val) {
      indicators[key] = val;
    }
  }
  return indicators;
}

// Build prioritizer request from localStorage + mock emissions
function buildRequest(locode: string) {
  // Load strategic preferences from localStorage
  const storageKey = `hiap:${locode}:strategic:form`;
  let sectors: string[] = [];
  let strategicPriorities = "";
  let excludeText = "";
  let savedWeights: { impact: number; alignment: number; feasibility: number } | undefined;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw) as {
        sectors: string[];
        strategicPriorities?: string;
        excludeText?: string;
        weights?: { impact: number; alignment: number; feasibility: number };
      };
      sectors = saved.sectors ?? [];
      strategicPriorities = saved.strategicPriorities ?? "";
      excludeText = saved.excludeText ?? "";
      savedWeights = saved.weights;
    }
  } catch {}

  // Map display names → pipeline keys
  const pipelineSectors = sectors.flatMap(s => SECTOR_NAME_MAP[s] ?? [s.toLowerCase()]);

  // Convert integer % weights → decimal fractions; fall back to spec defaults
  const weightsOverride = savedWeights
    ? {
        impact:      savedWeights.impact      / 100,
        alignment:   savedWeights.alignment   / 100,
        feasibility: savedWeights.feasibility / 100,
      }
    : { impact: 0.55, alignment: 0.22, feasibility: 0.23 };

  // Use mock GPC emissions data (confirmed by user in EmissionsReview step)
  const mockCity = (mockRequest as { requestData: { cityDataList: Array<{ cityEmissionsData: unknown }> } })
    .requestData.cityDataList[0];

  return {
    locode,
    cityStrategicPreferenceSectors: pipelineSectors,
    cityStrategicPreferenceOther: strategicPriorities,
    excludedActionsFreeText: excludeText,
    weightsOverride,
    cityEmissionsData: mockCity.cityEmissionsData as Parameters<typeof runPipeline>[0]["cityEmissionsData"],
    topN: 20,
  };
}

interface Props { params: { locode: string } }

export function Processing({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find(c => c.locode.toLowerCase() === locode.toLowerCase());
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;

  const [overall, setOverall] = useState(0);
  const [done, setDone] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  // Animate overall progress 0 → 100 over ~8 seconds with easing
  useEffect(() => {
    const DURATION = 8000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const raw = elapsed / DURATION;
      const eased = Math.min(raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw, 0.99);
      setOverall(Math.round(eased * 100));
      if (elapsed >= DURATION) {
        clearInterval(interval);
        setOverall(100);
        setDone(true);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Run pipeline synchronously on mount
  useEffect(() => {
    try {
      const req = buildRequest(locode);
      const indicators = extractCityIndicators();
      const result: PipelineResult = runPipeline(req, indicators);
      localStorage.setItem(`hiap:${locode}:results`, JSON.stringify(result));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? (err.stack ?? "") : "";
      console.error("Pipeline error:", msg, stack);
      setPipelineError(msg || "Unknown pipeline error");
    }
  }, [locode]);

  // Only navigate to recommendations if pipeline succeeded
  useEffect(() => {
    if (!done || pipelineError) return;
    const t = setTimeout(() => navigate(`/city/${citySlug}/recommendations`), 900);
    return () => clearTimeout(t);
  }, [done, pipelineError]);

  const displayPct = done ? 100 : overall;

  // Error state — show before the main card
  if (pipelineError) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar cityName={cityName} />
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 24px" }}>
          <div style={{ width: "100%", maxWidth: "560px", background: "white", borderRadius: "14px", border: "1px solid #FECACA", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "32px 28px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FEF2F2", border: "2px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>⚠</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#991B1B", marginBottom: "8px" }}>Prioritization failed</div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px", lineHeight: "1.6" }}>
              The scoring pipeline encountered an error. This is usually caused by missing or malformed input data.
            </div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "8px 12px", marginBottom: "24px", fontFamily: "monospace", textAlign: "left", wordBreak: "break-word" }}>
              {pipelineError}
            </div>
            <button
              onClick={() => navigate(`/city/${citySlug}/preflight`)}
              style={{ padding: "10px 24px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              ← Back to pre-flight check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "48px 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>

          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "18px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
              <Spinner done={done} />
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: done ? "#16A34A" : "#B45309" }}>
                  {done ? "Recommendations ready" : "Generating action recommendations"}
                </div>
                <div style={{ fontSize: "12px", color: "#92400E", marginTop: "2px" }}>
                  Started just now · {cityName} · Expected wait time 30 seconds
                </div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div style={{ padding: "16px 24px 0" }}>
              <div style={{ height: "6px", background: "#F3F4F6", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${displayPct}%`,
                  background: done ? "#16A34A" : "linear-gradient(90deg, #F9A200 0%, #F97316 100%)",
                  borderRadius: "4px",
                  transition: "width 0.2s ease, background 0.4s ease",
                }} />
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "6px", marginBottom: "4px" }}>
                {displayPct}% complete{!done && ` — ${currentStageName(displayPct)} in progress`}
                {done && " — All analyses complete"}
              </div>
            </div>

            {/* Stage rows */}
            <div style={{ padding: "4px 0 0" }}>
              {STAGES.map((stage, i) => {
                const status = done ? "complete" : stageStatus(i, displayPct);
                const pct = done ? 100 : stageProgress(i, displayPct);

                return (
                  <div key={stage.id} style={{
                    padding: "14px 24px",
                    borderTop: "1px solid #F3F4F6",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}>
                    <div style={{ flexShrink: 0, marginTop: "1px" }}>
                      {status === "complete" && (
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: "700" }}>✓</span>
                        </div>
                      )}
                      {status === "running" && <RunningDots />}
                      {status === "pending" && (
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #D1D5DB" }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{
                          fontSize: "13px", fontWeight: "600",
                          color: status === "pending" ? "#9CA3AF" : "#111827",
                        }}>
                          {stage.label}
                        </span>
                        {status !== "pending" && (
                          <span style={{
                            fontSize: "11px", fontWeight: "700",
                            padding: "2px 8px", borderRadius: "5px",
                            background: status === "complete" ? "#F0FDF4" : "#FFFBEB",
                            color: status === "complete" ? "#16A34A" : "#B45309",
                            border: `1px solid ${status === "complete" ? "#BBF7D0" : "#FDE68A"}`,
                          }}>
                            {pct}%
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: status === "pending" ? "#D1D5DB" : "#6B7280", lineHeight: "1.5" }}>
                        {stage.desc}
                      </div>
                      {status === "running" && (
                        <div style={{ marginTop: "8px", height: "4px", background: "#FEF3C7", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "#F9A200",
                            borderRadius: "3px",
                            transition: "width 0.3s ease",
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ margin: "12px 16px 16px", background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#4338CA", flexShrink: 0, fontWeight: "700" }}>✓</span>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#3730A3" }}>
                Results will be ready shortly!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner({ done }: { done: boolean }) {
  return (
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%",
      border: `3px solid ${done ? "#16A34A" : "#FDE68A"}`,
      borderTopColor: done ? "#16A34A" : "#F9A200",
      animation: done ? "none" : "spin 0.9s linear infinite",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {done && <span style={{ fontSize: "16px", color: "#16A34A" }}>✓</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RunningDots() {
  return (
    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#FFFBEB", border: "2px solid #F9A200", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: "3px", height: "3px", borderRadius: "50%", background: "#F9A200",
          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
          display: "inline-block",
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }`}</style>
    </div>
  );
}
