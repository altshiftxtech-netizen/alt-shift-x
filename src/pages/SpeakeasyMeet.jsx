import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Loader2, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import SessionCard from "@/components/speakeasy/meet/SessionCard";
import ScheduleSessionDialog from "@/components/speakeasy/meet/ScheduleSessionDialog";

function MeetInner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  const load = async () => {
    const all = await base44.entities.SpeakeasySession.list("starts_at", 100);
    // Hide sessions that ended more than an hour ago.
    const cutoff = Date.now() - 60 * 60000;
    const live = (all || []).filter((s) => {
      const end = new Date(s.starts_at).getTime() + (s.duration_minutes || 30) * 60000;
      return end > cutoff && s.status !== "cancelled";
    });
    setSessions(live);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
    const unsub = base44.entities.SpeakeasySession.subscribe(() => load());
    return () => unsub?.();
  }, []);

  const upcoming = sessions.filter((s) => new Date(s.starts_at).getTime() > Date.now() - 5 * 60000);
  const liveNow = sessions.filter((s) => {
    const start = new Date(s.starts_at).getTime();
    const end = start + (s.duration_minutes || 30) * 60000;
    return Date.now() >= start - 5 * 60000 && Date.now() <= end;
  });

  return (
    <div className="min-h-screen relative">
      {/* Modern Boardroom background — reminds members The Table is business. */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/25f9c8578_generated_image.png"
          alt="Modern executive boardroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1116]/80 via-[#0E1116]/70 to-[#0E1116]/90" />
      </div>

      <header className="relative z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/speakeasy/proxy-room")} className="text-[#9CA0A8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3fb950]/30 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center">
              <Armchair className="w-4 h-4 text-[#C8A95B]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Table</h1>
              <p className="text-[10px] text-[#9CA0A8] mt-0.5">Pull up a chair — small live sessions, not endless meetings.</p>
            </div>
          </div>
          {user && (
            <Button onClick={() => setScheduling(true)} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 h-8 gap-1.5 text-xs">
              <CalendarPlus className="w-3.5 h-3.5" /> Host
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[#D9DCE1]/40" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Armchair className="w-7 h-7 text-[#C8A95B] mx-auto mb-3" />
            <p className="text-sm text-[#9CA0A8] mb-4">No sessions on the books. Host the first one.</p>
            {user && (
              <Button onClick={() => setScheduling(true)} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 gap-1.5">
                <CalendarPlus className="w-4 h-4" /> Pull Up Some Chairs
              </Button>
            )}
          </div>
        ) : (
          <>
            {liveNow.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3fb950] mb-2">Happening now</p>
                <div className="space-y-3">
                  {liveNow.map((s) => <SessionCard key={s.id} session={s} currentUserId={user?.id} onChanged={load} />)}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B] mb-2 mt-2">Upcoming</p>
              <div className="space-y-3">
                {upcoming.filter((s) => !liveNow.includes(s)).map((s) => (
                  <SessionCard key={s.id} session={s} currentUserId={user?.id} onChanged={load} />
                ))}
                {upcoming.filter((s) => !liveNow.includes(s)).length === 0 && (
                  <p className="text-xs text-[#6B6F76] text-center py-4">Nothing else scheduled yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {scheduling && user && (
        <ScheduleSessionDialog user={user} onClose={() => setScheduling(false)}
          onCreated={() => { setScheduling(false); load(); }} />
      )}
    </div>
  );
}

export default function SpeakeasyMeet() {
  return (
    <ProxyRoomGate>
      <MeetInner />
    </ProxyRoomGate>
  );
}