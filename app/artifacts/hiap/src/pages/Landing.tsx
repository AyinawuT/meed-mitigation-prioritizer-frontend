import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CITIES,
  CITIES_WITH_INVENTORY,
  CITIES_BY_LOCODE,
  HOW_STEPS,
  searchCities,
  type CityData,
} from "@/data/cities";
import { getStepProgress } from "@/lib/stepProgress";
import { getFormattedTotalEmissions, getInventoryYear } from "@/lib/cityInventory";
import { useCityAttributes } from "@/hooks/use-city-attributes";
import { useLanguage } from "@/lib/i18n";
import { MapEmbed } from "@/components/MapEmbed";

const PROFILE_STEPS = ["emissions", "socioeconomic", "regulations", "strategic", "policy"];

function getCityStatus(locode: string): "AVAILABLE" | "IN PROGRESS" | "ONBOARDED" {
  const steps = PROFILE_STEPS.map((s) => ({ key: s, ...getStepProgress(locode, s) }));
  const emissionsP = steps.find((s) => s.key === "emissions")?.progress ?? 0;

  const anyStarted = emissionsP > 0 || steps.some((s) => s.confirmed);
  if (!anyStarted) return "AVAILABLE";

  const required = ["emissions", "socioeconomic", "regulations", "strategic"];
  const allComplete = required.every((key) => {
    const p = steps.find((s) => s.key === key);
    return p?.confirmed && (p?.progress ?? 0) >= 100;
  });
  return allComplete ? "ONBOARDED" : "IN PROGRESS";
}

function hasRanking(locode: string): boolean {
  try {
    return !!localStorage.getItem(`hiap:${locode}:results`);
  } catch {
    return false;
  }
}

