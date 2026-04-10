import { useState, useEffect } from "react";

interface MapEmbedProps {
  cityName: string;
  regionName: string;
  height?: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function buildEmbedUrl(lat: number, lon: number, delta = 0.12): string {
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

export function MapEmbed({ cityName, regionName, height = "220px" }: MapEmbedProps) {
  const cacheKey = `hiap:map2:${cityName}:${regionName}`;

  const [embedUrl, setEmbedUrl] = useState<string | null>(() => {
    try { return sessionStorage.getItem(cacheKey); } catch { return null; }
  });
  const [loading, setLoading] = useState(embedUrl === null);

  useEffect(() => {
    if (embedUrl !== null) return;
    const q = encodeURIComponent(`${cityName} ${regionName} Chile`);
    fetch(`${BASE}/photon-geocode?q=${q}&limit=5&lang=en`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const features: any[] = data.features ?? [];
        const match =
          features.find((f) => f.properties?.country_code === "CL") ??
          features[0];
        if (match) {
          const [lon, lat] = match.geometry.coordinates as [number, number];
          const url = buildEmbedUrl(lat, lon);
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
