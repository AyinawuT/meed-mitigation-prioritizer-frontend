import { useState, useEffect, type ReactNode } from "react";
import { setStepProgress, confirmStep } from "@/lib/stepProgress";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { StepBar } from "@/components/StepBar";
import { CITIES, type CityData } from "@/data/cities";
import type { PipelineResult, LegalExcludedAction, RankedAction } from "@/lib/scoringPipeline";
import { PIPELINE_RESULT_SCHEMA_VERSION } from "@/lib/scoringPipeline";
import { runPipelineForCity } from "@/lib/pipelineRunner";
import { useLanguage } from "@/lib/i18n";
import { localizedActionName } from "@/lib/actionDisplay";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";
import { Scale, CircleCheck, CircleX, TriangleAlert } from "lucide-react";

// ─── Sector display helpers ───────────────────────────────────────────────────

const SECTOR_DISPLAY: Record<string, string> = {
  stationary_energy: "Stationary Energy",
  transportation:    "Transportation",
  waste:             "Waste",
  ippu:              "IPPU",
  afolu:             "AFOLU",
  cross_sector:      "Cross-sector",
};

const SECTOR_COLORS: Record<string, { bg: string; color: string }> = {
  stationary_energy: { bg: "#EFF6FF", color: "#1D4ED8" },
  transportation:    { bg: "#F0FDF4", color: "#15803D" },
  waste:             { bg: "#FEF3C7", color: "#92400E" },
  ippu:              { bg: "#FDF4FF", color: "#7E22CE" },
  afolu:             { bg: "#ECFDF5", color: "#065F46" },
  cross_sector:      { bg: "#F5F5F7", color: "#6B7280" },
};

const VERDICT_CHIPS: Record<string, { label: string; bg: string; color: string }> = {
  enabled:     { label: "Enabled",     bg: "#F0FDF4", color: "#16A34A" },
  conditional: { label: "Conditional", bg: "#FFFBEB", color: "#D97706" },
  blocked:     { label: "Blocked",     bg: "#FEF2F2", color: "#DC2626" },
};

