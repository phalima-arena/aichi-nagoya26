import type { Finding, Relevance } from "./types";
import { RELEVANCE_COLORS } from "./colors";

const REPORT_TITLE = "Nagoya 2026 Asian Games — Observation Findings Report";
const MARGIN = 14;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const RELEVANCE_RGB: Record<Relevance, [number, number, number]> = {
  High: hexToRgb(RELEVANCE_COLORS.High),
  Medium: hexToRgb(RELEVANCE_COLORS.Medium),
  Low: hexToRgb(RELEVANCE_COLORS.Low),
};

export async function exportFindingsToExcel(findings: Finding[]) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nagoya 2026 Observation Platform";
  workbook.created = new Date();

  const generatedAtLabel = new Date().toLocaleString();

  const sheet = workbook.addWorksheet("Findings");
  sheet.columns = [
    { key: "finding_number", width: 14 },
    { key: "date", width: 14 },
    { key: "time", width: 12 },
    { key: "venue", width: 42 },
    { key: "functional_area", width: 32 },
    { key: "comment", width: 60 },
    { key: "relevance", width: 12 },
    { key: "observer_name", width: 22 },
  ];

  const titleRow = sheet.addRow([REPORT_TITLE]);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, 8);
  titleRow.font = { bold: true, size: 14 };

  const subtitleRow = sheet.addRow([`Generated ${generatedAtLabel}`]);
  sheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, 8);
  subtitleRow.font = { italic: true, color: { argb: "FF52514E" } };

  sheet.addRow([]);

  const headerRow = sheet.addRow([
    "Finding ID",
    "Date",
    "Time",
    "Venue",
    "Functional Area",
    "Comment",
    "Relevance",
    "Observer Name",
  ]);
  headerRow.font = { bold: true };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE1E0D9" } };

  findings.forEach((f) => {
    const occurred = new Date(f.occurred_at);
    sheet.addRow([
      f.finding_number,
      occurred.toLocaleDateString(),
      occurred.toLocaleTimeString(),
      f.venue,
      f.functional_area,
      f.description,
      f.relevance,
      f.observer_name ?? "",
    ]);
  });

  sheet.autoFilter = { from: `A${headerRow.number}`, to: `H${headerRow.number}` };
  sheet.headerFooter.oddHeader = `&C&B${REPORT_TITLE}`;
  sheet.headerFooter.oddFooter = `&LGenerated ${generatedAtLabel}&RPage &P of &N`;

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { key: "k", width: 40 },
    { key: "v", width: 12 },
  ];
  const summaryTitleRow = summarySheet.addRow([REPORT_TITLE]);
  summarySheet.mergeCells(summaryTitleRow.number, 1, summaryTitleRow.number, 2);
  summaryTitleRow.font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  const summaryHeaderRow = summarySheet.addRow(["Breakdown", "Count"]);
  summaryHeaderRow.font = { bold: true };
  summarySheet.addRow(["Total findings", findings.length]);
  (["High", "Medium", "Low"] as Relevance[]).forEach((level) => {
    summarySheet.addRow([`Relevance: ${level}`, findings.filter((f) => f.relevance === level).length]);
  });
  summarySheet.headerFooter.oddHeader = `&C&B${REPORT_TITLE}`;
  summarySheet.headerFooter.oddFooter = `&LGenerated ${generatedAtLabel}&RPage &P of &N`;

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `nagoya2026-findings-${Date.now()}.xlsx`
  );
}

interface LoadedImage {
  dataUrl: string;
  format: "JPEG" | "PNG" | "WEBP";
  width: number;
  height: number;
}

async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();

    let format: LoadedImage["format"];
    if (blob.type.includes("png")) format = "PNG";
    else if (blob.type.includes("webp")) format = "WEBP";
    else if (blob.type.includes("jpeg") || blob.type.includes("jpg")) format = "JPEG";
    else return null;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });

    return { dataUrl, format, width, height };
  } catch {
    return null;
  }
}

// jsPDF's shipped .d.ts omits these two internal methods even though they
// exist at runtime; cast narrowly rather than losing types on the whole object.
interface JsPdfInternalExt {
  getCurrentPageInfo(): { pageNumber: number };
  getNumberOfPages(): number;
}

