import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";

/**
 * Paying-tier gate for the Speakeasy Proxy Room.
 * Admins always pass. Paying members (active/trialing/past_due, non-free plan) pass.
 * Everyone else — logged out OR free tier — gets a graceful members-only screen
 * (no 403/blank). Kept separate from the launch-date SpeakeasyGate so this room
 * can be developed and tested in the sandbox independently.
 */
export default function ProxyRoomGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | guest | free | member

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setStatus("member"); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const paying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        setStatus(paying ? "member" : "free");
      } catch {
        setStatus("guest");
      }
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0C]">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" />
      </div>
    );
  }

  if (status === "member") return <>{children}</>;

  const isGuest = status === "guest";
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <SpeakeasyVideoBackground />
      <div className="relative z-10 max-w-md w-full text-center rounded-2xl border border-[#C8A95B]/20 bg-gradient-to-b from-white/[0.08] to-black/40 backdrop-blur-xl p-10">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/20 border border-[#C8A95B]/20 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6 text-[#C8A95B]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-2">Platinum Members Only</p>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          The Proxy Room
        </h1>
        <p className="text-sm text-[#9CA0A8] leading-relaxed mb-6">
          {isGuest
            ? "Sign in with a paying membership to step into the Speakeasy's private hub."
            : "The Proxy Room is reserved for our paying tier. Upgrade to walk through the velvet door."}
          {" "}<Sparkles className="inline w-3.5 h-3.5 text-[#C8A95B]" />
        </p>
        {isGuest ? (
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 w-full"
          >
            Sign In
          </Button>
        ) : (
          <Link to="/pricing">
            <Button className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 w-full">
              Upgrade to Enter
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}