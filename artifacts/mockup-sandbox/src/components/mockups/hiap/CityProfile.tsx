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
    ctaBlue: true,
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
    ctaBlue: true,
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
    ctaBlue: true,
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
    ctaBlue: true,
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
    ctaBlue: true,
  },
];

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: "#FFF3E0", text: "#C05621" },
    MEDIUM: { bg: "#FFF3E0", text: "#C05621" },
    LOW: { bg: "#E8F5E9", text: "#2E7D32" },
  };
  const c = colors[priority] ?? colors.LOW;
  return (
    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "600", letterSpacing: "0.03em" }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    "IN-PROGRESS": { bg: "#FFF3E0", text: "#C05621" },
    "NOT STARTED": { bg: "#F5F5F5", text: "#9CA3AF" },
    COMPLETE: { bg: "#E8F5E9", text: "#2E7D32" },
  };
  const c = colors[status] ?? colors["NOT STARTED"];
  return (
    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: c.bg, color: c.text, fontWeight: "500" }}>
      {status}
    </span>
  );
}

export function CityProfile() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* White header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            Cities / Santiago
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
                Santiago
              </h1>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>
                Región Metropolitana · 6.7M residents · Joined 2024
              </div>
            </div>
            <button
              style={{
                background: "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "11px 20px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: 0.55,
              }}
            >
              ⚡ GENERATE RECOMMENDATIONS
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 48px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
          City Profile
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px", lineHeight: "1.5" }}>
          Complete each section to build the foundation for your action recommendations. Sections marked HIGH have the greatest impact on ranking accuracy.
        </p>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                background: "white",
                border: "1px solid #EBEBEB",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <PriorityBadge priority={section.priority} />
                <StatusBadge status={section.status} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                {section.title}
              </div>
              {section.sub && (
                <div style={{ fontSize: "11px", color: "#C05621", marginBottom: "4px" }}>
                  {section.sub}
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", marginBottom: "12px", flex: "1" }}>
                {section.desc}
              </div>
              {section.progress !== null && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ background: "#E5E7EB", borderRadius: "3px", height: "3px" }}>
                    <div
                      style={{
                        background: "#16A34A",
                        width: `${section.progress}%`,
                        height: "3px",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              )}
              <a
                href="#"
                style={{
                  fontSize: "13px",
                  color: "#1E3A8A",
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
            border: "1px solid #EBEBEB",
            borderRadius: "10px",
            padding: "13px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            1 section in progress · 4 not started · 0 complete
          </span>
          <a href="#" style={{ fontSize: "13px", color: "#C05621", textDecoration: "none", fontWeight: "500" }}>
            Complete Emissions Data + 2 more sections to unlock recommendations →
          </a>
        </div>
      </div>
    </div>
  );
}
