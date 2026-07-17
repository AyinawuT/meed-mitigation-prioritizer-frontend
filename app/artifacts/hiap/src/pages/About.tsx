import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const NAVY = "#001EA7";
const GREEN = "#16A34A";
const CORFO_BLUE = "#1A6EB5";

export function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "48px 48px 40px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: NAVY, letterSpacing: "0.08em", marginBottom: "12px" }}>
            ABOUT THIS PROJECT
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#111827", margin: "0 0 16px", lineHeight: "1.2" }}>
            The Aceleradora Local de Mitigación project
          </h1>
          <p style={{ fontSize: "16px", color: "#4B5563", margin: 0, lineHeight: "1.7", maxWidth: "680px" }}>
            Aceleradora Local de Mitigación (ALM) is built through a partnership between the Open Earth Foundation and the Sustainability
            Solutions Group, working together to equip Chilean cities with a rigorous, data-driven tool
            for climate mitigation action prioritisation.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "48px 48px 80px" }}>

        {/* Project overview */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            Project overview
          </h2>
          <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 20px" }} />
          <p style={{ fontSize: "15px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
            Chilean cities face a significant challenge: identifying which climate mitigation actions will have
            the greatest impact given their specific emissions profile, legal context, and socioeconomic conditions.
            Generic action lists and national frameworks are not enough — cities need a tool that can rank
            options specifically for them.
          </p>
          <p style={{ fontSize: "15px", color: "#4B5563", margin: 0, lineHeight: "1.7" }}>
            The ALM project brings together two organisations whose complementary expertise makes this
            possible. The Open Earth Foundation contributes the technical infrastructure and scoring methodology
            behind ALM. The Sustainability Solutions Group contributes deep knowledge of Chilean cities —
            their greenhouse gas inventories, legal frameworks, and policy landscape.
          </p>
        </div>

        {/* Partner cards */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            Our partners
          </h2>
          <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 20px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Open Earth Foundation */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <img
                  src="/oef-logo-dark.svg"
                  alt="Open Earth Foundation"
                  style={{ height: "36px", flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>Open Earth Foundation</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>Tool development &amp; methodology</div>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                The Open Earth Foundation is a non-profit technology organisation focused on building open digital
                infrastructure for climate action. Within the ALM project, the Open Earth Foundation is
                responsible for the design and development of the Aceleradora Local de Mitigación tool.
              </p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                This includes the three-pillar scoring methodology (impact, alignment, feasibility), the pipeline
                that processes city data and policy signals into ranked action recommendations, and the interface
                through which city planners interact with the tool and interpret results.
              </p>
              <a
                href="https://www.openearth.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "13px", color: GREEN, fontWeight: "600", textDecoration: "none" }}
              >
                Visit openearth.org ↗
              </a>
            </div>

            {/* SSG */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "28px 32px" }}>
              {/*
                SSG guidelines: do not place logomark next to any text label.
                Minimum 64px height. Clearspace = 25% of own size (16px at 64px height).
                Logo stands alone — name and role are below it.
              */}
              <div style={{ marginBottom: "20px" }}>
                <img
                  src="/ssg-logomark-black.png"
                  alt="Sustainability Solutions Group"
                  style={{ height: "64px", display: "block", padding: "0 16px 0 0" }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>Sustainability Solutions Group</div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>City data &amp; local expertise</div>
              </div>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                The Sustainability Solutions Group (SSG) is a sustainability consultancy with deep expertise
                in Latin American climate policy and municipal greenhouse gas accounting. Within the ALM
                project, SSG brings the city-level knowledge that makes the tool's outputs credible and locally
                relevant.
              </p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                SSG provides the greenhouse gas inventories for each participating Chilean city — the emissions
                data that underpins the impact scoring — as well as the legal and policy documents covering
                Chile's NDC, regional PARCCs, and municipal PACCCs that drive the alignment and feasibility
                assessments.
              </p>
              <a
                href="https://ssg.coop/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "13px", color: NAVY, fontWeight: "600", textDecoration: "none" }}
              >
                Visit ssg.coop ↗
              </a>
            </div>

            {/* CORFO */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                {/*
                  CORFO guidelines: clearspace = height of letter O on all sides (~14px at this size).
                  Do not alter proportions or colors.
                */}
                <img
                  src="/corfo-color-transparent.png"
                  alt="CORFO"
                  style={{ height: "48px", flexShrink: 0, padding: "6px 6px" }}
                />
                <div>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>Corporación de Fomento de la Producción</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>Project funding</div>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                CORFO is Chile's national agency for entrepreneurship, innovation, and productivity, working to
                strengthen Chile's capacity for economic and technological development. CORFO funds projects that
                generate public value and build Chile's innovation ecosystem.
              </p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.7" }}>
                ALM is funded by CORFO through its Crea y Valida programme, part of the Comité InnovaChile.
                Crea y Valida supports the development and validation of innovative solutions with high potential
                for social and economic impact.
              </p>
              <a
                href="https://www.corfo.cl"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "13px", color: CORFO_BLUE, fontWeight: "600", textDecoration: "none" }}
              >
                Visit corfo.cl ↗
              </a>
            </div>

          </div>
        </div>

        {/* How we work together */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            How the partnership works
          </h2>
          <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 20px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              {
                step: "1",
                title: "SSG compiles city data",
                desc: "SSG collects and structures the GPC-aligned greenhouse gas inventories for each Chilean city, along with the legal requirements and policy signals from national, regional, and municipal frameworks.",
              },
              {
                step: "2",
                title: "Open Earth runs the pipeline",
                desc: "The Open Earth Foundation's ALM pipeline processes the city data, scores each action across the three pillars, applies pre-scoring filters, and produces a ranked list of mitigation actions.",
              },
              {
                step: "3",
                title: "Cities act on results",
                desc: "City planners use ALM to review ranked actions, explore score breakdowns, adjust strategic weights, and identify the highest-impact actions to carry forward into planning and implementation.",
              },
              {
                step: "4",
                title: "CORFO enables the project",
                desc: "The ALM project is funded by CORFO through its Crea y Valida programme, part of the Comité InnovaChile, which supports the development and validation of innovative solutions with high potential for social and economic impact in Chile.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "20px" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  background: "#EEF2FF",
                  color: NAVY,
                  fontWeight: "700",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}>{step}</div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827", marginBottom: "8px" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.6" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "10px",
          padding: "20px 24px",
        }}>
          <div style={{ fontSize: "14px", color: "#14532D", lineHeight: "1.7" }}>
            ALM is part of a broader initiative by the Open Earth Foundation to support
            evidence-based climate action planning in cities. The ALM project is a pilot that applies
            this approach specifically to the Chilean context, with the goal of expanding to further countries
            and municipalities. This work is made possible by funding from CORFO through its Crea y Valida programme.
          </div>
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
}
