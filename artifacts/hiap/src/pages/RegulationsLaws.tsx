import { useState, useEffect } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import actionsLegal from "@/data/actionsLegal.json";
import actionNames from "@/data/actionNames.json";

type Tab = "review" | "adjust";
type AlignmentStatus = "aligns" | "not_aligned" | "no_evidence";
type Strength = "mandatory" | "required" | "recommended" | "optional" | "informational";

interface Requirement {
  signal_code: string;
  signal_name: string;
  operator: string;
  required_value: string;
  legal_signal_value: string | null;
  strength: Strength;
  alignment_status: AlignmentStatus;
  location_scope: string | null;
  location_name: string | null;
  evidence_ids: string[];
  evidence_count: number;
}

interface ActionLegal {
  action_id: string;
  requirements: Requirement[];
}

interface ActionMeta {
  name: string;
  category: string;
  subcategory: string;
}

const ACTION_NAMES = actionNames as Record<string, ActionMeta>;

const SIGNAL_SHORT: Record<string, string> = {
  MUNI_WASTE_AUTHORITY:       "Waste management authority",
  MUNI_TRANSPORT_AUTHORITY:   "Transport authority",
  MUNI_PLANNING_AUTHORITY:    "Planning authority",
  MUNI_ENV_STANDARDS:         "Environmental standards",
  PLANS_ALIGNMENT:            "Plans alignment",
  PROCUREMENT_PUBLIC_BIDDING: "Procurement process",
  SUBSIDY_CAP_7PCT:           "Subsidy cap",
};

const VALUE_DISPLAY: Record<string, string> = {
  exclusive_authority: "exclusive authority",
  apply_standards:     "may apply standards",
  planning_authority:  "full planning authority",
  comply:              "must comply",
  public_bidding:      "public bidding",
  direct_award:        "direct award",
  restricted:          "restricted",
  shared_authority:    "shared authority",
  "0.07":              "7% cap",
  "0.12":              "12% (exceeds cap)",
  "0.05":              "5% (within cap)",
};

const STRENGTH_LABEL: Record<Strength, string> = {
  mandatory:     "mandatory",
  required:      "required",
  recommended:   "recommended",
  optional:      "optional",
  informational: "informational",
};

function getBlockingReqs(reqs: Requirement[]): Requirement[] {
  return reqs.filter(
    (r) =>
      (r.strength === "mandatory" || r.strength === "required") &&
      r.alignment_status === "not_aligned"
  );
}

function getUncertainReqs(reqs: Requirement[]): Requirement[] {
  return reqs.filter(
    (r) =>
      (r.strength === "mandatory" || r.strength === "required") &&
      r.alignment_status === "no_evidence"
  );
}

function blockReason(req: Requirement): string {
  const signal = SIGNAL_SHORT[req.signal_code] ?? req.signal_name;
  const required = VALUE_DISPLAY[req.required_value] ?? req.required_value;
  const found = req.legal_signal_value ? (VALUE_DISPLAY[req.legal_signal_value] ?? req.legal_signal_value) : null;
  const strength = STRENGTH_LABEL[req.strength];
  if (found) {
    return `${signal} — ${strength} requirement not met (needs ${required}, found ${found})`;
  }
  return `${signal} — ${strength} requirement not met (needs ${required})`;
}

function uncertainReason(req: Requirement): string {
  const signal = SIGNAL_SHORT[req.signal_code] ?? req.signal_name;
  const required = VALUE_DISPLAY[req.required_value] ?? req.required_value;
  return `${signal} — no evidence found that the city has ${required}`;
}

interface RegulationsLawsProps {
  params: { locode: string };
}

