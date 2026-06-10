import React, { useState, useEffect } from "react";
import { Inbox, Loader2, Send, Sparkles, CheckCircle2, RefreshCw, Archive, Trash2, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";

const sentimentStyle = {
  positive: "bg-emerald-900/50 text-emerald-300",
  neutral: "bg-slate-700/50 text-slate-300",
  negative: "bg-red-900/50 text-red-300",
  urgent: "bg-amber-900/50 text-amber-300",
  unknown: "bg-slate-700/50 text-slate-400",
};

/**
 * InboxPanel — incoming replies with AI summary, sentiment, and a suggested
 * reply the admin can edit and send. Auto-acknowledged messages are flagged.
 */
export default function InboxPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.InboundMessage.list("-received_at", 100).catch(() => []);
    setMessages(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visibleMessages = messages.filter((m) =>
    showArchived ? m.status === "archived" : m.status !== "archived"
  );

  const archiveMessage = async (e, m) => {
    e.stopPropagation();
    const next = m.status === "archived" ? "read" : "archived";
    await base44.entities.InboundMessage.update(m.id, { status: next }).catch(() => {});
    if (active?.id === m.id) setActive(null);
    load();
  };

  const deleteMessage = async (e, m) => {
    e.stopPropagation();
    if (!window.confirm("Delete this message permanently?")) return;
    await base44.entities.InboundMessage.delete(m.id).catch(() => {});
    if (active?.id === m.id) setActive(null);
    load();
  };

  const [campaignName, setCampaignName] = useState("");

  const openMessage = async (m) => {
    setActive(m);
    setDraft(m.ai_suggested_reply || "");
    setCampaignName("");
    // Campaign recognition — if this reply is linked to a campaign, look up its subject.
    if (m.in_reply_to_campaign_id) {
      base44.entities.EmailCampaign.get(m.in_reply_to_campaign_id)
        .then((c) => setCampaignName(c?.subject || ""))
        .catch(() => {});
    }
    if (m.status === "unread") {
      await base44.entities.InboundMessage.update(m.id, { status: "read" });
      load();
    }
  };

  const sendReply = async () => {
    if (!active || !draft.trim()) return;
    setSending(true);
    await base44.functions.invoke("sendMailRoomReply", { messageId: active.id, body: draft }).catch(() => {});
    setSending(false);
    setActive(null);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>;

  return (
    <div className="grid md:grid-cols-5 gap-4">
      {/* List */}
      <div className="md:col-span-2 space-y-1.5 max-h-[560px] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-orange-200 flex items-center gap-1.5"><Inbox className="w-3.5 h-3.5 text-orange-400" /> {showArchived ? "Archived" : "Inbox"} ({visibleMessages.length})</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowArchived((v) => !v)} title={showArchived ? "Back to inbox" : "View archived"}
              className={`p-1 rounded ${showArchived ? "text-orange-300 bg-[#2a1d16]" : "text-orange-300/60 hover:text-white"}`}>
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button onClick={load} className="text-orange-300 hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {visibleMessages.length === 0 && <p className="text-xs text-orange-200/40 text-center py-8">{showArchived ? "Nothing archived." : "No replies yet. They'll appear here once recipients respond."}</p>}
        {visibleMessages.map((m) => (
          <div key={m.id} onClick={() => openMessage(m)}
            className={`w-full text-left bg-[#1a120d] border rounded-lg p-3 transition-colors cursor-pointer ${active?.id === m.id ? "border-orange-500" : "border-orange-900/30 hover:border-orange-700"}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm text-orange-50 truncate">{m.from_name || m.from_email}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${sentimentStyle[m.sentiment] || sentimentStyle.unknown}`}>{m.sentiment}</span>
            </div>
            <p className="text-[11px] text-orange-200/60 truncate">{m.subject}</p>
            <p className="text-[10px] text-orange-200/40 truncate mt-0.5">{m.ai_summary || m.body_text?.slice(0, 60)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {m.status === "unread" && <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full">new</span>}
              {m.auto_acknowledged && <span className="text-[9px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> auto-ack'd</span>}
              {m.status === "replied" && <span className="text-[9px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded-full">replied</span>}
              <div className="flex-1" />
              <button onClick={(e) => archiveMessage(e, m)} title={m.status === "archived" ? "Unarchive" : "Archive"} className="text-orange-300/50 hover:text-orange-200 p-0.5"><Archive className="w-3 h-3" /></button>
              <button onClick={(e) => deleteMessage(e, m)} title="Delete" className="text-orange-300/50 hover:text-red-400 p-0.5"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="md:col-span-3">
        {!active ? (
          <div className="bg-[#1a120d] border border-orange-900/30 rounded-xl h-full flex items-center justify-center text-orange-200/40 text-sm py-16">
            Select a message to read &amp; reply
          </div>
        ) : (
          <div className="bg-[#1a120d] border border-orange-900/30 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-orange-50">{active.subject}</p>
                <p className="text-[11px] text-orange-200/50">From {active.from_name || active.from_email} &lt;{active.from_email}&gt;</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => archiveMessage(e, active)} title="Archive" className="text-orange-300/60 hover:text-orange-200 p-1 rounded hover:bg-[#3a2a24]"><Archive className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => deleteMessage(e, active)} title="Delete" className="text-orange-300/60 hover:text-red-400 p-1 rounded hover:bg-[#3a2a24]"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {campaignName && (
              <div className="flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-900/20 border border-blue-800/40 rounded-lg px-2.5 py-1.5">
                <Mail className="w-3 h-3" /> Reply to campaign: <span className="font-semibold truncate">{campaignName}</span>
              </div>
            )}
            {active.ai_intent && (
              <div className="flex items-center gap-1.5 text-[11px] text-orange-300">
                <Sparkles className="w-3 h-3" /> Intent: {active.ai_intent}
              </div>
            )}
            <div className="bg-[#241812] rounded-lg p-3 max-h-44 overflow-y-auto">
              <p className="text-sm text-orange-100 whitespace-pre-wrap">{active.body_text}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-orange-200 mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-orange-400" /> AI-suggested reply (edit before sending)</p>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8}
                className="w-full bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500 resize-none" />
            </div>

            <button onClick={sendReply} disabled={sending || !draft.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}