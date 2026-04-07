import { Navbar } from "./_shared/Navbar";
import { useState, useEffect } from "react";

const STEPS = [
  { key: "validation", title: "Data validation", desc: "Emissions + context data verified" },
  { key: "impact", title: "Impact Analysis", desc: "Scoring 345 actions on emissions reduction potential & implementation timeline" },
  { key: "alignment", title: "Alignment Analysis", desc: "Matching actions to city national and local frameworks and strategic preferences" },
  { key: "feasibility", title: "Feasibility Analysis", desc: "Assessing socioeconomic context and regulations & laws" },
];

export function Processing() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepProgress, setStepProgress] = useState(75);
  const [overallProgress, setOverallProgress] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepProgress((p) => {
        if (p >= 100) {
          setCurrentStep((s) => {
            const next = s + 1;
            if (next >= STEPS.length) {
              clearInterval(timer);
              setOverallProgress(100);
              return STEPS.length;
            }
            setOverallProgress(((next) / STEPS.length) * 100);
            return next;
          });
          return 0;
        }
        return p + 1.5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "14px",
          padding: "28px",
          width: "100%",
          maxWidth: "580px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {/* Amber header strip */}
          <div style={{
            background: "#FFFBEB",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "2px solid #F59E0B",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#92400E" }}>Generating action recommendations</div>
              <div style={{ fontSize: "12px", color: "#B45309" }}>Started just now · Santiago · Expected 1–2 min</div>
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ marginBottom: "6px" }}>
            <div style={{ background: "#F0F0F0", borderRadius: "4px", height: "4px", marginBottom: "6px" }}>
              <div style={{ background: "#F59E0B", height: "4px", borderRadius: "4px", width: `${overallProgress}%`, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
              {Math.round(overallProgress)}% complete — {STEPS[Math.min(currentStep, STEPS.length - 1)].title} in progress
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#F0F0F0", margin: "16px 0" }} />

          {/* Steps */}
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;

            return (
              <div key={step.key} style={{ padding: "12px 0", borderBottom: i < STEPS.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    {isDone ? (
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#16A34A", fontWeight: "700" }}>✓</div>
                    ) : isActive ? (
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #F59E0B", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                    ) : (
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#F5F5F5", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D1D5DB" }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: "1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: isDone ? "#16A34A" : isActive ? "#F59E0B" : "#9CA3AF" }}>
                        {step.title}
                      </div>
                      {isDone && <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "600" }}>100%</span>}
                      {isActive && <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "600" }}>{Math.round(stepProgress)}%</span>}
                    </div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{step.desc}</div>
                    {isActive && (
                      <div style={{ marginTop: "8px", background: "#F5F5F5", borderRadius: "4px", height: "3px" }}>
                        <div style={{ background: "#F59E0B", height: "3px", borderRadius: "4px", width: `${stepProgress}%`, transition: "width 0.2s ease" }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Safe close notice — light indigo bg matching design */}
          <div style={{
            background: "#EDE9FE",
            borderRadius: "8px",
            padding: "12px 16px",
            marginTop: "16px",
            fontSize: "12px",
            color: "#5B21B6",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <span style={{ fontWeight: "700", marginTop: "1px" }}>✓</span>
            <span>
              <strong>You can safely close this tab</strong><br />
              Results will be ready when you return. Notification will be sent to ri@santiago.cl.
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
