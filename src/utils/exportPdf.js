import jsPDF from "jspdf";
import { format } from "date-fns";

const BRAND = "#5b21b6"; // violet-800
const LIGHT = "#f8f7ff";
const MUTED = "#64748b";
const DARK = "#0f172a";

function addHeader(doc, title, subtitle) {
  // Background bar
  doc.setFillColor(BRAND);
  doc.rect(0, 0, 210, 22, "F");

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#ffffff");
  doc.text("ALT+SHIFT+X", 14, 14);

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK);
  doc.text(title, 14, 38);

  // Subtitle + date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(subtitle, 14, 46);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 52);

  // Divider
  doc.setDrawColor("#e2e8f0");
  doc.setLineWidth(0.4);
  doc.line(14, 56, 196, 56);

  return 64; // starting Y for content
}

function addSectionTitle(doc, text, y) {
  doc.setFillColor(LIGHT);
  doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(BRAND);
  doc.text(text.toUpperCase(), 17, y + 5);
  return y + 12;
}

function addFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text("Alt+Shift+X Market — Confidential", 14, 291);
    doc.text(`Page ${i} of ${pages}`, 196, 291, { align: "right" });
  }
}

// ─── Installed Components Report ─────────────────────────────────────────────
export function exportInstalledComponentsPdf(components) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = addHeader(doc, "Installed Components Report", "Marketplace component configurations & status summary");

  // Summary row
  const totalCalls = components.reduce((s, c) => s + (c.callsThisMonth || 0), 0);
  const totalCost = components.reduce((s, c) => s + (c.price || 0), 0);

  const summaryItems = [
    { label: "Components", value: String(components.length) },
    { label: "Total Calls / mo", value: totalCalls.toLocaleString() },
    { label: "Est. Monthly Cost", value: `$${totalCost}` },
    { label: "Active", value: components.filter(c => c.status === "active").length.toString() },
  ];

  y = addSectionTitle(doc, "Summary", y);
  const colW = 182 / summaryItems.length;
  summaryItems.forEach((item, i) => {
    const x = 14 + i * colW;
    doc.setFillColor("#ffffff");
    doc.setDrawColor("#e2e8f0");
    doc.roundedRect(x, y, colW - 3, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(DARK);
    doc.text(item.value, x + (colW - 3) / 2, y + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text(item.label, x + (colW - 3) / 2, y + 15, { align: "center" });
  });
  y += 26;

  // Components table
  y = addSectionTitle(doc, "Component Configurations", y);
  const cols = ["Component", "Code", "Type", "Category", "Trust", "Calls/mo", "Cost/mo", "Installed", "Status"];
  const colWidths = [38, 32, 12, 32, 12, 16, 16, 22, 16];
  let x = 14;

  // Table header
  doc.setFillColor("#1e293b");
  doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor("#ffffff");
  cols.forEach((col, i) => {
    doc.text(col, x + 2, y + 5);
    x += colWidths[i];
  });
  y += 7;

  // Table rows
  components.forEach((c, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    doc.setFillColor(rowBg);
    doc.rect(14, y, 182, 8, "F");
    doc.setDrawColor("#e2e8f0");
    doc.rect(14, y, 182, 8, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(DARK);
    const row = [
      c.name, c.code, c.type, c.category,
      String(c.trustScore ?? "—"),
      (c.callsThisMonth ?? 0).toLocaleString(),
      `$${c.price ?? 0}`,
      c.installedDate ?? "—",
      (c.status ?? "active").toUpperCase(),
    ];
    x = 14;
    row.forEach((val, i) => {
      doc.text(String(val), x + 2, y + 5.5);
      x += colWidths[i];
    });
    y += 8;
  });

  y += 8;

  // Notes section
  if (y > 240) { doc.addPage(); y = 20; }
  y = addSectionTitle(doc, "Notes for Stakeholders", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  const notes = [
    "• Trust scores are computed by the Alt+Shift+X Trust Engine and reflect performance, safety, satisfaction & retention.",
    "• All components are verified against the X-Protocol standard before marketplace listing.",
    "• Monthly cost estimates are based on current plan pricing and may vary with usage tier.",
    "• For integration support, visit the Setup Guide for each component in your dashboard.",
  ];
  notes.forEach(note => {
    doc.text(note, 14, y);
    y += 6;
  });

  addFooter(doc);
  doc.save(`AltShiftX_Components_${format(new Date(), "yyyyMMdd")}.pdf`);
}

// ─── Usage Analytics Report ───────────────────────────────────────────────────
export function exportUsageAnalyticsPdf(stats, byComponent, dailyUsage) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = addHeader(doc, "Usage Analytics Report", "API usage summary & component performance — stakeholder export");

  // Summary stats
  y = addSectionTitle(doc, "Period Summary", y);
  const colW = 182 / stats.length;
  stats.forEach((item, i) => {
    const x = 14 + i * colW;
    doc.setFillColor("#ffffff");
    doc.setDrawColor("#e2e8f0");
    doc.roundedRect(x, y, colW - 3, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(DARK);
    doc.text(item.value, x + (colW - 3) / 2, y + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text(item.label, x + (colW - 3) / 2, y + 15, { align: "center" });
  });
  y += 26;

  // Component breakdown table
  y = addSectionTitle(doc, "Component Performance Breakdown", y);
  const tableCols = ["Component Name", "API Calls", "% of Total", "Avg Latency"];
  const tableWidths = [80, 34, 34, 34];
  let tx = 14;

  doc.setFillColor("#1e293b");
  doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor("#ffffff");
  tableCols.forEach((col, i) => {
    doc.text(col, tx + 2, y + 5);
    tx += tableWidths[i];
  });
  y += 7;

  const totalCalls = byComponent.reduce((s, c) => s + c.calls, 0);
  byComponent.forEach((c, idx) => {
    const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    doc.setFillColor(rowBg);
    doc.rect(14, y, 182, 8, "F");
    doc.setDrawColor("#e2e8f0");
    doc.rect(14, y, 182, 8, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(DARK);
    const row = [
      c.name,
      c.calls.toLocaleString(),
      `${Math.round((c.calls / totalCalls) * 100)}%`,
      c.avgLatency ?? "—",
    ];
    tx = 14;
    row.forEach((val, i) => {
      doc.text(String(val), tx + 2, y + 5.5);
      tx += tableWidths[i];
    });
    y += 8;
  });
  y += 8;

  // Daily usage table
  if (y > 200) { doc.addPage(); y = 20; }
  y = addSectionTitle(doc, "Daily API Call Log", y);
  const dayCols = ["Date", "API Calls"];
  const dayWidths = [60, 40];
  tx = 14;

  doc.setFillColor("#1e293b");
  doc.rect(14, y, 100, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor("#ffffff");
  dayCols.forEach((col, i) => {
    doc.text(col, tx + 2, y + 5);
    tx += dayWidths[i];
  });
  y += 7;

  dailyUsage.forEach((entry, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    doc.setFillColor(rowBg);
    doc.rect(14, y, 100, 7, "F");
    doc.setDrawColor("#e2e8f0");
    doc.rect(14, y, 100, 7, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(DARK);
    tx = 14;
    [entry.day, String(entry.calls)].forEach((val, i) => {
      doc.text(val, tx + 2, y + 5);
      tx += dayWidths[i];
    });
    y += 7;
  });

  y += 8;

  // Insights
  if (y > 240) { doc.addPage(); y = 20; }
  y = addSectionTitle(doc, "Key Insights", y);
  const peak = dailyUsage.reduce((max, d) => d.calls > max.calls ? d : max, dailyUsage[0]);
  const topComp = byComponent[0];
  const insights = [
    `• Peak usage recorded on ${peak?.day} with ${peak?.calls} API calls.`,
    `• ${topComp?.name} is the most-used component at ${Math.round((topComp?.calls / totalCalls) * 100)}% of total volume.`,
    `• Average response latency across all components: ${byComponent.map(c => parseFloat(c.avgLatency)).filter(Boolean).reduce((a, b) => a + b, 0) / byComponent.length > 0 ? (byComponent.map(c => parseFloat(c.avgLatency)).filter(Boolean).reduce((a, b) => a + b, 0) / byComponent.filter(c => c.avgLatency).length).toFixed(2) + "s" : "—"}.`,
    "• All data sourced from verified Alt+Shift+X extraction logs and is suitable for stakeholder reporting.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  insights.forEach(note => {
    doc.text(note, 14, y);
    y += 6;
  });

  addFooter(doc);
  doc.save(`AltShiftX_Analytics_${format(new Date(), "yyyyMMdd")}.pdf`);
}