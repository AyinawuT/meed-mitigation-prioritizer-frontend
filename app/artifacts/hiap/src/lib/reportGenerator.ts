import jsPDF from "jspdf";
import { type ReportChapter, resolveI18nText } from "@/lib/reportApi";
import { preloadReportLogos, type LogoImage } from "@/lib/pdfAssets";

// ─── Page constants (A4 in mm) ────────────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 22;
const MARGIN_TOP = 24;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const FOOTER_Y = PAGE_H - 10;
const SAFE_BOTTOM = PAGE_H - 18;

// ─── Colours ──────────────────────────────────────────────────────────────────

const NAVY = [0, 30, 140] as const;
const DARK = [25, 25, 25] as const;
const MID  = [60, 60, 60] as const;
const SOFT = [110, 110, 110] as const;
const RULE = [210, 215, 225] as const;

// ─── Markdown block types ─────────────────────────────────────────────────────

type Align = "left" | "right" | "center";

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string; depth: number }
  | { type: "table"; headers: string[]; aligns: Align[]; rows: string[][] };

/** Strip inline markdown markers (**bold**, *italic*, `code`, [link](url)). */
function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/, "");
}

// ─── Markdown table helpers (GFM pipe tables) ─────────────────────────────────

/** Split a table row `| a | b |` into trimmed cell strings. */
function splitTableCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

/** True if a line is a table separator, e.g. `|---|:--:|---:|`. */
function isTableSeparator(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|") || !t.includes("-")) return false;
  const cells = splitTableCells(t);
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c.replace(/\s+/g, "")));
}

/** Read column alignments from a separator line. */
function parseAligns(sep: string, count: number): Align[] {
  const cells = splitTableCells(sep).map((c) => c.replace(/\s+/g, ""));
  const aligns: Align[] = [];
  for (let c = 0; c < count; c++) {
    const spec = cells[c] ?? "";
    const l = spec.startsWith(":");
    const r = spec.endsWith(":");
    aligns.push(l && r ? "center" : r ? "right" : "left");
  }
  return aligns;
}

/** Parse a chapter's markdown string into renderable blocks. */
function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) { i++; continue; }

    // Headings
    const h1m = trimmed.match(/^#\s+(.*)/);
    if (h1m) { blocks.push({ type: "h1", text: h1m[1] }); i++; continue; }

    const h2m = trimmed.match(/^##\s+(.*)/);
    if (h2m) { blocks.push({ type: "h2", text: h2m[1] }); i++; continue; }

    const h3m = trimmed.match(/^###\s+(.*)/);
    if (h3m) { blocks.push({ type: "h3", text: h3m[1] }); i++; continue; }

    // Bullets (-, *, or numbered)
    const bulletMatch = raw.match(/^(\s*)[-*]\s+(.*)/);
    if (bulletMatch) {
      const depth = Math.floor(bulletMatch[1].length / 2);
      blocks.push({ type: "bullet", text: bulletMatch[2], depth });
      i++;
      continue;
    }
    const numMatch = raw.match(/^(\s*)\d+\.\s+(.*)/);
    if (numMatch) {
      const depth = Math.floor(numMatch[1].length / 2);
      blocks.push({ type: "bullet", text: numMatch[2], depth });
      i++;
      continue;
    }

    // Tables — a `|`-row followed by a `|---|` separator line
    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableCells(trimmed).map(stripInline);
      const aligns = parseAligns(lines[i + 1], headers.length);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && !isTableSeparator(lines[i])) {
        const cells = splitTableCells(lines[i]).map(stripInline);
        rows.push(Array.from({ length: headers.length }, (_, c) => cells[c] ?? ""));
        i++;
      }
      blocks.push({ type: "table", headers, aligns, rows });
      continue;
    }

    // Paragraph — accumulate until blank line or block-level marker
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().match(/^#{1,3}\s/) &&
      !lines[i].trim().match(/^[-*]\s/) &&
      !lines[i].trim().match(/^\d+\.\s/) &&
      !(lines[i].trim().startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ─── Footer / header helpers ──────────────────────────────────────────────────

// Localized footer prefix for the current report. Set at the start of
// generateAndDownloadPdf (which knows the language); read by addPageFrame,
// itself invoked deep inside ensureSpace. A module-level value avoids threading
// the prefix through every ensureSpace/renderTable call — safe because PDF
// generation runs once at a time in the browser.
let footerPrefix = "City Action Output · ";

function addPageFrame(pdf: jsPDF, actionName: string): void {
  const n = pdf.getNumberOfPages();

  // Thin top bar
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, PAGE_W, 6, "F");

  // Footer rule
  pdf.setDrawColor(...RULE);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, FOOTER_Y - 4, PAGE_W - MARGIN_X, FOOTER_Y - 4);

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...SOFT);

  // Build footer label and truncate with ellipsis so it never overflows
  const maxFooterW = CONTENT_W * 0.78;
  const prefix = footerPrefix;
  let label = prefix + stripInline(actionName);
  while (label.length > prefix.length && pdf.getTextWidth(label) > maxFooterW) {
    label = label.slice(0, -1);
  }
  if (label.length < prefix.length + stripInline(actionName).length) {
    label = label.trimEnd() + "…";
  }

  pdf.text(label, MARGIN_X, FOOTER_Y);
  pdf.text(`${n}`, PAGE_W - MARGIN_X, FOOTER_Y, { align: "right" });
}

