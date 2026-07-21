import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

const STEPS = [
  "Emissions data",
  "Socioeconomic context",
  "Regulations & laws",
  "Strategic preferences",
  "Policy alignment",
  "Financial feasibility",
  "Pre-flight check",
];

const STEP_PATHS = [
  (slug: string) => `/city/${slug}/emissions`,
  (slug: string) => `/city/${slug}/socioeconomic`,
  (slug: string) => `/city/${slug}/regulations`,
  (slug: string) => `/city/${slug}/strategic`,
  (slug: string) => `/city/${slug}/policy`,
  (slug: string) => `/city/${slug}/financial-feasibility`,
  (slug: string) => `/city/${slug}/preflight`,
];

interface StepBarProps {
  activeStep: number;
  citySlug?: string;
}

export function StepBar({ activeStep, citySlug }: StepBarProps) {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

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
        const isClickable = (isDone || isActive) && !!citySlug;

        return (
          <div
            key={i}
            onClick={() => {
              if (isClickable && !isActive) {
                navigate(STEP_PATHS[i](citySlug!));
              }
            }}
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
              cursor: isClickable && !isActive ? "pointer" : "default",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (isClickable && !isActive) e.currentTarget.style.color = "#059669";
            }}
            onMouseLeave={(e) => {
              if (isClickable && !isActive) e.currentTarget.style.color = "#16A34A";
            }}
          >
            {isDone && <span style={{ color: "inherit", fontSize: "11px" }}>✓</span>}
            <span>{i + 1}. {t(step)}</span>
          </div>
        );
      })}
    </div>
  );
}
