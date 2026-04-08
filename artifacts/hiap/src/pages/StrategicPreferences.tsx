import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";

const ALL_SECTORS = [
  "Stationary Energy",
  "Transportation",
  "Waste",
  "Industrial Processes & Product Use (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)",
];

const TIMELINE_OPTIONS = [
  { value: "short",  label: "Short-term",    sub: "Actions implementable in less than 5 years" },
  { value: "medium", label: "Medium-term",   sub: "Actions implementable within 5–10 years" },
  { value: "long",   label: "Long-term",     sub: "Actions requiring more than 10 years" },
  { value: "none",   label: "No preference", sub: "Include actions across all timeframes" },
];

const DEFAULT_WEIGHTS = { impact: 55, alignment: 22, feasibility: 23 };

interface WeightState { impact: number; alignment: number; feasibility: number }

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
        sectors: string[];
        strategicPriorities: string;
        timeline: string | null;
        excludeText: string;
        weights?: WeightState;
      };
    } catch { return null; }
  }

  const saved = loadSaved();
  const [sectors,             setSectors]             = useState<Set<string>>(new Set(saved?.sectors ?? []));
  const [strategicPriorities, setStrategicPriorities] = useState(saved?.strategicPriorities ?? "");
  const [timeline,            setTimeline]            = useState<string | null>(saved?.timeline ?? null);
  const [excludeText,         setExcludeText]         = useState(saved?.excludeText ?? "");
  const [weights,             setWeights]             = useState<WeightState>(saved?.weights ?? { ...DEFAULT_WEIGHTS });

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
      localStorage.setItem(storageKey, JSON.stringify({
        sectors: Array.from(sectors),
        strategicPriorities,
        timeline,
        excludeText,
        weights,
      }));
    } catch {}

    const isCustomWeights = weights.impact !== DEFAULT_WEIGHTS.impact ||
      weights.alignment !== DEFAULT_WEIGHTS.alignment ||
      weights.feasibility !== DEFAULT_WEIGHTS.feasibility;

    const parts: string[] = [];
    if (sectors.size > 0) parts.push(`${sectors.size} priority sector${sectors.size !== 1 ? "s" : ""}`);
    if (strategicPriorities.trim()) parts.push("strategic priorities set");
    if (timeline) parts.push(`${TIMELINE_OPTIONS.find(t => t.value === timeline)?.label.toLowerCase()} timeline`);
    if (excludeText.trim()) parts.push("exclusion criteria set");
    if (isCustomWeights) parts.push("custom weights");

    setStepProgress(locode, "strategic", {
      visited: true,
      progress: timeline !== null ? 100 : sectors.size > 0 ? 50 : 10,
      sub: parts.length > 0 ? parts.join(" · ") : undefined,
    });
  }, [locode, sectors, strategicPriorities, timeline, excludeText, weights]);

  function toggleSector(s: string) {
    setSectors((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  function handleWeightChange(key: keyof WeightState, rawVal: number) {
    const newVal = Math.min(90, Math.max(5, Math.round(rawVal)));
    const others = (["impact", "alignment", "feasibility"] as Array<keyof WeightState>).filter(k => k !== key);
    const remaining = 100 - newVal;
    const currentOtherSum = weights[others[0]] + weights[others[1]];

    let r0: number, r1: number;
    if (currentOtherSum === 0) {
      r0 = Math.floor(remaining / 2);
      r1 = remaining - r0;
    } else {
      r0 = Math.round(remaining * weights[others[0]] / currentOtherSum);
      r0 = Math.max(5, Math.min(r0, remaining - 5));
      r1 = remaining - r0;
    }

    setWeights({ ...weights, [key]: newVal, [others[0]]: r0, [others[1]]: r1 });
  }

  function resetWeights() {
    setWeights({ ...DEFAULT_WEIGHTS });
  }

  const isCustomWeights = weights.impact !== DEFAULT_WEIGHTS.impact ||
    weights.alignment !== DEFAULT_WEIGHTS.alignment ||
    weights.feasibility !== DEFAULT_WEIGHTS.feasibility;

  const canSave = sectors.size > 0 || strategicPriorities.trim() !== "" || timeline !== null;

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

        {/* Strategic Priorities */}
        <Section title="Strategic Priorities" required badge="ALIGNMENT · 5%">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Describe what your city strategically prioritises — for example, job creation, social equity, public health improvements, or energy security. Actions that align with these priorities will score higher.
          </p>
          <textarea
            value={strategicPriorities}
            onChange={(e) => setStrategicPriorities(e.target.value)}
            placeholder="e.g. job creation in low-income areas, reducing air pollution near schools, energy independence from fossil fuels…"
            rows={4}
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
            onFocus={(e) => (e.target.style.borderColor = "#001EA7")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          {strategicPriorities.trim() && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "8px 0 0", fontWeight: "500" }}>
              ✓ Strategic priorities recorded
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

        {/* Scoring Weights */}
        <Section title="Scoring Weights" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
            Adjust how much each pillar contributes to the final ranking. The three weights must always sum to 100%. Move a slider and the other two adjust proportionally.
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 20px" }}>
            Default weights reflect the MEED+ methodology: Impact is primary (55%), followed by Feasibility (23%) and Alignment (22%).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <WeightSlider
              label="Impact"
              description="Emissions reduction potential and implementation timeline"
              value={weights.impact}
              defaultValue={DEFAULT_WEIGHTS.impact}
              color="#001EA7"
              onChange={(v) => handleWeightChange("impact", v)}
            />
            <WeightSlider
              label="Alignment"
              description="Policy support, priority sectors, and strategic co-benefit fit"
              value={weights.alignment}
              defaultValue={DEFAULT_WEIGHTS.alignment}
              color="#16A34A"
              onChange={(v) => handleWeightChange("alignment", v)}
            />
            <WeightSlider
              label="Feasibility"
              description="Legal environment and socioeconomic conditions"
              value={weights.feasibility}
              defaultValue={DEFAULT_WEIGHTS.feasibility}
              color="#F59E0B"
              onChange={(v) => handleWeightChange("feasibility", v)}
            />
          </div>

          {/* Weight total + reset */}
          <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                fontSize: "12px", fontWeight: "700", color: "#16A34A",
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "6px", padding: "4px 10px",
              }}>
                Total: {weights.impact + weights.alignment + weights.feasibility}%
              </div>
              {isCustomWeights && (
                <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "600", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "5px", padding: "3px 8px" }}>
                  Custom weights active
                </span>
              )}
            </div>
            {isCustomWeights && (
              <button
                onClick={resetWeights}
                style={{
                  fontSize: "12px", color: "#6B7280", background: "none",
                  border: "1px solid #E5E7EB", borderRadius: "6px",
                  padding: "5px 12px", cursor: "pointer",
                  transition: "all 0.12s",
                }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.borderColor = "#9CA3AF"; (e.target as HTMLElement).style.color = "#374151"; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.borderColor = "#E5E7EB"; (e.target as HTMLElement).style.color = "#6B7280"; }}
              >
                Reset to defaults
              </button>
            )}
          </div>
        </Section>

        {/* Actions to Exclude (optional) */}
        <Section title="Actions to Exclude" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Describe the types of actions your city wishes to exclude from the ranking — for example, actions that are already under way, politically infeasible, or outside your mandate. Actions matching this description will be removed from recommendations.
          </p>
          <textarea
            value={excludeText}
            onChange={(e) => setExcludeText(e.target.value)}
            placeholder="e.g. actions requiring national government approval, large capital infrastructure projects, actions targeting industrial facilities…"
            rows={4}
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
            onFocus={(e) => (e.target.style.borderColor = "#001EA7")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          {excludeText.trim() && (
            <p style={{ fontSize: "12px", color: "#F23D33", margin: "8px 0 0", fontWeight: "500" }}>
              ✓ Exclusion criteria recorded — matching actions will be removed from the ranking
            </p>
          )}
        </Section>

        {/* Save & Continue */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
          <button
            disabled={!canSave}
            onClick={() => navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/policy`)}
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

// ─── Weight Slider component ───────────────────────────────────────────────────

interface WeightSliderProps {
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  color: string;
  onChange: (v: number) => void;
}

function WeightSlider({ label, description, value, defaultValue, color, onChange }: WeightSliderProps) {
  const isDefault = value === defaultValue;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
        <div>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{label}</span>
          <span style={{ fontSize: "12px", color: "#9CA3AF", marginLeft: "8px" }}>{description}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
          {!isDefault && (
            <span style={{ fontSize: "11px", color: "#9CA3AF", textDecoration: "line-through" }}>{defaultValue}%</span>
          )}
          <span style={{
            fontSize: "14px", fontWeight: "700",
            color: isDefault ? "#6B7280" : color,
            minWidth: "38px", textAlign: "right",
          }}>
            {value}%
          </span>
        </div>
      </div>

      {/* Track + filled bar */}
      <div style={{ position: "relative", height: "28px", display: "flex", alignItems: "center" }}>
        {/* Default marker */}
        <div style={{
          position: "absolute",
          left: `${defaultValue}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "2px",
          height: "14px",
          background: "#D1D5DB",
          borderRadius: "1px",
          pointerEvents: "none",
          zIndex: 1,
        }} />
        <input
          type="range"
          min={5}
          max={90}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            height: "6px",
            borderRadius: "3px",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
            position: "relative",
            zIndex: 2,
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2.5px solid ${color};
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          }
          input[type=range]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2.5px solid ${color};
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>

      {/* Default annotation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
        <span style={{ fontSize: "10px", color: "#D1D5DB" }}>5%</span>
        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>
          Default: {defaultValue}%
          {!isDefault && <span style={{ color: color, marginLeft: "4px" }}>· adjusted</span>}
        </span>
        <span style={{ fontSize: "10px", color: "#D1D5DB" }}>90%</span>
      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

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
