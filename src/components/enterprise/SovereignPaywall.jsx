import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, Lock } from "lucide-react";

function isInIframe() { try { return window.self !== window.top; } catch { return true; } }

/** Shown to guests / non-Sovereign users. The doorway to the private club. */
export default function SovereignPaywall({ isGuest }) {
  const [seats, setSeats] = useState(0);
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (isInIframe()) { alert("Checkout is only available from the published app. Please open the live URL to subscribe."); return; }
    setLoading(true);
    const res = await base44.functions.invoke("createSovereignCheckout", { seats });
    if (res.data?.url) window.location.href = res.data.url;
    else { alert(res.data?.error || "Something went wrong."); setLoading(false); }
  };

  const total = 2499 + seats * 4999;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, #12151f, #05060a 70%)" }}>
      <div className="max-w-lg w-full text-center rounded-3xl border p-10" style={{ borderColor: "#C8A95B33", background: "linear-gradient(180deg,rgba(24,20,12,0.6),rgba(8,7,5,0.8))" }}>
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(200,169,91,0.12)", border: "1px solid rgba(200,169,91,0.35)" }}>
          <Crown className="w-7 h-7 text-[#E6C878]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B] mb-2">The Private Club Within the Club</p>
        <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sovereign: Enterprise Intelligence</h1>
        <p className="text-sm text-white/50 mb-6">Air-gapped sovereignty. Live key telemetry. Priority annexes and consultations. Where the whales come to see the Secure Handshake in action.</p>

        {isGuest ? (
          <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="w-full font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
            <Lock className="w-4 h-4 mr-2" /> Sign in to enter
          </Button>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-4 text-left">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/70">Sovereign base</span>
                <span className="text-lg font-black text-white">$2,499<span className="text-xs font-normal text-white/40">/mo</span></span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-white/70">Builder Seats <span className="text-[10px] text-white/40">($4,999/mo each)</span></span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSeats((s) => Math.max(0, s - 1))} className="w-7 h-7 rounded-lg border border-white/15 text-white/70 hover:bg-white/10">−</button>
                  <span className="w-6 text-center text-white font-bold">{seats}</span>
                  <button onClick={() => setSeats((s) => Math.min(50, s + 1))} className="w-7 h-7 rounded-lg border border-white/15 text-white/70 hover:bg-white/10">+</button>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-2xl font-black text-[#E6C878]">${total.toLocaleString()}<span className="text-xs font-normal text-white/40">/mo</span></span>
              </div>
            </div>
            <Button onClick={subscribe} disabled={loading} className="w-full font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enter the Sovereign Tier"}
            </Button>
          </>
        )}
        <Link to="/pricing" className="block mt-4 text-xs text-white/40 hover:text-white/70">← Back to pricing</Link>
      </div>
    </div>
  );
}