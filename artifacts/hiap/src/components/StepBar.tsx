const STEPS = [
  "Emissions data",
  "Socioeconomic context",
  "Regulations & laws",
  "Strategic preferences",
  "Policy alignment",
  "Pre-flight check",
];

interface StepBarProps {
  activeStep: number;
}

export function StepBar({ activeStep }: StepBarProps) {
  return (
    <div style={{
      background: "white",
      borderBottom: "1px solid #E5E7EB",
      display: "flex",
      overflowX: "auto",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    }}>
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <div
            key={i}
            style={{
              padding: "10px 20px",
              fontSize: "12px",
              borderBottom: isActive ? "2px solid #001EA7" : "2px solid transparent",
              color: isActive ? "#001EA7" : isDone ? "#16A34A" : "#9CA3AF",
              fontWeight: isActive ? "600" : "400",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              flexShrink: 0,
            }}
          >
            {isDone && <span style={{ color: "#16A34A", fontSize: "11px" }}>✓</span>}
            <span>{i + 1}. {step}</span>
            {i === 4 && (
              <span style={{
                fontSize: "10px",
                color: "#6B7280",
                background: "#F3F4F6",
                borderRadius: "4px",
                padding: "1px 5px",
              }}>
                optional
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
