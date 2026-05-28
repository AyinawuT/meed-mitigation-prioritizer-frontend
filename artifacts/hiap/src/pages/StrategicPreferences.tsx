import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";

const ALL_SECTORS = [
  "Stationary Energy",
  "Transportation",
  "Waste",
  "Industrial Processes & Product Use (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)",
];

const CO_BENEFITS = [
  { key: "air_quality",             label: "Air Quality" },
  { key: "water_quality",           label: "Water Quality" },
  { key: "habitat",                 label: "Habitat & Biodiversity" },
  { key: "housing",                 label: "Housing" },
  { key: "stakeholder_engagement",  label: "Stakeholder Engagement" },
  { key: "cost_of_living",          label: "Cost of Living" },
  { key: "mobility",                label: "Mobility" },
];

const TIMELINE_OPTIONS = [
  { value: "short",  label: "Short-term",    sub: "Actions implementable in less than 5 years" },
  { value: "medium", label: "Medium-term",   sub: "Actions implementable within 5–10 years" },
  { value: "long",   label: "Long-term",     sub: "Actions requiring more than 10 years" },
  { value: "none",   label: "No preference", sub: "Include actions across all timeframes" },
];

interface Props { params: { locode: string } }

export function StrategicPreferences({ params }: Props) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const storageKey = `hiap:${locode}:strategic:form`;

  function loadSaved() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as {
        sectors?: string[];
        strategicPriorities?: string | string[];
        timeline?: string | null;
        excludeText?: string;
        excludedSectors?: string[];
        excludedCoBenefits?: string[];
        weights?: unknown;
      };
    } catch { return null; }
  }

  const saved = loadSaved();

  // Backward compat: strategicPriorities was previously a free-text string
  const savedPriorities: string[] = Array.isArray(saved?.strategicPriorities)
    ? saved.strategicPriorities
    : [];

  const [sectors,            setSectors]           = useState<Set<string>>(new Set(saved?.sectors ?? []));
  const [priorities,         setPriorities]        = useState<Set<string>>(new Set(savedPriorities));
  const [timeline,           setTimeline]          = useState<string | null>(saved?.timeline ?? null);
  const [excludedSectors,    setExcludedSectors]   = useState<Set<string>>(new Set(saved?.excludedSectors ?? []));
  const [excludedCoBenefits, setExcludedCoBenefits] = useState<Set<string>>(new Set(saved?.excludedCoBenefits ?? []));
  const [excludeText,        setExcludeText]       = useState(saved?.excludeText ?? "");

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>City not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");

  useEffect(() => {
    try {
      let existingWeights: unknown;
      try {
        const ex = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        existingWeights = ex.weights;
      } catch {}

      localStorage.setItem(storageKey, JSON.stringify({
        sectors: Array.from(sectors),
        strategicPriorities: Array.from(priorities),
        timeline,
        excludeText,
        excludedSectors: Array.from(excludedSectors),
        excludedCoBenefits: Array.from(excludedCoBenefits),
        ...(existingWeights !== undefined ? { weights: existingWeights } : {}),
      }));
    } catch {}

    const parts: string[] = [];
    if (sectors.size > 0) parts.push(`${sectors.size} priority sector${sectors.size !== 1 ? "s" : ""}`);
    if (priorities.size > 0) parts.push(`${priorities.size} strategic priorit${priorities.size !== 1 ? "ies" : "y"}`);
    if (timeline) parts.push(`${TIMELINE_OPTIONS.find(t => t.value === timeline)?.label.toLowerCase()} timeline`);
    const hasExclusions = excludedSectors.size > 0 || excludedCoBenefits.size > 0 || excludeText.trim();
    if (hasExclusions) parts.push("exclusion criteria set");

    setStepProgress(locode, "strategic", {
      visited: true,
      progress: timeline !== null ? 100 : sectors.size > 0 ? 50 : 10,
      sub: parts.length > 0 ? parts.join(" · ") : undefined,
    });
  }, [locode, sectors, priorities, timeline, excludedSectors, excludedCoBenefits, excludeText]);

  function toggleSector(s: string) {
    setSectors((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  }
  function togglePriority(k: string) {
    setPriorities((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }
  function toggleExcludedSector(s: string) {
    setExcludedSectors((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  }
  function toggleExcludedCoBenefit(k: string) {
    setExcludedCoBenefits((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  const canSave = sectors.size > 0 || priorities.size > 0 || timeline !== null;
  const hasAnyExclusion = excludedSectors.size > 0 || excludedCoBenefits.size > 0 || excludeText.trim();

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={3} citySlug={citySlug} />

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Strategic Preferences</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
            Strategic Preferences
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
            Tell MEED+ HIAP which sectors and goals matter most to your city, how quickly actions must be implementable, and whether any types of actions should be excluded from the ranking.
          </p>
          <p style={{ fontSize: "13px", color: "#16A34A", fontWeight: "500", margin: 0 }}>
            MEED+ ALIGNMENT & IMPACT: Alignment shapes 22% of ranking — priority sectors 15% of alignment score, strategic priorities 5% · Implementation timeline shapes 20% of impact score · Impact shapes 55% of ranking
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 60px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Priority Sectors */}
        <Section title="Priority Sectors" required badge="ALIGNMENT · 15%">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Select the sectors your city wants to prioritise. Actions in these sectors will receive a higher alignment score.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ALL_SECTORS.map((s) => {
              const on = sectors.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSector(s)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    border: on ? "1.5px solid #001EA7" : "1.5px solid #E5E7EB",
                    background: on ? "#001EA7" : "white",
                    color: on ? "white" : "#374151",
                    fontSize: "13px",
                    fontWeight: on ? "600" : "400",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {sectors.size > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "10px 0 0", fontWeight: "500" }}>
              ✓ {sectors.size} sector{sectors.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </Section>

        {/* Strategic Priorities — co-benefit checkboxes */}
        <Section title="Strategic Priorities" required badge="ALIGNMENT · 5%">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Select the co-benefits your city wants to emphasise. Actions that deliver these co-benefits alongside emissions reductions will score higher in the alignment ranking.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {CO_BENEFITS.map(({ key, label }) => {
              const on = priorities.has(key);
              return (
                <button
                  key={key}
                  onClick={() => togglePriority(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: on ? "1.5px solid #001EA7" : "1.5px solid #E5E7EB",
                    background: on ? "#EEF2FF" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                >
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "3px", flexShrink: 0,
                    border: on ? "none" : "1.5px solid #D1D5DB",
                    background: on ? "#001EA7" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxSizing: "border-box",
                  }}>
                    {on && <span style={{ color: "white", fontSize: "11px", lineHeight: 1 }}>✓</span>}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: on ? "600" : "400", color: on ? "#001EA7" : "#374151" }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {priorities.size > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "10px 0 0", fontWeight: "500" }}>
              ✓ {priorities.size} co-benefit{priorities.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </Section>

        {/* Implementation Timeline */}
        <Section title="Implementation Timeline" required badge="IMPACT · 20%">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            How quickly do you need actions to be implementable? This filters and weights actions by their time-to-impact.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {TIMELINE_OPTIONS.map((opt) => {
              const on = timeline === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTimeline(on ? null : opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: on ? "1.5px solid #001EA7" : "1.5px solid #E5E7EB",
                    background: on ? "#F5F7FF" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                >
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: on ? "5px solid #001EA7" : "1.5px solid #D1D5DB",
                    flexShrink: 0,
                    background: "white",
                    boxSizing: "border-box",
                  }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: on ? "600" : "400", color: on ? "#001EA7" : "#111827" }}>{opt.label}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>{opt.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Actions to Exclude — structured */}
        <Section title="Actions to Exclude" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 18px" }}>
            Specify which types of actions your city wants to exclude from the ranking. In the pre-flight summary, you will be able to review and confirm which specific actions are proposed for exclusion before running the ranking.
          </p>

          {/* Exclude by sector */}
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>Exclude by sector</p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 10px" }}>All actions belonging to these sectors will be proposed for exclusion.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            {ALL_SECTORS.map((s) => {
              const on = excludedSectors.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleExcludedSector(s)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    border: on ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                    background: on ? "#FEF2F2" : "white",
                    color: on ? "#DC2626" : "#374151",
                    fontSize: "13px",
                    fontWeight: on ? "600" : "400",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {excludedSectors.size > 0 && (
            <p style={{ fontSize: "12px", color: "#DC2626", margin: "0 0 18px", fontWeight: "500" }}>
              {excludedSectors.size} sector{excludedSectors.size !== 1 ? "s" : ""} marked for exclusion
            </p>
          )}
          {excludedSectors.size === 0 && <div style={{ marginBottom: "18px" }} />}

          {/* Exclude by co-benefit impact */}
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>Exclude by co-benefit impact</p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 10px" }}>Actions that have a negative effect on the selected co-benefits will be proposed for exclusion.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            {CO_BENEFITS.map(({ key, label }) => {
              const on = excludedCoBenefits.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleExcludedCoBenefit(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: on ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                    background: on ? "#FEF2F2" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                >
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "3px", flexShrink: 0,
                    border: on ? "none" : "1.5px solid #D1D5DB",
                    background: on ? "#DC2626" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxSizing: "border-box",
                  }}>
                    {on && <span style={{ color: "white", fontSize: "11px", lineHeight: 1 }}>✓</span>}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: on ? "600" : "400", color: on ? "#DC2626" : "#374151" }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {excludedCoBenefits.size > 0 && (
            <p style={{ fontSize: "12px", color: "#DC2626", margin: "0 0 18px", fontWeight: "500" }}>
              {excludedCoBenefits.size} co-benefit{excludedCoBenefits.size !== 1 ? "s" : ""} selected — actions with negative impact on these will be proposed for exclusion
            </p>
          )}
          {excludedCoBenefits.size === 0 && <div style={{ marginBottom: "18px" }} />}

          {/* Additional exclusion criteria */}
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>
            Additional exclusion criteria <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0, color: "#9CA3AF" }}>(optional)</span>
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 8px" }}>
            Describe any other actions to exclude — for example, actions already under way, politically infeasible, or outside your mandate.
          </p>
          <textarea
            value={excludeText}
            onChange={(e) => setExcludeText(e.target.value)}
            placeholder="Do not include actions related to electric vehicles or electric mobility"
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              fontSize: "13px",
              color: "#111827",
              border: "1.5px solid #E5E7EB",
              borderRadius: "8px",
              resize: "vertical",
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              lineHeight: "1.6",
              outline: "none",
              background: "white",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          {excludeText.trim() && (
            <p style={{ fontSize: "12px", color: "#DC2626", margin: "8px 0 0", fontWeight: "500" }}>
              Additional exclusion criteria recorded
            </p>
          )}

          {!hasAnyExclusion && (
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "12px 0 0", fontStyle: "italic" }}>
              No exclusion criteria set — all actions will be included in the ranking.
            </p>
          )}
        </Section>

        {/* Save & Continue */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
          <button
            disabled={!canSave}
            onClick={() => { confirmStep(locode, "strategic"); navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/policy`); }}
            style={{
              background: canSave ? "#16A34A" : "#E5E7EB",
              color: canSave ? "white" : "#9CA3AF",
              border: "none",
              borderRadius: "8px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            {fromPreflight ? "Save & return to pre-flight →" : "Save & continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  badge?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Section({ title, badge, required, children }: SectionProps) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #EBEBEB",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: 0 }}>{title}</h2>
        {required && (
          <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "500" }}>REQUIRED</span>
        )}
        {badge && (
          <span style={{ marginLeft: "auto", fontSize: "10px", background: "#F0F9FF", color: "#0369A1", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", letterSpacing: "0.03em" }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
