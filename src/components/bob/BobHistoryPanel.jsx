import React, { useState, useEffect } from "react";
import { History, Plus, GitBranch, Loader2, MessageSquare, Clock, Trash2, RotateCcw, FileText, Lock, AlertTriangle, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EsiShareModal from "@/components/bob/EsiShareModal";

// The Wipe Board — a builder's project history. Each BOB conversation is a
// "project" they can jump back into, fork (Spin Off), download as an ESI legal
// record, soft-delete to Trash, restore, or permanently delete (two-step).
export default function BobHistoryPanel({ activeConvId, onOpen, onWipeBoard, onSpinOff, isPaying, onRequestEsi }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(null);
  const [busy, setBusy] = useState(null); // conversation id under a delete/restore op
  const [confirmDelete, setConfirmDelete] = useState(null); // id pending final delete confirm
  const [confirmTrash, setConfirmTrash] = useState(null); // id pending move-to-trash confirm
  const [showTrash, setShowTrash] = useState(false);
  const [esiBusy, setEsiBusy] = useState(null);
  const [shareConv, setShareConv] = useState(null); // conversation whose ESI is being shared

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.agents.listConversations({ agent_name: "bob_builder" });
      setConvos((list || []).slice(0, 50));
    } catch {
      setConvos([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeConvId]);

  const isTrashed = (c) => !!c.metadata?.trashed;
  const active = convos.filter((c) => !isTrashed(c)).slice(0, 25);
  const trashed = convos.filter(isTrashed);

  const handleSpinOff = async (c) => {
    setSpinning(c.id);
    await onSpinOff(c);
    setSpinning(null);
  };

  // Soft-delete → move to Trash (recoverable). Auto-opens the Trash drawer so
  // the builder can see where the project went.
  const trashProject = async (c) => {
    setBusy(c.id);
    await base44.agents.updateConversation(c.id, {
      metadata: { ...(c.metadata || {}), trashed: true, trashed_at: new Date().toISOString() },
    });
    setConfirmTrash(null);
    await load();
    setShowTrash(true);
    setBusy(null);
  };

  const restoreProject = async (c) => {
    setBusy(c.id);
    const md = { ...(c.metadata || {}) };
    delete md.trashed;
    delete md.trashed_at;
    await base44.agents.updateConversation(c.id, { metadata: md });
    await load();
    setBusy(null);
  };

  // Permanent delete — second step after confirmation
  const finalDelete = async (c) => {
    setBusy(c.id);
    await base44.agents.deleteConversation(c.id);
    setConfirmDelete(null);
    await load();
    setBusy(null);
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
      onRequestEsi?.(c);
    }
    setEsiBusy(null);
  };

  const titleFor = (c) =>
    c.metadata?.name?.replace(/^BOB Session /, "Project · ") || "Untitled Project";

  const timeFor = (c) => {
    const d = c.updated_date || c.created_date;
    if (!d) return "";
    return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-violet-400" /> Wipe Board · History
        </span>
        <button
          onClick={onWipeBoard}
          title="Start a fresh project"
          className="flex items-center gap-1 text-[10px] font-bold text-[#0A0A0C] bg-gradient-to-r from-violet-300 to-violet-500 hover:opacity-90 px-2 py-1 rounded-lg"
        >
          <Plus className="w-3 h-3" /> Wipe Board
        </button>
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          </div>
        ) : active.length === 0 ? (
          <p className="text-[11px] text-slate-500 px-4 py-5 text-center leading-relaxed">
            No projects yet. Hit <span className="text-violet-400 font-semibold">Wipe Board</span> to start your first one.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {active.map((c) => (
              <div
                key={c.id}
                className={`px-3 py-2.5 transition-colors ${c.id === activeConvId ? "bg-violet-900/30" : "hover:bg-slate-700/40"}`}
              >
                <button onClick={() => onOpen(c)} className="w-full text-left">
                  <p className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    {titleFor(c)}
                  </p>
                  <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {timeFor(c)}
                  </p>
                </button>
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
                    onClick={() => setShareConv(c)}
                    title="Share ESI record to Google Drive, Dropbox, OneDrive & more"
                    className="flex items-center gap-1 text-[10px] font-semibold text-sky-300 hover:text-white bg-sky-900/30 hover:bg-sky-800 border border-sky-700/50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                  {confirmTrash === c.id ? (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => trashProject(c)}
                        disabled={busy === c.id}
                        title="Move to Trash (recoverable)"
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-1 rounded-md transition-colors"
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
                  ) : (
                    <button
                      onClick={() => setConfirmTrash(c.id)}
                      title="Move to Trash (recoverable)"
                      className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-600 border border-slate-600/50 px-2 py-1 rounded-md transition-colors ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {shareConv && <EsiShareModal conversation={shareConv} onClose={() => setShareConv(null)} />}
    </div>
  );
}