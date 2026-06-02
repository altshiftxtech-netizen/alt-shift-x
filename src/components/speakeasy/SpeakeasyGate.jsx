import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const PAID_PLANS = ["starter", "pro", "enterprise", "base_operator", "strategic_architect", "sovereign_commander"];

// Full-page members gate. Any active/trialing paid plan unlocks The Speakeasy.
export default function SpeakeasyGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | locked | member

  useEffect(() => {
    base44.entities.Subscription.filter({})
      .then(subs => {
        const active = (subs || []).filter(s => s.status === "active" || s.status === "trialing");
        const isMember = active.some(s => PAID_PLANS.includes(s.plan));
        setStatus(isMember ? "member" : "locked");
      })
      .catch(() => setStatus("locked"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0C]">
        <Loader2 className="w-6 h-6 animate-spin text-[#D9DCE1]/50" />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0C] px-6">
        <div className="max-w-md w-full text-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl p-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-[#D9DCE1]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-2">Members Only</p>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>The Speakeasy</h1>
          <p className="text-sm text-[#9CA0A8] leading-relaxed mb-6">
            A private lounge for serious builders. The password? A membership. Activate a paid plan to walk through the door. <Sparkles className="inline w-3.5 h-3.5 text-[#C8A95B]" />
          </p>
          <Link to="/pricing">
            <Button className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 w-full">
              Become a Member
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}