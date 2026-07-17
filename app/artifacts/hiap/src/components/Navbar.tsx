import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

interface NavbarProps {
  cityName?: string;
}

export function Navbar({ cityName }: NavbarProps) {
  const [, navigate] = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
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
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <div
          style={{
            background: "#16A34A",
            borderRadius: "6px",
            width: "28px",
            height: "28px",
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
        <span style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>
          Aceleradora Local de Mitigación
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
            <span>{lang === "en" ? "🇬🇧" : "🇨🇱"}</span>
            <span style={{ fontWeight: "500" }}>{lang === "en" ? "EN" : "ES"}</span>
            <span style={{ fontSize: "10px" }}>▾</span>
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
                  <span style={{ fontSize: "16px" }}>{l === "en" ? "🇬🇧" : "🇨🇱"}</span>
                  <div>
                    <div>{l === "en" ? "English" : "Español"}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "400" }}>
                      {l === "en" ? "English" : "Castellano"}
                    </div>
                  </div>
                  {lang === l && <span style={{ marginLeft: "auto", color: "#001EA7", fontSize: "14px" }}>✓</span>}
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
  );
}
