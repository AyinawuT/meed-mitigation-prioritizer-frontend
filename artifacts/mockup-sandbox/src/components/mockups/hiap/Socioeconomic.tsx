import { Navbar } from "./_shared/Navbar";
import { StepBar } from "./_shared/StepBar";
import { useState } from "react";

type Indicator = { label: string; value: string; category: string; categoryColor: string; source: string };

const SECTION1: Indicator[] = [
  { label: "Population size", value: "214,857", category: "—", categoryColor: "#9CA3AF", source: "INE 2022" },
  { label: "Unemployment rate", value: "9.44%", category: "High", categoryColor: "#DC2626", source: "CASEN 2022" },
  { label: "Median household income", value: "1,200,000 CLP", category: "High", categoryColor: "#C05621", source: "CASEN 2022" },
  { label: "Poverty rate", value: "26.77%", category: "Very high", categoryColor: "#DC2626", source: "CASEN 2022" },
  { label: "Home ownership rate", value: "40%", category: "Very low", categoryColor: "#9CA3AF", source: "INE 2022" },
  { label: "Renter share", value: "43.48%", category: "High", categoryColor: "#C05621", source: "CASEN 2022" },
];

const SECTION2: Indicator[] = [
  { label: "Transport & logistics employment", value: "7.35%", category: "Low", categoryColor: "#9CA3AF", source: "CASEN 2022" },
  { label: "Industry & construction employment", value: "22.79%", category: "High", categoryColor: "#C05621", source: "CASEN 2022" },
  { label: "Electricity access", value: "100%", category: "Very low impact", categoryColor: "#16A34A", source: "MINENERGIA 2021" },
  { label: "Public transport share", value: "31.84%", category: "Medium", categoryColor: "#C05621", source: "EOD 2021" },
];

function categoryBg(color: string) {
  if (color === "#DC2626") return "#FEE2E2";
  if (color === "#C05621") return "#FFF3E0";
  if (color === "#16A34A") return "#D1FAE5";
  return "#F5F5F5";
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(indicator.value);

  return (
    <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", lineHeight: "1.3" }}>{indicator.label}</div>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: categoryBg(indicator.categoryColor), color: indicator.categoryColor, fontWeight: "500", whiteSpace: "nowrap", marginLeft: "8px" }}>
          {indicator.category}
        </span>
      </div>
      {editing ? (
        <div>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ width: "100%", border: "1px solid #2563EB", borderRadius: "6px", padding: "6px 10px", fontSize: "13px", boxSizing: "border-box", marginBottom: "8px", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setEditing(false)} style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", cursor: "pointer" }}>Save</button>
            <button onClick={() => { setVal(indicator.value); setEditing(false); }} style={{ background: "white", color: "#6B7280", border: "1px solid #D1D5DB", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{val}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{indicator.source}</div>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "5px", padding: "3px 10px", fontSize: "11px", color: "#6B7280", cursor: "pointer" }}>Edit</button>
          </div>
        </>
      )}
    </div>
  );
}

export function Socioeconomic() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />
      <StepBar activeStep={1} />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>Santiago / City Profile / Socioeconomic Context</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>Socioeconomic context</h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0" }}>Review the indicators we use to assess implementation feasibility. Confirm values or correct anything that is wrong.</p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", background: "#FFF3E0", color: "#C05621", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>HIGH</span>
              <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>
                Confirm all as correct
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 48px" }}>
        {/* Data source */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "10px 16px", marginBottom: "18px", fontSize: "12px", color: "#1E40AF" }}>
          📊 Data sourced from CityCatalyst global-api · City context endpoint
        </div>

        {/* Section 1 */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Population &amp; economy
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {SECTION1.map((ind) => <IndicatorCard key={ind.label} indicator={ind} />)}
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sector employment &amp; infrastructure
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {SECTION2.map((ind) => <IndicatorCard key={ind.label} indicator={ind} />)}
          </div>
        </div>

        {/* Missing indicators */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#92400E", marginBottom: "10px" }}>⚠️ 2 indicators could improve your feasibility score</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["GDP per capita", "Vehicle ownership rate"].map((ind) => (
              <div key={ind} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#92400E" }}>{ind}</span>
                <button style={{ background: "white", border: "1px solid #FDE68A", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", color: "#C05621", cursor: "pointer", fontWeight: "500" }}>+ Add</button>
              </div>
            ))}
          </div>
        </div>

        {/* MEED+ impact bar */}
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", fontSize: "12px", color: "#15803D" }}>
          ✦ Socioeconomic data shapes feasibility scoring for 155 actions — 35%
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer" }}>← Back</button>
          <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Save &amp; continue to regulations →
          </button>
        </div>
      </div>
    </div>
  );
}
