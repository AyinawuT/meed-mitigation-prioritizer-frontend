import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";

const NATIONAL_FRAMEWORKS = [
  {
    id: "eclp",
    name: "Estrategia Climática de Largo Plazo (ECLP)",
    sub: "Chile's long-term climate strategy — net zero by 2050, carbon neutral by 2050",
  },
  {
    id: "ndc",
    name: "Nationally Determined Contribution (NDC)",
    sub: "Chile's updated NDC commits to a GHG emissions peak by 2025 and net zero by 2050",
  },
  {
    id: "ley21455",
    name: "Ley Marco de Cambio Climático (Law 21.455)",
    sub: "2022 framework law — mandates municipal PCGCCs and sectoral mitigation plans",
  },
  {
    id: "pcgcc",
    name: "Plan Comunal de Gestión del Cambio Climático (PCGCC)",
    sub: "Municipal climate management plan required by Law 21.455",
  },
  {
    id: "pancc",
    name: "Plan de Acción Nacional de Cambio Climático (PANCC)",
    sub: "National climate action plan covering mitigation and adaptation priorities",
  },
  {
    id: "pna",
    name: "Plan Nacional de Adaptación al Cambio Climático (PNA)",
    sub: "National adaptation plan with sectoral and cross-cutting adaptation measures",
  },
];

const INTERNATIONAL_COMMITMENTS = [
  {
    id: "c40",
    name: "C40 Cities Network",
    sub: "Global network of climate-leading cities committed to delivering the Paris Agreement",
  },
  {
    id: "r2z",
    name: "Race to Zero",
    sub: "UN campaign for net zero commitments with credible near-term action plans",
  },
  {
    id: "gcm",
    name: "Global Covenant of Mayors for Climate & Energy",
    sub: "Voluntary commitment to reduce GHG emissions and build climate resilience",
  },
  {
    id: "cdp",
    name: "CDP Cities (Carbon Disclosure Project)",
    sub: "Annual disclosure of city-level climate data, targets, and actions",
  },
  {
    id: "under2",
    name: "Under2 Coalition",
    sub: "Subnational governments committed to keeping warming below 2 °C",
  },
  {
    id: "m410",
    name: "Mission 4.1.0 / Net Zero Cities",
    sub: "European mission for 100 climate-neutral smart cities by 2030",
  },
];

interface Props { params: { locode: string } }

