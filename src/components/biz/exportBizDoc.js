import jsPDF from "jspdf";
import { format } from "date-fns";
import { DISCLAIMER } from "./bizData";

// Exports a generated BOB² business document to PDF, with the "Drafting Aid
// Only" disclosure baked into both the header and every page footer.
export function exportBizDocPdf(docData) {
  const { template_label, title, jurisdiction, version, draft_body, assumptions = [], review_checklist = [] } = docData;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const LEFT = 16, RIGHT = 194, WIDTH = RIGHT - LEFT;

  // Header
  pdf.setFillColor("#1a1207");
  pdf.rect(0, 0, 210, 24, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor("#C8A95B");
  pdf.text("BOB² BuilderOperatedBiz — DRAFTING AID ONLY", LEFT, 10);
  pdf.setFontSize(15);
  pdf.setTextColor("#ffffff");
  pdf.text(template_label, LEFT, 18);

  let y = 32;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor("#334155");
  pdf.text(`Title: ${title}`, LEFT, y); y += 5;
  pdf.text(`Jurisdiction: ${jurisdiction || "United States (general)"}`, LEFT, y); y += 5;
  pdf.text(`Version: v${version || 1}  ·  Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, LEFT, y); y += 8;

  // Body
  pdf.setDrawColor("#e2e8f0");
  pdf.line(LEFT, y, RIGHT, y); y += 8;
  pdf.setTextColor("#0f172a");
  pdf.setFontSize(9.5);
  const bodyLines = pdf.splitTextToSize(stripMd(draft_body), WIDTH);
  bodyLines.forEach((line) => {
    if (y > 275) { pdf.addPage(); y = 20; }
    pdf.text(line, LEFT, y); y += 5;
  });

  // Assumptions
  y = section(pdf, "Assumptions Made (fields not provided)", y);
  assumptions.forEach((a) => { y = bullet(pdf, a, y); });

  // Review checklist
  y = section(pdf, "Next Review Checklist (for qualified counsel)", y);
  review_checklist.forEach((c) => { y = bullet(pdf, c, y); });

  // Footer disclaimer on every page
  const pages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6.5);
    pdf.setTextColor("#94a3b8");
    const foot = pdf.splitTextToSize(DISCLAIMER.full, WIDTH);
    pdf.text(foot.slice(0, 2), LEFT, 288);
    pdf.text(`Page ${i} of ${pages}`, RIGHT, 293, { align: "right" });
  }

  pdf.save(`${template_label.replace(/\s+/g, "_")}_v${version || 1}.pdf`);
}

function section(pdf, label, y) {
  if (y > 260) { pdf.addPage(); y = 20; }
  y += 4;
  pdf.setFillColor("#f8f7f2");
  pdf.rect(16, y, 178, 7, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor("#8a6d1f");
  pdf.text(label.toUpperCase(), 19, y + 5);
  pdf.setFont("helvetica", "normal");
  return y + 11;
}

function bullet(pdf, text, y) {
  if (y > 278) { pdf.addPage(); y = 20; }
  pdf.setFontSize(8.5);
  pdf.setTextColor("#334155");
  const lines = pdf.splitTextToSize(`• ${text}`, 174);
  pdf.text(lines, 19, y);
  return y + lines.length * 4.5 + 1;
}

function stripMd(s = "") {
  return String(s).replace(/[#*_`>]/g, "").replace(/\n{3,}/g, "\n\n");
}