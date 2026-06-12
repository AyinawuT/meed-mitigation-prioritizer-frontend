import { useState, useEffect } from "react";

interface MapEmbedProps {
  cityName: string;
  regionName: string;
  height?: string;
}

function buildEmbedUrl(lat: number, lon: number, delta = 0.12): string {
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

export function MapEmbed({ cityName, regionName, height = "220px" }: MapEmbedProps) {
  const cacheKey = `hiap:map3:${cityName}:${regionName}`;

  const [embedUrl, setEmbedUrl] = useState<string | null>(() => {
    try { return sessionStorage.getItem(cacheKey); } catch { return null; }
  });
  const [loading, setLoading] = useState(embedUrl === null);

  useEffect(() => {
    if (embedUrl !== null) return;
    const name = encodeURIComponent(cityName);
    const region = encodeURIComponent(regionName);
    fetch(`/api/geocode?name=${name}&region=${region}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { lat: number; lon: number }) => {
        if (data.lat && data.lon) {
          const url = buildEmbedUrl(data.lat, data.lon);
          try { sessionStorage.setItem(cacheKey, url); } catch {}
          setEmbedUrl(url);
        } else {
          try { sessionStorage.setItem(cacheKey, ""); } catch {}
          setEmbedUrl("");
        }
      })
      .catch(() => {
        setEmbedUrl("");
      })
      .finally(() => setLoading(false));
  }, [cityName, regionName]);

  const base: React.CSSProperties = {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #EBEBEB",
    height,
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  };

  if (loading) {
    return (
      <div style={{ ...base, background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading map…</span>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div style={{ ...base, background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Map not available</span>
      </div>
    );
  }

  return (
    <div style={{ ...base }}>
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
