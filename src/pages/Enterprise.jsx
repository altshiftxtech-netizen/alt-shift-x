import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Crown, Radio, Boxes, CalendarClock, Cpu, ShieldCheck, Wrench } from "lucide-react";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import SovereignPaywall from "@/components/enterprise/SovereignPaywall";
import EnterpriseLegalGate from "@/components/enterprise/EnterpriseLegalGate";
import PipelineKeyMonitor from "@/components/enterprise/PipelineKeyMonitor";
import ComponentRequestQueue from "@/components/enterprise/ComponentRequestQueue";
import SovereignCalendar from "@/components/enterprise/SovereignCalendar";
import SecureHandshakeModule from "@/components/enterprise/SecureHandshakeModule";
import DeveloperSeatsTab from "@/components/enterprise/DeveloperSeatsTab";
import EngineeringSuiteTab from "@/components/enterprise/engineering/EngineeringSuiteTab";
import AdvisoryAgentsStrip from "@/components/enterprise/AdvisoryAgentsStrip";

const TABS = [
  { key: "command", label: "Command Deck", icon: Radio },
  { key: "handshake", label: "Secure Handshake", icon: ShieldCheck },
  { key: "annexes", label: "Annex Queue", icon: Boxes },
  { key: "calendar", label: "Calendar", icon: CalendarClock },
  { key: "seats", label: "Developer Seats", icon: Cpu },
  { key: "engineering", label: "Engineering Suite", icon: Wrench },
];

export default function Enterprise() {
  const { status, user, isAdmin } = useSovereignAccess();
  const [tab, setTab] = useState("command");
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-[#05060a]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }
  if (status === "guest") return <SovereignPaywall isGuest />;
  if (status === "denied") return <SovereignPaywall />;

  // Sovereign / admin — the private club
  return (
    <div className="min-h-screen text-white relative" style={{ background: "radial-gradient(ellipse at 50% -10%, #131824, #05060a 60%)" }}>
      {/* Sovereign background video */}
      <video
        className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        src="https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/9ecf5a4c1_68074918c_generated_video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none" />

      <div className="relative z-10">
        <EnterpriseLegalGate
          open={legalOpen}
          onClose={() => setLegalOpen(false)}
          onAccept={() => { setLegalAccepted(true); setLegalOpen(false); }}
        />

        {/* Sovereign masthead */}
        <div className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(5,6,10,0.75)" }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,169,91,0.12)", border: "1px solid rgba(200,169,91,0.35)" }}>
              <Crown className="w-5 h-5 text-[#E6C878]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C8A95B] leading-none">Sovereign Tier</p>
              <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Enterprise Intelligence</h1>
            </div>
            <span className="text-[10px] text-white/40 hidden sm:block">{user?.email}</span>
            <Link to="/dashboard" className="text-xs text-white/50 hover:text-white">Dashboard</Link>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6C878] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E6C878]">Air-Gapped Sovereignty · Active</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            The private club<br /><span className="text-[#E6C878]">within the club.</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mt-4 text-sm sm:text-base">
            Live enterprise key telemetry, priority catalog annexes, forensic key handoffs, and dedicated consultations — with BOB and The Upkeeper on persistent advisory watch.
          </p>
        </div>

        {/* Persistent advisors */}
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <AdvisoryAgentsStrip />
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/10 pb-px">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? "text-[#E6C878] border-[#E6C878]" : "text-white/45 border-transparent hover:text-white/80"}`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
          {tab === "command" && (
            <div className="grid lg:grid-cols-2 gap-5">
              <PipelineKeyMonitor isAdmin={isAdmin} />
              <ComponentRequestQueue user={user} />
              <div className="lg:col-span-2"><SovereignCalendar user={user} /></div>
            </div>
          )}
          {tab === "handshake" && (
            <div className="max-w-2xl mx-auto">
              <SecureHandshakeModule
                isAdmin={isAdmin}
                user={user}
                legalAccepted={legalAccepted}
                onRequireLegal={() => setLegalOpen(true)}
              />
              {!legalAccepted && (
                <p className="text-center text-[11px] text-white/40 mt-3">
                  The ENT-LEGAL-SAFEGUARD-1.0 MSA must be accepted before any key is revealed.
                </p>
              )}
            </div>
          )}
          {tab === "annexes" && <div className="max-w-2xl mx-auto"><ComponentRequestQueue user={user} /></div>}
          {tab === "calendar" && <div className="max-w-2xl mx-auto"><SovereignCalendar user={user} /></div>}
          {tab === "seats" && <DeveloperSeatsTab isAdmin={isAdmin} hasSeatLicense={isAdmin} />}
          {tab === "engineering" && <EngineeringSuiteTab isAdmin={isAdmin} hasSeatLicense={isAdmin} />}
        </div>
      </div>
    </div>
  );
}