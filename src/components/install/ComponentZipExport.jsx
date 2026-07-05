import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { FileArchive, Loader2, Download, CheckCircle2, Clock, ListChecks, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BlackstoneDisclosureModal from "@/components/enterprise/forensic/BlackstoneDisclosureModal";

// A component is data-collection-flagged if its name/code signals collection behavior.
const isDataCollection = (c) => /data.?collection|scrape|harvest/i.test(`${c.component_name || ""} ${c.component_code || ""}`);

/**
 * ComponentZipExport — lets eligible users export the FULL information of every
 * component they own as a ZIP. Offers three flows:
 *   • Everything
 *   • Only new since their last download (checkpoint)
 *   • Hand-pick a batch
 * Eligibility (paid, non-developer) is enforced server-side; this only renders
 * the button when `eligible` is true.
 */
export default function ComponentZipExport({ eligible, installs = [] }) {
  const [open, setOpen] = useState(false);
  const [checkpoint, setCheckpoint] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState({});
  const [mode, setMode] = useState(null); // "all" | "checkpoint" | "selected"
  const [blackstone, setBlackstone] = useState(null); // { mode } pending acknowledgment
  const [dcName, setDcName] = useState("");

  useEffect(() => {
    if (!open) return;
    base44.entities.DownloadCheckpoint.filter({})
      .then((rows) => setCheckpoint(rows?.[0] || null))
      .catch(() => setCheckpoint(null));
  }, [open]);

  if (!eligible) return null;

  // Determine which components are in scope for a given mode, and whether any
  // of them are flagged for DATA_COLLECTION (requires Blackstone disclosure).
  const scopeFor = (selectedMode) => {
    if (selectedMode === "selected") {
      const ids = new Set(Object.keys(picked).filter((k) => picked[k]));
      return installs.filter((c) => ids.has(c.component_id || c.id));
    }
    return installs;
  };

  const start = (selectedMode) => {
    const flagged = scopeFor(selectedMode).find(isDataCollection);
    if (flagged) {
      setDcName(flagged.component_name || flagged.component_code || "");
      setBlackstone({ mode: selectedMode });
      return;
    }
    run(selectedMode);
  };

  const run = async (selectedMode) => {
    setBusy(true);
    setError("");
    setMode(selectedMode);
    try {
      const ids = selectedMode === "selected"
        ? Object.keys(picked).filter((k) => picked[k])
        : [];
      if (selectedMode === "selected" && ids.length === 0) {
        setError("Pick at least one component.");
        setBusy(false);
        return;
      }
      const res = await base44.functions.invoke("downloadOwnedComponentsZip", {
        mode: selectedMode,
        component_ids: ids,
      });
      if (res.data?.url) {
        const a = document.createElement("a");
        a.href = res.data.url;
        a.download = "altshiftx_components.zip";
        a.target = "_blank";
        a.click();
        setOpen(false);
      } else if (res.data?.count === 0) {
        setError("Nothing new since your last download.");
      } else {
        setError(res.data?.error || "Could not build the ZIP. Please try again.");
      }
    } catch (e) {
      setError("Could not build the ZIP. Please try again.");
    }
    setBusy(false);
    setMode(null);
  };

  const lastDownload = checkpoint?.last_download_at
    ? new Date(checkpoint.last_download_at).toLocaleString()
    : null;

  return (
    <>
      <Button variant="outline" className="text-sm h-9 gap-2" onClick={() => setOpen(true)}>
        <FileArchive className="w-4 h-4" /> Download ZIP
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); setPicked({}); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-violet-600" /> Export your components
            </DialogTitle>
            <DialogDescription>
              Bundle the full information of the components you own into a ZIP and download it to your device or cloud.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5">
            <button
              onClick={() => start("all")}
              disabled={busy}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors text-left disabled:opacity-60"
            >
              <Package className="w-5 h-5 text-violet-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Download everything</p>
                <p className="text-xs text-slate-500">All {installs.length} components you own</p>
              </div>
              {busy && mode === "all" ? <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> : <Download className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => start("checkpoint")}
              disabled={busy || !lastDownload}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors text-left disabled:opacity-50"
            >
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Only new since last download</p>
                <p className="text-xs text-slate-500">
                  {lastDownload ? `Last download: ${lastDownload}` : "No previous download on record yet"}
                </p>
              </div>
              {busy && mode === "checkpoint" ? <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> : <Download className="w-4 h-4 text-slate-400" />}
            </button>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm font-semibold text-slate-900">Pick a batch</p>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1 mb-2 pr-1">
                {installs.map((c) => {
                  const id = c.component_id || c.id;
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-xs text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!picked[id]}
                        onChange={(e) => setPicked((p) => ({ ...p, [id]: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="font-medium">{c.component_name}</span>
                      {c.component_code && <span className="text-slate-400 font-mono">{c.component_code}</span>}
                    </label>
                  );
                })}
              </div>
              <Button onClick={() => start("selected")} disabled={busy} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-1.5">
                {busy && mode === "selected" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download selected
              </Button>
            </div>

            {error && <p className="text-xs text-red-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {error}</p>}
          </div>
        </DialogContent>
      </Dialog>

      <BlackstoneDisclosureModal
        open={!!blackstone}
        componentName={dcName}
        onCancel={() => setBlackstone(null)}
        onAcknowledge={() => { const m = blackstone?.mode; setBlackstone(null); if (m) run(m); }}
      />
    </>
  );
}