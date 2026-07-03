import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, ScrollText, Truck, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import RaffleEntryForm from "@/components/speakeasy/raffles/RaffleEntryForm";
import RaffleStarfield from "@/components/speakeasy/raffles/RaffleStarfield";

function RaffleDetailInner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await base44.entities.Raffle.filter({ slug });
      const r = rows[0] || null;
      setRaffle(r);
      if (r?.age_policy_id) {
        const p = await base44.entities.AgePolicy.get(r.age_policy_id).catch(() => null);
        setPolicy(p);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#05030f]">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#8FD8FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#05030f] text-white">
        <p>That raffle couldn't be found.</p>
        <button onClick={() => navigate("/speakeasy/raffles")} className="text-[#8FD8FF] underline">Back to Raffles</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "radial-gradient(120% 90% at 30% 10%, #24124a 0%, #0d1030 45%, #05030f 100%)" }}>
      <RaffleStarfield />
      <button onClick={() => navigate("/speakeasy/raffles")}
        className="fixed top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> All Raffles
      </button>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-24">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{raffle.title}</h1>
        <p className="text-white/60 mt-2">{raffle.description}</p>
        <p className="text-[12px] text-white/40 mt-1">Ends {raffle.end_date}</p>

        {/* Prizes */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-white font-semibold mb-3"><Gift className="w-5 h-5 text-[#8FD8FF]" /> Prizes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(raffle.prizes || []).map((p, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">{p.name}</p>
                  {p.value && <span className="text-[#8FD8FF] text-sm font-semibold">{p.value}</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/50">
                  {p.fulfillment_mode === "email_voucher"
                    ? <><Mail className="w-3.5 h-3.5" /> Digital voucher</>
                    : <><Truck className="w-3.5 h-3.5" /> Shipped</>}
                  {p.claim_required && <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10">claim required</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entry form */}
        <div className="mt-8">
          <h2 className="text-white font-semibold mb-3">Enter</h2>
          <RaffleEntryForm raffle={raffle} policy={policy} />
        </div>

        {/* Rules */}
        {raffle.rules_text && (
          <div className="mt-8">
            <h2 className="flex items-center gap-2 text-white font-semibold mb-3"><ScrollText className="w-5 h-5 text-[#8FD8FF]" /> Rules</h2>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
              {raffle.rules_text.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-white/60 text-sm">• {line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpeakeasyRaffleDetail() {
  return (
    <ProxyRoomGate>
      <RaffleDetailInner />
    </ProxyRoomGate>
  );
}