/**
 * Ensure there is room for `needed` mm.  If not, add a new page and reset y.
 */
function ensureSpace(
  pdf: jsPDF,
  y: number,
  needed: number,
  actionName: string,
): number {
  if (y + needed > SAFE_BOTTOM) {
    addPageFrame(pdf, actionName);
    pdf.addPage();
    return MARGIN_TOP;
  }
  return y;
}

// ─── Table renderer ───────────────────────────────────────────────────────────

/** Render a parsed markdown table as a bordered grid; returns the new y. */
function renderTable(
  pdf: jsPDF,
  block: { headers: string[]; aligns: Align[]; rows: string[][] },
  yStart: number,
  actionName: string,
): number {
  let y = yStart;
  const cols = block.headers.length;
  if (cols === 0) return y;

  const FS = 8.5;      // cell font size
  const LH = 3.6;      // line height (mm)
  const PADX = 2;      // horizontal cell padding
  const PADY = 1.8;    // vertical cell padding

  // Column widths ∝ longest cell content, clamped, then normalised to CONTENT_W.
  const weights = block.headers.map((h, c) => {
    let maxLen = h.length;
    for (const r of block.rows) maxLen = Math.max(maxLen, (r[c] ?? "").length);
    return Math.max(6, Math.min(maxLen, 60));
  });
  const wsum = weights.reduce((a, b) => a + b, 0);
  let widths = weights.map((w) => Math.max(14, (CONTENT_W * w) / wsum));
  const wtot = widths.reduce((a, b) => a + b, 0);
  widths = widths.map((w) => (w * CONTENT_W) / wtot);

  const measure = (cells: string[]) => {
    pdf.setFontSize(FS);
    const lines = cells.map((txt, c) => pdf.splitTextToSize(txt || "", widths[c] - 2 * PADX) as string[]);
    const maxLines = lines.reduce((m, l) => Math.max(m, l.length), 1);
    return { lines, h: maxLines * LH + 2 * PADY };
  };

  const drawRow = (cells: string[], header: boolean) => {
    pdf.setFont("helvetica", header ? "bold" : "normal");
    const { lines, h } = measure(cells);
    if (header) {
      pdf.setFillColor(240, 243, 252);
      pdf.rect(MARGIN_X, y, CONTENT_W, h, "F");
    }
    const tc = header ? NAVY : MID;
    pdf.setTextColor(tc[0], tc[1], tc[2]);
    let x = MARGIN_X;
    for (let c = 0; c < cols; c++) {
      const align = block.aligns[c] ?? "left";
      const cellLines = lines[c] ?? [""];
      for (let li = 0; li < cellLines.length; li++) {
        const baseY = y + PADY + (li + 1) * LH - 0.9;
        if (align === "right") {
          pdf.text(cellLines[li], x + widths[c] - PADX, baseY, { align: "right" });
        } else if (align === "center") {
          pdf.text(cellLines[li], x + widths[c] / 2, baseY, { align: "center" });
        } else {
          pdf.text(cellLines[li], x + PADX, baseY);
        }
      }
      x += widths[c];
    }
    // Grid: column separators + bottom border.
    pdf.setDrawColor(...RULE);
    pdf.setLineWidth(0.2);
    let vx = MARGIN_X;
    for (let c = 0; c <= cols; c++) { pdf.line(vx, y, vx, y + h); if (c < cols) vx += widths[c]; }
    pdf.line(MARGIN_X, y + h, MARGIN_X + CONTENT_W, y + h);
    y += h;
  };

  // Keep the header with at least its first row.
  y = ensureSpace(pdf, y, measure(block.headers).h + 8, actionName);
  pdf.setDrawColor(...RULE);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y); // top border
  drawRow(block.headers, true);

  for (const r of block.rows) {
    const h = measure(r).h;
    if (y + h > SAFE_BOTTOM) {
      addPageFrame(pdf, actionName);
      pdf.addPage();
      y = MARGIN_TOP;
      pdf.setDrawColor(...RULE);
      pdf.setLineWidth(0.2);
      pdf.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
      drawRow(block.headers, true); // repeat header on the new page
    }
    drawRow(r, false);
  }
  return y + 3;
}

