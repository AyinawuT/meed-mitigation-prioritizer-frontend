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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero - white background, split layout matching MEED+ design */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "40px 64px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "80px", alignItems: "center" }}>
            {/* Left: headline */}
            <div style={{ flex: "0 0 340px" }}>
              <p style={{ fontSize: "22px", fontWeight: "400", color: "#111827", margin: "0 0 2px", lineHeight: "1.3" }}>
                Take action.
              </p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 14px", lineHeight: "1.3" }}>
                Drive impact.
              </p>
              <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.6", margin: "0" }}>
                Empower your city to prioritize climate actions that make a difference with data-driven insights.
              </p>
            </div>

            {/* Right: search */}
            <div style={{ flex: "1" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "14px", color: "#9CA3AF", fontSize: "16px", zIndex: 1 }}>🔍</span>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search by city name or LOCODE (e.g. Iquique, CL IQQ)..."
                  style={{
                    width: "100%",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "13px 14px 13px 42px",
                    fontSize: "13px",
                    outline: "none",
                    color: "#111827",
                    boxSizing: "border-box",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                />
                {searchVal && (
                  <button
                    onClick={() => setSearchVal("")}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                {QUICK_CITIES.map((c) => (
                  <button
                    key={c}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "12px",
                      color: "#6B7280",
                      cursor: "pointer",
                      padding: "2px 0",
                      textDecoration: "underline",
                      textDecorationColor: "#D1D5DB",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "12px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex" }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                flex: "1",
                textAlign: "center",
                borderRight: i < STATS.length - 1 ? "1px solid #EBEBEB" : "none",
                padding: "6px 0",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 64px" }}>
        {/* Recent cities */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "500", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recently onboarded cities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {CITIES.map((city) => (
              <div
                key={city.locode}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
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
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginTop: "10px" }}>
                  {city.emissions}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Total GHG emissions</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>How it works</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
            HIAP guides you through four steps to generate a ranked action plan for your city.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
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
    </div>
  );
}
