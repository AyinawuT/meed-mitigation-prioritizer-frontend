import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

interface Props { params: { locode: string } }

export function StrategicPreferences({ params }: Props) {
  const [, navigate] = useLocation();
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
      };
    } catch { return null; }
  }

  const saved = loadSaved();
  const [sectors,             setSectors]             = useState<Set<string>>(new Set(saved?.sectors ?? []));
  const [strategicPriorities, setStrategicPriorities] = useState(saved?.strategicPriorities ?? "");
  const [timeline,            setTimeline]            = useState<string | null>(saved?.timeline ?? null);
  const [excludeText,         setExcludeText]         = useState(saved?.excludeText ?? "");

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
      }));
    } catch {}

    const parts: string[] = [];
    if (sectors.size > 0) parts.push(`${sectors.size} priority sector${sectors.size !== 1 ? "s" : ""}`);
    if (strategicPriorities.trim()) parts.push("strategic priorities set");
    if (timeline) parts.push(`${TIMELINE_OPTIONS.find(t => t.value === timeline)?.label.toLowerCase()} timeline`);
    if (excludeText.trim()) parts.push("exclusion criteria set");

    setStepProgress(locode, "strategic", {
      visited: true,
      progress: timeline !== null ? 100 : sectors.size > 0 ? 50 : 10,
      sub: parts.length > 0 ? parts.join(" · ") : undefined,
    });
  }, [locode, sectors, strategicPriorities, timeline, excludeText]);

  function toggleSector(s: string) {
    setSectors((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

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
