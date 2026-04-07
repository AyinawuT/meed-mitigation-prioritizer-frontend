import { Navbar } from "./_shared/Navbar";
import { useState } from "react";

const SECTORS = [
  "Stationary Energy",
  "Transportation",
  "Waste",
  "Industrial Processes & Product Use (IPPU)",
  "Agriculture, Forestry & Other Land Use (AFOLU)",
];

const TIMELINE_OPTIONS = ["Short-term (<5y)", "Medium-term (5–10y)", "Long-term (10+ y)"];
const BUDGET_OPTIONS = ["< $50M", "$50M – 200M", "$200M – 1B", "$1B+"];

export function StrategicPreferences() {
  const [selectedSectors, setSelectedSectors] = useState(["Stationary Energy", "Transportation", "Waste"]);
  const [timeline, setTimeline] = useState("Medium-term (5–10y)");
  const [budget, setBudget] = useState("$200M – 1B");
  const [priorities, setPriorities] = useState("");
  const [excludeText, setExcludeText] = useState("");

  const toggleSector = (s: string) => {
    setSelectedSectors((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev
    );
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar />

      {/* White page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "20px 48px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "6px" }}>
            Santiago / City Profile / Strategic Preferences
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#111827", margin: "0 0 10px" }}>
            Strategic Preferences
          </h1>
          {/* MEED+ impact bar */}
          <div style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#15803D",
            lineHeight: "1.5",
          }}>
            MEED+ Impact &amp; Alignment: Alignment shapes 22% of the ranking with priority sectors and strategic priorities taking 15% and 5% respectively of the alignment score. Implementation timeline shapes 20% of the impact score which as mentioned earlier shaped 55% of the ranking.
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 48px" }}>
        {/* Sector prioritisation */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Which sectors should we prioritise?
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
            Select up to 5 sectors — at least 1 must apply.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SECTORS.map((s) => {
              const active = selectedSectors.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSector(s)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "20px",
                    border: active ? "none" : "1px solid #D1D5DB",
                    background: active ? "#001EA7" : "#FFFFFF",
                    color: active ? "white" : "#6B7280",
                    fontSize: "13px",
                    fontWeight: active ? "500" : "400",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategic priorities */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            What are this city's strategic priorities?
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
            Write out what your city prioritizes. Examples may include job creation and local economy, air quality and public health etc.
          </div>
          <input
            type="text"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="City strategic priorities"
            style={{
              width: "100%",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Implementation timeline */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Implementation timeline
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
            Priority planning horizon for your top-20 actions.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            {TIMELINE_OPTIONS.map((opt) => {
              const active = timeline === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setTimeline(opt)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    border: active ? "none" : "1px solid #D1D5DB",
                    background: active ? "#001EA7" : "white",
                    color: active ? "white" : "#6B7280",
                    fontSize: "13px",
                    fontWeight: active ? "500" : "400",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget range */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Indicative budget range
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
            Approximate available per year across actions.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            {BUDGET_OPTIONS.map((opt) => {
              const active = budget === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setBudget(opt)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    border: active ? "none" : "1px solid #D1D5DB",
                    background: active ? "#001EA7" : "white",
                    color: active ? "white" : "#6B7280",
                    fontSize: "13px",
                    fontWeight: active ? "500" : "400",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Excluded actions */}
        <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "20px", marginBottom: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Actions to exclude <span style={{ color: "#9CA3AF", fontWeight: "400" }}>(optional)</span>
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
            Write out the type of actions you wish to exclude. Actions that match the type of actions you have typed will be excluded from the ranking.
          </div>
          <input
            type="text"
            value={excludeText}
            onChange={(e) => setExcludeText(e.target.value)}
            placeholder="City strategic priorities"
            style={{
              width: "100%",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "12px", color: "#6B7280", cursor: "pointer", fontWeight: "500", letterSpacing: "0.03em" }}>
            ← CITY POWERS &amp; MANDATES
          </button>
          <button style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "12px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.03em" }}>
            SAVE PREFERENCES →
          </button>
        </div>
      </div>
    </div>
  );
}
