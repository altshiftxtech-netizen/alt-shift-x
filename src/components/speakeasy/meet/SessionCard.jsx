import React, { useState } from "react";
import { Calendar, Clock, Users, Video, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

function fmtWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/**
 * A "pull up a chair" session. Shows time, host, RSVPs, and — once it's time —
 * a live Join button. Members RSVP by adding themselves to rsvp_ids.
 */
export default function SessionCard({ session, currentUserId, onChanged }) {
  const [busy, setBusy] = useState(false);
  const rsvps = session.rsvp_ids || [];
  const joined = rsvps.includes(currentUserId);

  const start = new Date(session.starts_at).getTime();
  const end = start + (session.duration_minutes || 30) * 60000;
  const now = Date.now();
  const isLive = now >= start - 5 * 60000 && now <= end && session.status !== "cancelled" && session.status !== "ended";
  const isOver = now > end || session.status === "ended";

  const toggleRsvp = async () => {
    if (busy) return;
    setBusy(true);
    const next = joined ? rsvps.filter((id) => id !== currentUserId) : [...rsvps, currentUserId];
    await base44.entities.SpeakeasySession.update(session.id, { rsvp_ids: next });
    setBusy(false);
    onChanged?.();
  };

  return (
    <div className={`rounded-2xl border backdrop-blur-xl p-4 ${isLive ? "border-[#3fb950]/40 bg-[#3fb950]/[0.06]" : "border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent"} ${isOver ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white truncate">{session.title}</h3>
            {isLive && <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#3fb950] bg-[#3fb950]/15 px-1.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" /> Live</span>}
            {isOver && <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B6F76] bg-white/5 px-1.5 py-0.5 rounded-full">Ended</span>}
          </div>
          {session.description && <p className="text-xs text-[#9CA0A8] mt-1 line-clamp-2">{session.description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px] text-[#9CA0A8]">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#C8A95B]" /> {fmtWhen(session.starts_at)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration_minutes || 30}m</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {rsvps.length} attending</span>
          </div>
          <p className="text-[10px] text-[#6B6F76] mt-1.5">Hosted by {session.host_name || "a member"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {isLive && session.meeting_url ? (
          <a href={session.meeting_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] text-white hover:opacity-90">
            <Video className="w-3.5 h-3.5" /> Join now
          </a>
        ) : !isOver ? (
          <button onClick={toggleRsvp} disabled={busy}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${joined ? "bg-white/10 text-white border border-white/15" : "bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C]"}`}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : joined ? <Check className="w-3.5 h-3.5" /> : null}
            {joined ? "Saved a seat" : "Pull up a chair"}
          </button>
        ) : null}
      </div>
    </div>
  );
}