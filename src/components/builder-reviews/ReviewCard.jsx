import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Flag, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ReviewCard({ review: r, onReply, onFlag }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(r.id, replyText);
    setReplying(false);
    setReplyText("");
  };

  return (
    <Card className={`border shadow-sm ${r.flagged ? "border-slate-300 opacity-60" : "border-slate-200"}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-800">{r.author}</span>
              <span className="text-[10px] text-slate-400">{r.role} · {r.org}</span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-violet-600 font-semibold bg-violet-50 px-1.5 py-0.5 rounded-full">{r.component}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
              ))}
              <span className="text-[10px] text-slate-400 ml-1">{r.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {r.replied && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5"/>Replied</span>}
            <button onClick={() => onFlag(r.id)} title="Flag review" className="text-slate-300 hover:text-red-400 transition-colors">
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-3">{r.body}</p>

        {r.replied && r.reply && (
          <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2.5 mb-3">
            <p className="text-[10px] font-semibold text-violet-600 mb-1">Your reply</p>
            <p className="text-xs text-slate-700">{r.reply}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">{r.helpful} found this helpful</span>
          {!r.replied && (
            replying ? (
              <div className="flex items-center gap-2 w-full ml-4">
                <input
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmitReply()}
                  placeholder="Write your reply..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <Button size="sm" className="text-xs h-7 bg-violet-700 hover:bg-violet-800" onClick={handleSubmitReply}>Send</Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setReplying(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => setReplying(true)}>
                <MessageSquare className="w-3 h-3" /> Reply
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}