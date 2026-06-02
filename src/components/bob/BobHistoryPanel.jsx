import React, { useState, useEffect } from "react";
import { History, Plus, GitBranch, Loader2, MessageSquare, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

// The Wipe Board — a builder's project history. Each BOB conversation is a
// "project" they can jump back into, fork (Spin Off), or start fresh.
export default function BobHistoryPanel({ activeConvId, onOpen, onWipeBoard, onSpinOff }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.agents.listConversations({ agent_name: "bob_builder" });
      setConvos((list || []).slice(0, 25));
    } catch {
      setConvos([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeConvId]);

  const handleSpinOff = async (c) => {
    setSpinning(c.id);
    await onSpinOff(c);
    setSpinning(null);
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

      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          </div>
        ) : convos.length === 0 ? (
          <p className="text-[11px] text-slate-500 px-4 py-5 text-center leading-relaxed">
            No projects yet. Hit <span className="text-violet-400 font-semibold">Wipe Board</span> to start your first one.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {convos.map((c) => (
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
                <button
                  onClick={() => handleSpinOff(c)}
                  disabled={spinning === c.id}
                  title="Fork this project into a ready-to-go spin-off"
                  className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-violet-300 hover:text-white bg-violet-900/40 hover:bg-violet-800 border border-violet-700/50 px-2 py-1 rounded-md transition-colors"
                >
                  {spinning === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitBranch className="w-3 h-3" />}
                  Spin Off
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}