// ─── PDF filename helpers ─────────────────────────────────────────────────────

function buildFilename(cityName: string, actionName: string): string {
  const norm = (s: string) =>
    s.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  return `${norm(cityName)}-${norm(actionName).toLowerCase().slice(0, 50)}-output-plan.pdf`;
}

// ─── PDF chrome strings (report body arrives already in the chosen language) ──

const CHROME = {
  en: {
    docType: "CLIMATE ACTION REPORT",
    title: "City Action Output",
    action: "ACTION",
    builtBy: "BUILT BY",
    fundedBy: "FUNDED BY",
    builtCredit: "Built by Open Earth Foundation and Sustainability Solutions Group",
    fundedCredit: "Funded by the Crea y Valida programme, Comité InnovaChile de Corfo",
    generated: "Generated",
    dateLocale: "en-GB",
  },
  es: {
    docType: "INFORME DE ACCIÓN CLIMÁTICA",
    title: "Informe de Acción de la Ciudad",
    action: "ACCIÓN",
    builtBy: "DESARROLLADO POR",
    fundedBy: "FINANCIADO POR",
    builtCredit: "Desarrollado por Open Earth Foundation y Sustainability Solutions Group",
    fundedCredit: "Financiado por el programa Crea y Valida, Comité InnovaChile de Corfo",
    generated: "Generado el",
    dateLocale: "es-CL",
  },
} as const;

// ─── Main export ──────────────────────────────────────────────────────────────

export interface GeneratePdfOptions {
  cityName: string;
  actionName: string;
  chapters: ReportChapter[];
  lang?: "en" | "es";
  /** Languages the backend generated the plan in (response.language); used to resolve chapter text. */
  availableLanguages?: string[];
}

