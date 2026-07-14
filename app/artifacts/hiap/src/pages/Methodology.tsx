import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";
const GREEN = "#16A34A";
const NAVY = "#001EA7";

function CodeBlock({ children }: { children: string }) {
  return (
    <div style={{
      background: "#F3F4F6",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "14px 18px",
      fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
      fontSize: "13px",
      color: "#374151",
      lineHeight: "1.7",
      marginTop: "12px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }}>
      {children}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      padding: "20px 24px",
      display: "flex",
      gap: "18px",
      background: "#FFFFFF",
    }}>
      <div style={{
        flexShrink: 0,
        width: "30px",
        height: "30px",
        borderRadius: "8px",
        background: "#EEF2FF",
        color: NAVY,
        fontWeight: "700",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "15px", color: "#111827", marginBottom: "6px" }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: "22px",
      fontWeight: "700",
      color: "#111827",
      margin: "0 0 8px",
      scrollMarginTop: "72px",
    }}>{children}</h2>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 20px" }} />;
}

function CalloutBox({ color, children }: { color: string; children: React.ReactNode }) {
  const bg = color === "blue" ? "#EEF2FF" : color === "amber" ? "#FFFBEB" : "#F0FDF4";
  const border = color === "blue" ? "#C7D2FE" : color === "amber" ? "#FDE68A" : "#BBF7D0";
  const text = color === "blue" ? NAVY : color === "amber" ? "#92400E" : "#14532D";
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "8px",
      padding: "14px 18px",
      fontSize: "14px",
      color: text,
      lineHeight: "1.6",
    }}>{children}</div>
  );
}

function PillarBadge({ label, color }: { label: string; color: string }) {
  const bg = color === "blue" ? "#EFF6FF" : color === "purple" ? "#F5F3FF" : "#F0FDF4";
  const text = color === "blue" ? BLUE : color === "purple" ? PURPLE : GREEN;
  return (
    <span style={{
      background: bg,
      color: text,
      fontSize: "11px",
      fontWeight: "600",
      padding: "3px 8px",
      borderRadius: "6px",
      letterSpacing: "0.02em",
    }}>{label}</span>
  );
}

function Subcomp({ pct, title, desc, color }: { pct: string; title: string; desc: string; color: string }) {
  const bg = color === "blue" ? "#EFF6FF" : color === "purple" ? "#F5F3FF" : "#F0FDF4";
  const text = color === "blue" ? BLUE : color === "purple" ? PURPLE : GREEN;
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div style={{
        flexShrink: 0,
        width: "44px",
        height: "28px",
        background: bg,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700",
        color: text,
      }}>{pct}</div>
      <div>
        <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>{desc}</div>
      </div>
    </div>
  );
}

