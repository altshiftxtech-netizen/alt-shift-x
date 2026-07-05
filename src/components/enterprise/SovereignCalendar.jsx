import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Video, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

/** Sovereign Calendar — book priority consultations (Google Calendar + Meet). */
export default function SovereignCalendar({ user }) {
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);
  const [mine, setMine] = useState([]);

  const load = async () => {
    try { setMine(await base44.entities.SovereignConsultation.list("-start", 10)); } catch { /* no-op */ }
  };
  useEffect(() => { load(); }, []);

  const book = async () => {
    setError("");
    if (!topic || !when) { setError("Pick a topic and a time."); return; }
    setBusy(true);
    const res = await base44.functions.invoke("bookSovereignConsultation", {
      topic, company_name: company, start: new Date(when).toISOString(),
    });
    if (res.data?.consultation) { setBooked(res.data.consultation); setTopic(""); setCompany(""); setWhen(""); load(); }
    else setError(res.data?.error || "Booking failed.");
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border p-6" style={{ background: "linear-gradient(180deg,rgba(30,24,16,0.7),rgba(12,9,6,0.85))", borderColor: "#C8A95B33" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,169,91,0.12)", border: "1px solid rgba(200,169,91,0.3)" }}>
          <CalendarClock className="w-5 h-5 text-[#E6C878]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B]">Priority Access</p>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Sovereign Calendar</h3>
        </div>
      </div>

      {booked ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Consultation scheduled</p>
          <p className="text-xs text-white/50 mt-1">{format(new Date(booked.start), "EEE, MMM d · h:mm a")}</p>
          {booked.meet_link && (
            <a href={booked.meet_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#E6C878] hover:underline">
              <Video className="w-3.5 h-3.5" /> Join Google Meet
            </a>
          )}
          <Button variant="ghost" className="block mx-auto mt-3 text-xs text-white/50" onClick={() => setBooked(null)}>Book another</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input placeholder="Consultation topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 [color-scheme:dark]" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button onClick={book} disabled={busy} className="w-full font-semibold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
            {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking…</> : <><Video className="w-4 h-4 mr-2" /> Book Priority Consultation</>}
          </Button>
          <p className="text-[10px] text-white/35 text-center">Adds a Google Calendar event with a Meet link and notifies you by email.</p>
        </div>
      )}

      {mine.length > 0 && !booked && (
        <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Upcoming</p>
          {mine.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              <CalendarClock className="w-3.5 h-3.5 text-[#C8A95B]/60 shrink-0" />
              <span className="text-white/70 flex-1 truncate">{c.topic}</span>
              <span className="text-white/40">{format(new Date(c.start), "MMM d, h:mm a")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}