import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import { setStepProgress } from "@/lib/stepProgress";
import policyData from "@/data/actionsPolicySignals.json";
import actionNames from "@/data/actionNames.json";

interface PolicySignal {
  location_scope: "National" | "Regional";
  location_name: string;
  signal_type: "action" | "funding" | "governance" | "sector" | "target";
  signal_relation: string;
  signal_strength: "low" | "medium" | "high";
  evidence_count: number;
}

interface ActionPolicyRecord {
  action_id: string;
  policy_signals: PolicySignal[];
}

interface ActionMeta { name: string; category: string; subcategory: string; }
const ACTION_NAMES = actionNames as Record<string, ActionMeta>;
const ALL_POLICY = (policyData as { policy_signals: ActionPolicyRecord[] }).policy_signals;

const OUR_ACTION_IDS = Object.keys(ACTION_NAMES);

const TYPE_LABEL: Record<string, string> = {
  action:     "Policy action",
  funding:    "Funding",
  governance: "Governance",
  sector:     "Sector plan",
  target:     "Emissions target",
};

const RELATION_LABEL: Record<string, string> = {
  supports:    "supports",
  provides:    "provides",
  assigns:     "assigns",
  identifies:  "identifies",
  commits:     "commits",
  ceiling:     "caps funding",
  establishes: "establishes",
};

const STRENGTH_STYLE: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  high:   { dot: "#16A34A", bg: "#F0FDF4", text: "#16A34A",  border: "#BBF7D0" },
  medium: { dot: "#F9A200", bg: "#FFFBEB", text: "#B45309",  border: "#FDE68A" },
  low:    { dot: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280",  border: "#E5E7EB" },
};

function overallStrength(signals: PolicySignal[]): "high" | "medium" | "low" {
  if (signals.some(s => s.signal_strength === "high"))   return "high";
  if (signals.some(s => s.signal_strength === "medium")) return "medium";
  return "low";
}

const OVERALL_LABEL: Record<string, string> = {
  high:   "Strong support",
  medium: "Moderate support",
  low:    "Weak support",
};

interface Props { params: { locode: string } }

export function PolicyAlignment({ params }: Props) {
  const [, navigate] = useLocation();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city: CityData | undefined = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );

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

  const actions = OUR_ACTION_IDS
    .map(id => ({
      id,
      meta: ACTION_NAMES[id],
      record: ALL_POLICY.find(r => r.action_id === id),
    }))
    .filter(a => a.record);

  const nationalStrengths = actions.map(a => {
    const nat = a.record!.policy_signals.filter(s => s.location_scope === "National");
    return overallStrength(nat);
  });

  const strongCount    = nationalStrengths.filter(s => s === "high").length;
  const moderateCount  = nationalStrengths.filter(s => s === "medium").length;
  const weakCount      = nationalStrengths.filter(s => s === "low").length;
  const totalEvidence  = actions.reduce((sum, a) =>
    sum + a.record!.policy_signals.reduce((s2, sig) => s2 + sig.evidence_count, 0), 0);

  useEffect(() => {
    setStepProgress(locode, "policy", {
      visited: true,
      progress: 100,
      sub: `${actions.length} actions assessed · ${strongCount} strong, ${moderateCount} moderate policy support`,
    });
  }, [locode]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={4} citySlug={citySlug} />

      {/* Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Policy Alignment</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Policy Alignment</h1>
            <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontWeight: "500" }}>Optional</span>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
            MEED+ HIAP has checked each candidate action against national and regional policy signals for {city.name}. Actions with stronger policy backing receive a higher alignment score in the ranking.
          </p>
          <p style={{ fontSize: "13px", color: "#16A34A", fontWeight: "500", margin: 0 }}>
            MEED+ ALIGNMENT: Policy alignment contributes 80% to the city's alignment score · Alignment shapes 22% of ranking
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 60px" }}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          <KpiCard value={actions.length} label="Actions assessed" sub="Against national & regional policy" bg="white" valuecol="#111827" border="#E5E7EB" />
          <KpiCard value={strongCount}   label="Strong policy support" sub="At least one high-strength signal" bg="#F0FDF4" valuecol="#16A34A" border="#BBF7D0" />
          <KpiCard value={moderateCount} label="Moderate support" sub="Highest signal strength is medium" bg="#FFFBEB" valuecol="#B45309" border="#FDE68A" />
          <KpiCard value={weakCount}     label="Weak support" sub="All signals are low strength" bg="#F9FAFB" valuecol="#6B7280" border="#E5E7EB" />
        </div>

        {/* Action cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {actions.map((a) => {
            const natSignals = a.record!.policy_signals.filter(s => s.location_scope === "National");
            const regSignals = a.record!.policy_signals.filter(s => s.location_scope === "Regional");
            const regName    = regSignals[0]?.location_name ?? "Regional";
            const natStr     = overallStrength(natSignals);
            const ss         = STRENGTH_STYLE[natStr];

            return (
              <div key={a.id} style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                {/* Action header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", lineHeight: "1.4", marginBottom: "3px" }}>{a.meta.name}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{a.meta.subcategory}</div>
                  </div>
                  <span style={{ marginLeft: "16px", flexShrink: 0, fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, fontWeight: "600" }}>
                    {OVERALL_LABEL[natStr]}
                  </span>
                </div>

                {/* Signals grid */}
                <div style={{ display: "grid", gridTemplateColumns: regSignals.length > 0 ? "1fr 1fr" : "1fr", gap: "12px" }}>
                  {/* National */}
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "7px", textTransform: "uppercase" }}>National · Chile</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {natSignals.map((sig, i) => <SignalChip key={i} signal={sig} />)}
                    </div>
                  </div>
                  {/* Regional */}
                  {regSignals.length > 0 && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "7px", textTransform: "uppercase" }}>Regional · {regName}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {regSignals.map((sig, i) => <SignalChip key={i} signal={sig} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Evidence note */}
        <div style={{ marginTop: "16px", padding: "12px 16px", background: "#F5F7FF", borderRadius: "8px", border: "1px solid #C7D2FE", fontSize: "12px", color: "#4338CA" }}>
          Policy signals drawn from <strong>{totalEvidence.toLocaleString()}</strong> pieces of national and regional policy evidence. Signals cover policy actions, funding mechanisms, governance assignments, sector plans, and emissions targets.
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px" }}>
          <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: "13px", cursor: "pointer", padding: 0 }}>
            ← Skip this step
          </button>
          <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            Save & continue →
          </button>
        </div>
      </div>
    </div>
  );
}

function SignalChip({ signal }: { signal: PolicySignal }) {
  const ss = STRENGTH_STYLE[signal.signal_strength];
  const relation = RELATION_LABEL[signal.signal_relation] ?? signal.signal_relation;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "5px",
      padding: "4px 8px", borderRadius: "5px",
      background: ss.bg, border: `1px solid ${ss.border}`,
      fontSize: "11px", color: ss.text,
    }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: ss.dot, flexShrink: 0, display: "inline-block" }} />
      <span style={{ fontWeight: "500" }}>{TYPE_LABEL[signal.signal_type]}</span>
      <span style={{ color: "#9CA3AF", fontWeight: "400" }}>· {relation}</span>
      <span style={{ color: "#9CA3AF", fontSize: "10px" }}>({signal.evidence_count})</span>
    </div>
  );
}

function KpiCard({ value, label, sub, bg, valuecol, border }: { value: number; label: string; sub: string; bg: string; valuecol: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "24px", fontWeight: "700", color: valuecol, lineHeight: "1.2" }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginTop: "2px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{sub}</div>
    </div>
  );
}
