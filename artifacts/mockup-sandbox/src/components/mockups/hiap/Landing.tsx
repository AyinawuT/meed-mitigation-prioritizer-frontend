import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

const CITIES = [
  { locode: "CL IQQ", name: "Iquique", region: "Tarapacá", population: "214,857", emissions: "9.8M tCO₂e", status: "Active" },
  { locode: "CL ARI", name: "Arica", region: "Arica y Parinacota", population: "239,126", emissions: "7.4M tCO₂e", status: "In progress" },
  { locode: "CL ANF", name: "Antofagasta", region: "Antofagasta", population: "402,651", emissions: "12.1M tCO₂e", status: "Active" },
];

const QUICK_CITIES = ["Iquique", "Santiago", "Antofagasta", "Valparaíso", "Concepción"];

const STATS = [
  { value: "345", label: "Mitigation actions" },
  { value: "12", label: "Cities onboarded" },
  { value: "5", label: "GPC sectors covered" },
  { value: "1–2 min", label: "Time to recommendations" },
];

const HOW_STEPS = [
  { n: "1", title: "Select your city", desc: "Search by city name or LOCODE to find your city's existing emissions inventory." },
  { n: "2", title: "Complete your profile", desc: "Review and confirm emissions data, socioeconomic context, and strategic preferences." },
  { n: "3", title: "Generate recommendations", desc: "Run HIAP's scoring pipeline across 345 mitigation actions ranked for your city." },
  { n: "4", title: "Act on the ranking", desc: "Download your ranked action plan and share with your city's climate team." },
];

export function Landing() {
  const [searchVal, setSearchVal] = useState("");

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#1E3A8A", padding: "48px 64px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Two-column hero */}
          <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>
            {/* Left: headline */}
            <div style={{ flex: "1" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#93C5FD",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                Powered by CityCatalyst · Chile pilot
              </div>
              <h1 style={{ fontSize: "36px", fontWeight: "600", color: "white", lineHeight: "1.2", margin: "0 0 16px" }}>
                Take action.<br />
                <span style={{ fontWeight: "700" }}>Drive impact.</span>
              </h1>
              <p style={{ color: "#93C5FD", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px", maxWidth: "360px" }}>
                Empower your city to prioritize climate actions that make a difference with data-driven insights.
              </p>
            </div>

            {/* Right: search card */}
            <div style={{ flex: "1" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "12px 12px 0 0",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px", fontWeight: "500" }}>
                  Select your city to begin
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ position: "relative", flex: "1" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        fontSize: "14px",
                      }}
                    >
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder="Search by city name or LOCODE (e.g. Iquique, CL IQQ)..."
                      style={{
                        width: "100%",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        padding: "10px 12px 10px 36px",
                        fontSize: "13px",
                        outline: "none",
                        color: "#111827",
                        boxSizing: "border-box",
                      }}
                    />
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    Find city
                  </button>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {QUICK_CITIES.map((c) => (
                    <button
                      key={c}
                      style={{
                        background: "#F3F4F6",
                        border: "none",
                        borderRadius: "12px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        color: "#6B7280",
                        cursor: "pointer",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats bar flush below search */}
              <div
                style={{
                  background: "white",
                  borderRadius: "0 0 12px 12px",
                  padding: "12px 24px",
                  borderTop: "0.5px solid #E5E7EB",
                  display: "flex",
                  gap: "0",
                }}
              >
                {STATS.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      flex: "1",
                      textAlign: "center",
                      borderRight: i < STATS.length - 1 ? "0.5px solid #E5E7EB" : "none",
                      padding: "0 12px",
                    }}
                  >
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>{s.value}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 64px" }}>
        {/* Recent cities */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Recently onboarded cities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {CITIES.map((city) => (
              <div
                key={city.locode}
                style={{
                  background: "white",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>🇨🇱</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>{city.name}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{city.locode}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: city.status === "Active" ? "#DCFCE7" : "#FEF9C3",
                      color: city.status === "Active" ? "#15803D" : "#854D0E",
                      fontWeight: "500",
                    }}
                  >
                    {city.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>
                  {city.region} · {city.population} residents
                </div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginTop: "8px" }}>
                  {city.emissions}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Total GHG emissions</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>How it works</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
            HIAP guides you through four steps to generate a ranked action plan for your city.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "white",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#EFF6FF",
                    color: "#1E3A8A",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  {step.n}
                </div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginBottom: "6px" }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5" }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div style={{ background: "#1E3A8A", padding: "40px 64px", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "500", color: "white", marginBottom: "8px" }}>
          Ready to generate your city's recommendations?
        </div>
        <p style={{ color: "#93C5FD", fontSize: "13px", marginBottom: "20px" }}>
          Join 12 Chilean cities already using HIAP to prioritise climate actions.
        </p>
        <button
          style={{
            background: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