export function Methodology() {
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  const tocLinks = [
    { id: "formula", label: "The overall formula" },
    { id: "impact", label: "Pillar 1 — Impact" },
    { id: "alignment", label: "Pillar 2 — Alignment" },
    { id: "feasibility", label: "Pillar 3 — Feasibility" },
    { id: "pre-scoring-filters", label: "Pre-scoring filters" },
    { id: "interpret", label: "How to interpret your results" },
  ];

  return (
    <>
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "48px 48px 40px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: NAVY, letterSpacing: "0.08em", marginBottom: "12px" }}>
            HOW MEED+ HIAP WORKS
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#111827", margin: "0 0 16px", lineHeight: "1.2" }}>
            The prioritization methodology
          </h1>
          <p style={{ fontSize: "16px", color: "#4B5563", margin: 0, lineHeight: "1.7", maxWidth: "680px" }}>
            MEED+ HIAP ranks climate mitigation actions for your city using a three-pillar scoring model.
            Every score is traceable — you can see exactly which data inputs produced each number
            and why an action ranked where it did.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 48px 80px" }}>

        {/* Table of contents */}
        <div ref={tocRef} style={{
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "20px 24px",
          background: "#FFFFFF",
          marginBottom: "48px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: "12px" }}>
            ON THIS PAGE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tocLinks.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D1D5DB", flexShrink: 0 }} />
                <button
                  onClick={() => scrollTo(l.id)}
                  style={{ background: "none", border: "none", padding: 0, color: NAVY, fontSize: "14px", cursor: "pointer", textAlign: "left" }}
                >
                  {l.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Overall formula ── */}
        <div id="formula" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="formula-h">The overall formula</SectionHeading>
          <Divider />
          <div style={{
            background: NAVY,
            borderRadius: "12px",
            padding: "28px 32px",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#93C5FD", letterSpacing: "0.1em", marginBottom: "20px" }}>
              OVERALL SCORING FORMULA
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {/* Final score box */}
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#93C5FD", marginBottom: "4px" }}>Final score</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>0 → 1</div>
              </div>
              <div style={{ fontSize: "22px", color: "#93C5FD", fontWeight: "300" }}>=</div>
              {/* Impact */}
              <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#93C5FD", marginBottom: "4px" }}>Impact score</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>× 0.55</div>
              </div>
              <div style={{ fontSize: "22px", color: "#93C5FD", fontWeight: "300" }}>+</div>
              {/* Alignment */}
              <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#93C5FD", marginBottom: "4px" }}>Alignment score</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#C4B5FD" }}>× 0.22</div>
              </div>
              <div style={{ fontSize: "22px", color: "#93C5FD", fontWeight: "300" }}>+</div>
              {/* Feasibility */}
              <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#93C5FD", marginBottom: "4px" }}>Feasibility score</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#6EE7B7" }}>× 0.23</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#93C5FD", margin: "20px 0 0", lineHeight: "1.6" }}>
              These are the default weights. You can adjust them on the Pre-flight page, weights always sum to 100%.
            </p>
          </div>

          {/* Three pillar cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "24px" }}>
            {/* Impact */}
            <div style={{ border: "1px solid #DBEAFE", borderRadius: "10px", padding: "20px", background: "#FFFFFF" }}>
              <PillarBadge label="Impact" color="blue" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "10px 0 4px" }}>Emission reduction potential</h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 16px" }}>Default weight: 55%</p>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px" }}>How much of your city's emissions could this action address, and how quickly?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Subcomp pct="80%" title="Reduction share" desc="Matched emissions weighted by evidence strength, as a share of total city emissions" color="blue" />
                <Subcomp pct="20%" title="Timeline score" desc="How quickly results can be delivered — faster delivery scores higher" color="blue" />
              </div>
            </div>
            {/* Alignment */}
            <div style={{ border: "1px solid #EDE9FE", borderRadius: "10px", padding: "20px", background: "#FFFFFF" }}>
              <PillarBadge label="Alignment" color="purple" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "10px 0 4px" }}>Policy and strategic fit</h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 16px" }}>Default weight: 22%</p>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px" }}>Is this action supported by existing plans and your city's stated priorities?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Subcomp pct="75%" title="Policy support score" desc="Signals from national NDC, PARCC, PACCC, and sector plans" color="purple" />
                <Subcomp pct="15%" title="Sector preference match" desc="Whether the action is in a sector your city has prioritized" color="purple" />
                <Subcomp pct="5%" title="Co-benefit preference match" desc="How well the action's co-benefits align with your city's selected priorities" color="purple" />
                <Subcomp pct="5%" title="Timeframe preference match" desc="Whether the action's implementation horizon matches your city's preferred timeline" color="purple" />
              </div>
            </div>
            {/* Feasibility */}
            <div style={{ border: "1px solid #DCFCE7", borderRadius: "10px", padding: "20px", background: "#FFFFFF" }}>
              <PillarBadge label="Feasibility" color="green" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "10px 0 4px" }}>Implementation readiness</h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 16px" }}>Default weight: 23%</p>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px" }}>Can your city realistically implement this action given its legal and financial context?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Subcomp pct="34%" title="Legal readiness" desc="Continuous score from the legal assessment — blocked actions are removed before this step" color="green" />
                <Subcomp pct="33%" title="Mitigation feasibility" desc="Pre-calculated score reflecting how feasible the action is given your city's real conditions" color="green" />
                <Subcomp pct="33%" title="Financial feasibility" desc="Pre-calculated score reflecting how realistically your city can finance and deliver the action" color="green" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Pillar 1 ── */}
        <div id="impact" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="impact-h">Pillar 1 — Impact in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The impact score measures two things: how large a share of your city's total emissions this action could realistically reduce,
            and how quickly it could deliver results. Actions targeting large emission sources with strong evidence of effectiveness score
            highest. Actions that can be implemented quickly get an additional boost.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Match action to your city's emissions">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                The tool matches each action to the parts of your city's emissions inventory it could address. The matched
                emissions are weighted by an evidence-based strength rating to estimate realistic reduction potential.
              </p>
            </Step>
            <Step n={2} title="Apply the impact strength multiplier">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 10px", lineHeight: "1.6" }}>
                Each action has an evidence-based impact rating. This scales the matched emissions to reflect realistic reduction potential:
              </p>
              <CodeBlock>{"Very high → 1.0   |   High → 0.8   |   Medium → 0.6   |   Low → 0.4   |   Very low → 0.2"}</CodeBlock>
            </Step>
            <Step n={3} title="Calculate reduction share of total city emissions">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                The weighted matched emissions are divided by your city's total emissions to produce a share between 0 and 1.
                For AFOLU actions (forestry and land use), carbon removal entries count as positive contributions to both the
                numerator and denominator.
              </p>
            </Step>
            <Step n={4} title="Combine with timeline score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 10px", lineHeight: "1.6" }}>
                Actions that deliver results faster score higher. A missing or unknown timeline is treated as neutral:
              </p>
              <CodeBlock>{"Less than 5 years    → 1.0\n5 to 10 years        → 0.5\nMore than 10 years   → 0.0\nMissing or unknown   → 0.5 (neutral)\n\nImpact score = (0.80 × reduction share) + (0.20 × timeline score)"}</CodeBlock>
            </Step>
          </div>
        </div>

        {/* ── Pillar 2 ── */}
        <div id="alignment" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="alignment-h">Pillar 2 — Alignment in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The alignment score measures how well each action fits into the policy landscape your city operates in and the priorities
            your city has declared. Actions backed by multiple levels of government policy and matching your city's own preferences
            score highest.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Load policy signals for your city">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                The tool checks whether each action is backed by Chile's national climate commitments (NDC), the regional climate
                plan (PARCC), your municipality's own climate plan (PACCC) where available, and sector-specific policy documents.
                Signals are weighted by level — national carries more weight than regional, which carries more than municipal.
                Binding targets carry more weight than sector priorities, which carry more than general mentions.
              </p>
            </Step>
            <Step n={2} title="Score policy support per action">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 10px", lineHeight: "1.6" }}>
                Each action receives a policy support score (0–1) based on how many plans support it and the strength of those
                signals. Policy support is the dominant alignment input at 75% weight. The full alignment formula:
              </p>
              <CodeBlock>{"Alignment score = (0.75 × policy support)\n              + (0.15 × sector match)\n              + (0.05 × co-benefit match)\n              + (0.05 × timeframe match)"}</CodeBlock>
            </Step>
            <Step n={3} title="Apply sector preference">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                Whether the action falls in a sector your city selected as a priority on the Strategic Preferences page.
                A match scores 1.0; no match scores 0.0. This contributes 15% of the alignment score.
              </p>
            </Step>
            <Step n={4} title="Match co-benefit preferences">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                How well the action's co-benefits align with the priorities your city selected. If your city selected no
                co-benefit priorities, this component defaults to neutral (0.5).
              </p>
            </Step>
            <Step n={5} title="Match timeframe preference">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 10px", lineHeight: "1.6" }}>
                Whether the action's timeline matches your city's preferred implementation horizon:
              </p>
              <CodeBlock>{"Exact match                              → 1.0\nAdjacent match (e.g. medium vs short)    → 0.5\nFar mismatch (e.g. short vs long)        → 0.0\nNo preference set or timeline missing    → 0.5 (neutral)"}</CodeBlock>
            </Step>
          </div>
          <div style={{ marginTop: "16px" }}>
            <CalloutBox color="blue">
              Policy support is the dominant input at 75% weight. An action backed by Chile's NDC and a regional plan will score
              significantly higher than one with no policy backing — even if your city hasn't explicitly prioritized that sector.
            </CalloutBox>
          </div>
        </div>

        {/* ── Pillar 3 ── */}
        <div id="feasibility" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="feasibility-h">Pillar 3 — Feasibility in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The feasibility score measures how ready your city is to actually deliver an action — combining its legal standing,
            how feasible it is given real local conditions, and how realistically it can be financed. Actions where the city has
            clear authority, strong local conditions, and accessible funding score highest.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Legal readiness">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                Each action is assessed against Chilean municipal law. The assessment produces a continuous score between 0 and 1
                based on two dimensions — <strong>ownership</strong> (does the municipality have the legal authority?) and{" "}
                <strong>restrictions</strong> (are there legal barriers?). Actions where the municipality clearly has authority and
                faces no restrictions score close to 1.0. Actions where authority is shared or conditional score lower but remain
                in the ranking, flagged for your review. Actions where the municipality has no legal authority are removed from the
                ranking entirely before scoring begins. If the legal assessment is missing for an action, the component defaults to
                neutral (0.5).
              </p>
            </Step>
            <Step n={2} title="Mitigation feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                A pre-calculated score reflecting how feasible the action is given your city's real conditions — including
                socioeconomic factors, local capacity, and the characteristics of the action. This score is produced by a
                dedicated assessment and used directly in the formula. If missing, it defaults to neutral (0.5).
              </p>
            </Step>
            <Step n={3} title="Financial feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                A pre-calculated score reflecting how realistically your city can finance and deliver the action — based on the
                action's cost and complexity, your city's budget profile and delivery capacity, and the availability of matching
                funds. The Financial Feasibility page shows the full reasoning, matched funds, and comparable funded projects for
                each action. If missing, it defaults to neutral (0.5).
              </p>
            </Step>
            <Step n={4} title="Combine components into a feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 10px", lineHeight: "1.6" }}>
                When any component is missing, the tool uses 0.5 as a neutral fallback so no action is unfairly penalized due
                to incomplete data:
              </p>
              <CodeBlock>{"Feasibility score = (0.34 × legal score)\n                  + (0.33 × mitigation feasibility)\n                  + (0.33 × financial feasibility)"}</CodeBlock>
            </Step>
          </div>
        </div>

        {/* ── Pre-scoring filters ── */}
        <div id="pre-scoring-filters" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="pre-scoring-filters-h">Pre-scoring filters</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 24px", lineHeight: "1.7" }}>
            Before scoring begins, two types of filter can remove actions from the ranking entirely.
            Removed actions receive no score and are listed transparently so you can review and adjust if needed.
          </p>

          {/* Sub-section A: Legal hard filter */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.04em", marginBottom: "10px", textTransform: "uppercase" }}>
              A — Legal filter (automatic)
            </div>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              The tool automatically checks every action against your city's municipal legal context across two dimensions:{" "}
              <strong>ownership</strong> (legal authority) and <strong>restrictions</strong> (legal constraints).
              If either dimension returns a <strong>blocked</strong> verdict, the action is removed before scoring begins.
            </p>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["Dimension", "Verdict", "Effect"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Ownership", "blocked", "#FEE2E2", "#991B1B", "Municipality lacks legal authority — action removed before scoring"],
                    ["Ownership", "conditional", "#FFFBEB", "#D97706", "Shared or partial authority — action scores at reduced rate, flagged"],
                    ["Ownership", "enabled", "#F0FDF4", "#16A34A", "Full municipal authority — action scores normally"],
                    ["Restrictions", "blocked", "#FEE2E2", "#991B1B", "Hard legal restriction — action removed before scoring"],
                    ["Restrictions", "conditional", "#FFFBEB", "#D97706", "Soft restrictions or authorization needed — scores at reduced rate"],
                    ["Restrictions", "enabled", "#F0FDF4", "#16A34A", "No restrictions identified — action scores normally"],
                  ].map(([dimension, verdict, bg, color, effect], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "10px 14px", color: "#374151", fontWeight: i % 3 === 0 ? "600" : "400" }}>{i % 3 === 0 ? dimension : ""}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: bg, color, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>{verdict}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#6B7280" }}>{effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CalloutBox color="blue">
              If the legal assessment is missing for an action, it is not removed. It passes with a conditional flag for your
              review. Only a confirmed <strong>blocked</strong> verdict on either dimension causes removal.
            </CalloutBox>
          </div>

          {/* Sub-section B: City preference exclusions */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.04em", marginBottom: "10px", textTransform: "uppercase" }}>
              B — City preference exclusions (your choice)
            </div>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              On the Strategic Preferences page, you can instruct the tool to remove specific types of actions based on your
              city's political, operational, or mandate-based decisions. For example:{" "}
              <em>"Do not include actions that significantly increase household costs for vulnerable communities"</em> or{" "}
              <em>"Exclude any actions that require new fossil fuel infrastructure."</em>
            </p>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              Unlike the legal filter, this is a deliberate choice by your city. An excluded action may be perfectly legal and
              could score very highly if re-included. Use preference exclusions for genuine constraints, not to filter by
              expected score.
            </p>
            <CalloutBox color="amber">
              Removed actions are listed transparently in your results so you can review and adjust if needed.
            </CalloutBox>
          </div>
        </div>

        {/* ── Interpret ── */}
        <div id="interpret" style={{ scrollMarginTop: "72px" }}>
          <SectionHeading id="interpret-h">How to interpret your results</SectionHeading>
          <Divider />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                letter: "H", bg: "#DCFCE7", color: GREEN,
                title: "High impact score, lower feasibility score",
                desc: "The action addresses a large share of your city's emissions but faces legal or financial headwinds. These are high-value actions worth investing in — but they may require policy groundwork or external funding to unlock first.",
              },
              {
                letter: "A", bg: "#EDE9FE", color: PURPLE,
                title: "High alignment score, lower impact score",
                desc: "The action is well-supported by existing plans and your priorities but addresses a smaller share of emissions. These are low-friction actions — good candidates for quick wins and building political momentum.",
              },
              {
                letter: "W", bg: "#FEF9C3", color: "#92400E",
                title: "Adjusting the weights",
                desc: "If near-term deliverability matters more to your city right now, increase the feasibility weight on the Strategic Preferences page. If political alignment matters most, increase the alignment weight. The ranking updates immediately to reflect your city's priorities.",
              },
            ].map(({ letter, bg, color, title, desc }) => (
              <div key={letter} style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "20px 24px", display: "flex", gap: "16px", background: "#FFFFFF" }}>
                <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "8px", background: bg, color, fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {letter}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#111827", marginBottom: "6px" }}>{title}</div>
                  <div style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
}