export function RegulationsLaws({ params }: RegulationsLawsProps) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromPreflight = search.includes("from=preflight");
  const [activeTab, setActiveTab] = useState<Tab>("review");
  const [overrides, setOverrides] = useState<Set<string>>(new Set());
  const [overrideNotes, setOverrideNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [expandedUncertain, setExpandedUncertain] = useState(false);

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
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}>
            ← Back to cities
          </button>
        </div>
      </div>
    );
  }

  const citySlug = city.locode.replace(" ", "-");
  const actions = actionsLegal.legal_requirements as ActionLegal[];

  const excluded   = actions.filter((a) => getBlockingReqs(a.requirements).length > 0);
  const uncertain  = actions.filter((a) => getBlockingReqs(a.requirements).length === 0 && getUncertainReqs(a.requirements).length > 0);
  const included   = actions.filter((a) => getBlockingReqs(a.requirements).length === 0 && getUncertainReqs(a.requirements).length === 0);

  const excludedCount  = excluded.filter((a) => !overrides.has(a.action_id)).length;
  const overriddenCount = overrides.size;
  const includedCount  = included.length + overriddenCount;

  useEffect(() => {
    setStepProgress(locode, "regulations", {
      visited: true,
      progress: 100,
      sub: `${actions.length} actions assessed · ${includedCount} included in ranking`,
    });
  }, [locode, actions.length, includedCount]);

  function toggleOverride(id: string) {
    setOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setEditingNote(null);
      } else {
        next.add(id);
        setEditingNote(id);
      }
      return next;
    });
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <Navbar cityName={city.name} />
      <StepBar activeStep={2} citySlug={citySlug} />

      {/* Page header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 18px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>Cities</button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>{city.name}</button>
            <span>›</span>
            <span style={{ color: "#374151" }}>Regulations & Laws</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "40px" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
                Regulations & Laws
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>
                MEED+ HIAP has checked each candidate action against Chilean municipal law. Actions that fail a
                mandatory or required legal check are excluded from the ranking unless you override them.
              </p>
              <p style={{ fontSize: "13px", color: "#16A34A", fontWeight: "500", margin: 0 }}>
                MEED+ FEASIBILITY: Regulations and laws shapes 50% of feasibility score · Feasibility shapes 23% of ranking
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {(["review", "adjust"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "7px 18px", borderRadius: "6px", border: "none",
                    background: activeTab === tab ? "#001EA7" : "white",
                    color: activeTab === tab ? "white" : "#9CA3AF",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer",
                    outline: activeTab === tab ? "none" : "1px solid #DDDDE1",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 64px 40px" }}>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            {
              value: includedCount,
              label: "Included in ranking",
              sub: `${included.length} passed legal review${overriddenCount > 0 ? ` · ${overriddenCount} manually reinstated` : ""}`,
              bg: "#F0FDF4", valuecol: "#16A34A", border: "#BBF7D0",
            },
            {
              value: excludedCount,
              label: "Excluded from ranking",
              sub: "Failed a mandatory or required legal check",
              bg: excludedCount === 0 ? "#F0FDF4" : "#FEF2F2",
              valuecol: excludedCount === 0 ? "#16A34A" : "#DC2626",
              border: excludedCount === 0 ? "#BBF7D0" : "#FCA5A5",
            },
            {
              value: uncertain.length,
              label: "Flagged — evidence missing",
              sub: "No evidence found for a mandatory check",
              bg: uncertain.length === 0 ? "#F9FAFB" : "#FFFBEB",
              valuecol: uncertain.length === 0 ? "#9CA3AF" : "#D97706",
              border: uncertain.length === 0 ? "#E5E7EB" : "#FDE68A",
            },
          ].map((k) => (
            <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: "10px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: k.valuecol, lineHeight: 1, marginBottom: "4px" }}>{k.value}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>{k.label}</div>
              <div style={{ fontSize: "11px", color: "#6B7280" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── EXCLUDED ACTIONS ── */}
        {excluded.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Excluded actions
              <span style={{ fontSize: "12px", fontWeight: "400", color: "#9CA3AF", marginLeft: "8px" }}>
                These actions failed one or more legal checks and will not appear in the ranking
              </span>
            </div>

            <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              {excluded.map((action, idx) => {
                const meta = ACTION_NAMES[action.action_id];
                const blockingReqs = getBlockingReqs(action.requirements);
                const isOverridden = overrides.has(action.action_id);
                const isLast = idx === excluded.length - 1;
                const isEditingThisNote = editingNote === action.action_id;

                return (
                  <div
                    key={action.action_id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: isLast ? "none" : "1px solid #F5F5F5",
                      background: isOverridden ? "#FFFBEB" : "white",
                      transition: "background 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      {/* Left: action info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: isOverridden ? "#92400E" : "#111827" }}>
                            {meta?.name ?? action.action_id}
                          </span>
                          {isOverridden && (
                            <span style={{ fontSize: "11px", background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", padding: "1px 7px", borderRadius: "4px", fontWeight: "600" }}>
                              Manually reinstated
                            </span>
                          )}
                        </div>
                        {meta?.subcategory && (
                          <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", padding: "1px 6px", borderRadius: "3px", display: "inline-block", marginBottom: "8px" }}>
                            {meta.subcategory}
                          </span>
                        )}

                        {/* Blocking reasons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {blockingReqs.map((req) => (
                            <div key={req.signal_code} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                              <span style={{ fontSize: "12px", color: "#DC2626", flexShrink: 0, marginTop: "1px" }}>✗</span>
                              <span style={{ fontSize: "12px", color: "#6B7280" }}>{blockReason(req)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Override note */}
                        {isOverridden && (
                          <div style={{ marginTop: "10px" }}>
                            {isEditingThisNote ? (
                              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                <textarea
                                  placeholder="Add a note explaining why this action should be included (optional)…"
                                  value={overrideNotes[action.action_id] ?? ""}
                                  onChange={(e) => setOverrideNotes((prev) => ({ ...prev, [action.action_id]: e.target.value }))}
                                  style={{ flex: 1, fontSize: "12px", padding: "8px 10px", borderRadius: "6px", border: "1px solid #FDE68A", resize: "vertical", minHeight: "56px", fontFamily: "inherit", color: "#374151", outline: "none", background: "#FFFDF5" }}
                                />
                                <button
                                  onClick={() => setEditingNote(null)}
                                  style={{ fontSize: "12px", background: "#92400E", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap" }}
                                >
                                  Save note
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{ fontSize: "12px", color: "#92400E", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}
                                onClick={() => setEditingNote(action.action_id)}
                              >
                                {overrideNotes[action.action_id]
                                  ? <span>"{overrideNotes[action.action_id]}" <span style={{ color: "#D97706", textDecoration: "underline" }}>edit</span></span>
                                  : <span style={{ color: "#D97706", textDecoration: "underline" }}>+ Add a note explaining the override</span>
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: override toggle */}
                      {activeTab === "adjust" && (
                        <div style={{ flexShrink: 0 }}>
                          <button
                            onClick={() => toggleOverride(action.action_id)}
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "7px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              border: isOverridden ? "1px solid #FDE68A" : "1px solid #D1D5DB",
                              background: isOverridden ? "#FEF3C7" : "white",
                              color: isOverridden ? "#92400E" : "#6B7280",
                              transition: "all 0.15s",
                            }}
                          >
                            {isOverridden ? "↩ Remove override" : "Include in ranking"}
                          </button>
                        </div>
                      )}

                      {activeTab === "review" && isOverridden && (
                        <span style={{ fontSize: "11px", color: "#D97706", flexShrink: 0, marginTop: "4px" }}>
                          Overridden
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeTab === "review" && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#9CA3AF", textAlign: "right" }}>
                Switch to <strong>Adjust</strong> mode to override individual exclusions
              </div>
            )}
          </div>
        )}

        {/* ── FLAGGED / UNCERTAIN ── */}
        {uncertain.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => setExpandedUncertain((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "8px" }}
            >
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                Flagged actions ({uncertain.length})
              </span>
              <span style={{ fontSize: "12px", color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", padding: "1px 7px", borderRadius: "4px" }}>
                Evidence missing
              </span>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                {expandedUncertain ? "▲ hide" : "▼ show"}
              </span>
            </button>

            {expandedUncertain && (
              <div style={{ background: "white", border: "1px solid #EBEBEB", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                {uncertain.map((action, idx) => {
                  const meta = ACTION_NAMES[action.action_id];
                  const uncReqs = getUncertainReqs(action.requirements);
                  const isLast = idx === uncertain.length - 1;
                  return (
                    <div
                      key={action.action_id}
                      style={{ padding: "14px 20px", borderBottom: isLast ? "none" : "1px solid #F5F5F5" }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>
                        {meta?.name ?? action.action_id}
                      </div>
                      {meta?.subcategory && (
                        <span style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", padding: "1px 6px", borderRadius: "3px", display: "inline-block", marginBottom: "6px" }}>
                          {meta.subcategory}
                        </span>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {uncReqs.map((req) => (
                          <div key={req.signal_code} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "12px", color: "#D97706", flexShrink: 0, marginTop: "1px" }}>?</span>
                            <span style={{ fontSize: "12px", color: "#6B7280" }}>{uncertainReason(req)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INCLUDED (summary only) ── */}
        <div style={{
          background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px",
          padding: "14px 20px", marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "20px", color: "#16A34A" }}>✓</span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>
              {includedCount} {includedCount === 1 ? "action" : "actions"} will proceed to ranking
            </div>
            <div style={{ fontSize: "12px", color: "#4ADE80" }}>
              {included.length} passed legal review automatically
              {overriddenCount > 0 && ` · ${overriddenCount} manually reinstated`}
              {uncertain.length > 0 && ` · ${uncertain.length} flagged actions are included pending further evidence`}
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{
          background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#0369A1",
          display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "14px", flexShrink: 0 }}>ℹ</span>
          <span>
            <strong>How MEED+ HIAP uses this data:</strong> Legal checks are based on Ley 18.695 (Ley Orgánica Constitucional de Municipalidades).
            Actions that fail a <strong>mandatory</strong> or <strong>required</strong> check are excluded from the ranking
            to avoid proposing legally non-viable actions. You can override any exclusion in{" "}
            <strong>Adjust</strong> mode if you believe the action is viable for {city.name}.
          </span>
        </div>

        {/* Footer navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/socioeconomic`)}
            style={{ background: "white", border: "1px solid #DDDDE1", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", color: "#6B7280", cursor: "pointer", fontWeight: "500" }}
          >
            ← Socioeconomic Context
          </button>
          <button
            onClick={() => { confirmStep(locode, "regulations"); navigate(fromPreflight ? `/city/${citySlug}/preflight` : `/city/${citySlug}/strategic`); }}
            style={{ background: "#16A34A", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(22,163,74,0.3)" }}
          >
            {fromPreflight ? "Save & return to pre-flight →" : "Strategic preferences →"}
          </button>
        </div>
      </div>
    </div>
  );
}
