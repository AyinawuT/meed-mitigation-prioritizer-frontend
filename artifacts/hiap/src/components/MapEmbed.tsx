import { useState, useEffect } from "react";

interface MapEmbedProps {
  cityName: string;
  regionName: string;
  height?: string;
}

export function MapEmbed({ cityName, regionName, height = "220px" }: MapEmbedProps) {
  const cacheKey = `hiap:map:${cityName}:${regionName}`;

  const [embedUrl, setEmbedUrl] = useState<string | null>(() => {
    try { return sessionStorage.getItem(cacheKey); } catch { return null; }
  });
  const [loading, setLoading] = useState(!embedUrl);

  useEffect(() => {
    if (embedUrl) return;
    const query = `${cityName}, ${regionName}, Chile`;
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "es" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const delta = 0.12;
          const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
          const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
          try { sessionStorage.setItem(cacheKey, url); } catch {}
          setEmbedUrl(url);
        } else {
          setEmbedUrl("");
        }
        setLoading(false);
      })
      .catch(() => { setEmbedUrl(""); setLoading(false); });
  }, [cityName, regionName]);

  const shell: React.CSSProperties = {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #EBEBEB",
    height,
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    background: "#F5F5F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (loading) {
    return (
      <div style={shell}>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading map…</span>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div style={shell}>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Map not available</span>
      </div>
    );
  }

  return (
    <div style={{ ...shell, background: "transparent" }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: "none", display: "block" }}
        title={`Map of ${cityName}`}
      />
    </div>
  );
}
