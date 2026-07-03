import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Sparkles, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import RaffleStarfield from "@/components/speakeasy/raffles/RaffleStarfield";

function RafflesInner() {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await base44.entities.Raffle.filter({ status: "open" }, "-created_date", 50);
      setRaffles(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "radial-gradient(120% 90% at 30% 10%, #24124a 0%, #0d1030 45%, #05030f 100%)" }}>
      <RaffleStarfield />
      {/* chrome */}
      <button onClick={() => navigate("/speakeasy/proxy-room")}
        className="fixed top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> Back to the Room
      </button>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8FD8FF]/10 border border-[#8FD8FF]/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#8FD8FF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8FD8FF]">Members Only</span>
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Raffles</h1>
          <p className="text-white/60 mt-2 max-w-md mx-auto text-sm">Real prizes for the Speakeasy. Entry requires participants to be 16 or older.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-[#8FD8FF] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {raffles.map((r) => (
              <button key={r.id} onClick={() => navigate(`/speakeasy/raffles/${r.slug}`)}
                className="group text-left rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-[#8FD8FF]/40 transition-all">
                <div className="h-32 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3b1d6e, #10163a)" }}>
                  {r.hero_image_url
                    ? <img src={r.hero_image_url} alt={r.title} className="w-full h-full object-cover opacity-80" />
                    : <div className="w-full h-full flex items-center justify-center"><Ticket className="w-10 h-10 text-[#8FD8FF]/60" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg leading-tight">{r.title}</h3>
                  <p className="text-white/55 text-sm mt-1 line-clamp-2">{r.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-white/45">Ends {r.end_date}</span>
                    <span className="inline-flex items-center gap-1 text-[#8FD8FF] text-sm font-medium">
                      Enter <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpeakeasyRaffles() {
  return (
    <ProxyRoomGate>
      <RafflesInner />
    </ProxyRoomGate>
  );
}