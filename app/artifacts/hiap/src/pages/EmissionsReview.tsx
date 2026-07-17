import { useEffect } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { getEmissionsData, type EmissionSectorRow } from "@/lib/cityInventory";

const EMPTY_SECTORS: EmissionSectorRow[] = [
  { sector: "Stationary Energy",                           sub: "I.1–I.8",    ref: "I.1–I.8",    emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Transportation",                              sub: "II.1–II.5",  ref: "II.1–II.5",  emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Waste",                                       sub: "III.1–III.4",ref: "III.1–III.4",emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Industrial Processes & Product Use (IPPU)",   sub: "IV.1–IV.4",  ref: "IV.1–IV.4",  emissions: null, share: null, source: null, status: "Not mapped" },
  { sector: "Agriculture, Forestry & Other Land Use (AFOLU)", sub: "V.1–V.3",ref: "V.1–V.3",    emissions: null, share: null, source: null, status: "Not mapped" },
];

interface EmissionsReviewProps {
  params: { locode: string };
}

export function EmissionsReview({ params }: EmissionsReviewProps) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");
  const fromRecommendations = search.includes("from=recommendations");

  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

  const inventoryData = getEmissionsData(locode);
  const sectors = inventoryData?.rows ?? EMPTY_SECTORS;
  const inventoryYear = inventoryData?.year.toString() ?? city?.emissionsYear ?? "—";

  if (!city) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "80px auto", padding: "0 64px", textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>City not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>
            ← Back to cities
          </button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");
  const confirmedCount = sectors.filter((s) => s.status === "Confirmed").length;
  const totalEmissions = sectors.reduce((sum, s) => sum + (s.emissions ?? 0), 0);
  const totalMillions = (totalEmissions / 1e6).toFixed(2);

  useEffect(() => {
    setStepProgress(locode, "emissions", {
      visited: true,
      progress: Math.round((confirmedCount / sectors.length) * 100),
      sub: `${confirmedCount} / ${sectors.length} sectors confirmed · Inventory year ${inventoryYear}`,
    });
  }, [locode, confirmedCount, sectors.length, inventoryYear]);

  function handleConfirm() {
    confirmStep(locode, "emissions");
    if (fromRecommendations) navigate(`/city/${citySlug}/recommendations?tab=context`);
    else if (fromPreflight) navigate(`/city/${citySlug}/preflight`);
    else navigate(`/city/${citySlug}/socioeconomic`);
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={0} citySlug={citySlug} />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              Cities
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {city.name}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Emissions Data</span>
          </div>

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
              Emissions Data
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
              Aceleradora Local de Mitigación uses {city.name}'s greenhouse gas inventory to identify which sectors contribute most to emissions. This data determines the potential impact of each climate action and shapes how actions are ranked.
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{
                fontSize: "11px",
                background: confirmedCount === sectors.length ? "#F0FDF4" : "#FFF3E0",
                color: confirmedCount === sectors.length ? "#16A34A" : "#C05621",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: "600",
              }}>
                {confirmedCount} / {sectors.length} sectors confirmed
              </span>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "6px", padding: "5px 12px",
                fontSize: "11px", color: "#15803D", fontWeight: "600",
              }}>
                <span>📊</span>
                <span>ALM IMPACT: Emissions data shapes 55% of ranking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 40px" }}>
        {/* Summary bar */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          padding: "16px 24px",
          marginBottom: "14px",
          display: "flex",
          gap: "40px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          flexWrap: "wrap",
        }}>
          {[
            { label: "Total GHG Emissions", value: inventoryData ? `${totalMillions}M tCO₂e` : "—" },
            { label: "Inventory Year", value: inventoryYear },
            { label: "Primary Source", value: inventoryData ? "SSG" : "—" },
            { label: "Completeness", value: `${confirmedCount} of ${sectors.length} sectors` },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Sector table */}
        <div style={{
          background: "white",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                {["SECTOR", "SUB-SECTORS", "TOTAL tCO₂e", "% SHARE", "DATA SOURCE", "STATUS"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 16px",
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: "500",
                    textAlign: "left",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectors.map((row, i) => {
                const isConfirmed = row.status === "Confirmed";
                return (
                  <tr key={i} style={{ borderBottom: i < sectors.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>{row.sector}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px", fontFamily: "monospace" }}>{row.ref}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#6B7280", maxWidth: "220px" }}>
                      {row.sub}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: isConfirmed ? "#111827" : "#D1D5DB", fontVariantNumeric: "tabular-nums" }}>
                      {row.emissions !== null ? row.emissions.toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: isConfirmed ? "#111827" : "#D1D5DB" }}>
                      {row.share !== null ? `${row.share}%` : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#6B7280" }}>
                      {row.source ?? "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {isConfirmed ? (
                        <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "500" }}>✓ Confirmed</span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Not mapped</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}`)}
            style={{
              background: "white",
              border: "1px solid #DDDDE1",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              color: "#6B7280",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ← City Profile
          </button>

          <button
            onClick={handleConfirm}
            style={{
              background: "#16A34A",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
            }}
          >
            {fromRecommendations ? "Save & return to context breakdown →" : fromPreflight ? "Save & return to pre-flight →" : "Socioeconomic context →"}
          </button>
        </div>
      </div>
    </div>
  );
}
