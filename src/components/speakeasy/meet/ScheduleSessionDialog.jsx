import React, { useState } from "react";
import { X, Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * Schedule a small live session. Stores it as a SpeakeasySession and lets the
 * host drop in a video link (Meet/Zoom). Members then RSVP from the card.
 */
export default function ScheduleSessionDialog({ user, groupId = null, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim() || !date || !time || saving) return;
    const startsAt = new Date(`${date}T${time}`);
    if (isNaN(startsAt.getTime())) { setError("Please pick a valid date and time."); return; }
    if (startsAt.getTime() < Date.now()) { setError("Pick a time in the future."); return; }
    setSaving(true);
    setError("");
    const data = {
      title: title.trim(),
      description: description.trim(),
      host_id: user.id,
      host_name: user.full_name || user.email,
      starts_at: startsAt.toISOString(),
      duration_minutes: Number(duration) || 30,
      meeting_url: meetingUrl.trim(),
      rsvp_ids: [user.id],
      status: "scheduled",
    };
    if (groupId) data.group_id = groupId;
    const session = await base44.entities.SpeakeasySession.create(data);
    setSaving(false);
    onCreated?.(session);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#C8A95B]/20 bg-[#0E0E12] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Pull Up Some Chairs</h2>
          <button onClick={onClose} className="text-[#9CA0A8] hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Topic</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
          placeholder="e.g. Estimating workflows — open table"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40 mb-3" />

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Details <span className="text-[#6B6F76] font-normal">(optional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={240}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-[#C8A95B]/40 mb-3" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8A95B]/40 [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8A95B]/40 [color-scheme:dark]" />
          </div>
        </div>

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Length</label>
        <select value={duration} onChange={(e) => setDuration(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8A95B]/40 mb-3 [&>option]:text-black">
          {[15, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
        </select>

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Video link <span className="text-[#6B6F76] font-normal">(Meet, Zoom…)</span></label>
        <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)}
          placeholder="https://meet.google.com/…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40 mb-4" />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <Button onClick={submit} disabled={!title.trim() || !date || !time || saving}
          className="w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />} Schedule Session
        </Button>
      </div>
    </div>
  );
}