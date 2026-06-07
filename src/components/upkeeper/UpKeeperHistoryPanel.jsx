import React, { useState, useEffect } from "react";
import { History, Plus, Loader2, MessageSquare, Clock, Trash2, FileText, CheckCircle2, Mail, Archive, AlertTriangle, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

// The UpKeeper's session history — mirrors BOB's Wipe Board. Each maintenance
// session can be reopened, emailed as a Maintenance Event Log (ESI), or deleted
// (two-step trash confirm). The whole history can be downloaded as a ZIP of PDFs
// or cleared entirely (two-step confirm).
export default function UpKeeperHistoryPanel({ activeConvId, onOpen, onWipeBoard }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportBusy, setReportBusy] = useState(null);
  const [reportDone, setReportDone] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(null);
  const [zipBusy, setZipBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.agents.listConversations({ agent_name: "the_upkeeper" });
      // The agents SDK has no hard-delete, so deleted sessions are flagged
      // trashed in metadata and filtered out here.
      setConvos((list || []).filter((c) => !c.metadata?.trashed).slice(0, 25));
    } catch {
      setConvos([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeConvId]);

  const titleFor = (c) => c.metadata?.name || "Maintenance Session";
  const timeFor = (c) => {
    const d = c.updated_date || c.created_date;
    return d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  };

  // Generate the Maintenance Event Log (ESI) and email it to altshiftx.tech@gmail.com.
  const sendReport = async (c) => {
    setReportBusy(c.id);
    setReportDone(null);
    await base44.functions.invoke("emailMaintenanceReport", { conversationId: c.id, alsoEmailMe: true });
    setReportBusy(null);
    setReportDone(c.id);
    setTimeout(() => setReportDone(null), 4000);
  };

  // Download every session's Maintenance Event Log as a single ZIP of PDFs.
  const downloadAll = async () => {
    if (zipBusy || convos.length === 0) return;
    setZipBusy(true);
    try {
      const res = await base44.functions.invoke("exportAllMaintenanceLogs", {}, { responseType: "blob" });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Maintenance_Logs_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("download all failed", e);
    }
    setZipBusy(false);
  };

  const deleteSession = async (c) => {
    setBusy(c.id);
    await base44.agents.updateConversation(c.id, {
      metadata: { ...(c.metadata || {}), trashed: true, trashed_at: new Date().toISOString() },
    });
    setConfirmDelete(null);
    await load();
    setBusy(null);
  };

  // Two-step clear: flags every session trashed so they drop off the history.
  const clearHistory = async () => {
    setClearing(true);
    for (const c of convos) {
      await base44.agents.updateConversation(c.id, {
        metadata: { ...(c.metadata || {}), trashed: true, trashed_at: new Date().toISOString() },
      });
    }
    setConfirmClear(false);
    await load();
    setClearing(false);
    onWipeBoard();
  };

  return (
    <div className="bg-[#241812] border border-orange-900/40 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-orange-900/40 flex items-center justify-between">
        <span className="text-xs font-bold text-orange-100 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-orange-400" /> Session History
        </span>
        <button onClick={onWipeBoard} title="Start a fresh session"
          className="flex items-center gap-1 text-[10px] font-bold text-[#0A0A0C] bg-gradient-to-r from-orange-200 to-orange-400 hover:opacity-90 px-2 py-1 rounded-lg">
          <Plus className="w-3 h-3" /> Wipe Board
        </button>
      </div>

      {/* History-wide actions: Download all (ZIP) + Clear history (two-step) */}
      <div className="px-3 py-2 border-b border-orange-900/40 flex items-center gap-1.5">
        <button onClick={downloadAll} disabled={zipBusy || convos.length === 0}
          title="Download all sessions as a ZIP of Maintenance Event Logs (PDF)"
          className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-100 bg-[#3a2a24] hover:bg-[#4a352c] border border-orange-900/40 hover:border-orange-500 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50">
          {zipBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {zipBusy ? "Zipping…" : "Download All (ZIP)"}
        </button>
        {confirmClear ? (
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={clearHistory} disabled={clearing}
              className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-1.5 rounded-md transition-colors">
              {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />} Confirm Clear
            </button>
            <button onClick={() => setConfirmClear(false)} className="text-[10px] font-semibold text-orange-200/60 hover:text-white px-1.5 py-1.5">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} disabled={convos.length === 0}
            title="Permanently delete all sessions"
            className="flex items-center gap-1.5 text-[10px] font-semibold text-red-300 hover:text-white bg-red-900/20 hover:bg-red-800 border border-red-800/40 px-2.5 py-1.5 rounded-md transition-colors ml-auto disabled:opacity-50">
            <Archive className="w-3 h-3" /> Clear History
          </button>
        )}
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-orange-500" /></div>
        ) : convos.length === 0 ? (
          <p className="text-[11px] text-orange-200/50 px-4 py-5 text-center leading-relaxed">
            No sessions yet. Hit <span className="text-orange-300 font-semibold">Wipe Board</span> to start one.
          </p>
        ) : (
          <div className="divide-y divide-orange-900/30">
            {convos.map((c) => (
              <div key={c.id} className={`px-3 py-2.5 transition-colors ${c.id === activeConvId ? "bg-orange-900/30" : "hover:bg-[#3a2a24]/50"}`}>
                <button onClick={() => onOpen(c)} className="w-full text-left">
                  <p className="text-[11px] font-semibold text-orange-100 truncate flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-orange-400 flex-shrink-0" /> {titleFor(c)}
                  </p>
                  <p className="text-[9px] text-orange-200/50 flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {timeFor(c)}
                  </p>
                </button>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <button onClick={() => sendReport(c)} disabled={reportBusy === c.id}
                    title="Generate a Maintenance Event Log (ESI) and email it to the maintenance inbox"
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/30 hover:bg-emerald-800 border border-emerald-700/50 px-2 py-1 rounded-md transition-colors">
                    {reportBusy === c.id ? <Loader2 className="w-3 h-3 animate-spin" />
                      : reportDone === c.id ? <CheckCircle2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {reportDone === c.id ? "Emailed" : "Maintenance Report"}
                  </button>
                  {confirmDelete === c.id ? (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={() => deleteSession(c)} disabled={busy === c.id}
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-1 rounded-md transition-colors">
                        {busy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Confirm Delete
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] font-semibold text-orange-200/60 hover:text-white px-1.5 py-1 rounded-md">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(c.id)} title="Move session to trash (delete)"
                      className="flex items-center gap-1 text-[10px] font-semibold text-orange-200/50 hover:text-white bg-[#3a2a24] hover:bg-red-800 border border-orange-900/40 px-2 py-1 rounded-md transition-colors ml-auto">
                      <Trash2 className="w-3 h-3" /> Trash
                    </button>
                  )}
                  {reportDone === c.id && (
                    <p className="text-[9px] text-emerald-400/80 w-full flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> Sent to altshiftx.tech@gmail.com</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}