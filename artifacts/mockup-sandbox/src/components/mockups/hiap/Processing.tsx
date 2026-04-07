import { Navbar } from "./_shared/Navbar";
import { useState, useEffect } from "react";

const STEPS = [
  {
    key: "validation",
    title: "Data validation",
    desc: "Emissions + context data verified",
  },
  {
    key: "impact",
    title: "Impact Analysis",
    desc: "Scoring 345 actions on emissions reduction potential & implementation timeline",
  },
  {
    key: "alignment",
    title: "Alignment Analysis",
    desc: "Matching actions to city national and local frameworks and strategic preferences",
  },
  {
    key: "feasibility",
    title: "Feasibility Analysis",
    desc: "Assessing socioeconomic context and regulations & laws",
  },
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
        return p + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#F9FAFB",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "12px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#FEF9C3",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "2px solid #D97706",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
                flexShrink: "0",
              }}
            />
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#854D0E" }}>
                Generating action recommendations
              </div>
              <div style={{ fontSize: "12px", color: "#B45309" }}>
                Started just now · Santiago · Expected 1–2 min
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ background: "#E5E7EB", borderRadius: "4px", height: "6px", marginBottom: "6px" }}>
              <div
                style={{
                  background: "#D97706",
                  height: "6px",
                  borderRadius: "4px",
                  width: `${overallProgress}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {Math.round(overallProgress)}% complete — {STEPS[Math.min(currentStep, STEPS.length - 1)].title} in progress
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              const isPending = i > currentStep;

              return (
                <div
                  key={step.key}
                  style={{
                    padding: "14px 0",
                    borderBottom: i < STEPS.length - 1 ? "0.5px solid #F3F4F6" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    {/* Icon */}
                    <div style={{ flexShrink: "0", marginTop: "2px" }}>
                      {isDone ? (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#DCFCE7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            color: "#16A34A",
                          }}
                        >
                          ✓
                        </div>
                      ) : isActive ? (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "2px solid #D97706",
                            borderTopColor: "transparent",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#F3F4F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            color: "#9CA3AF",
                          }}
                        >
                          ○
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: "1" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: isDone ? "#16A34A" : isActive ? "#D97706" : "#9CA3AF",
                          }}
                        >
                          {step.title}
                        </div>
                        {isDone && (
                          <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "600" }}>100%</span>
                        )}
                        {isActive && (
                          <span style={{ fontSize: "12px", color: "#D97706", fontWeight: "600" }}>
                            {Math.round(stepProgress)}%
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                        {step.desc}
                      </div>
                      {isActive && (
                        <div style={{ marginTop: "8px", background: "#F3F4F6", borderRadius: "4px", height: "4px" }}>
                          <div
                            style={{
                              background: "#D97706",
                              height: "4px",
                              borderRadius: "4px",
                              width: `${stepProgress}%`,
                              transition: "width 0.2s ease",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safe close notice */}
          <div
            style={{
              background: "#EFF6FF",
              borderRadius: "8px",
              padding: "12px 16px",
              marginTop: "16px",
              fontSize: "12px",
              color: "#1E40AF",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✓</span>
            <span>
              <strong>You can safely close this tab</strong>
              <br />
              Results will be ready when you return. Notification will be sent to ri@santiago.cl.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
