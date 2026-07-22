import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Languages, ChevronDown, Check, Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const NOTIFY_FORM_URL = "https://forms.gle/DjFiV4jezipPm4gj7";

interface NavbarProps {
  cityName?: string;
}

export function Navbar({ cityName }: NavbarProps) {
  const [, navigate] = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifyOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifyOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [notifyOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
    <nav
      style={{
        background: "#001EA7",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer", minWidth: 0, flexShrink: 1 }}
      >
        <div
          style={{
            background: "#16A34A",
            borderRadius: "6px",
            width: "28px",
            height: "28px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: "700",
            color: "white",
          }}
        >
          ALM
        </div>
        <span style={{ color: "white", fontWeight: "500", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Aceleradora Local de Mitigación
        </span>
        <span style={{
          flexShrink: 0,
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#BFDBFE",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: "999px",
          padding: "1px 7px",
        }}>
          Beta
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", padding: 0, color: "#93C5FD", fontSize: "13px", cursor: "pointer" }}
        >
          {t("Dashboard")}
        </button>
        <button
          onClick={() => navigate("/methodology")}
          style={{ background: "none", border: "none", padding: 0, color: "#93C5FD", fontSize: "13px", cursor: "pointer" }}
        >
          {t("Methodology")}
        </button>
        <button
          onClick={() => navigate("/about")}
          style={{ background: "none", border: "none", padding: 0, color: "#93C5FD", fontSize: "13px", cursor: "pointer" }}
        >
          {t("About")}
        </button>

        {/* Notify — highlighted call-to-action */}
        <button
          onClick={() => setNotifyOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#16A34A",
            border: "none",
            borderRadius: "999px",
            padding: "6px 14px",
            color: "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#15803D")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#16A34A")}
        >
          <Bell size={14} style={{ flexShrink: 0 }} />
          {t("Get notified")}
        </button>

        {/* Language switcher */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              padding: "4px 8px",
              color: "#93C5FD",
              fontSize: "13px",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Languages size={15} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: "500" }}>{lang === "en" ? "EN" : "ES"}</span>
            <ChevronDown size={12} style={{ flexShrink: 0 }} />
          </button>

          {open && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              overflow: "hidden",
              minWidth: "130px",
              zIndex: 100,
            }}>
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "10px 14px",
                    background: lang === l ? "#F0F4FF" : "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: lang === l ? "#001EA7" : "#374151",
                    fontWeight: lang === l ? "600" : "400",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
                  onMouseLeave={(e) => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                >
                  <Languages size={16} color="#6B7280" style={{ flexShrink: 0 }} />
                  <div>
                    <div>{l === "en" ? "English" : "Español"}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "400" }}>
                      {l === "en" ? "English" : "Castellano"}
                    </div>
                  </div>
                  {lang === l && <Check size={14} color="#001EA7" style={{ marginLeft: "auto", flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {cityName && (
          <span
            style={{
              color: "#BFDBFE",
              fontSize: "12px",
              borderLeft: "1px solid #3B5FA0",
              paddingLeft: "16px",
            }}
          >
            {cityName}
          </span>
        )}
      </div>
    </nav>

    {/* Notify modal */}
    {notifyOpen && (
      <div
        onClick={() => setNotifyOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          zIndex: 200,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{
            position: "relative",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            maxWidth: "420px",
            width: "100%",
            padding: "32px 32px 28px",
            textAlign: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setNotifyOpen(false)}
            aria-label={t("Close")}
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: "20px",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ×
          </button>

          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", background: "#DCFCE7", marginBottom: "16px" }}>
            <Bell size={22} color="#16A34A" />
          </div>

          <h2 style={{ fontSize: "19px", fontWeight: "700", color: "#111827", margin: "0 0 10px" }}>
            {t("Stay in the loop")}
          </h2>

          <p style={{ fontSize: "13.5px", color: "#4B5563", lineHeight: "1.6", margin: "0 0 20px" }}>
            {t("We're building the Aceleradora Local de Mitigación alongside the cities that use it. Scan the code — or open the ")}
            <a
              href={NOTIFY_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#001EA7", fontWeight: "600", textDecoration: "underline" }}
            >
              {t("form")}
            </a>
            {t(" — to hear first about new features, city releases and product updates.")}
          </p>

          {/* QR */}
          <a
            href={NOTIFY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "14px", background: "white" }}
          >
            <img
              src="/notify-form-qr.svg"
              alt={t("QR code linking to the updates form")}
              width={168}
              height={168}
              style={{ display: "block", width: "168px", height: "168px" }}
            />
          </a>

          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "12px" }}>
            {t("Scan with your phone camera to open the form")}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
