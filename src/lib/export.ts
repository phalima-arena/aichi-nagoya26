import type { Finding } from "./types";
import { RELEVANCE_LEVELS } from "./types";

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

export async function exportFindingsToExcel(findings: Finding[]) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nagoya 2026 Observation Platform";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Findings");
  sheet.columns = [
    { header: "Finding #", key: "finding_number", width: 14 },
    { header: "Date & Time", key: "occurred_at", width: 20 },
    { header: "Venue", key: "venue", width: 42 },
    { header: "Functional Area", key: "functional_area", width: 32 },
    { header: "Findings", key: "description", width: 60 },
    { header: "Relevance", key: "relevance", width: 12 },
    { header: "Observer", key: "observer_name", width: 20 },
    { header: "Photo URL", key: "photo_url", width: 42 },
    { header: "Logged At", key: "created_at", width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE1E0D9" } };

  findings.forEach((f) => {
    sheet.addRow({
      finding_number: f.finding_number,
      occurred_at: new Date(f.occurred_at).toLocaleString(),
      venue: f.venue,
      functional_area: f.functional_area,
      description: f.description,
      relevance: f.relevance,
      observer_name: f.observer_name ?? "",
      photo_url: f.photo_url ?? "",
      created_at: new Date(f.created_at).toLocaleString(),
    });
  });

  sheet.autoFilter = { from: "A1", to: "I1" };

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Breakdown", key: "k", width: 40 },
    { header: "Count", key: "v", width: 12 },
  ];
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.addRow({ k: "Total findings", v: findings.length });
  RELEVANCE_LEVELS.forEach((level) => {
    summarySheet.addRow({ k: `Relevance: ${level}`, v: findings.filter((f) => f.relevance === level).length });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `nagoya2026-findings-${Date.now()}.xlsx`
  );
}

export async function exportFindingsToPdf(findings: Finding[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const byRelevance = Object.fromEntries(
    RELEVANCE_LEVELS.map((level) => [level, findings.filter((f) => f.relevance === level).length])
  );

  doc.setFontSize(16);
  doc.text("Nagoya 2026 Asian Games — Observation Findings Report", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated ${new Date().toLocaleString()} · ${findings.length} findings total`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Relevance", "Count"]],
    body: RELEVANCE_LEVELS.map((level) => [level, String(byRelevance[level] ?? 0)]),
    theme: "grid",
    headStyles: { fillColor: [11, 11, 11] },
    tableWidth: 80,
  });

  const afterSummaryY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: afterSummaryY,
    head: [["#", "Date / Time", "Venue", "Functional Area", "Relevance", "Findings", "Observer"]],
    body: findings.map((f) => [
      f.finding_number,
      new Date(f.occurred_at).toLocaleString(),
      f.venue,
      f.functional_area,
      f.relevance,
      f.description,
      f.observer_name ?? "—",
    ]),
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { cellWidth: 18 },
      5: { cellWidth: 90 },
      6: { cellWidth: 24 },
    },
    headStyles: { fillColor: [42, 120, 214] },
    theme: "striped",
  });

  doc.save(`nagoya2026-findings-${Date.now()}.pdf`);
}
