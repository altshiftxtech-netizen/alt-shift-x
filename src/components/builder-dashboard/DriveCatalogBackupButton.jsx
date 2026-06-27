import React, { useState } from "react";
import { Cloud, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Builds the same CSV the local export uses, then writes it to the Alt+Shift+X
// operations Google Drive folder as a dated catalog backup. Keeps an off-platform
// record of the builder's component inventory.
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
      c.sku || "", c.name || "", c.code || "", c.type || "", c.category || "", c.status || "",
      price.toFixed(2), installs, (price * installs).toFixed(2),
      Number(c.rating || 0).toFixed(1), Number(c.reviews_count || 0), Number(c.trust_score || 0),
      c.certified ? "Yes" : "No",
      c.created_date ? new Date(c.created_date).toISOString().slice(0, 10) : "",
      c.updated_date ? new Date(c.updated_date).toISOString().slice(0, 10) : "",
    ].map(esc).join(","));
  }
  return lines.join("\n");
}

export default function DriveCatalogBackupButton({ components = [] }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleBackup = async () => {
    setBusy(true);
    setDone(false);
    try {
      const csv = "\uFEFF" + toCsv(components);
      const name = `component-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
      await base44.functions.invoke("googleDriveOps", { action: "create", name, mimeType: "text/csv", content: csv });
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      // Drive backup is best-effort — silent on failure
    }
    setBusy(false);
  };

  return (
    <button
      onClick={handleBackup}
      disabled={busy || components.length === 0}
      className="flex items-center gap-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
      title="Save a dated catalog backup to Google Drive"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
      {done ? "Backed up" : "Backup to Drive"}
    </button>
  );
}