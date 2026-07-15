export function Footer() {
  return (
    <div style={{ background: "#001EA7", padding: "24px 64px" }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "32px",
      }}>

        {/* LEFT ZONE — product identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              background: "#16A34A", borderRadius: "5px", width: "24px", height: "24px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: "700", color: "white",
            }}>M+</div>
            <span style={{ color: "#93C5FD", fontSize: "13px" }}>MEED+ · HIAP</span>
          </div>
          <span style={{ color: "#3B5FA0", fontSize: "12px" }}>
            High Impact Action Prioritizer — Climate Solutions for Chilean Cities
          </span>
        </div>

        {/* MIDDLE ZONE — builders (prominent) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          {/* Logo row — fixed 64px height so caption aligns with right zone */}
          <div style={{ height: "64px", display: "flex", alignItems: "center", gap: "24px" }}>
            {/* OEF logo — white via CSS filter, same height as SSG */}
            <img
              src="/oef-logo.svg"
              alt="Open Earth Foundation"
              style={{ height: "64px", filter: "brightness(0) invert(1)", flexShrink: 0 }}
            />
            {/* Visual separator */}
            <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
            {/* SSG logomark — minimum 64px height, 16px clearspace (25% of 64px) via padding */}
            <img
              src="/ssg-logomark-white.png"
              alt="Sustainability Solutions Group"
              style={{
                height: "64px",
                mixBlendMode: "screen",
                flexShrink: 0,
                padding: "0 4px",
              }}
            />
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", textAlign: "center", lineHeight: "1.5" }}>
            Built by Open Earth Foundation and Sustainability Solutions Group
          </div>
        </div>

        {/* RIGHT ZONE — funder (secondary) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {/* Logo container — same 64px height as middle zone so captions align */}
          {/* CORFO stays at 48px (visually smaller than SSG per brand guidelines) */}
          <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src="/corfo-white.png"
              alt="Proyecto apoyado por CORFO"
              style={{
                height: "48px",
                mixBlendMode: "screen",
                flexShrink: 0,
              }}
            />
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", textAlign: "center", maxWidth: "190px", lineHeight: "1.5" }}>
            Funded by the{" "}
            <a
              href="https://www.chileatiende.gob.cl/fichas/65100-crea-y-valida"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px", opacity: 0.8 }}
            >
              Crea y Valida
            </a>{" "}
            programme, Comité InnovaChile de Corfo
          </div>
        </div>

      </div>
    </div>
  );
}