function SectorChip({ tag }: { tag: string }) {
  const { t } = useLanguage();
  const s = SECTOR_COLORS[tag] ?? SECTOR_COLORS.cross_sector;
  return (
    <span style={{
      fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
      background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      {t(SECTOR_DISPLAY[tag] ?? tag)}
    </span>
  );
}

function VerdictChip({ category }: { category: string | null }) {
  const { t } = useLanguage();
  if (!category) return null;
  const chip = VERDICT_CHIPS[category];
  if (!chip) return null;
  return (
    <span style={{
      fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
      background: chip.bg, color: chip.color, whiteSpace: "nowrap",
    }}>
      {t(chip.label)}
    </span>
  );
}

function sectorBreakdown(
  actions: { sectorTag: string }[],
  t: (en: string, vars?: Record<string, string>) => string,
): string {
  const counts: Record<string, number> = {};
  for (const a of actions) {
    const tag = a.sectorTag || "cross_sector";
    counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([tag, n]) => `${n} ${t(SECTOR_DISPLAY[tag] ?? tag)}`)
    .join(" · ");
}

// ─── Excluded action card ─────────────────────────────────────────────────────

function ExcludedActionCard({ action }: { action: LegalExcludedAction }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [justOpen, setJustOpen] = useState(false);
  const [refsOpen, setRefsOpen] = useState(false);
  const ld = action.legalData;
  // Field naming: *_es holds Spanish, base ownership/restrictions hold English;
  // for justification the base field is the native Spanish and *_en is the
  // English translation. Prefer the variant matching the active language.
  const isEs = lang === "es";
  const ownershipDesc = isEs
    ? (ld.ownership_description_es || ld.ownership_description)
    : (ld.ownership_description || ld.ownership_description_es);
  const restrictionsDesc = isEs
    ? (ld.restrictions_description_es || ld.restrictions_description)
    : (ld.restrictions_description || ld.restrictions_description_es);
  const justification = isEs
    ? (ld.legal_justification || ld.legal_justification_en)
    : (ld.legal_justification_en || ld.legal_justification);
  const hasDetail = ld.ownership_category || ld.restrictions_category || justification || ld.legal_references.length > 0;

  return (
    <div style={{
      background: "white", border: "1px solid #FECACA", borderRadius: "10px",
      overflow: "hidden",
    }}>
      {/* Always-visible header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", flex: 1, minWidth: "120px" }}>
          {localizedActionName(action, lang)}
        </span>
        <SectorChip tag={action.sectorTag} />
        <span style={{
          fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
          background: "#FEF2F2", color: "#DC2626", whiteSpace: "nowrap",
        }}>
          {t("Excluded")}
        </span>
        {hasDetail && (
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              background: "none", border: "1px solid #FECACA", borderRadius: "6px",
              cursor: "pointer", padding: "3px 8px",
              fontSize: "11px", fontWeight: "600", color: "#9CA3AF",
              display: "flex", alignItems: "center", gap: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {open ? t("Hide details ▲") : t("Why excluded? ▼")}
          </button>
        )}
      </div>

      {/* Collapsible detail panel */}
      {open && (
        <div style={{ borderTop: "1px solid #FEE2E2", padding: "12px 16px", background: "#FFFBFB" }}>

          {/* Ownership */}
          {ld.ownership_category && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: ownershipDesc ? "4px" : 0 }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", width: "84px", flexShrink: 0 }}>{t("Ownership")}</span>
                <VerdictChip category={ld.ownership_category} />
              </div>
              {ownershipDesc && (
                <p style={{ fontSize: "12px", color: "#4B5563", margin: "4px 0 0 92px", lineHeight: "1.5" }}>
                  {ownershipDesc}
                </p>
              )}
            </div>
          )}

          {/* Restrictions */}
          {ld.restrictions_category && (
            <div style={{ marginBottom: justification || ld.legal_references.length > 0 ? "10px" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: restrictionsDesc ? "4px" : 0 }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", width: "84px", flexShrink: 0 }}>{t("Restrictions")}</span>
                <VerdictChip category={ld.restrictions_category} />
              </div>
              {restrictionsDesc && (
                <p style={{ fontSize: "12px", color: "#4B5563", margin: "4px 0 0 92px", lineHeight: "1.5" }}>
                  {restrictionsDesc}
                </p>
              )}
            </div>
          )}

          {/* Legal justification — nested collapsible */}
          {justification && (
            <div style={{ borderTop: "1px solid #FEE2E2", paddingTop: "8px", marginTop: "4px" }}>
              <button
                onClick={() => setJustOpen(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontSize: "11px", fontWeight: "600", color: "#9CA3AF",
                  display: "flex", alignItems: "center", gap: "4px",
                }}
              >
                <span style={{ fontSize: "9px" }}>{justOpen ? "▲" : "▼"}</span>
                {t("Legal justification")}
              </button>
              {justOpen && (
                <p style={{ fontSize: "12px", color: "#4B5563", marginTop: "8px", marginBottom: 0, lineHeight: "1.6" }}>
                  {justification}
                </p>
              )}
            </div>
          )}

          {/* Legal references — collapsible */}
          {ld.legal_references.length > 0 && (
            <div style={{ borderTop: "1px solid #FEE2E2", paddingTop: "8px", marginTop: "4px" }}>
              <button
                onClick={() => setRefsOpen(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontSize: "11px", fontWeight: "600", color: "#9CA3AF",
                  display: "flex", alignItems: "center", gap: "4px",
                }}
              >
                <span style={{ fontSize: "9px" }}>{refsOpen ? "▲" : "▼"}</span>
                {t("Legal references")}
              </button>
              {refsOpen && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                  {ld.legal_references.map((ref, i) => (
                    <span key={i} style={{
                      fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                      background: "#F3F4F6", color: "#374151", fontFamily: "monospace",
                    }}>
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Flagged action card ──────────────────────────────────────────────────────

function FlaggedActionCard({ action }: { action: LegalExcludedAction }) {
  const { t, lang } = useLanguage();
  return (
    <div style={{
      background: "white", border: "1px solid #FDE68A", borderRadius: "10px",
      padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", flex: 1, minWidth: "120px" }}>
          {localizedActionName(action, lang)}
        </span>
        <SectorChip tag={action.sectorTag} />
        <span style={{
          fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px",
          background: "#FFFBEB", color: "#92400E", whiteSpace: "nowrap",
        }}>
          {t("Assessment pending")}
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>
        {t("No legal assessment is available for this action yet. It has been included in the ranking with a neutral legal score.")}
      </p>
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  count, label, sublabel, sectorLine, bg, border, countColor, icon,
}: {
  count: number; label: string; sublabel?: string; sectorLine?: string;
  bg: string; border: string; countColor: string; icon: ReactNode;
}) {
  return (
    <div style={{
      flex: 1, minWidth: "170px", background: bg, border: `1px solid ${border}`,
      borderRadius: "12px", padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "2px" }}>
        <span style={{ fontSize: "30px", fontWeight: "800", color: countColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {count}
        </span>
        <span style={{ fontSize: "14px" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "3px" }}>{label}</div>
      {sublabel && <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.4" }}>{sublabel}</div>}
      {sectorLine && (
        <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", lineHeight: "1.4" }}>{sectorLine}</div>
      )}
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

interface Props { params: { locode: string } }

export function RegulationsLaws({ params }: Props) {
  const { t, lang } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const urlLocode = params.locode ?? "";
  const locode = urlLocode.replace("-", " ");
  const city = CITIES.find(c => c.locode.toLowerCase() === locode.toLowerCase()) as CityData | undefined;
  const citySlug = city ? city.locode.replace(" ", "-") : urlLocode;
  const cityName = city?.name ?? locode;
  const fromPreflight = search.includes("from=preflight");
  const fromRecommendations = search.includes("from=recommendations");

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);

  useEffect(() => {
    setStepProgress(locode, "regulations", { visited: true });


    // Load any previously cached result — discard if schema is stale
    try {
      const raw = localStorage.getItem(`hiap:${locode}:results`);
      if (raw) {
        const parsed = JSON.parse(raw) as PipelineResult;
        if ((parsed.schemaVersion ?? 0) >= PIPELINE_RESULT_SCHEMA_VERSION) {
          setResult(parsed);
          return; // fresh data — skip the live fetch
        }
        // Stale schema — clear and fall through to re-fetch
        localStorage.removeItem(`hiap:${locode}:results`);
      }
    } catch {}

    // No cached result — run the pipeline now so the user sees legal data at step 3.
    // Strategic preferences default gracefully when not yet filled in (steps 4–6).
    setLegalLoading(true);
    setLegalError(null);
    runPipelineForCity(locode, { topN: 20, createExplanations: false, language: lang })
      .then((r) => setResult(r))
      .catch((err) => setLegalError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLegalLoading(false));
  }, [locode, search]);

  // When results load, mark step progress at 100% so the city profile card
  // shows "NEEDS REVIEW" (and "COMPLETE" once the user clicks Continue →)
  useEffect(() => {
    if (!result) return;
    const excl = result.legalExcluded?.length ?? 0;
    const incl = result.validActionsCount ?? result.ranked?.length ?? 0;
    const sub = excl > 0
      ? `${excl} excluded · ${incl} included`
      : `${incl} actions included`;
    setStepProgress(locode, "regulations", { visited: true, progress: 100, sub });
  }, [locode, result]);

  // Derived stats — handle both new and old stored results gracefully
  const ranked: RankedAction[] = result?.ranked ?? [];
  const legalExcluded: LegalExcludedAction[] = result?.legalExcluded ?? [];
  const legalFlagged: LegalExcludedAction[] = result?.legalFlagged ?? [];

  const conditionalCount = ranked.filter(a => a.legalData?.verdict_category === "conditional").length;
  const validActionsCount = result?.validActionsCount;
  const includedCount = validActionsCount ?? ranked.length;

  // Unique sectors present in excluded + flagged lists
  const allSectors = [...new Set([
    ...legalExcluded.map(a => a.sectorTag || "cross_sector"),
    ...legalFlagged.map(a => a.sectorTag || "cross_sector"),
  ])];

  const filteredExcluded = sectorFilter === "all"
    ? legalExcluded
    : legalExcluded.filter(a => (a.sectorTag || "cross_sector") === sectorFilter);
  const filteredFlagged = sectorFilter === "all"
    ? legalFlagged
    : legalFlagged.filter(a => (a.sectorTag || "cross_sector") === sectorFilter);

  const rankedSectorItems = ranked.map(a => ({
    sectorTag: (a as RankedAction & { sectorTag?: string }).sectorTag || "cross_sector",
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column" }}>
      <Navbar cityName={cityName} />
      <StepBar activeStep={2} citySlug={citySlug} />

      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB", padding: "16px 64px 20px" }}>
        <div style={{ maxWidth: "840px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {t("Cities")}
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/city/${citySlug}`)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D1D5DB" }}>
              {cityName}
            </button>
            <span>›</span>
            <span style={{ color: "#374151" }}>{t("Regulations & Laws")}</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
            {t("Regulations & Laws")}
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 10px", lineHeight: "1.6" }}>
            {t("Aceleradora Local de Mitigación has checked each candidate action against Chilean laws. Actions where the city lacks the legal authority to implement them independently are excluded from the ranking before scoring begins.")}
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: "6px", padding: "5px 12px",
              fontSize: "11px", color: "#15803D", fontWeight: "600",
            }}>
              <Scale size={14} color="#15803D" style={{ flexShrink: 0 }} />
              <span>{t("ALM FEASIBILITY: Legal verdict shapes 34% of feasibility score · Feasibility shapes 23% of ranking")}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "840px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>


        {/* Summary cards */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
          <SummaryCard
            count={includedCount}
            label={t("passed legal review")}
            sublabel={
              !result
                ? t("Run the pipeline to see legal review")
                : t("top {n} shown in your ranking", { n: String(result?.topN ?? 20) })
            }
            sectorLine={ranked.length > 0 ? sectorBreakdown(rankedSectorItems, t) : undefined}
            bg="#F0FDF4" border="#BBF7D0" countColor="#16A34A" icon={<CircleCheck size={14} color="#16A34A" style={{ flexShrink: 0 }} />}
          />
          <SummaryCard
            count={legalExcluded.length}
            label={t("Excluded from ranking")}
            sublabel={t("Removed before scoring")}
            sectorLine={legalExcluded.length > 0 ? sectorBreakdown(legalExcluded, t) : undefined}
            bg="#FEF2F2" border="#FECACA" countColor="#DC2626" icon={<CircleX size={14} color="#DC2626" style={{ flexShrink: 0 }} />}
          />
          <SummaryCard
            count={legalFlagged.length}
            label={t("Flagged — evidence missing")}
            sublabel={t("Included in ranking, assessment pending")}
            sectorLine={legalFlagged.length > 0 ? sectorBreakdown(legalFlagged, t) : undefined}
            bg="#FFFBEB" border="#FDE68A" countColor="#D97706" icon={<TriangleAlert size={14} color="#D97706" style={{ flexShrink: 0 }} />}
          />
        </div>

        {/* Legal review loading */}
        {!result && legalLoading && (
          <div style={{
            background: "white", border: "1px solid #E5E7EB", borderRadius: "12px",
            padding: "40px 28px", textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: "3px solid #E5E7EB", borderTopColor: "#001EA7",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              {t("Running legal review…")}
            </div>
            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
              {t("Checking all candidate actions against Chilean laws")}
            </div>
          </div>
        )}

        {/* Legal review error */}
        {!result && !legalLoading && legalError && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px",
            padding: "28px 24px", textAlign: "center",
          }}>
            <div style={{ marginBottom: "10px" }}><TriangleAlert size={28} color="#DC2626" style={{ flexShrink: 0 }} /></div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#991B1B", marginBottom: "6px" }}>
              {t("Could not load legal review")}
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "16px", lineHeight: "1.5", maxWidth: "380px", margin: "0 auto 16px" }}>
              {legalError}
            </div>
            <button
              onClick={() => {
                setLegalLoading(true);
                setLegalError(null);
                runPipelineForCity(locode, { topN: 20, createExplanations: false, language: lang })
                  .then((r) => setResult(r))
                  .catch((err) => setLegalError(err instanceof Error ? err.message : String(err)))
                  .finally(() => setLegalLoading(false));
              }}
              style={{ padding: "8px 20px", background: "#001EA7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              {t("Retry")}
            </button>
          </div>
        )}

        {/* Pipeline ran but all actions passed */}
        {result && legalExcluded.length === 0 && legalFlagged.length === 0 && (
          <div style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px",
            padding: "28px 24px", textAlign: "center",
          }}>
            <div style={{ marginBottom: "10px" }}><CircleCheck size={28} color="#15803D" style={{ flexShrink: 0 }} /></div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#15803D", marginBottom: "6px" }}>
              {t("All actions passed the legal review")}
            </div>
            <div style={{ fontSize: "12px", color: "#4B5563" }}>
              {t("No actions were excluded or flagged based on legal authority requirements.")}
            </div>
          </div>
        )}

        {/* Sector filter */}
        {result && allSectors.length > 1 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
            {["all", ...allSectors].map(s => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", transition: "all 0.15s",
                  background: sectorFilter === s ? "#001EA7" : "white",
                  color: sectorFilter === s ? "white" : "#374151",
                  border: sectorFilter === s ? "1px solid #001EA7" : "1px solid #D1D5DB",
                }}
              >
                {s === "all" ? t("All sectors") : t(SECTOR_DISPLAY[s] ?? s)}
              </button>
            ))}
          </div>
        )}

        {/* Excluded section */}
        {result && filteredExcluded.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ marginBottom: "12px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
                {t("Excluded from ranking ({n})", { n: String(filteredExcluded.length) })}
                <InfoTip text={DEFS.verdictBlocked} />
              </h2>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>
                {t("These actions were removed before scoring. The city does not currently have the legal authority to implement them independently.")}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredExcluded.map(a => (
                <ExcludedActionCard key={a.actionId} action={a} />
              ))}
            </div>
          </div>
        )}

        {/* Flagged section */}
        {result && filteredFlagged.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ marginBottom: "12px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
                {t("Flagged — evidence missing ({n})", { n: String(filteredFlagged.length) })}
                <InfoTip text={DEFS.verdictConditional} />
              </h2>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>
                {t("No legal assessment was found for these actions. They are included in the ranking with a neutral legal score.")}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredFlagged.map(a => (
                <FlaggedActionCard key={a.actionId} action={a} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state when sector filter returns nothing */}
        {result && sectorFilter !== "all" && filteredExcluded.length === 0 && filteredFlagged.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px", color: "#9CA3AF", fontSize: "13px" }}>
            {t("No excluded or flagged actions in {sector}.", { sector: t(SECTOR_DISPLAY[sectorFilter] ?? sectorFilter) })}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #E5E7EB",
        }}>
          <button
            onClick={() => navigate(`/city/${citySlug}/socioeconomic`)}
            style={{
              background: "white", color: "#374151", border: "1px solid #D1D5DB",
              borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← {t("Socioeconomic Context")}
          </button>
          <button
            onClick={() => {
              confirmStep(locode, "regulations");
              if (fromRecommendations) navigate(`/city/${citySlug}/recommendations?tab=context`);
              else if (fromPreflight) navigate(`/city/${citySlug}/preflight`);
              else navigate(`/city/${citySlug}/strategic`);
            }}
            style={{
              background: "#16A34A", color: "white", border: "none",
              borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer", boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
            }}
          >
            {fromRecommendations ? t("Save & return to context breakdown →") : fromPreflight ? t("Save & return to pre-flight →") : t("Strategic preferences →")}
          </button>
        </div>
      </div>
    </div>
  );
}
