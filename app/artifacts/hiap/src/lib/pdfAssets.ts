// Rasterizes public/ logo assets into PNG data URLs for jsPDF, which cannot
// embed SVG. Every loader resolves to null on failure so PDF generation
// degrades to text-only credits instead of throwing.

export interface LogoImage {
  dataUrl: string;
  wPx: number;
  hPx: number;
}

// The site footer shows these logos on navy via CSS tricks (OEF: SVG whitened
// with brightness(0) invert(1); SSG/CORFO: white-on-black PNGs blended with
// mix-blend-mode: screen). Pre-compositing onto the cover navy in a canvas
// reproduces that exact look and avoids black boxes in the PDF.
type CompositeMode = "invert-white" | "screen";

const COVER_NAVY = "rgb(0, 30, 140)";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadLogoDataUrl(
  src: string,
  opts: { targetWidthPx: number; mode: CompositeMode },
): Promise<LogoImage | null> {
  try {
    const img = await loadImage(src);
    const naturalW = img.naturalWidth || opts.targetWidthPx;
    const naturalH = img.naturalHeight || opts.targetWidthPx;
    const wPx = opts.targetWidthPx;
    const hPx = Math.max(1, Math.round((naturalH / naturalW) * wPx));

    const canvas = document.createElement("canvas");
    canvas.width = wPx;
    canvas.height = hPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = COVER_NAVY;
    ctx.fillRect(0, 0, wPx, hPx);
    if (opts.mode === "invert-white") ctx.filter = "brightness(0) invert(1)";
    if (opts.mode === "screen") ctx.globalCompositeOperation = "screen";
    ctx.drawImage(img, 0, 0, wPx, hPx);

    return { dataUrl: canvas.toDataURL("image/png"), wPx, hPx };
  } catch {
    return null;
  }
}

export interface ReportLogos {
  oef: LogoImage | null;
  ssg: LogoImage | null;
  corfo: LogoImage | null;
}

export async function preloadReportLogos(): Promise<ReportLogos> {
  const [oef, ssg, corfo] = await Promise.all([
    loadLogoDataUrl("/oef-logo.svg", { targetWidthPx: 600, mode: "invert-white" }),
    loadLogoDataUrl("/ssg-logomark-white.png", { targetWidthPx: 300, mode: "screen" }),
    loadLogoDataUrl("/corfo-white.png", { targetWidthPx: 480, mode: "screen" }),
  ]);
  return { oef, ssg, corfo };
}
