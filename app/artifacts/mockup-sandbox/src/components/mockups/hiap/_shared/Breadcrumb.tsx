export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "12px",
        color: "#9CA3AF",
        display: "flex",
        gap: "6px",
        alignItems: "center",
      }}
    >
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span>/</span>}
          <span style={{ color: i === items.length - 1 ? "#6B7280" : "#9CA3AF" }}>
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}
