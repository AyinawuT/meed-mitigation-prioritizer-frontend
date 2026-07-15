import jsPDF from "jspdf";
import type { ReportChapter } from "@/lib/reportApi";

// ─── Page constants (A4 in mm) ────────────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const MARGIN_TOP = 22;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const FOOTER_Y = PAGE_H - 10;
const SAFE_BOTTOM = PAGE_H - 20; // stop adding content below this line

// ─── Markdown block types ─────────────────────────────────────────────────────

type Block =
  | { type: "heading2"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; items: string[] };

/** Strip inline markdown markers (**bold**, *italic*, `code`). */
function stripInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

/** Parse a chapter's markdown string into renderable blocks. */
function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading2", text: trimmed.slice(3) });
      i++;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "bullet", items });
      continue;
    }

    // Accumulate paragraph until blank line or a block-level marker
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("## ") &&
      !lines[i].trim().startsWith("- ")
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

// ─── Footer helper ────────────────────────────────────────────────────────────

function addFooter(pdf: jsPDF): void {
  const pageNum = pdf.getNumberOfPages();
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(160, 160, 160);
  pdf.text("MEED+ HIAP — City Action Report", MARGIN_X, FOOTER_Y);
  pdf.text(`Page ${pageNum}`, PAGE_W - MARGIN_X, FOOTER_Y, { align: "right" });
}

/**
 * Check whether the next block needs a page break.
 * If so, add footer to the current page and open a new one.
 * Returns the (possibly reset) y cursor.
 */
function maybeNewPage(pdf: jsPDF, y: number, needed: number): number {
  if (y + needed > SAFE_BOTTOM) {
    addFooter(pdf);
    pdf.addPage();
    return MARGIN_TOP;
  }
  return y;
}

// ─── PDF filename helpers ─────────────────────────────────────────────────────

function buildFilename(cityName: string, actionName: string): string {
  const safeCityName = cityName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const safeActionName = actionName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);

  return `${safeCityName}-${safeActionName}-output-plan.pdf`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface GeneratePdfOptions {
  cityName: string;
  actionName: string;
  chapters: ReportChapter[];
}

/**
 * Assemble the report chapters into a styled PDF and trigger a browser download.
 */
export function generateAndDownloadPdf(options: GeneratePdfOptions): void {
  const { cityName, actionName, chapters } = options;

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // ── Cover page ──────────────────────────────────────────────────────────────

  // Blue header band
  pdf.setFillColor(0, 30, 167);
  pdf.rect(0, 0, PAGE_W, 72, "F");

  // Thin gold accent line
  pdf.setFillColor(249, 162, 0);
  pdf.rect(0, 72, PAGE_W, 2, "F");

  // Wordmark
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("MEED+ HIAP", MARGIN_X, 30);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text("City Action Output Plan", MARGIN_X, 42);

  // Light separator
  pdf.setDrawColor(255, 255, 255, 0.3);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, 50, PAGE_W - MARGIN_X, 50);

  // City name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text(cityName, MARGIN_X, 60);

  // Body content area
  pdf.setTextColor(30, 30, 30);
  let coverY = 90;

  // Action label
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text("ACTION", MARGIN_X, coverY);
  coverY += 6;

  // Action name (may wrap)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(20, 20, 20);
  const actionLines = pdf.splitTextToSize(stripInline(actionName), CONTENT_W);
  pdf.text(actionLines, MARGIN_X, coverY);
  coverY += actionLines.length * 8 + 6;

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN_X, coverY, MARGIN_X + 60, coverY);
  coverY += 10;

  // Generation date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  const today = new Date().toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  pdf.text(`Generated ${today}`, MARGIN_X, coverY);

  // Cover footer
  addFooter(pdf);

  // ── Chapter pages ────────────────────────────────────────────────────────────

  for (const chapter of chapters) {
    pdf.addPage();
    let y = MARGIN_TOP;

    // Chapter title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(0, 30, 167);
    y = maybeNewPage(pdf, y, 16);
    pdf.text(chapter.title, MARGIN_X, y);
    y += 5;

    // Underline
    pdf.setDrawColor(0, 30, 167);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 8;

    // Render markdown blocks
    const blocks = parseMarkdown(chapter.markdown);

    for (const block of blocks) {
      if (block.type === "heading2") {
        y = maybeNewPage(pdf, y, 14);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(40, 40, 40);
        const hLines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of hLines) {
          y = maybeNewPage(pdf, y, 7);
          pdf.text(line, MARGIN_X, y);
          y += 6;
        }
        y += 2;

      } else if (block.type === "paragraph") {
        y = maybeNewPage(pdf, y, 8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        const pLines = pdf.splitTextToSize(stripInline(block.text), CONTENT_W);
        for (const line of pLines) {
          y = maybeNewPage(pdf, y, 6);
          pdf.text(line, MARGIN_X, y);
          y += 5.2;
        }
        y += 3;

      } else if (block.type === "bullet") {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        for (const item of block.items) {
          const indent = 4;
          const bulletText = stripInline(item);
          const bLines = pdf.splitTextToSize(bulletText, CONTENT_W - indent);
          for (let li = 0; li < bLines.length; li++) {
            y = maybeNewPage(pdf, y, 6);
            if (li === 0) {
              pdf.text("•", MARGIN_X, y);
              pdf.text(bLines[li], MARGIN_X + indent, y);
            } else {
              pdf.text(bLines[li], MARGIN_X + indent, y);
            }
            y += 5.2;
          }
        }
        y += 2;
      }
    }

    addFooter(pdf);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  pdf.save(buildFilename(cityName, actionName));
}
