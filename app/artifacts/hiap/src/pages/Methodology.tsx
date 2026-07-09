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
                <Subcomp pct="5%" title="Co-benefit preference match" desc="How well the action's co-benefits align with your city's selected co-benefit priorities" color="purple" />
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
                <Subcomp pct="34%" title="Legal verdict score" desc="Continuous 0–1 score from the legal assessment (verdictScore); blocked actions are removed before this step" color="green" />
                <Subcomp pct="33%" title="Mitigation feasibility" desc="City-scoped mitigation feasibility score from the action mitigation feasibility endpoint" color="green" />
                <Subcomp pct="33%" title="Financial feasibility" desc="City-scoped climate-finance feasibility score — route accessibility, fund access, and comparable funded projects" color="green" />
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
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Each action is tagged with the GPC sectors and subsectors it addresses using a <code>sector_number</code> +
                <code>subsector_number[]</code> pair, forming subsector-level keys such as <code>I.1</code> (stationary energy, subsector 1)
                or <code>II.1</code> (transportation, subsector 1). The pipeline looks up how much your city emits in those exact subsectors.
                Full GPC reference numbers (e.g. <code>II.1.1</code>) are retained as reference data but do not drive the Impact join.
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
                The weighted matched emissions are divided by the city's total scoring emissions magnitude to get a 0–1 share.
                AFOLU subsectors (<code>V.*</code>) contribute their absolute inventory value — so a carbon-removal entry of −50 contributes 50 to
                both the numerator and denominator. Non-AFOLU subsectors contribute only when their inventory value is strictly positive.
              </p>
              <CodeBlock>{"reduction_share = (matched_subsector_emissions × impact_multiplier)\n                  ÷ total_scoring_emissions_magnitude\n\n// AFOLU V.* : use abs(emissions)\n// Others    : use emissions only when > 0"}</CodeBlock>
            </Step>
            <Step n={4} title="Combine with timeline score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                Actions that deliver results quickly receive a higher timeline score, rewarding near-term impact over long-term structural changes.
                A missing or unknown timeline is treated as the neutral midpoint.
              </p>
              <CodeBlock>{"<5 years  → 1.0    5-10 years → 0.5    >10 years → 0.0    missing → 0.5\n\nimpact_score = (0.80 × reduction_share) + (0.20 × timeline_score)"}</CodeBlock>
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
              <CodeBlock>{"alignment_score = (0.75 × policy_support_score)\n               + (0.15 × sector_preference_match)\n               + (0.05 × cobenefit_preference_match)\n               + (0.05 × timeframe_preference_match)"}</CodeBlock>
            </Step>
            <Step n={3} title="Apply sector preference">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: "1.6" }}>
                The pipeline maps each action's <code>sector_number</code> (I → stationary_energy, II → transportation, etc.)
                and checks whether that sector appears in <code>cityStrategicPreferenceSectors[]</code>.
                A match scores 1.0; no match scores 0.0. This contributes 15% of the alignment score.
              </p>
            </Step>
            <Step n={4} title="Match co-benefit preferences">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                For the city's selected co-benefit priorities (from <code>cityStrategicPreferenceCoBenefitKeys[]</code>),
                the pipeline sums each action's <code>impact_numeric</code> for those keys (missing keys score 0), then normalises the
                result from [−2n, +2n] to a 0–1 scale where n is the number of selected co-benefit keys.
                When no co-benefit keys are selected, this component stays at the neutral midpoint of 0.5.
              </p>
              <CodeBlock>{"other_component = normalize(\n  sum(coBenefits[key].impact_numeric for key in selectedKeys),\n  min = len(selectedKeys) × −2,\n  max = len(selectedKeys) × +2\n)\n// no keys selected → 0.5 (neutral)"}</CodeBlock>
            </Step>
            <Step n={5} title="Match timeframe preference">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                The city's preferred implementation horizon (<code>cityStrategicPreferenceTimeframes[]</code>) is compared to the action's
                <code>timelineForImplementation</code>. If the city selects multiple timeframes, the best match for that action is used.
              </p>
              <CodeBlock>{"action timeline → bucket:  <5yr → short   5-10yr → medium   >10yr → long\n\nexact match   → 1.0\nadjacent match → 0.5    (e.g. city=medium, action=short or long)\nfar mismatch  → 0.0    (e.g. city=short, action=long)\nmissing / no_preference → 0.5 (neutral)"}</CodeBlock>
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
            <Step n={1} title="Legal verdict score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 12px", lineHeight: "1.6" }}>
                The Hard Filter (see Pre-scoring filters) removes any action whose <code>verdictCategory = blocked</code> before
                scoring begins. For every action that survives, the legal assessment also provides a continuous <strong>verdictScore</strong> (0–1)
                which feeds directly into the feasibility calculation as the legal component. A missing score falls back to the neutral value of 0.5.
              </p>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Verdict category", "Effect on scoring", "What it means"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["blocked", "Action removed — never scored", "Hard Filter removes the action before scoring begins"],
                      ["non-blocked", "verdictScore used directly", "The continuous 0–1 score from the legal assessment feeds the feasibility component"],
                      ["missing", "Neutral 0.5 applied", "No legal row available — action is not penalised but scores at the midpoint"],
                    ].map(([cat, effect, meaning], i) => (
                      <tr key={cat} style={{ borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
                            background: cat === "blocked" ? "#FEF2F2" : cat === "non-blocked" ? "#F0FDF4" : "#FFFBEB",
                            color: cat === "blocked" ? "#DC2626" : cat === "non-blocked" ? "#16A34A" : "#D97706",
                          }}>{cat}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151", fontWeight: "500" }}>{effect}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CodeBlock>{"legal_component = verdictScore        // continuous 0–1 from legal assessment\n// fallback: 0.5 if verdictScore is missing"}</CodeBlock>
            </Step>
            <Step n={2} title="Mitigation feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                The pipeline reads each action's <code>action_score</code> (0–1) directly from the city-scoped
                mitigation feasibility endpoint. This score reflects how feasible the action is given the city's
                real conditions across multiple feasibility dimensions. The pipeline does not recompute it — it uses
                the pre-calculated value as-is. If an action has no score row, or the row is missing <code>action_score</code>,
                the component falls back to the neutral midpoint.
              </p>
              <CodeBlock>{"mitigation_component = action_score       // 0–1 from mitigation feasibility endpoint\n// fallback: 0.5 if action_score is missing or endpoint returns 404"}</CodeBlock>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "8px 0 0", lineHeight: "1.6" }}>
                Dimension-level detail (option family, mapping strength, breakdown, city rank) is retained as evidence and
                visible on the action detail page, but only the top-level <code>action_score</code> enters the feasibility formula.
              </p>
            </Step>
            <Step n={3} title="Financial feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                The pipeline reads each action's <code>financial_feasibility</code> (0–1) directly from the city-scoped
                climate-finance feasibility endpoint. The score reflects the action's financing route, fund access, and
                the city's financial and institutional capacity. Again, the pipeline uses the pre-calculated value — it does
                not compute capital intensity or complexity itself. Missing rows fall back to the neutral midpoint.
              </p>
              <CodeBlock>{"financial_component = financial_feasibility   // 0–1 from climate-finance endpoint\n// fallback: 0.5 if financial_feasibility is missing or endpoint returns 404"}</CodeBlock>
              <CalloutBox color="green">
                The financial feasibility score contributes one third of the total feasibility score — it is a live pipeline
                input, not a supplementary display. The Financial Feasibility page shows the full breakdown of route reasoning,
                matched funds, and comparable funded projects for each action.
              </CalloutBox>
            </Step>

            <Step n={4} title="Combine components into a feasibility score">
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 4px", lineHeight: "1.6" }}>
                The feasibility score combines all three components. Missing components fall back to the neutral value of 0.5
                so no action is unfairly penalised when data is unavailable:
              </p>
              <CodeBlock>{"feasibility_score = (0.34 × legal_verdict_score)\n                  + (0.33 × mitigation_feasibility_score)\n                  + (0.33 × financial_feasibility_score)\n\n// fallback for any missing component: use 0.5 (neutral midpoint)"}</CodeBlock>
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
