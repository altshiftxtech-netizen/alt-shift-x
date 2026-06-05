import React, { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";

// Builds a CSV (Excel/Google Sheets compatible) of the builder's components so
// they can keep their own up-to-date records of inventory, net worth & work.
function toCsv(rows) {
  const headers = [
    "SKU", "Name", "Code", "Type", "Category", "Status",
    "Price (USD/mo)", "Installs", "Monthly Recurring (USD)",
    "Rating", "Reviews", "Trust Score", "Certified", "Created", "Last Updated",
  ];
  const esc = (v) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const c of rows) {
    const price = Number(c.price || 0);
    const installs = Number(c.installs_count || 0);
    lines.push([
      c.sku || "",
      c.name || "",
      c.code || "",
      c.type || "",
      c.category || "",
      c.status || "",
      price.toFixed(2),
      installs,
      (price * installs).toFixed(2),
      Number(c.rating || 0).toFixed(1),
      Number(c.reviews_count || 0),
      Number(c.trust_score || 0),
      c.certified ? "Yes" : "No",
      c.created_date ? new Date(c.created_date).toISOString().slice(0, 10) : "",
      c.updated_date ? new Date(c.updated_date).toISOString().slice(0, 10) : "",
    ].map(esc).join(","));
  }
  return lines.join("\n");
}

export default function ComponentExportButton({ components = [] }) {
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    setBusy(true);
    const csv = toCsv(components);
    // Prepend BOM so Excel reads UTF-8 correctly.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-components-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={busy || components.length === 0}
      className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
      title="Download an up-to-date spreadsheet of your components"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
      Export to Excel / Sheets
    </button>
  );
}