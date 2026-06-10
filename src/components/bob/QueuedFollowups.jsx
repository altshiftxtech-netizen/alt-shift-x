import React from "react";
import { Clock, X, Paperclip } from "lucide-react";

/**
 * QueuedFollowups — shows the messages a builder typed WHILE BOB was still
 * working. They're stacked (in order) right under the live conversation as
 * dimmed "waiting" bubbles, so it's clear the query is being taken care of and
 * the follow-up is lined up next. BOB delivers the current answer first, then
 * automatically picks up each queued item in turn.
 */
export default function QueuedFollowups({ items = [], onRemove }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      {items.map((q, i) => (
        <div key={i} className="flex items-start gap-2.5 justify-end">
          <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-violet-600/30 border border-violet-500/40 text-violet-100 relative">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-300 uppercase tracking-wide mb-1">
              <Clock className="w-3 h-3 animate-pulse" />
              Queued{items.length > 1 ? ` · ${i + 1} of ${items.length}` : ""}
            </div>
            {q.content && <p className="whitespace-pre-wrap">{q.content}</p>}
            {q.file_urls?.length > 0 && (
              <p className="text-[11px] text-violet-300/80 mt-1 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> {q.file_urls.length} file{q.file_urls.length > 1 ? "s" : ""} attached
              </p>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                title="Remove from queue"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:bg-red-600 hover:border-red-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}