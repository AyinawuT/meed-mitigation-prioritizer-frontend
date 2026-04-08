import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES } from "@/data/cities";
import policyPlansData from "@/data/policyPlans.json";

const CANDIDATE_COUNT = new Set(
  policyPlansData.plans.flatMap(p => p.actions.map((a: { id: string }) => a.id))
).size;

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
    desc: `Scoring ${CANDIDATE_COUNT} actions on emissions reduction potential & implementation timeline`,
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
  const startTime = useRef(Date.now());

  // Animate overall progress 0 → 100 over ~8 seconds with easing
  useEffect(() => {
    const DURATION = 8000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const raw = elapsed / DURATION;
      // ease-in-out curve, cap at 99 until we explicitly finish
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

  // Navigate to recommendations once done
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate(`/city/${citySlug}/recommendations`), 900);
    return () => clearTimeout(t);
  }, [done]);

  const displayPct = done ? 100 : overall;

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={cityName} />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "48px 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>

          {/* Main card */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "18px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
              <Spinner done={done} />
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: done ? "#16A34A" : "#B45309" }}>
                  {done ? "Recommendations ready" : "Generating action recommendations"}
                </div>
                <div style={{ fontSize: "12px", color: "#92400E", marginTop: "2px" }}>
                  Started just now · {cityName} · Expected 1–2 min
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
                    {/* Status icon */}
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

                    {/* Content */}
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
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#3730A3", marginBottom: "2px" }}>
                  You can safely close this tab
                </div>
                <div style={{ fontSize: "12px", color: "#6366F1" }}>
                  Results will be ready when you return. Notification will be sent to rl@santiago.cl.
                </div>
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
