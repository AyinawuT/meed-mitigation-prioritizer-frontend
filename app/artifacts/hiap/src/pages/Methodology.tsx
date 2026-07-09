import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";

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
      whiteSpace: "pre",
      overflowX: "auto",
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
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "48px 48px 40px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: NAVY, letterSpacing: "0.08em", marginBottom: "12px" }}>
            HOW MEED+ HIAP WORKS
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#111827", margin: "0 0 16px", lineHeight: "1.2" }}>
            The prioritisation methodology
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
              Default weights shown. Your city can adjust these on the Strategic Preferences page — for example,
              increasing feasibility weight if near-term deliverability is a priority. Weights must always sum to 1.0.
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
                <Subcomp pct="80%" title="Reduction share" desc="Matched GPC sector emissions × impact strength ÷ total city emissions" color="blue" />
                <Subcomp pct="20%" title="Timeline score" desc="How quickly results can be delivered (<5 yr = 1.0, 5–10 yr = 0.5, >10 yr = 0.0)" color="blue" />
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
                <Subcomp pct="15%" title="Sector preference match" desc="Whether the action is in a sector your city has prioritised" color="purple" />
                <Subcomp pct="5%" title="Strategic preference match" desc="Co-benefit overlap with your city's stated strategic priorities" color="purple" />
                <Subcomp pct="5%" title="Timeframe preference match" desc="Whether the action's implementation horizon matches your city's preferred timeline" color="purple" />
              </div>
            </div>
            {/* Feasibility */}
            <div style={{ border: "1px solid #DCFCE7", borderRadius: "10px", padding: "20px", background: "#FFFFFF" }}>
              <PillarBadge label="Feasibility" color="green" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "10px 0 4px" }}>Implementation readiness</h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 16px" }}>Default weight: 23%</p>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px" }}>Can your city realistically implement this action given its legal and socioeconomic context?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Subcomp pct="33%" title="Legal verdict" desc="Municipal authority and legal restrictions assessment — ownership and restrictions dimensions combined into a single component score" color="green" />
                <Subcomp pct="33%" title="Mitigation feasibility" desc="City-specific mitigation feasibility score derived from socioeconomic and contextual factors" color="green" />
                <Subcomp pct="33%" title="Financial feasibility" desc="Availability of financing routes, fund access, and comparable funded projects — assessed via the Financial Feasibility page" color="green" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Pillar 1 ── */}
        <div id="impact" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="impact-h">Pillar 1 — Impact in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The impact score answers: if this action were fully implemented, how much of this city's emissions would it address?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Match action to your city's emissions">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                Each action is tagged with the GPC sectors it addresses (e.g. II.1.1 On-road transport, I.1.1 Residential buildings).
                We look up how much your city emits in those exact sectors from your GPC inventory.
              </p>
            </Step>
            <Step n={2} title="Apply the impact strength multiplier">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action has an evidence-based impact rating. This scales the matched emissions to reflect realistic reduction potential.
              </p>
              <CodeBlock>{"very_low → 0.2    low → 0.4    medium → 0.6    high → 0.8    very_high → 1.0"}</CodeBlock>
            </Step>
            <Step n={3} title="Calculate reduction share of total city emissions">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Divide the weighted matched emissions by your city's total emissions to get a 0–1 share.
                An action addressing 38% of your city's transport emissions with a "high" impact rating scores 0.31 on reduction share.
              </p>
              <CodeBlock>{"reduction_share = (matched_emissions × impact_multiplier) ÷\n                  total_city_emissions"}</CodeBlock>
            </Step>
            <Step n={4} title="Combine with timeline score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Actions that deliver results quickly receive a higher timeline score, rewarding near-term impact over long-term structural changes.
              </p>
              <CodeBlock>{"impact_score = (0.80 × reduction_share) + (0.20 × timeline_score)"}</CodeBlock>
            </Step>
          </div>
        </div>

        {/* ── Pillar 2 ── */}
        <div id="alignment" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="alignment-h">Pillar 2 — Alignment in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The alignment score answers: is this action already supported by the plans and priorities that govern your city?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Load policy signals for your city">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                We extract signals from Chile's NDC, the relevant PARCC (regional climate action plan), your municipal PACCC where available,
                and sector-specific policy documents. Each signal indicates whether a plan supports, mentions, or requires a type of action.
              </p>
            </Step>
            <Step n={2} title="Score policy support per action">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action receives a policy support score (0–1) based on how many plans support it, the strength of those signals
                (national &gt; regional &gt; municipal), and the type of signal (binding target &gt; sector priority &gt; mention).
              </p>
              <CodeBlock>{"alignment_score = (0.75 × policy_support_score)\n               + (0.15 × sector_preference_match)\n               + (0.05 × strategic_preference_match)\n               + (0.05 × timeframe_preference_match)"}</CodeBlock>
            </Step>
            <Step n={3} title="Apply your sector preferences">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                If your city has flagged transportation as a priority sector and an action is a transport action, it receives a 15% alignment boost
                from the sector component. This directly reflects the strategic direction your city expressed during onboarding.
              </p>
            </Step>
          </div>
          <div style={{ marginTop: "16px" }}>
            <CalloutBox color="blue">
              The policy support score is the dominant alignment input at 75% weight. Actions supported by Chile's NDC and a regional PARCC
              will score significantly higher than actions with no policy backing — even if the city has not explicitly prioritised that sector.
            </CalloutBox>
          </div>
        </div>

        {/* ── Pillar 3 ── */}
        <div id="feasibility" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="feasibility-h">Pillar 3 — Feasibility in detail</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            The feasibility score answers: given your city's legal context and socioeconomic conditions, how ready is this city to implement this action?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step n={1} title="Legal verdict">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 12px", lineHeight: "1.6" }}>
                Each action is assessed across two legal dimensions: <strong>Ownership</strong> (does the municipality have the legal
                authority to implement this action?) and <strong>Restrictions</strong> (are there legal restrictions or authorizations
                that would constrain implementation?). Each dimension returns a verdict category, and both are combined into a single
                component score (0–1) that feeds into the feasibility calculation.
              </p>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Verdict", "Component score", "What it means"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["enabled", "1.0", "Full municipal authority; no legal restrictions identified"],
                      ["conditional", "~0.5", "Shared or partial authority, or soft restrictions — legal groundwork may be needed"],
                      ["blocked", "removed", "No authority or hard legal restriction — action excluded before scoring"],
                    ].map(([verdict, score, meaning], i) => (
                      <tr key={verdict} style={{ borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
                            background: verdict === "enabled" ? "#F0FDF4" : verdict === "conditional" ? "#FFFBEB" : "#FEF2F2",
                            color: verdict === "enabled" ? "#16A34A" : verdict === "conditional" ? "#D97706" : "#DC2626",
                          }}>{verdict}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151", fontWeight: "600" }}>{score}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CalloutBox color="blue">
                If either the ownership or restrictions dimension returns <strong>blocked</strong>, the action is removed from the ranking
                entirely before scoring begins. A <strong>conditional</strong> result flags the action for review but does not remove it —
                it scores at a reduced component score.
              </CalloutBox>
            </Step>
            <Step n={2} title="Mitigation feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action has a set of rules that describe which city conditions make it more or less feasible. For example, an active mobility
                action might have a rule: "high unemployment is constraining" (because residents may depend on vehicles for work).
                We match your city's actual indicator values against these rules.
              </p>
              <CodeBlock>{"bucket_score:  very_low=-2  low=-1  medium=0  high=+1  very_high=+2\ndirection:     supportive → keep sign    constraining → reverse sign\nnormalised:    (weighted_average + 2) ÷ 4  →  gives 0–1 range"}</CodeBlock>
            </Step>
            <Step n={3} title="Financial feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 12px", lineHeight: "1.6" }}>
                The financial feasibility score assesses whether a city can realistically finance and deliver an action,
                given the action's cost and complexity requirements and the city's own financial and institutional capacity.
                It draws on four inputs:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                {[
                  ["Capital intensity", "How much money the action typically requires — from low-cost measures to large infrastructure investment"],
                  ["Preparation complexity", "How much planning, technical design, and procurement capacity the action demands before implementation can begin"],
                  ["City financial profile", "Composite of financial autonomy (share of budget raised locally vs. national transfers) and delivery capacity (qualified staff to plan and manage projects)"],
                  ["Fund access", "Number of directly matched external funding opportunities available for the action's sector in Chile"],
                ].map(([term, explanation]) => (
                  <div key={term as string} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, width: "6px", height: "6px", borderRadius: "50%", background: GREEN, marginTop: "7px" }} />
                    <div>
                      <span style={{ fontWeight: "600", fontSize: "13px", color: "#111827" }}>{term}</span>
                      <span style={{ fontSize: "13px", color: "#6B7280" }}> — {explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action is classified into a <strong>financial route</strong> based on its capital intensity, preparation complexity, and the city profile:
              </p>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Route", "Score", "What it means"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Self-deliverable", "0.85", "City can implement with own budget and staff — low cost, low complexity"],
                      ["Needs co-finance", "0.55", "Requires additional funding partners but city has sufficient institutional capacity"],
                      ["Needs finance & support", "0.25", "Requires external financing and significant technical or institutional support"],
                    ].map(([route, score, meaning], i) => (
                      <tr key={route} style={{ borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                        <td style={{ padding: "10px 14px", color: "#374151", fontWeight: "600" }}>{route}</td>
                        <td style={{ padding: "10px 14px", color: GREEN, fontWeight: "700" }}>{score}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CalloutBox color="green">
                Fund access boosts the score when direct financing opportunities are available for the action's sector.
                The Financial Feasibility page lists all matched funds and comparable funded projects for each action.
              </CalloutBox>
            </Step>

            <Step n={4} title="Combine components into a feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                The feasibility score is built from three components: legal verdict, mitigation feasibility, and financial feasibility.
                When financial feasibility data is available for an action (financing route and fund access), all three components are weighted equally.
                A two-component fallback applies for actions with no financial feasibility score:
              </p>
              <CodeBlock>{"// Full 3-component formula (used when financial feasibility data is available):\nfeasibility_score = (0.33 × legal_verdict)\n                  + (0.33 × mitigation_feasibility)\n                  + (0.33 × financial_feasibility)\n\n// 2-component fallback (used for actions with no financial feasibility score):\nfeasibility_score = (0.50 × legal_verdict)\n                  + (0.50 × mitigation_feasibility)"}</CodeBlock>
            </Step>
          </div>
        </div>

        {/* ── Pre-scoring filters ── */}
        <div id="pre-scoring-filters" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="pre-scoring-filters-h">Pre-scoring filters</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 24px", lineHeight: "1.7" }}>
            Before any scoring happens, two types of filter can remove actions from the ranking entirely.
            Neither is a score penalty — removed actions receive no score at all.
          </p>

          {/* Sub-section A: Legal hard filter */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.04em", marginBottom: "10px", textTransform: "uppercase" }}>
              A — Legal eligibility (hard filter)
            </div>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              The system automatically assesses every action against the municipal legal context for your city, evaluating two
              dimensions — <strong>ownership</strong> (legal authority) and <strong>restrictions</strong> (legal constraints).
              If either dimension returns a <strong>blocked</strong> verdict, the action is removed before scoring begins.
              This is objective and automatic; the city has no input into this filter.
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
                    ["Ownership", "blocked", "#FEE2E2", "#991B1B", "Municipality lacks legal authority — action removed"],
                    ["Ownership", "conditional", "#FFFBEB", "#D97706", "Shared or partial authority — scores at reduced rate, flagged"],
                    ["Ownership", "enabled", "#F0FDF4", "#16A34A", "Full municipal authority — scores at full rate"],
                    ["Restrictions", "blocked", "#FEE2E2", "#991B1B", "Hard legal restriction — action removed"],
                    ["Restrictions", "conditional", "#FFFBEB", "#D97706", "Soft restrictions or authorisation needed — scores at reduced rate"],
                    ["Restrictions", "enabled", "#F0FDF4", "#16A34A", "No restrictions identified — scores at full rate"],
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
              If the assessment is missing for an action (no evidence found), the action is <strong>not blocked</strong> — it passes
              with a conditional flag for the city to review. Only a confirmed <strong>blocked</strong> verdict on either dimension
              causes removal.
            </CalloutBox>
          </div>

          {/* Sub-section B: City preference exclusions */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.04em", marginBottom: "10px", textTransform: "uppercase" }}>
              B — City preference exclusions
            </div>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              Cities can also instruct MEED+ HIAP to remove specific types of actions based on political, operational, or
              mandate-based decisions. Unlike the legal hard filter, this is a deliberate choice by the city — an excluded
              action may be perfectly legal and could score very highly if re-included.
            </p>
            <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 14px", lineHeight: "1.6" }}>
              On the Strategic Preferences page, cities describe in plain language which action types to exclude — for
              example: <em>"Do not include actions that significantly increase household costs for vulnerable communities"</em> or{" "}
              <em>"Exclude any actions that require new fossil fuel infrastructure."</em> These instructions are matched against
              the action library before scoring begins.
            </p>
            <CalloutBox color="amber">
              Cities should use preference exclusions for genuine mandate or political constraints, not to filter by expected score.
              Removed actions are listed transparently in the results so the city can review and adjust if needed.
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
                title: "High impact score, low feasibility score",
                desc: "The action addresses a large share of your city's emissions but faces legal or socioeconomic headwinds. These are high-value actions worth investing in — but they may require policy or capacity groundwork first.",
              },
              {
                letter: "A", bg: "#EDE9FE", color: PURPLE,
                title: "High alignment score, lower impact score",
                desc: "The action is well-supported by existing plans and your priorities but addresses a smaller share of emissions. These are low-friction actions — good candidates for quick wins and building political momentum.",
              },
              {
                letter: "W", bg: "#FEF9C3", color: "#92400E",
                title: "Adjusting weights changes the ranking",
                desc: "If your city prioritises near-term deliverability over maximum emission reduction, increase the feasibility weight. If political alignment matters most, increase the alignment weight. The ranking will update immediately to reflect your city's priorities.",
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
  );
}
