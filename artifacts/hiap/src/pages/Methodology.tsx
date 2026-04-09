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
    { id: "hard-filter", label: "The hard filter — legal eligibility" },
    { id: "excluded-actions", label: "Excluded actions — city preferences" },
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
            HIAP ranks climate mitigation actions for your city using a three-pillar scoring model.
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
                <Subcomp pct="80%" title="Policy support score" desc="Signals from national NDC, PARCC, PACCC, and sector plans" color="purple" />
                <Subcomp pct="15%" title="Sector preference match" desc="Whether the action is in a sector your city has prioritised" color="purple" />
                <Subcomp pct="5%" title="Strategic preference match" desc="Match against your city's free-text strategic priorities" color="purple" />
              </div>
            </div>
            {/* Feasibility */}
            <div style={{ border: "1px solid #DCFCE7", borderRadius: "10px", padding: "20px", background: "#FFFFFF" }}>
              <PillarBadge label="Feasibility" color="green" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "10px 0 4px" }}>Implementation readiness</h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 16px" }}>Default weight: 23%</p>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px" }}>Can your city realistically implement this action given its legal and socioeconomic context?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Subcomp pct="50%" title="Legal enabling conditions" desc="Soft legal signals — recommended and optional requirements" color="green" />
                <Subcomp pct="50%" title="Socioeconomic fit" desc="City indicators matched to action requirements — employment, income, poverty, transport access" color="green" />
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
              <CodeBlock>{"alignment_score = (0.80 × policy_support_score)\n               + (0.15 × sector_preference_match)\n               + (0.05 × strategic_preference_match)"}</CodeBlock>
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
              The policy support score is the dominant alignment input at 80% weight. Actions supported by Chile's NDC and a regional PARCC
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
            <Step n={1} title="Legal enabling conditions (soft signals)">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 12px", lineHeight: "1.6" }}>
                Soft legal requirements (recommended and optional strength) indicate whether the legal environment supports or creates friction
                for implementation. These differ from hard requirements — they do not block an action, but they affect its feasibility score.
              </p>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Alignment status", "Score contribution", "Meaning"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["aligns", "1.0", "Legal environment actively supports this action"],
                      ["no_evidence", "0.5", "No legal signal found — neutral score"],
                      ["not_aligned", "0.0", "Legal friction exists — reduces feasibility"],
                    ].map(([status, score, meaning]) => (
                      <tr key={status} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#374151" }}>{status}</td>
                        <td style={{ padding: "10px 14px", color: "#374151", fontWeight: "600" }}>{score}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Step>
            <Step n={2} title="Socioeconomic fit score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action has a set of rules that describe which city conditions make it more or less feasible. For example, an active mobility
                action might have a rule: "high unemployment is constraining" (because residents may depend on vehicles for work).
                We match your city's actual indicator values against these rules.
              </p>
              <CodeBlock>{"bucket_score:  very_low=-2  low=-1  medium=0  high=+1  very_high=+2\ndirection:     supportive → keep sign    constraining → reverse sign\nnormalised:    (weighted_average + 2) ÷ 4  →  gives 0–1 range"}</CodeBlock>
            </Step>
            <Step n={3} title="Combine both components">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Legal and socioeconomic components are weighted equally at 50% each.
              </p>
              <CodeBlock>{"feasibility_score = (0.50 × legal_component) + (0.50 × socioeconomic_component)"}</CodeBlock>
            </Step>
          </div>
        </div>

        {/* ── Hard filter ── */}
        <div id="hard-filter" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="hard-filter-h">The hard filter — legal eligibility</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
            Before any scoring happens, actions that cannot legally be implemented in your city are removed entirely.
            This is not a score penalty — it is a binary pass/fail gate.
          </p>
          <div style={{ marginBottom: "20px" }}>
            <CalloutBox color="amber">
              Actions that fail a mandatory or required legal requirement are removed from the ranking entirely.
              They will appear in your results under "Ineligible actions" with the specific legal signal that blocked them.
              No score is calculated for these actions.
            </CalloutBox>
          </div>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Strength", "Effect on hard filter", "Effect on feasibility score"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["mandatory", "#FEE2E2", "#991B1B", "Blocks action if not_aligned", "Not applicable — action removed"],
                  ["required", "#FFEDD5", "#9A3412", "Blocks action if not_aligned", "Not applicable — action removed"],
                  ["recommended", "#FEF9C3", "#713F12", "No block", "Scores into legal component"],
                  ["optional", "#F3F4F6", "#374151", "No block", "Scores into legal component"],
                  ["informational", "#EFF6FF", "#1E40AF", "No block", "No scoring effect"],
                ].map(([strength, bg, color, filter, feasibility]) => (
                  <tr key={strength} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: bg as string, color: color as string, padding: "2px 8px", borderRadius: "5px", fontSize: "12px", fontWeight: "500" }}>{strength}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#374151" }}>{filter}</td>
                    <td style={{ padding: "10px 14px", color: "#6B7280" }}>{feasibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CalloutBox color="blue">
            A "no evidence" result on a mandatory requirement does not block the action — it passes with a flag.
            Only a confirmed "not_aligned" result causes removal.
          </CalloutBox>
        </div>

        {/* ── Excluded actions ── */}
        <div id="excluded-actions" style={{ scrollMarginTop: "72px", marginBottom: "48px" }}>
          <SectionHeading id="excluded-actions-h">Excluded actions — city preferences</SectionHeading>
          <Divider />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 20px", lineHeight: "1.7" }}>
            Cities can instruct HIAP to remove specific types of actions from the ranking entirely before scoring begins.
            This is separate from the legal hard filter — it reflects political, operational, or mandate-based decisions
            that are specific to your city.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            <Step n={1} title="City enters exclusion instructions">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                On the Strategic Preferences page, a city can describe in plain language which types of actions should not
                appear in the ranking — for example: <em>"Do not include actions that significantly increase household costs
                for vulnerable communities"</em> or <em>"Exclude any actions that require new fossil fuel infrastructure."</em>
              </p>
            </Step>
            <Step n={2} title="Instructions are matched against the action library">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                The exclusion text is interpreted semantically and matched against action names, categories, and descriptions
                across the full library of 155 actions. Any action that matches the described criteria is removed
                before scoring begins — it will not receive a score and will not appear in the ranked results.
              </p>
            </Step>
            <Step n={3} title="Excluded actions are shown transparently">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                Removed actions appear in the results page under a separate "Excluded actions" section, showing which
                actions were removed and why. Cities can review and adjust their exclusion criteria by returning to
                Strategic Preferences and re-running the ranking.
              </p>
            </Step>
          </div>
          <CalloutBox color="amber">
            Excluded actions are removed before any score is calculated — they are not penalised, just omitted. This
            distinction matters: an action excluded by city preference might score very highly if re-included. Cities
            should use this feature for genuine mandate or political constraints, not as a way to filter by score.
          </CalloutBox>
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
