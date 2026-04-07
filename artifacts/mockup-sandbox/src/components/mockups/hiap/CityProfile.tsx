import { Navbar } from "./_shared/Navbar";

const SECTIONS = [
  {
    id: "emissions",
    priority: "HIGH",
    status: "IN-PROGRESS",
    title: "Emissions Data",
    desc: "Your city's GHG inventory by sector. The primary input for action prioritisation.",
    sub: "3 / 5 sectors confirmed · Inventory year 2023",
    progress: 60,
    cta: "Continue →",
    ctaColor: "#1E3A8A",
  },
  {
    id: "socioeconomic",
    priority: "HIGH",
    status: "NOT STARTED",
    title: "Socioeconomic Context",
    desc: "Population, GDP, and key socioeconomic indicators to improve accuracy.",
    sub: null,
    progress: null,
    cta: "Start →",
    ctaColor: "#6B7280",
  },
  {
    id: "regulations",
    priority: "MEDIUM",
    status: "NOT STARTED",
    title: "Regulations & Laws",
    desc: "Local legislation and policies that determine which actions are feasible.",
    sub: null,
    progress: null,
    cta: "Start →",
    ctaColor: "#6B7280",
  },
  {
    id: "preferences",
    priority: "LOW",
    status: "NOT STARTED",
    title: "Strategic Preferences",
    desc: "Sector priorities, co-benefits, budget range, and implementation timeline.",
    sub: null,
    progress: null,
    cta: "Start →",
    ctaColor: "#6B7280",
  },
  {
    id: "policy",
    priority: "LOW",
    status: "NOT STARTED",
    title: "Policy Alignment",
    desc: "Optional: align with national and local climate frameworks.",
    sub: null,
    progress: null,
    cta: "Start →",
    ctaColor: "#6B7280",
  },
];

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: "#FEF9C3", text: "#854D0E" },
    MEDIUM: { bg: "#FEF9C3", text: "#854D0E" },
    LOW: { bg: "#DCFCE7", text: "#166634" },
  };
  const c = colors[priority] ?? colors.LOW;
  return (
    <span
      style={{
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "4px",
        background: c.bg,
        color: c.text,
        fontWeight: "500",
      }}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    "IN-PROGRESS": { bg: "#FEF9C3", text: "#854D0E" },
    "NOT STARTED": { bg: "#F3F4F6", text: "#6B7280" },
    COMPLETE: { bg: "#DCFCE7", text: "#15803D" },
  };
  const c = colors[status] ?? colors["NOT STARTED"];
  return (
    <span
      style={{
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "4px",
        background: c.bg,
        color: c.text,
        fontWeight: "500",
      }}
    >
      {status}
    </span>
  );
}

export function CityProfile() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />

      {/* Breadcrumb + header */}
      <div style={{ background: "white", borderBottom: "0.5px solid #E5E7EB", padding: "16px 40px 20px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            Cities / Santiago
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
                Santiago
              </h1>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>
                Región Metropolitana · 6.7M residents · Joined 2024
              </div>
            </div>
            <button
              style={{
                background: "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: 0.6,
              }}
            >
              ⚡ GENERATE RECOMMENDATIONS
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 40px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "500", color: "#111827", margin: "0 0 6px" }}>
          City Profile
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px" }}>
          Complete each section to build the foundation for your action recommendations. Sections marked HIGH have the greatest impact on ranking accuracy.
        </p>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                background: "white",
                border: "0.5px solid #E5E7EB",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <PriorityBadge priority={section.priority} />
                <StatusBadge status={section.status} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "6px" }}>
                {section.title}
              </div>
              {section.sub && (
                <div style={{ fontSize: "12px", color: "#D97706", marginBottom: "4px" }}>
                  {section.sub}
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", marginBottom: "12px" }}>
                {section.desc}
              </div>
              {section.progress !== null && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ background: "#E5E7EB", borderRadius: "4px", height: "4px" }}>
                    <div
                      style={{
                        background: "#16A34A",
                        width: `${section.progress}%`,
                        height: "4px",
                        borderRadius: "4px",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              )}
              <a
                href="#"
                style={{
                  fontSize: "13px",
                  color: section.ctaColor,
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                {section.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "8px",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            1 section in progress · 4 not started · 0 complete
          </span>
          <a
            href="#"
            style={{
              fontSize: "13px",
              color: "#D97706",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Complete Emissions Data + 2 more sections to unlock recommendations →
          </a>
        </div>
      </div>
    </div>
  );
}
