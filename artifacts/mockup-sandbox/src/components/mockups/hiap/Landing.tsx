import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

const QUICK_CITIES = ["Iquique", "Santiago", "Antofagasta", "Valparaíso", "Concepción"];

type CityData = {
  name: string;
  country: string;
  region: string;
  emissions: string;
  emissionsYear: string;
  population: string;
  area: string;
  biome: string;
  mapUrl: string;
};

const CITY_DATA: Record<string, CityData> = {
  iquique: {
    name: "Iquique",
    country: "Chile",
    region: "Tarapacá",
    emissions: "9,118,054 tCO₂e",
    emissionsYear: "2023",
    population: "214,857",
    area: "2,242 km²",
    biome: "Atacama Desert",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-70.22,-20.35,-70.06,-20.17&layer=mapnik",
  },
  santiago: {
    name: "Santiago",
    country: "Chile",
    region: "Región Metropolitana",
    emissions: "18,340,210 tCO₂e",
    emissionsYear: "2023",
    population: "6,700,000",
    area: "641 km²",
    biome: "Mediterranean Shrubland",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-70.85,-33.62,-70.5,-33.28&layer=mapnik",
  },
  antofagasta: {
    name: "Antofagasta",
    country: "Chile",
    region: "Antofagasta",
    emissions: "12,100,000 tCO₂e",
    emissionsYear: "2023",
    population: "402,651",
    area: "3,045 km²",
    biome: "Atacama Desert",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-70.47,-23.72,-70.36,-23.56&layer=mapnik",
  },
  valparaíso: {
    name: "Valparaíso",
    country: "Chile",
    region: "Valparaíso",
    emissions: "5,430,000 tCO₂e",
    emissionsYear: "2023",
    population: "296,655",
    area: "402 km²",
    biome: "Mediterranean Shrubland",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-71.68,-33.12,-71.57,-33.03&layer=mapnik",
  },
  concepción: {
    name: "Concepción",
    country: "Chile",
    region: "Biobío",
    emissions: "7,820,000 tCO₂e",
    emissionsYear: "2023",
    population: "223,574",
    area: "221 km²",
    biome: "Temperate Rainforest",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-73.12,-36.87,-73.06,-36.82&layer=mapnik",
  },
};

const STATS = [
  { value: "345", label: "Mitigation actions" },
  { value: "12", label: "Cities onboarded" },
  { value: "5", label: "GPC sectors covered" },
  { value: "1–2 min", label: "Time to recommendations" },
];

const HOW_STEPS = [
  { n: "1", title: "Select your city", desc: "Search by city name to find your city's existing emissions inventory." },
  { n: "2", title: "Complete your profile", desc: "Review and confirm emissions data, socioeconomic context, regulations & laws, policy alignment, and strategic preferences." },
  { n: "3", title: "Generate recommendations", desc: "Run HIAP's scoring pipeline across 345 mitigation actions ranked for your city." },
  { n: "4", title: "Act on the ranking", desc: "Download your ranked action plan and share with your city's climate team." },
];

function matchCity(query: string): CityData | null {
  if (!query.trim()) return null;
  const key = query.trim().toLowerCase();
  return CITY_DATA[key] ?? null;
}

function getSuggestions(query: string): CityData[] {
  if (!query.trim()) return [];
  const key = query.trim().toLowerCase();
  return Object.values(CITY_DATA).filter((c) =>
    c.name.toLowerCase().startsWith(key)
  );
}

export function Landing() {
  const [searchVal, setSearchVal] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = getSuggestions(searchVal);

  function selectCity(city: CityData) {
    setSearchVal(city.name);
    setSelectedCity(city);
    setShowSuggestions(false);
  }

  function handleSearchChange(val: string) {
    setSearchVal(val);
    setSelectedCity(null);
    setShowSuggestions(true);
  }

  function handleSearchBlur() {
    setTimeout(() => setShowSuggestions(false), 150);
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "28px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "48px", alignItems: "center" }}>
            {/* Left: headline */}
            <div style={{ flex: "0 0 380px" }}>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 10px", lineHeight: "1.3" }}>
                Prioritise climate actions for your city
              </p>
              <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.6", margin: "0" }}>
                HIAP analyses your city's emissions, policy context, and implementation capacity to recommend the highest-impact mitigation actions — ranked and ready to act on.
              </p>
            </div>

            {/* Right: search */}
            <div style={{ flex: "1", position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "14px", color: "#9CA3AF", fontSize: "16px", zIndex: 1 }}>🔍</span>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleSearchBlur}
                  placeholder="Search by city name (e.g. Iquique, Santiago, Antofagasta)..."
                  style={{
                    width: "100%",
                    border: selectedCity ? "1.5px solid #001EA7" : "1px solid #E5E7EB",
                    borderRadius: showSuggestions && suggestions.length > 0 ? "10px 10px 0 0" : "10px",
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
                    onClick={() => { setSearchVal(""); setSelectedCity(null); setShowSuggestions(false); }}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 10,
                  overflow: "hidden",
                }}>
                  {suggestions.map((city) => (
                    <div
                      key={city.name}
                      onMouseDown={() => selectCity(city)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderBottom: "1px solid #F5F5F5",
                        fontSize: "13px",
                        color: "#111827",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F7FF")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <span style={{ color: "#001EA7", fontSize: "15px" }}>📍</span>
                      <div>
                        <div style={{ fontWeight: "500" }}>{city.name}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{city.region}, {city.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick links */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                {QUICK_CITIES.map((c) => (
                  <button
                    key={c}
                    onMouseDown={() => selectCity(CITY_DATA[c.toLowerCase()]!)}
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

      {/* City preview panel — shown after selecting a city */}
      {selectedCity && (
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 20px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* City label */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ color: "#001EA7", fontSize: "16px" }}>📍</span>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {selectedCity.name}, {selectedCity.country}
              </span>
            </div>

            {/* Map + stats row */}
            <div style={{ display: "flex", gap: "28px", alignItems: "stretch" }}>
              {/* Map */}
              <div style={{
                flex: "0 0 460px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #EBEBEB",
                height: "220px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}>
                <iframe
                  src={selectedCity.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: "none", display: "block" }}
                  title={`Map of ${selectedCity.name}`}
                />
              </div>

              {/* Stats */}
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px" }}>
                {[
                  { icon: "↗", label: `Total emissions in ${selectedCity.emissionsYear}`, value: selectedCity.emissions, valueSize: "22px", valueWeight: "700" },
                  { icon: "👥", label: "Total population", value: selectedCity.population, valueSize: "16px", valueWeight: "600" },
                  { icon: "⬜", label: "Total land area", value: selectedCity.area, valueSize: "16px", valueWeight: "600" },
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ fontSize: "16px", marginTop: "2px", color: "#9CA3AF", width: "20px", textAlign: "center" }}>{stat.icon}</span>
                    <div>
                      <div style={{ fontSize: stat.valueSize as any, fontWeight: stat.valueWeight as any, color: "#111827", lineHeight: "1.2" }}>{stat.value}</div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <button
                  style={{
                    background: "#001EA7",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "13px 28px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,30,167,0.25)",
                  }}
                >
                  View City Profile →
                </button>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px", textAlign: "right" }}>
                  Joined 2024 · {selectedCity.region}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "10px 64px" }}>
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
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 28px" }}>
        {/* How it works */}
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>How it works</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
            HIAP guides you through four steps to generate a ranked action plan for your city.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "12px",
                  padding: "14px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#EFF6FF",
                    color: "#001EA7",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
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
