import { Navbar } from "./_shared/Navbar";
import { Breadcrumb } from "./_shared/Breadcrumb";
import { StepBar } from "./_shared/StepBar";
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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh" }}>
      <Navbar cityName="Santiago" />
      <StepBar activeStep={3} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 40px" }}>
        <Breadcrumb items={["Santiago", "City Profile", "Strategic Preferences"]} />
        <h1 style={{ fontSize: "22px", fontWeight: "500", color: "#111827", margin: "8px 0 4px" }}>
          Strategic Preferences
        </h1>

        {/* MEED+ bar */}
        <div
          style={{
            background: "#DCFCE7",
            border: "0.5px solid #86EFAC",
            borderRadius: "8px",
            padding: "10px 16px",
            marginBottom: "24px",
            fontSize: "12px",
            color: "#166634",
            lineHeight: "1.5",
          }}
        >
          MEED+ Impact & Alignment: Alignment shapes 22% of the ranking with priority sectors and strategic priorities taking 15% and 5% respectively of the alignment score. Implementation timeline shapes 20% of the impact score which as mentioned earlier shaped 55% of the ranking.
        </div>

        {/* Sector prioritisation */}
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
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
                    padding: "7px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: active ? "#1E3A8A" : "#F3F4F6",
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
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            What are this city's strategic priorities?
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
            Write out what your city prioritizes. Examples may include job creation and local economy, air quality and public health etc.
          </div>
          <textarea
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="City strategic priorities"
            style={{
              width: "100%",
              border: "0.5px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#111827",
              outline: "none",
              resize: "none",
              height: "70px",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Implementation timeline */}
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Implementation timeline
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
            Priority planning horizon for your top-20 actions.
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {TIMELINE_OPTIONS.map((opt) => {
              const active = timeline === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setTimeline(opt)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    border: active ? "none" : "0.5px solid #E5E7EB",
                    background: active ? "#1E3A8A" : "white",
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
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Indicative budget range
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
            Approximate available per year across actions.
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {BUDGET_OPTIONS.map((opt) => {
              const active = budget === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setBudget(opt)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    border: active ? "none" : "0.5px solid #E5E7EB",
                    background: active ? "#1E3A8A" : "white",
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
        <div
          style={{
            background: "white",
            border: "0.5px solid #E5E7EB",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
            Actions to exclude <span style={{ color: "#9CA3AF", fontWeight: "400" }}>(optional)</span>
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
            Write out the type of actions you wish to exclude. Actions that match the type of actions you have typed will be excluded from the ranking.
          </div>
          <textarea
            value={excludeText}
            onChange={(e) => setExcludeText(e.target.value)}
            placeholder="City strategic priorities"
            style={{
              width: "100%",
              border: "0.5px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#111827",
              outline: "none",
              resize: "none",
              height: "70px",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            style={{
              background: "white",
              border: "0.5px solid #D1D5DB",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            ← City Powers & Mandates
          </button>
          <button
            style={{
              background: "#16A34A",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Save Preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
