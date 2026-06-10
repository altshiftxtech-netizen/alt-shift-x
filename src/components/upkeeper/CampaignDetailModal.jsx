import React from "react";
import { X, CheckCircle2, XCircle, Clock, Users, Calendar, Eye, Paperclip, CalendarClock } from "lucide-react";

const STATUS_STYLE = {
  draft: "bg-slate-700/40 text-slate-300",
  sending: "bg-amber-900/40 text-amber-300",
  sent: "bg-emerald-900/40 text-emerald-300",
  failed: "bg-red-900/40 text-red-300",
};

// Read-only detail view for a sent/draft campaign — opened from the history list.
export default function CampaignDetailModal({ campaign, onClose }) {
  if (!campaign) return null;
  const c = campaign;
  const Icon = c.status === "sent" ? CheckCircle2 : c.status === "failed" ? XCircle : Clock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#241812] border border-orange-900/40 rounded-2xl shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-orange-900/40 sticky top-0 bg-[#241812]">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-orange-50">{c.subject}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${STATUS_STYLE[c.status] || STATUS_STYLE.draft}`}>
                <Icon className="w-3 h-3" /> {c.status}
              </span>
              <span className="text-[11px] text-orange-200/50 flex items-center gap-1 capitalize">
                <Users className="w-3 h-3" /> {c.audience?.replace("_", " ")}
              </span>
              {c.sent_at && (
                <span className="text-[11px] text-orange-200/50 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(c.sent_at).toLocaleString()}
                </span>
              )}
              {c.status === "scheduled" && c.scheduled_for && (
                <span className="text-[11px] text-blue-300 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" /> Scheduled {new Date(c.scheduled_for).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-orange-300 hover:text-white p-1 rounded-lg hover:bg-[#3a2a24] shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#1a120d] border border-orange-900/30 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-orange-50">{c.recipient_count || 0}</p>
              <p className="text-[10px] text-orange-200/50">Recipients</p>
            </div>
            <div className="bg-[#1a120d] border border-orange-900/30 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-emerald-400">{c.sent_count || 0}</p>
              <p className="text-[10px] text-orange-200/50">Sent</p>
            </div>
            <div className="bg-[#1a120d] border border-orange-900/30 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-red-400">{c.failed_count || 0}</p>
              <p className="text-[10px] text-orange-200/50">Failed</p>
            </div>
            <div className="bg-[#1a120d] border border-orange-900/30 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-blue-300 flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" />{c.open_count || 0}</p>
              <p className="text-[10px] text-orange-200/50">Opens</p>
            </div>
          </div>

          {(c.attachments || []).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-orange-200/70 mb-1.5">Attachments</p>
              <div className="flex flex-wrap gap-1.5">
                {c.attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#1a120d] border border-orange-900/30 text-orange-200 text-[11px] px-2.5 py-1 rounded-full hover:border-orange-600">
                    <Paperclip className="w-3 h-3" /> <span className="max-w-[160px] truncate">{a.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-orange-200/70 mb-1.5">Email body</p>
            <div className="bg-[#1a120d] border border-orange-900/30 rounded-lg p-3 max-h-80 overflow-y-auto">
              <p className="text-sm text-orange-100 whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}