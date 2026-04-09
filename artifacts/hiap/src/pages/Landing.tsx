import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { CITIES, HOW_STEPS, searchCities, type CityData } from "@/data/cities";

const QUICK_CITIES = ["Iquique", "Antofagasta", "Arica", "Alto Hospicio", "Taltal"];

export function Landing() {
  const [, navigate] = useLocation();
  const [searchVal, setSearchVal] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = searchCities(searchVal);

  function selectCity(city: CityData) {
    setSearchVal(city.name);
    setSelectedCity(city);
    setShowDropdown(false);
    setHighlightIdx(-1);
  }

  function handleChange(val: string) {
    setSearchVal(val);
    setSelectedCity(null);
    setShowDropdown(true);
    setHighlightIdx(-1);
  }

  function handleBlur() {
    setTimeout(() => setShowDropdown(false), 150);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      selectCity(suggestions[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  const hasDropdown = showDropdown && suggestions.length > 0;

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
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
                MEED+ HIAP analyses your city's emissions, policy context, and implementation capacity to recommend the highest-impact mitigation actions — ranked and ready to act on.
              </p>
            </div>

            {/* Right: search */}
            <div style={{ flex: "1", position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "14px", color: "#9CA3AF", fontSize: "16px", zIndex: 1 }}>
                  🔍
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchVal}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by city name (e.g. Iquique, Antofagasta, Arica)..."
                  style={{
                    width: "100%",
                    border: selectedCity ? "1.5px solid #001EA7" : "1px solid #E5E7EB",
                    borderRadius: hasDropdown ? "10px 10px 0 0" : "10px",
                    padding: "13px 36px 13px 42px",
                    fontSize: "13px",
                    outline: "none",
                    color: "#111827",
                    boxSizing: "border-box",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    transition: "border-color 0.15s",
                  }}
                />
                {searchVal && (
                  <button
                    onMouseDown={() => { setSearchVal(""); setSelectedCity(null); setShowDropdown(false); }}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "16px", lineHeight: 1 }}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {hasDropdown && (
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
                  zIndex: 20,
                  overflow: "hidden",
                  maxHeight: "260px",
                  overflowY: "auto",
                }}>
                  {suggestions.map((city, idx) => (
                    <div
                      key={city.locode}
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
                        background: idx === highlightIdx ? "#F5F7FF" : "white",
                      }}
                      onMouseEnter={() => setHighlightIdx(idx)}
                    >
                      <span style={{ color: "#001EA7", fontSize: "15px" }}>📍</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500" }}>{city.name}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{city.region}, {city.country}</div>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "right" }}>
                        <div>{city.locode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick links */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                {QUICK_CITIES.map((name) => {
                  const city = CITIES.find((c) => c.name === name);
                  if (!city) return null;
                  return (
                    <button
                      key={name}
                      onMouseDown={() => selectCity(city)}
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
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City preview panel */}
      {selectedCity && (
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 20px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ color: "#001EA7", fontSize: "16px" }}>📍</span>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {selectedCity.name}, {selectedCity.country}
              </span>
              <span style={{
                background: "#F0FDF4",
                color: "#16A34A",
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "999px",
                border: "1px solid #BBF7D0",
                marginLeft: "4px",
              }}>
                ONBOARDED
              </span>
            </div>

            <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
              {/* Left column: map + CTA button */}
              <div style={{ flex: "0 0 460px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Map */}
                <div style={{
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

                {/* CTA below the map */}
                <button
                  onClick={() => {
                    const slug = selectedCity.locode.replace(" ", "-");
                    navigate(`/city/${slug}`);
                  }}
                  style={{
                    background: "#001EA7",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "13px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,30,167,0.25)",
                    transition: "opacity 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span>Open {selectedCity.name} City Profile</span>
                  <span style={{ fontSize: "16px" }}>→</span>
                </button>
              </div>

              {/* Stats */}
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px", paddingTop: "12px" }}>
                {[
                  {
                    icon: "↗",
                    label: `Total emissions in ${selectedCity.emissionsYear}`,
                    value: selectedCity.emissions,
                    valueSize: "22px",
                    valueWeight: "700",
                    valueColor: "#111827",
                  },
                  {
                    icon: "👥",
                    label: "Total population",
                    value: selectedCity.population,
                    valueSize: "16px",
                    valueWeight: "600",
                    valueColor: "#111827",
                  },
                  {
                    icon: "⬜",
                    label: "Total land area",
                    value: selectedCity.area,
                    valueSize: "16px",
                    valueWeight: "600",
                    valueColor: "#111827",
                  },
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ fontSize: "16px", marginTop: "2px", color: "#9CA3AF", width: "20px", textAlign: "center" }}>
                      {stat.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: stat.valueSize, fontWeight: stat.valueWeight as any, color: stat.valueColor, lineHeight: "1.2" }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 64px 60px" }}>
        {/* How it works */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 3px" }}>How it works</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
            MEED+ HIAP guides you through four steps to generate a ranked action plan for your city.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "12px",
                  padding: "24px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  minHeight: "160px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#CBD5E1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#EBEBEB";
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
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginBottom: "6px" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5" }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All onboarded cities */}
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 3px" }}>Onboarded cities</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
            {CITIES.length} cities across northern Chile with emissions inventories ready to prioritise.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {CITIES.map((city) => (
              <button
                key={city.locode}
                onClick={() => { const slug = city.locode.replace(" ", "-"); navigate(`/city/${slug}`); }}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#001EA7";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#EBEBEB";
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#EFF6FF",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  📍
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{city.name}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{city.region}</div>
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{city.locode}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#001EA7", padding: "20px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#16A34A", borderRadius: "5px", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>
              M+
            </div>
            <span style={{ color: "#93C5FD", fontSize: "13px" }}>MEED+ · HIAP</span>
          </div>
          <span style={{ color: "#3B5FA0", fontSize: "12px" }}>
            High Impact Action Prioritizer — Climate Solutions for Chilean Cities
          </span>
        </div>
      </div>
    </div>
  );
}