export function PolicyAlignment({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const storageKey = `hiap:${locode}:policy:form`;

  function loadSaved() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as {
        national: string[];
        international: string[];
        localPlans: string;
        keyCommitments: string;
      };
    } catch { return null; }
  }

  const saved = loadSaved();
  const [national,       setNational]       = useState<Set<string>>(new Set(saved?.national ?? []));
  const [international,  setInternational]  = useState<Set<string>>(new Set(saved?.international ?? []));
  const [localPlans,     setLocalPlans]     = useState(saved?.localPlans ?? "");
  const [keyCommitments, setKeyCommitments] = useState(saved?.keyCommitments ?? "");

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
  const totalSelected = national.size + international.size;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        national: Array.from(national),
        international: Array.from(international),
        localPlans,
        keyCommitments,
      }));
    } catch {}

    const parts: string[] = [];
    if (national.size > 0) parts.push(`${national.size} national framework${national.size !== 1 ? "s" : ""}`);
    if (international.size > 0) parts.push(`${international.size} international commitment${international.size !== 1 ? "s" : ""}`);
    if (localPlans.trim()) parts.push("local plans noted");
    if (keyCommitments.trim()) parts.push("key commitments noted");

    setStepProgress(locode, "policy", {
      visited: true,
      progress: totalSelected > 0 ? 100 : localPlans.trim() || keyCommitments.trim() ? 50 : 10,
      sub: parts.length > 0 ? parts.join(" · ") : undefined,
    });
  }, [locode, national, international, localPlans, keyCommitments]);

  function toggleSet(set: Set<string>, setFn: (s: Set<string>) => void, key: string) {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const canSave = totalSelected > 0 || localPlans.trim() !== "" || keyCommitments.trim() !== "";

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={4} citySlug={citySlug} />

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Policy Alignment</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  Policy Alignment
                </h1>
                <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontWeight: "500" }}>
                  Optional
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
                Indicate which national frameworks and international commitments your city is signed up to. Actions that help deliver these commitments will receive a higher alignment score.
              </p>
              <p style={{ fontSize: "13px", color: "#16A34A", fontWeight: "500", margin: 0 }}>
                MEED+ ALIGNMENT: Policy alignment with national frameworks and international commitments contributes to the city's alignment score · Alignment shapes 22% of ranking
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 64px 60px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* National Frameworks */}
        <Section title="National Climate Frameworks" badge="CHILE">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
            Select the national frameworks your city is required to or has committed to align with. These shape which actions are strategically relevant for Chile.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {NATIONAL_FRAMEWORKS.map((fw) => {
              const on = national.has(fw.id);
              return (
                <FrameworkRow
                  key={fw.id}
                  name={fw.name}
                  sub={fw.sub}
                  checked={on}
                  onChange={() => toggleSet(national, setNational, fw.id)}
                  color="#001EA7"
                />
              );
            })}
          </div>
          {national.size > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "12px 0 0", fontWeight: "500" }}>
              ✓ {national.size} national framework{national.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </Section>

        {/* International Commitments */}
        <Section title="International Commitments" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
            Select any international networks or campaigns your city has joined. Actions supporting these commitments will receive alignment credit.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {INTERNATIONAL_COMMITMENTS.map((ic) => {
              const on = international.has(ic.id);
              return (
                <FrameworkRow
                  key={ic.id}
                  name={ic.name}
                  sub={ic.sub}
                  checked={on}
                  onChange={() => toggleSet(international, setInternational, ic.id)}
                  color="#0369A1"
                />
              );
            })}
          </div>
          {international.size > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "12px 0 0", fontWeight: "500" }}>
              ✓ {international.size} international commitment{international.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </Section>

        {/* Local Plans */}
        <Section title="Local Climate Plans" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            List any local or regional climate plans, strategies, or commitments your city has in place — for example, a PLADECO climate chapter, a local emissions reduction target, or a city-level adaptation plan.
          </p>
          <textarea
            value={localPlans}
            onChange={(e) => setLocalPlans(e.target.value)}
            placeholder="e.g. PLADECO 2022–2026 with a clean transport chapter, Municipal Climate Strategy targeting 30% emissions reduction by 2030…"
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
          {localPlans.trim() && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "8px 0 0", fontWeight: "500" }}>
              ✓ Local plans recorded
            </p>
          )}
        </Section>

        {/* Key Policy Commitments */}
        <Section title="Key Policy Commitments or Targets" badge="OPTIONAL">
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 14px" }}>
            Describe any specific quantitative targets or policy commitments your city has made — for example, a net zero target year, a renewable energy share goal, or a modal shift target for transport.
          </p>
          <textarea
            value={keyCommitments}
            onChange={(e) => setKeyCommitments(e.target.value)}
            placeholder="e.g. Net zero by 2050, 40% renewable electricity by 2030, 25% reduction in transport emissions by 2035…"
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
          {keyCommitments.trim() && (
            <p style={{ fontSize: "12px", color: "#16A34A", margin: "8px 0 0", fontWeight: "500" }}>
              ✓ Key commitments recorded
            </p>
          )}
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}`)}
            style={{
              background: "none",
              border: "none",
              color: "#6B7280",
              fontSize: "13px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← Skip this step
          </button>
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

interface FrameworkRowProps {
  name: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
  color: string;
}

function FrameworkRow({ name, sub, checked, onChange, color }: FrameworkRowProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "8px",
        border: checked ? `1.5px solid ${color}` : "1px solid #E5E7EB",
        background: checked ? "#F5F7FF" : "white",
        cursor: "pointer",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: color, width: "15px", height: "15px", flexShrink: 0, marginTop: "2px", cursor: "pointer" }}
      />
      <div>
        <div style={{ fontSize: "13px", color: checked ? color : "#111827", fontWeight: checked ? "600" : "400", lineHeight: "1.4" }}>{name}</div>
        <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px", lineHeight: "1.4" }}>{sub}</div>
      </div>
    </label>
  );
}

interface SectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

function Section({ title, badge, children }: SectionProps) {
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
