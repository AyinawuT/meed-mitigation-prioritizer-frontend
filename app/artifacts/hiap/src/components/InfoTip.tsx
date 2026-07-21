import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Shared info tooltip for explaining terminology (timelines, cost levels,
// verdicts, confidence…). Extracted from the hand-rolled InfoTooltip in
// FinancialFeasibility: a fixed-position hover box, so it escapes table
// overflow. Pass raw English strings — translation happens here via t().
export function InfoTip({ term, text, size = 12 }: { term?: string; text: string; size?: number }) {
  const { t } = useLanguage();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  }
  function hide() { setPos(null); }

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", marginLeft: "4px", cursor: "default" }}
    >
      <Info size={size} color="#9CA3AF" style={{ flexShrink: 0 }} />
      {pos && (
        <span style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          transform: "translate(-50%, -100%)",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "10px 12px",
          width: "260px",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          fontSize: "12px",
          color: "#374151",
          lineHeight: "1.6",
          fontWeight: "400",
          pointerEvents: "none",
        }}>
          {term && (
            <span style={{ display: "block", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>
              {t(term)}
            </span>
          )}
          {t(text)}
        </span>
      )}
    </span>
  );
}
