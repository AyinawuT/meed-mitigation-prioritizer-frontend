import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";
import actionNames from "@/data/actionNames.json";

interface ActionMeta { name: string; category: string; subcategory: string; }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

const ACTION_SECTOR: Record<string, string> = {
  c40_0010: "Buildings",
  c40_0012: "Buildings",
  c40_0013: "Buildings",
  c40_0023: "Transport",
  c40_0034: "Waste",
  c40_0040: "Waste",
  c40_0037: "Waste",
  ipcc_0074: "Urban Planning",
  c40_0025: "Transport",
  c40_0029: "Transport",
};

const SECTOR_CHIP: Record<string, { bg: string; text: string }> = {
  Buildings:     { bg: "#FFF3E0", text: "#C05621" },
  Transport:     { bg: "#EFF6FF", text: "#1D4ED8" },
  Waste:         { bg: "#F0FDF4", text: "#16A34A" },
  "Urban Planning": { bg: "#FAF5FF", text: "#7C3AED" },
};

const ALL_SECTORS = [
  "Stationary Energy",
  "Transportation",
  "Waste",
  "Industrial Processes & Product Use (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)",
];

const ALL_COBENEFITS = [
  "Job creation",
  "Public health",
  "Social equity",
  "Air quality",
  "Climate resilience",
  "Energy security",
];

const TIMELINE_OPTIONS = [
  { value: "short",  label: "Short-term",  sub: "Actions implementable within 1–3 years" },
  { value: "medium", label: "Medium-term", sub: "Actions implementable within 3–7 years" },
  { value: "long",   label: "Long-term",   sub: "Actions implementable within 7+ years" },
  { value: "none",   label: "No preference", sub: "Include actions across all timeframes" },
];

const ALL_ACTION_IDS = Object.keys(ACTION_NAMES);

interface Props { params: { locode: string } }

export function StrategicPreferences({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const [sectors,    setSectors]    = useState<Set<string>>(new Set());
  const [cobenefits, setCobenefits] = useState<Set<string>>(new Set());
  const [timeline,   setTimeline]   = useState<string | null>(null);
  const [excluded,   setExcluded]   = useState<Set<string>>(new Set());
  const [excludeOpen, setExcludeOpen] = useState(false);

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
    const parts: string[] = [];
    if (sectors.size > 0) parts.push(`${sectors.size} priority sector${sectors.size !== 1 ? "s" : ""}`);
    if (cobenefits.size > 0) parts.push(`${cobenefits.size} co-benefit${cobenefits.size !== 1 ? "s" : ""}`);
    if (timeline) parts.push(`${TIMELINE_OPTIONS.find(t => t.value === timeline)?.label.toLowerCase()} timeline`);
    if (excluded.size > 0) parts.push(`${excluded.size} action${excluded.size !== 1 ? "s" : ""} excluded`);

    setStepProgress(locode, "strategic", {
      visited: true,
      progress: timeline !== null ? 100 : sectors.size > 0 ? 50 : 10,
      sub: parts.length > 0 ? parts.join(" · ") : undefined,
    });
  }, [locode, sectors.size, cobenefits.size, timeline, excluded.size]);

  function toggleSet(set: Set<string>, setFn: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setFn(next);
  }

  const canSave = sectors.size > 0 || cobenefits.size > 0 || timeline !== null;

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
            Tell MEED+ HIAP which sectors and goals matter most to your city, how quickly actions must be implementable, and whether any specific actions should be excluded from the ranking.
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
                  onClick={() => toggleSet(sectors, setSectors, s)}
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

        {/* Strategic Priorities / Co-benefits */}
        <Section title="Strategic Priorities" required badge="ALIGNMENT · 5%">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Select the co-benefits your city values. Actions delivering these outcomes will score higher on strategic alignment.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ALL_COBENEFITS.map((cb) => {
              const on = cobenefits.has(cb);
              return (
                <button
                  key={cb}
                  onClick={() => toggleSet(cobenefits, setCobenefits, cb)}
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
                  {cb}
                </button>
              );
            })}
          </div>
          {cobenefits.size > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "10px 0 0", fontWeight: "500" }}>
              ✓ {cobenefits.size} co-benefit{cobenefits.size !== 1 ? "s" : ""} selected
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
                    background: on ? "white" : "white",
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

        {/* Actions to Exclude (optional) */}
        <Section title="Actions to Exclude" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Exclude specific actions from the ranking regardless of their score — for example, actions already under way or politically infeasible. Excluded actions will not appear in your recommendations.
          </p>
          <button
            onClick={() => setExcludeOpen(!excludeOpen)}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              fontSize: "13px", color: "#001EA7", fontWeight: "500",
              display: "flex", alignItems: "center", gap: "6px", marginBottom: excludeOpen ? "14px" : "0",
            }}
          >
            <span style={{ fontSize: "11px", display: "inline-block", transform: excludeOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>▶</span>
            {excludeOpen ? "Hide" : "Show"} action list
            {excluded.size > 0 && (
              <span style={{ background: "#FFEAEE", color: "#F23D33", fontSize: "11px", padding: "1px 7px", borderRadius: "10px", fontWeight: "600" }}>
                {excluded.size} excluded
              </span>
            )}
          </button>

          {excludeOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {ALL_ACTION_IDS.map((id) => {
                const meta = ACTION_NAMES[id];
                const sector = ACTION_SECTOR[id] ?? "Other";
                const chipStyle = SECTOR_CHIP[sector] ?? { bg: "#F3F4F6", text: "#374151" };
                const isExcluded = excluded.has(id);
                return (
                  <label
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: isExcluded ? "1.5px solid #FCA5A5" : "1px solid #E5E7EB",
                      background: isExcluded ? "#FFF5F5" : "white",
                      cursor: "pointer",
                      transition: "background 0.12s, border-color 0.12s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={() => toggleSet(excluded, setExcluded, id)}
                      style={{ accentColor: "#F23D33", width: "15px", height: "15px", flexShrink: 0, cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: "#111827", lineHeight: "1.4" }}>{meta.name}</div>
                    </div>
                    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: chipStyle.bg, color: chipStyle.text, fontWeight: "600", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {sector}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Section>

        {/* Save & Continue */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
          <button
            disabled={!canSave}
            onClick={() => navigate(`/city/${citySlug}`)}
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
            Save & continue →
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