export async function generateAndDownloadPdf(options: GeneratePdfOptions): Promise<void> {
  const { cityName, actionName, chapters, availableLanguages } = options;
  const lang = options.lang ?? "en";
  const chrome = CHROME[lang];
  // Localize the page-footer prefix for this report (read by addPageFrame).
  footerPrefix = `${chrome.title} · `;

  // Logos degrade independently to null; the PDF always renders.
  const logos = await preloadReportLogos().catch(() => ({ oef: null, ssg: null, corfo: null }));

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // ── Cover page ───────────────────────────────────────────────────────────────

  // Full navy background
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Gold accent stripe at bottom of header area
  pdf.setFillColor(249, 162, 0);
  pdf.rect(MARGIN_X, 110, 40, 1.5, "F");

  // Brand + document type label (small caps style)
  pdf.setTextColor(210, 220, 240);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("ACELERADORA LOCAL DE MITIGACIÓN", MARGIN_X, 44);
  pdf.setTextColor(180, 195, 230);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(chrome.docType, MARGIN_X, 51);

  // Main title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text(chrome.title, MARGIN_X, 74);

  // City name
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.setTextColor(210, 220, 240);
  pdf.text(cityName, MARGIN_X, 120);

  // Divider
  pdf.setDrawColor(255, 255, 255);
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN_X, 128, PAGE_W - MARGIN_X, 128);

  // Action label
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(160, 175, 210);
  pdf.text(chrome.action, MARGIN_X, 140);

  // Action name (wrapped)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  const actionLines = pdf.splitTextToSize(stripInline(actionName), CONTENT_W);
  pdf.text(actionLines.slice(0, 4), MARGIN_X, 149);

  // ── Cover bottom band — partner logos + credits ────────────────────────────
  // Logos sit on the navy background (pre-composited in pdfAssets); each one
  // is optional so a failed asset load never blocks the download.

  const LOGO_BOTTOM = 248;
  const placeLogo = (logo: LogoImage | null, x: number, hMm: number): number => {
    if (!logo) return 0;
    const wMm = (logo.wPx / logo.hPx) * hMm;
    try {
      pdf.addImage(logo.dataUrl, "PNG", x, LOGO_BOTTOM - hMm, wMm, hMm);
      return wMm;
    } catch {
      return 0;
    }
  };

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(160, 175, 210);
  pdf.text(chrome.builtBy, MARGIN_X, 231);

  // Builders (left): OEF + SSG, heights mirroring the site footer (64px/64px)
  let logoX = MARGIN_X;
  const oefW = placeLogo(logos.oef, logoX, 12);
  if (oefW > 0) logoX += oefW + 8;
  placeLogo(logos.ssg, logoX, 12);

  // Funder (right): CORFO, visually smaller per brand guidelines (48px)
  const corfoH = 9;
  const corfoW = logos.corfo ? (logos.corfo.wPx / logos.corfo.hPx) * corfoH : 0;
  const corfoX = PAGE_W - MARGIN_X - corfoW;
  if (logos.corfo) {
    pdf.text(chrome.fundedBy, corfoX, 231);
    placeLogo(logos.corfo, corfoX, corfoH);
  }

  // Credit lines (always rendered, even if logo images failed to load)
  pdf.setFontSize(7.5);
  pdf.setTextColor(150, 165, 205);
  pdf.text(chrome.builtCredit, MARGIN_X, 258);
  pdf.text(chrome.fundedCredit, MARGIN_X, 263);

  // Generation date at bottom left
  const today = new Date().toLocaleDateString(chrome.dateLocale, {
    year: "numeric", month: "long", day: "numeric",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(130, 150, 190);
  pdf.text(`${chrome.generated} ${today}`, MARGIN_X, PAGE_H - 16);

  // ── Content pages ─────────────────────────────────────────────────────────

  pdf.addPage();
  let y = MARGIN_TOP;

  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];

    // ── Chapter header band ────────────────────────────────────────────────
    // Ensure enough room for chapter heading + first content block
    y = ensureSpace(pdf, y, 22, actionName);

    // Chapter title row
    pdf.setFillColor(240, 243, 252);
    pdf.rect(MARGIN_X - 4, y - 5, CONTENT_W + 8, 10, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...NAVY);
    pdf.text(resolveI18nText(chapter.title, lang, availableLanguages), MARGIN_X, y);
    y += 10;

    // Thin navy rule
    pdf.setDrawColor(...NAVY);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 7;

    // ── Markdown content ───────────────────────────────────────────────────
    const blocks = parseMarkdown(resolveI18nText(chapter.markdown, lang, availableLanguages));

    for (const block of blocks) {
      if (block.type === "h1") {
        y = ensureSpace(pdf, y, 14, actionName);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(...DARK);
        const lines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of lines) {
          y = ensureSpace(pdf, y, 7, actionName);
          pdf.text(line, MARGIN_X, y);
          y += 6;
        }
        y += 2;

      } else if (block.type === "h2") {
        y = ensureSpace(pdf, y, 12, actionName);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(...MID);
        const lines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of lines) {
          y = ensureSpace(pdf, y, 6.5, actionName);
          pdf.text(line, MARGIN_X, y);
          y += 5.5;
        }
        y += 1.5;

      } else if (block.type === "h3") {
        y = ensureSpace(pdf, y, 10, actionName);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...SOFT);
        const lines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of lines) {
          y = ensureSpace(pdf, y, 6, actionName);
          pdf.text(line, MARGIN_X, y);
          y += 5.2;
        }
        y += 1;

      } else if (block.type === "paragraph") {
        y = ensureSpace(pdf, y, 7, actionName);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...MID);
        const lines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of lines) {
          y = ensureSpace(pdf, y, 5.5, actionName);
          pdf.text(line, MARGIN_X, y);
          y += 5;
        }
        y += 2.5;

      } else if (block.type === "bullet") {
        const indent = MARGIN_X + 3 + block.depth * 4;
        const bulletW = CONTENT_W - 3 - block.depth * 4;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...MID);
        const lines = pdf.splitTextToSize(stripInline(block.text), bulletW - 4);
        for (let li = 0; li < lines.length; li++) {
          y = ensureSpace(pdf, y, 5.5, actionName);
          if (li === 0) {
            pdf.setTextColor(...NAVY);
            pdf.text("•", indent, y);
            pdf.setTextColor(...MID);
            pdf.text(lines[li], indent + 4, y);
          } else {
            pdf.text(lines[li], indent + 4, y);
          }
          y += 5;
        }
        y += 1.5;

      } else if (block.type === "table") {
        y = renderTable(pdf, block, y, actionName);
        y += 2;
      }
    }

    // Small gap between chapters (not a page break)
    if (ci < chapters.length - 1) {
      y = ensureSpace(pdf, y, 14, actionName);
      pdf.setDrawColor(...RULE);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 10;
    }
  }

  // Frame the last page
  addPageFrame(pdf, actionName);

  pdf.save(buildFilename(cityName, actionName));
}
