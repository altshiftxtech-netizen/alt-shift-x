import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Radio, Boxes, CalendarClock, ShieldCheck, Cpu } from "lucide-react";

const PERKS = [
  { icon: Radio, text: "Live Pipeline Key Monitor" },
  { icon: Boxes, text: "Priority catalog annex requests" },
  { icon: ShieldCheck, text: "Air-gapped Secure Handshake (BT-SECURE-KEY-TRANS-1.0)" },
  { icon: CalendarClock, text: "Sovereign priority consultations" },
  { icon: Cpu, text: "Developer Seats + system-level SRE dashboards" },
];

/** The third tier — Sovereign: Enterprise Intelligence. A private, high-stakes door. */
export default function SovereignTierBanner() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div
        className="relative overflow-hidden rounded-3xl border p-8 sm:p-10"
        style={{ borderColor: "#C8A95B40", background: "radial-gradient(ellipse at 15% 0%, #1b1a24, #0a0a0f 65%)" }}
      >
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(200,169,91,0.18), transparent 70%)" }} />
        <div className="relative flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.3)" }}>
              <Crown className="w-3.5 h-3.5 text-[#E6C878]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E6C878]">Sovereign Tier</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sovereign: Enterprise Intelligence
            </h2>
            <p className="text-sm text-white/55 max-w-xl mb-5">
              The private club within the club — for the companies that operate like the ones building the future. Air-gapped sovereignty, live telemetry, and dedicated intelligence, behind a single door.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2.5 mb-2">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-start gap-2 text-sm text-white/70">
                  <p.icon className="w-4 h-4 mt-0.5 text-[#C8A95B] shrink-0" /> {p.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$2,499</span>
              <span className="text-sm text-white/40">/mo</span>
            </div>
            <p className="text-xs text-white/50 mt-1">+ $4,999/mo per Builder Seat</p>
            <div className="my-4 h-px bg-white/10" />
            <Link to="/enterprise">
              <Button className="w-full font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
                Enter the Sovereign Tier
              </Button>
            </Link>
            <p className="text-[10px] text-white/35 text-center mt-3">By invitation & subscription. MSA required before key access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}