export async function exportFindingsToPdf(findings: Finding[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const internalExt = doc.internal as unknown as JsPdfInternalExt;
  const generatedAtLabel = `Generated ${new Date().toLocaleString()}`;
  const totalPagesExp = "{total_pages_count_string}";

  function drawHeaderFooter() {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageNumber = internalExt.getCurrentPageInfo().pageNumber;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(11, 11, 11);
    doc.text(REPORT_TITLE, MARGIN, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(generatedAtLabel, pageWidth - MARGIN, 10, { align: "right" });

    doc.setDrawColor(225, 224, 217);
    doc.line(MARGIN, 13, pageWidth - MARGIN, 13);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${pageNumber} of ${totalPagesExp}`, pageWidth / 2, pageHeight - 8, { align: "center" });

    doc.setTextColor(11, 11, 11);
  }

  // --- Page 1+: findings table ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(11, 11, 11);
  doc.text("All Findings", MARGIN, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `${findings.length} finding${findings.length === 1 ? "" : "s"} — click a Finding ID to jump to its detail page`,
    MARGIN,
    27
  );
  doc.setTextColor(11, 11, 11);

  const idCellPositions: ({ page: number; x: number; y: number; w: number; h: number } | undefined)[] = [];

  autoTable(doc, {
    startY: 32,
    head: [["Finding ID", "Date", "Time", "Venue", "Functional Area", "Comment", "Relevance", "Observer Name"]],
    body: findings.map((f) => {
      const occurred = new Date(f.occurred_at);
      return [
        f.finding_number,
        occurred.toLocaleDateString(),
        occurred.toLocaleTimeString(),
        f.venue,
        f.functional_area,
        f.description,
        f.relevance,
        f.observer_name || "—",
      ];
    }),
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak", textColor: [11, 11, 11] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      2: { cellWidth: 18 },
      3: { cellWidth: 42 },
      4: { cellWidth: 36 },
      5: { cellWidth: 78 },
      6: { cellWidth: 18 },
      7: { cellWidth: 26 },
    },
    headStyles: { fillColor: [11, 11, 11], textColor: [255, 255, 255] },
    theme: "striped",
    margin: { top: 16, left: MARGIN, right: MARGIN, bottom: 14 },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 0) {
        data.cell.styles.textColor = [42, 120, 214];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 6) {
        const level = data.cell.raw as Relevance;
        data.cell.styles.textColor = RELEVANCE_RGB[level] ?? [11, 11, 11];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        idCellPositions[data.row.index] = {
          page: data.pageNumber,
          x: data.cell.x,
          y: data.cell.y,
          w: data.cell.width,
          h: data.cell.height,
        };
      }
    },
    didDrawPage: drawHeaderFooter,
  });

  const tableEndPage = internalExt.getNumberOfPages();

  // --- One detail page per finding ---
  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    doc.addPage();
    drawHeaderFooter();

    doc.setFontSize(9);
    doc.setTextColor(42, 120, 214);
    doc.textWithLink("< Back to findings table", MARGIN, 20, { pageNumber: 1 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(11, 11, 11);
    doc.text(f.finding_number, MARGIN, 30);
    doc.setFont("helvetica", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentTop = 38;
    const contentBottom = pageHeight - 16;
    const leftX = MARGIN;
    const leftWidth = (pageWidth - MARGIN * 2) * 0.42;
    const rightX = leftX + leftWidth + 10;
    const rightWidth = pageWidth - MARGIN - rightX;
    const boxHeight = contentBottom - contentTop;

    doc.setDrawColor(225, 224, 217);
    doc.setFillColor(245, 245, 243);
    doc.rect(leftX, contentTop, leftWidth, boxHeight, "FD");

    const image = f.photo_url ? await loadImage(f.photo_url) : null;
    if (image) {
      const scale = Math.min(leftWidth / image.width, boxHeight / image.height);
      const drawW = image.width * scale;
      const drawH = image.height * scale;
      const drawX = leftX + (leftWidth - drawW) / 2;
      const drawY = contentTop + (boxHeight - drawH) / 2;
      doc.addImage(image.dataUrl, image.format, drawX, drawY, drawW, drawH);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text(f.photo_url ? "Photo unavailable" : "No photo attached", leftX + leftWidth / 2, contentTop + boxHeight / 2, {
        align: "center",
      });
      doc.setTextColor(11, 11, 11);
    }

    let y = contentTop + 4;
    function row(label: string, value: string) {
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(label.toUpperCase(), rightX, y);
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(11, 11, 11);
      const lines = doc.splitTextToSize(value, rightWidth);
      doc.text(lines, rightX, y);
      y += lines.length * 5 + 4;
    }

    const occurred = new Date(f.occurred_at);
    row("Date", occurred.toLocaleDateString());
    row("Time", occurred.toLocaleTimeString());
    row("Venue", f.venue);
    row("Functional Area", f.functional_area);

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("RELEVANCE", rightX, y);
    y += 5;
    const rgb = RELEVANCE_RGB[f.relevance];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(rightX, y - 4.5, 26, 7, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(f.relevance, rightX + 13, y, { align: "center" });
    doc.setTextColor(11, 11, 11);
    y += 10;

    row("Comment", f.description);
    row("Observer Name", f.observer_name || "Not provided");
  }

  idCellPositions.forEach((pos, i) => {
    if (!pos) return;
    doc.setPage(pos.page);
    doc.link(pos.x, pos.y, pos.w, pos.h, { pageNumber: tableEndPage + i + 1 });
  });

  doc.putTotalPages(totalPagesExp);
  doc.save(`nagoya2026-findings-${Date.now()}.pdf`);
}
