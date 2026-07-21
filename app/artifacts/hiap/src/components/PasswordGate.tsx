import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Soft, client-side privacy gate for the shared preview link — a first
// privacy layer, NOT real security (the check runs in the browser and the
// value ships in the bundle). Set VITE_ACCESS_PASSWORD at build time to
// override; otherwise the fallback below gates the deployed link out of the
// box. Rotate the demo password by editing ACCESS_PASSWORD_FALLBACK here.
const ACCESS_PASSWORD_FALLBACK = "meed-2026";
const EXPECTED =
  (import.meta.env.VITE_ACCESS_PASSWORD as string | undefined) || ACCESS_PASSWORD_FALLBACK;
const SESSION_KEY = "alm:access";

export function PasswordGate({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const enabled = EXPECTED.length > 0;

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (!enabled) return true;
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === EXPECTED) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <div style={{
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #001EA7 0%, #0A2FC4 55%, #001456 100%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
        padding: "36px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px", margin: "0 auto 18px",
          background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Lock size={24} color="#001EA7" />
        </div>

        <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
          {t("Private access")}
        </div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "6px", lineHeight: "1.3" }}>
          Aceleradora Local de Mitigación
        </div>
        <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.5", margin: "0 0 22px" }}>
          {t("This tool is private. Enter the access password to continue.")}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder={t("Access password")}
            aria-label={t("Access password")}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${error ? "#DC2626" : "#E5E7EB"}`,
              borderRadius: "10px",
              padding: "13px 14px",
              fontSize: "14px",
              outline: "none",
              color: "#111827",
              marginBottom: "10px",
            }}
          />
          {error && (
            <div style={{ fontSize: "12px", color: "#DC2626", textAlign: "left", marginBottom: "10px" }}>
              {t("Incorrect password. Please try again.")}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              background: "#001EA7",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "13px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,30,167,0.25)",
            }}
          >
            {t("Enter")}
          </button>
        </form>
      </div>
    </div>
  );
}
