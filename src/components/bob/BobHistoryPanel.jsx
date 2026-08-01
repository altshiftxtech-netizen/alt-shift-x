import React, { useState, useEffect, useRef } from "react";
import { History, Plus, GitBranch, Loader2, MessageSquare, Clock, Trash2, RotateCcw, FileText, Lock, AlertTriangle, Share2, Mail, Archive, Eraser, RefreshCw, Pencil, Check, X, Download, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EsiShareModal from "@/components/bob/EsiShareModal";
import RecoverProjectButton from "@/components/bob/RecoverProjectButton";
import { downloadRecoveryFile } from "@/lib/projectRecovery";
import { loadMetaMap, renameConversation, trashConversation, restoreConversation, clearConversation } from "@/lib/conversationMeta";
import { ACTIVE_LIMIT, HARD_CAP, HISTORY_PAGE } from "@/lib/bobHistoryLimits";

const AGENT = "bob_builder";

// The Wipe Board — a builder's project history. Each BOB conversation is a
// "project" they can jump back into, fork (Spin Off), download as an ESI legal
// record, soft-delete to Trash, restore, or permanently delete (two-step).
export default function BobHistoryPanel({ activeConvId, onOpen, onWipeBoard, onSpinOff, refreshSignal }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(null);
  const [busy, setBusy] = useState(null); // conversation id under a delete/restore op
  const [confirmDelete, setConfirmDelete] = useState(null); // id pending final delete confirm
  const [confirmTrash, setConfirmTrash] = useState(null); // id pending move-to-trash confirm
  const [showTrash, setShowTrash] = useState(false);
  const [esiBusy, setEsiBusy] = useState(null);
  const [shareConv, setShareConv] = useState(null); // conversation whose ESI is being shared
  const [zipBusy, setZipBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false); // clear-history confirm state
  const [clearing, setClearing] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false); // wipe-board confirm state
  const [editing, setEditing] = useState(null); // conversation id whose title is being edited
  const [draftTitle, setDraftTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [jsonBusy, setJsonBusy] = useState(null); // conversation id whose recovery file is downloading
  const [showArchived, setShowArchived] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // expanded by default so history is visible
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const metaMap = await loadMetaMap(AGENT);
      // Hard cap: fetch only the most recent HISTORY_PAGE conversations. The old
      // pagination loop (up to 2000) re-ran after every turn and stalled the
      // main thread — the root cause of replies vanishing and stale chats
      // appearing. A bounded single page keeps the board fast and complete.
      const all = await base44.agents.listConversations({
        q: { agent_name: AGENT },
        limit: HISTORY_PAGE,
        sort: "-updated_date",
      }) || [];

      // Fallback: if the SDK didn't return a conversation that ConversationMeta
      // knows about, build a stub from the meta record so the project still
      // shows on the board. The full conversation is loaded on-demand when the
      // user clicks it (openProject calls getConversation). Without this, any
      // SDK failure or empty result wipes the entire history even though the
      // metadata records exist.
      const sdkIds = new Set(all.map((c) => c.id));
      const metaOnly = Object.values(metaMap)
        .filter((m) => !sdkIds.has(m.conversation_id))
        .map((m) => ({
          id: m.conversation_id,
          metadata: {
            name: m.title || "New Project",
            trashed: !!m.trashed,
            cleared: !!m.cleared,
          },
          updated_date: m.updated_date || m.created_date,
          created_date: m.created_date,
        }));
      const combined = [...all, ...metaOnly];

      // The agents SDK exposes no updateConversation — rename/trash/clear live in
      // our ConversationMeta entity. Merge that state onto each conversation so
      // the rest of the panel can read it off c.metadata as before.
      const merged = combined.map((c) => {
        const m = metaMap[c.id];
        if (!m) return c;
        return {
          ...c,
          metadata: {
            ...(c.metadata || {}),
            ...(m.title ? { name: m.title } : {}),
            trashed: !!m.trashed,
            cleared: !!m.cleared,
          },
        };
      });
      // Sort by most recently updated so meta-only stubs interleave correctly.
      merged.sort((a, b) => new Date(b.updated_date || b.created_date || 0) - new Date(a.updated_date || a.created_date || 0));
      setConvos(merged.filter((c) => !c.metadata?.cleared));
    } catch (err) {
      console.error("[BobHistoryPanel] load failed:", err);
      setLoadError(true);
    }
    setLoading(false);
  };

  // Track load state in refs so the retry timer always reads the CURRENT values,
  // not stale closure captures from the initial render (where loading=true and
  // convos=[], which made the old retry condition always false).
  const loadingRef = useRef(true);
  const convosRef = useRef([]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { convosRef.current = convos; }, [convos]);

  useEffect(() => {
    load();
  }, [activeConvId, refreshSignal]);

  // Auto-retry: the initial mount load can fail if the auth token isn't fully
  // initialized yet (common on fresh page loads behind ProtectedRoute). Retry
  // up to 3 times with increasing delays so the panel always eventually loads.
  const retryCountRef = useRef(0);
  useEffect(() => {
    const timers = [];
    const delays = [1500, 3000, 5000];
    for (const delay of delays) {
      const t = setTimeout(() => {
        if (convosRef.current.length === 0 && !loadingRef.current && retryCountRef.current < delays.length) {
          retryCountRef.current += 1;
          load();
        }
      }, delay);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const isTrashed = (c) => !!c.metadata?.trashed;
  // Show ALL non-trashed sessions — even ones still named "New Project".
  // Previously, unnamed sessions were hidden, which made real sessions with
  // messages vanish from the board if the auto-title call failed.
  const live = convos.filter((c) => !isTrashed(c));
  const active = live.slice(0, ACTIVE_LIMIT);                 // top 10
  const archived = live.slice(ACTIVE_LIMIT, HARD_CAP);        // 11–20, collapsed
  const overCap = live.slice(HARD_CAP);                       // beyond 20 → download-or-lose
  const trashed = convos.filter(isTrashed);

  // Download a single project's JSON recovery file.
  const handleSaveFile = async (c) => {
    setJsonBusy(c.id);
    try {
      await downloadRecoveryFile(c);
    } catch {
      // recovery export is free — nothing to fall back to
    }
    setJsonBusy(null);
  };

  // Over-cap projects: download the recovery file, then clear it out for good.
  const downloadAndRelease = async (c) => {
    setBusy(c.id);
    try {
      await downloadRecoveryFile(c);
      await clearConversation(c.id, AGENT);
      await load();
    } catch {
      // swallow
    } finally {
      setBusy(null);
    }
  };

  const handleSpinOff = async (c) => {
    setSpinning(c.id);
    await onSpinOff(c);
    setSpinning(null);
  };

  // Soft-delete → move to Trash (recoverable). Auto-opens the Trash drawer so
  // the builder can see where the project went. Also auto-emails the ESI legal
  // record to the builder so they keep a copy of the wiped project.
  const trashProject = async (c) => {
    setBusy(c.id);
    try {
      await trashConversation(c.id, AGENT);
      // Fire-and-forget: email the ESI record to the builder's own address.
      base44.functions.invoke("emailEsiRecord", { conversationId: c.id }).catch(() => {});
      await load();
      setShowTrash(true);
    } catch {
      // swallow — never leave the row stuck spinning
    } finally {
      setConfirmTrash(null);
      setBusy(null);
    }
  };

  const restoreProject = async (c) => {
    setBusy(c.id);
    try {
      await restoreConversation(c.id, AGENT);
      await load();
    } catch {
      // swallow
    } finally {
      setBusy(null);
    }
  };

  // Permanent delete — second step after confirmation. The agents SDK has no
  // hard-delete, so we flag the project `cleared`; load() filters it out for good.
  const finalDelete = async (c) => {
    setBusy(c.id);
    try {
      await clearConversation(c.id, AGENT);
      await load();
    } catch {
      // swallow
    } finally {
      setConfirmDelete(null);
      setBusy(null);
    }
  };

  const handleEsi = async (c) => {
    setEsiBusy(c.id);
    try {
      const res = await base44.functions.invoke("exportEsiRecord", { conversationId: c.id });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ESI_Record_${(c.metadata?.name || "project").replace(/[^a-z0-9]+/gi, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ESI export is free — nothing to fall back to.
    }
    setEsiBusy(null);
  };

  // Download every active project's ESI record as a single ZIP.
  const downloadAllZip = async () => {
    setZipBusy(true);
    try {
      const res = await base44.functions.invoke(
        "exportAllEsiRecords",
        { conversationIds: active.map((c) => c.id) },
        { responseType: "blob" }
      );
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ESI_Records_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ESI export is free — nothing to fall back to.
    }
    setZipBusy(false);
  };

  // Clear History — move ALL active projects to Trash (recoverable). Also emails
  // each project's ESI record to the builder so nothing is lost.
  const clearHistory = async () => {
    setClearing(true);
    try {
      for (const c of active) {
        await trashConversation(c.id, AGENT).catch(() => {});
        base44.functions.invoke("emailEsiRecord", { conversationId: c.id }).catch(() => {});
      }
      await load();
      setShowTrash(true);
    } finally {
      setConfirmClear(false);
      setClearing(false);
    }
  };

  const startEdit = (c) => {
    setEditing(c.id);
    setDraftTitle(titleFor(c) === "New Project" ? "" : titleFor(c));
  };

  const saveTitle = async (c) => {
    const name = draftTitle.trim();
    if (!name) { setEditing(null); return; }
    setSavingTitle(true);
    try {
      await renameConversation(c.id, AGENT, name);
      await load();
    } catch {
      // swallow
    } finally {
      setSavingTitle(false);
      setEditing(null);
    }
  };

  const titleFor = (c) => {
    const n = c.metadata?.name;
    if (!n || n === "New Project") return "New Project";
    // Legacy sessions used a "BOB Session <time>" name — show them cleanly.
    if (/^BOB Session/.test(n)) return n.replace(/^BOB Session Spin-Off /, "Spin-Off · ").replace(/^BOB Session /, "Project · ");
    return n;
  };

  const timeFor = (c) => {
    const d = c.updated_date || c.created_date;
    if (!d) return "";
    return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Show project history" : "Hide project history"}
            className="text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-violet-400 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
            <History className="w-3.5 h-3.5 text-violet-400" /> Wipe Board · History
            {live.length > 0 && <span className="text-[9px] font-semibold text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded-full">{live.length}</span>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); load(); }} title="Refresh project list" className="text-slate-500 hover:text-violet-300 transition-colors ml-auto mr-2">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
          {confirmWipe ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setConfirmWipe(false); onWipeBoard(); }}
                title="Start a fresh project"
                className="flex items-center gap-1 text-[10px] font-bold text-[#0A0A0C] bg-gradient-to-r from-violet-300 to-violet-500 hover:opacity-90 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3 h-3" /> Confirm Wipe
              </button>
              <button onClick={() => setConfirmWipe(false)} className="text-[10px] font-semibold text-slate-400 hover:text-white px-1.5 py-1 rounded-md">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmWipe(true)}
              title="Start a fresh project"
              className="flex items-center gap-1 text-[10px] font-bold text-[#0A0A0C] bg-gradient-to-r from-violet-300 to-violet-500 hover:opacity-90 px-2 py-1 rounded-lg"
            >
              <Plus className="w-3 h-3" /> Wipe Board
            </button>
          )}
        </div>
        {!collapsed && active.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={downloadAllZip}
              disabled={zipBusy}
              title="Download all ESI records as one ZIP file"
              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/30 hover:bg-emerald-800 border border-emerald-700/50 px-2 py-1 rounded-md transition-colors"
            >
              {zipBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
              Download All (ZIP)
            </button>
            <RecoverProjectButton onRecovered={async (conv) => { await load(); onOpen(conv); }} />
            {confirmClear ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={clearHistory}
                  disabled={clearing}
                  title="Move all projects to Trash"
                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-1 rounded-md transition-colors"
                >
                  {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eraser className="w-3 h-3" />}
                  Clear All
                </button>
                <button onClick={() => setConfirmClear(false)} className="text-[10px] font-semibold text-slate-400 hover:text-white px-1.5 py-1 rounded-md">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                title="Move all projects to Trash (recoverable)"
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-600 border border-slate-600/50 px-2 py-1 rounded-md transition-colors ml-auto"
              >
                <Eraser className="w-3 h-3" /> Clear History
              </button>
            )}
          </div>
        )}
        {!collapsed && confirmClear && (
          <p className="text-[9px] text-slate-500 flex items-center gap-1">
            <Mail className="w-2.5 h-2.5" /> All projects move to Trash; each ESI record is emailed to you.
          </p>
        )}
      </div>

      {!collapsed && (
      <>
      <div className="max-h-[340px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          </div>
        ) : active.length === 0 ? (
          <div className="px-4 py-5 text-center space-y-2.5">
            {loadError ? (
              <>
                <p className="text-[11px] text-amber-400 leading-relaxed">
                  Couldn't load history. Check your connection and retry.
                </p>
                <button
                  onClick={load}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-300 hover:text-white border border-violet-700 hover:border-violet-500 bg-violet-900/30 px-2.5 py-1.5 rounded-md transition-colors mx-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </>
            ) : (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                No projects yet. Hit <span className="text-violet-400 font-semibold">Wipe Board</span> to start your first one.
              </p>
            )}
            <div className="flex items-center justify-center">
              <RecoverProjectButton onRecovered={async (conv) => { await load(); onOpen(conv); }} />
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {active.map((c) => (
              <div
                key={c.id}
                className={`px-3 py-2.5 transition-colors ${c.id === activeConvId ? "bg-violet-900/30" : "hover:bg-slate-700/40"}`}
              >
                {editing === c.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(c); if (e.key === "Escape") setEditing(null); }}
                      placeholder="Project title…"
                      className="flex-1 min-w-0 text-[11px] font-semibold text-slate-100 bg-slate-900 border border-violet-600 rounded-md px-2 py-1 outline-none"
                    />
                    <button onClick={() => saveTitle(c)} disabled={savingTitle} title="Save" className="text-emerald-400 hover:text-emerald-300 p-1">
                      {savingTitle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditing(null)} title="Cancel" className="text-slate-500 hover:text-white p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => onOpen(c)} className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-violet-400 flex-shrink-0" />
                        {titleFor(c)}
                      </p>
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {timeFor(c)}
                      </p>
                    </button>
                    <button onClick={() => startEdit(c)} title="Rename project" className="text-slate-500 hover:text-violet-300 p-1 flex-shrink-0">
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleSpinOff(c)}
                    disabled={spinning === c.id}
                    title="Fork this project into a ready-to-go spin-off"
                    className="flex items-center gap-1 text-[10px] font-semibold text-violet-300 hover:text-white bg-violet-900/40 hover:bg-violet-800 border border-violet-700/50 px-2 py-1 rounded-md transition-colors"
                  >
                    {spinning === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitBranch className="w-3 h-3" />}
                    Spin Off
                  </button>
                  <button
                    onClick={() => handleEsi(c)}
                    disabled={esiBusy === c.id}
                    title="Download ESI legal record (PDF)"
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/30 hover:bg-emerald-800 border border-emerald-700/50 px-2 py-1 rounded-md transition-colors"
                  >
                    {esiBusy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    ESI Record
                  </button>
                  <button
                    onClick={() => handleSaveFile(c)}
                    disabled={jsonBusy === c.id}
                    title="Save a recovery file (.json) you can re-import later"
                    className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-white bg-amber-900/30 hover:bg-amber-800 border border-amber-700/50 px-2 py-1 rounded-md transition-colors"
                  >
                    {jsonBusy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                    Save File
                  </button>
                  <button
                    onClick={() => setShareConv(c)}
                    title="Share ESI record to Google Drive, Dropbox, OneDrive & more"
                    className="flex items-center gap-1 text-[10px] font-semibold text-sky-300 hover:text-white bg-sky-900/30 hover:bg-sky-800 border border-sky-700/50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                  <button
                    onClick={() => setConfirmTrash(confirmTrash === c.id ? null : c.id)}
                    title="Move to Trash (recoverable)"
                    className={`flex items-center gap-1 text-[10px] font-semibold border px-2 py-1 rounded-md transition-colors ml-auto ${confirmTrash === c.id ? "text-white bg-red-700 border-red-600" : "text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-600 border-slate-600/50"}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>

                {/* Move-to-Trash confirm — its own full-width row below the
                    actions so it never overlaps buttons or the next card. */}
                {confirmTrash === c.id && (
                  <div className="mt-2 bg-red-950/40 border border-red-800/40 rounded-md p-2.5 space-y-2">
                    <p className="text-[10px] text-slate-300 font-semibold">Move this project to Trash?</p>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" /> ESI record will be emailed to you. Recoverable from Trash.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => trashProject(c)}
                        disabled={busy === c.id}
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {busy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Move to Trash
                      </button>
                      <button
                        onClick={() => setConfirmTrash(null)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Over-cap projects — must be downloaded or released (download-or-lose).
          Anything beyond the 20-project hard cap lands here. */}
      {overCap.length > 0 && (
        <div className="border-t border-amber-800/60 bg-amber-950/30">
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> {overCap.length} project{overCap.length > 1 ? "s" : ""} over the {HARD_CAP}-project limit
            </p>
            <p className="text-[9px] text-amber-400/80 mt-0.5">
              Save each as a recovery file to keep it. Releasing removes it from the board.
            </p>
          </div>
          <div className="divide-y divide-amber-900/40 max-h-[180px] overflow-y-auto">
            {overCap.map((c) => (
              <div key={c.id} className="px-3 py-2 flex items-center gap-2">
                <p className="text-[11px] font-semibold text-slate-300 truncate flex-1">{titleFor(c)}</p>
                <button
                  onClick={() => downloadAndRelease(c)}
                  disabled={busy === c.id}
                  title="Download recovery file, then remove from board"
                  className="flex items-center gap-1 text-[10px] font-bold text-[#1a1205] bg-amber-400 hover:bg-amber-300 px-2 py-1 rounded-md transition-colors flex-shrink-0"
                >
                  {busy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Save & Release
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived drawer — live projects 11–20, kept but collapsed. */}
      {archived.length > 0 && (
        <div className="border-t border-slate-700">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Archive className="w-3 h-3" /> Archived ({archived.length})
            </span>
            <span>{showArchived ? "Hide" : "Show"}</span>
          </button>
          {showArchived && (
            <div className="divide-y divide-slate-700/60 max-h-[220px] overflow-y-auto bg-slate-900/40">
              {archived.map((c) => (
                <div key={c.id} className="px-3 py-2.5 flex items-center gap-2">
                  <button onClick={() => onOpen(c)} className="flex-1 min-w-0 text-left">
                    <p className="text-[11px] font-semibold text-slate-300 truncate">{titleFor(c)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {timeFor(c)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleSaveFile(c)}
                    disabled={jsonBusy === c.id}
                    title="Save recovery file (.json)"
                    className="text-amber-300 hover:text-white p-1 flex-shrink-0"
                  >
                    {jsonBusy === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trash drawer */}
      {trashed.length > 0 && (
        <div className="border-t border-slate-700">
          <button
            onClick={() => setShowTrash((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-3 h-3" /> Trash ({trashed.length})
            </span>
            <span>{showTrash ? "Hide" : "Show"}</span>
          </button>
          {showTrash && (
            <div className="divide-y divide-slate-700/60 max-h-[220px] overflow-y-auto bg-slate-900/40">
              {trashed.map((c) => (
                <div key={c.id} className="px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-slate-400 truncate line-through">{titleFor(c)}</p>
                  {confirmDelete === c.id ? (
                    <div className="mt-1.5 bg-red-950/50 border border-red-800/50 rounded-md p-2">
                      <p className="text-[9px] text-red-300 flex items-center gap-1 mb-1.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Permanently delete? This cannot be undone.
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => finalDelete(c)}
                          disabled={busy === c.id}
                          className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-1 rounded-md"
                        >
                          {busy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        onClick={() => restoreProject(c)}
                        disabled={busy === c.id}
                        className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/30 hover:bg-emerald-800 border border-emerald-700/50 px-2 py-1 rounded-md transition-colors"
                      >
                        {busy === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        Restore
                      </button>
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-800 border border-red-800/50 px-2 py-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Forever
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {shareConv && <EsiShareModal conversation={shareConv} onClose={() => setShareConv(null)} />}
    </div>
  );
}