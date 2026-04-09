import { useLocation } from "wouter";

interface NavbarProps {
  cityName?: string;
}

export function Navbar({ cityName }: NavbarProps) {
  const [, navigate] = useLocation();
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
            fontSize: "11px",
            fontWeight: "700",
            color: "white",
          }}
        >
          M+
        </div>
        <span style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>
          MEED+
        </span>
        <span style={{ color: "#93C5FD", fontSize: "12px", marginLeft: "4px" }}>
          · HIAP
        </span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <a href="#" style={{ color: "#93C5FD", fontSize: "13px", textDecoration: "none" }}>
          Explore
        </a>
        <button
          onClick={() => navigate("/methodology")}
          style={{ background: "none", border: "none", padding: 0, color: "#93C5FD", fontSize: "13px", textDecoration: "none", cursor: "pointer" }}
        >
          Methodology
        </button>
        <button
          onClick={() => navigate("/about")}
          style={{ background: "none", border: "none", padding: 0, color: "#93C5FD", fontSize: "13px", textDecoration: "none", cursor: "pointer" }}
        >
          About
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#93C5FD", fontSize: "13px" }}>
          <span>🇨🇱</span>
          <span>EN ▾</span>
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