export function Landing() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [searchVal, setSearchVal] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [rankedCities, setRankedCities] = useState<CityData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const cityAttrs = useCityAttributes(selectedCity?.locode ?? "");

  // Cities the user has already generated a ranking for (localStorage is not
  // reactive, so read once on mount — Landing remounts on navigation).
  useEffect(() => {
    setRankedCities(
      CITIES.filter((c) => hasRanking(c.locode)).map((c) => CITIES_BY_LOCODE[c.locode]),
    );
  }, []);

  const trimmed = searchVal.trim();
  const isSearching = trimmed.length > 0 && !selectedCity;
  // Empty query → offer the demo-ready cities (those with an emissions inventory).
  const dropdownList = isSearching ? searchCities(trimmed) : CITIES_WITH_INVENTORY;
  const noMatches = isSearching && dropdownList.length === 0;

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
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightIdx((i) => Math.min(i + 1, dropdownList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0 && dropdownList[highlightIdx]) {
      selectCity(dropdownList[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  const panelOpen = showDropdown && !selectedCity;

  const heroStats = [
    { value: "155", label: t("Mitigation actions") },
    { value: String(CITIES_WITH_INVENTORY.length), label: t("Cities with emissions data") },
    { value: "5", label: t("GPC sectors covered") },
    { value: "1–2 min", label: t("Time to recommendations") },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #001EA7 0%, #0A2FC4 55%, #001456 100%)",
        padding: "56px 64px 64px",
        position: "relative",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#9DB4FF", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            {t("Climate mitigation planning for Chilean cities")}
          </div>
          <h1 style={{ fontSize: "38px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 16px", lineHeight: "1.15", letterSpacing: "-0.02em" }}>
            {t("Find the best path to your city's climate action")}
          </h1>
          <p style={{ color: "#C7D2FE", fontSize: "15px", lineHeight: "1.6", margin: "0 auto 32px", maxWidth: "600px" }}>
            {t("Search a city to score and rank over 100 mitigation actions against its emissions, laws, policy and socioeconomic profile.")}
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto", textAlign: "left" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={18} color="#9CA3AF" style={{ position: "absolute", left: "16px", zIndex: 1 }} />
              <input
                ref={inputRef}
                type="text"
                value={searchVal}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={t("Search by city name (e.g. Iquique, Antofagasta, Arica)...")}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "none",
                  borderRadius: panelOpen ? "12px 12px 0 0" : "12px",
                  padding: "16px 40px 16px 46px",
                  fontSize: "15px",
                  outline: "none",
                  color: "#111827",
                  boxSizing: "border-box",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                }}
              />
              {searchVal && (
                <button
                  onMouseDown={() => { setSearchVal(""); setSelectedCity(null); setShowDropdown(true); inputRef.current?.focus(); }}
                  style={{ position: "absolute", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", lineHeight: 1, display: "flex", alignItems: "center" }}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {panelOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                zIndex: 30,
                overflow: "hidden",
                maxHeight: "320px",
                overflowY: "auto",
              }}>
                {/* Section label */}
                <div style={{ padding: "10px 16px 6px", fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {isSearching ? t("Search results") : t("Cities ready to explore")}
                </div>

                {noMatches ? (
                  <div style={{ padding: "8px 16px 18px" }}>
                    <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", lineHeight: "1.5" }}>
                      {t("No cities match \"{q}\". Try one of the cities with emissions data:", { q: trimmed })}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {CITIES_WITH_INVENTORY.map((city) => (
                        <button
                          key={city.locode}
                          onMouseDown={() => selectCity(city)}
                          style={{ background: "#F0F4FF", border: "1px solid #DBE3FF", borderRadius: "999px", padding: "5px 12px", fontSize: "12px", color: "#001EA7", cursor: "pointer", fontWeight: "500" }}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  dropdownList.map((city, idx) => (
                    <div
                      key={city.locode}
                      onMouseDown={() => selectCity(city)}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "13px",
                        color: "#111827",
                        background: idx === highlightIdx ? "#F0F4FF" : "white",
                      }}
                    >
                      <MapPin size={15} color="#001EA7" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "500" }}>{city.name}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city.region}, {city.country}</div>
                      </div>
                      {city.emissionsYear && (
                        <span style={{ fontSize: "10px", fontWeight: "600", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "2px 8px", flexShrink: 0 }}>
                          {t("Data ready")}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Stat strip */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "36px", marginTop: "40px" }}>
            {heroStats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: "700", color: "#FFFFFF", lineHeight: "1.1" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9DB4FF", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Selected city preview ────────────────────────────────────────── */}
      {selectedCity && (
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "24px 64px 28px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <MapPin size={16} color="#001EA7" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>
                {selectedCity.name}, {selectedCity.country}
              </span>
              {(() => {
                const status = getCityStatus(selectedCity.locode);
                const styles: Record<string, { bg: string; color: string; border: string }> = {
                  "AVAILABLE":   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
                  "IN PROGRESS": { bg: "#FFF7ED", color: "#C05621", border: "#FED7AA" },
                  "ONBOARDED":   { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
                };
                const s = styles[status];
                return (
                  <span style={{ background: s.bg, color: s.color, fontSize: "10px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px", border: `1px solid ${s.border}` }}>
                    {t(status)}
                  </span>
                );
              })()}
            </div>

            <div style={{ display: "flex", gap: "28px", alignItems: "stretch", flexWrap: "wrap" }}>
              {/* Left: map + CTA */}
              <div style={{ flex: "1 1 420px", minWidth: "300px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <MapEmbed cityName={selectedCity.name} regionName={selectedCity.region} height="200px" />
                <button
                  onClick={() => navigate(`/city/${selectedCity.locode.replace(" ", "-")}`)}
                  style={{
                    background: "#16A34A",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                    boxShadow: "0 2px 8px rgba(22,163,74,0.28)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {t("Start ranking for {name} →", { name: selectedCity.name })}
                </button>
              </div>

              {/* Right: hero metric + secondary stats */}
              <div style={{ flex: "1 1 360px", minWidth: "280px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
                {(() => {
                  const yr = getInventoryYear(selectedCity.locode) ?? selectedCity.emissionsYear;
                  const emissions = getFormattedTotalEmissions(selectedCity.locode) ?? selectedCity.emissions;
                  return (
                    <div style={{ background: "#F8FAFC", border: "1px solid #E9EEF5", borderRadius: "12px", padding: "18px 20px" }}>
                      <div style={{ fontSize: "11px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        {yr ? t("Total emissions · inventory {year}", { year: yr }) : t("Total emissions")}
                      </div>
                      <div style={{ fontSize: "30px", fontWeight: "700", color: "#001EA7", lineHeight: "1.1" }}>
                        {emissions ?? t("No data available")}
                      </div>
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {[
                    { label: t("Population"), value: cityAttrs.population },
                    { label: t("Land area"), value: cityAttrs.area },
                    { label: t("Pop. density"), value: cityAttrs.populationDensity },
                  ].map((stat) => (
                    <div key={stat.label} style={{ flex: "1 1 120px", minWidth: "110px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: stat.value ? "#111827" : "#9CA3AF", lineHeight: "1.2" }}>
                        {stat.value ?? "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", padding: "36px 64px 60px", width: "100%" }}>

        {/* Cities with ranked actions */}
        {rankedCities.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 3px" }}>
              {t("Cities with ranked actions")}
            </h2>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
              {t("Jump straight back into a ranking you've already generated.")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
              {rankedCities.map((city) => (
                <button
                  key={city.locode}
                  onClick={() => navigate(`/city/${city.locode.replace(" ", "-")}/recommendations`)}
                  style={{
                    textAlign: "left",
                    background: "white",
                    border: "1px solid #E9EEF5",
                    borderLeft: "3px solid #16A34A",
                    borderRadius: "12px",
                    padding: "16px 18px",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "2px 8px" }}>
                      ✓ {t("Ranked")}
                    </span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{city.name}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{city.region}</div>
                  <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: "600", marginTop: "10px" }}>
                    {t("View ranking →")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 3px" }}>{t("How it works")}</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
            {t("Aceleradora Local de Mitigación guides you through four steps to generate a ranked action plan for your city.")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "white",
                  border: "1px solid #EBEBEB",
                  borderRadius: "12px",
                  padding: "22px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFF6FF", color: "#001EA7", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                  {step.n}
                </div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginBottom: "6px" }}>
                  {t(step.title)}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5" }}>{t(step.desc)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
