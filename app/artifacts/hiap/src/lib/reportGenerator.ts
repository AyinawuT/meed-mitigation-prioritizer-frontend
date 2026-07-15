import jsPDF from "jspdf";
import type { ReportChapter } from "@/lib/reportApi";

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

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string; depth: number };

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

    // Paragraph — accumulate until blank line or block-level marker
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().match(/^#{1,3}\s/) &&
      !lines[i].trim().match(/^[-*]\s/) &&
      !lines[i].trim().match(/^\d+\.\s/)
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
  const leftLabel = pdf.splitTextToSize(`City Action Output Plan · ${stripInline(actionName).slice(0, 60)}`, CONTENT_W * 0.75);
  pdf.text(leftLabel[0], MARGIN_X, FOOTER_Y);
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

// ─── Main export ──────────────────────────────────────────────────────────────

export interface GeneratePdfOptions {
  cityName: string;
  actionName: string;
  chapters: ReportChapter[];
}

export function generateAndDownloadPdf(options: GeneratePdfOptions): void {
  const { cityName, actionName, chapters } = options;

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // ── Cover page ───────────────────────────────────────────────────────────────

  // Full navy background
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Gold accent stripe at bottom of header area
  pdf.setFillColor(249, 162, 0);
  pdf.rect(MARGIN_X, 110, 40, 1.5, "F");

  // Document type label (small caps style)
  pdf.setTextColor(180, 195, 230);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("CLIMATE ACTION REPORT", MARGIN_X, 50);

  // Main title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("City Action Output", MARGIN_X, 74);

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
  pdf.text("ACTION", MARGIN_X, 140);

  // Action name (wrapped)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  const actionLines = pdf.splitTextToSize(stripInline(actionName), CONTENT_W);
  pdf.text(actionLines.slice(0, 4), MARGIN_X, 149);

  // Generation date at bottom left
  const today = new Date().toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(130, 150, 190);
  pdf.text(`Generated ${today}`, MARGIN_X, PAGE_H - 16);

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
    pdf.text(chapter.title, MARGIN_X, y);
    y += 10;

    // Thin navy rule
    pdf.setDrawColor(...NAVY);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 7;

    // ── Markdown content ───────────────────────────────────────────────────
    const blocks = parseMarkdown(chapter.markdown);

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
