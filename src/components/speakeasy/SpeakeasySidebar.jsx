import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Instagram, Youtube, Github, UserPlus, Briefcase, Megaphone, Lock, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SOCIALS = [
  { icon: Twitter, label: "X / Twitter", url: "https://twitter.com/altshiftx" },
  { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/company/altshiftx" },
  { icon: Instagram, label: "Instagram", url: "https://instagram.com/altshiftx" },
  { icon: Youtube, label: "YouTube", url: "https://youtube.com/@altshiftx" },
  { icon: Github, label: "GitHub", url: "https://github.com/altshiftx" },
];

const RULES = [
  "Build each other up. Ship energy only.",
  "Keep it classy — business-appropriate at all times.",
  "Credit your sources. No stolen work.",
  "Ask @frontman anything — the host has your back.",
  "What's said in the Speakeasy, stays in the Speakeasy.",
];

export default function SpeakeasySidebar() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const invite = async () => {
    if (!email.includes("@") || sending) return;
    setSending(true);
    const res = await base44.functions.invoke("speakeasyInvite", { email });
    if (res.data?.success) { setSent(true); setEmail(""); setTimeout(() => setSent(false), 3000); }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      {/* Invite */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-4 h-4 text-[#C8A95B]" />
          <h3 className="text-sm font-bold text-white">Invite a Builder</h3>
        </div>
        <p className="text-[11px] text-[#9CA0A8] mb-3 leading-relaxed">The Speakeasy is members-only. Invitees activate a paid plan to enter.</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="builder@email.com"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40 mb-2" />
        <Button onClick={invite} disabled={sending || !email.includes("@")}
          className="w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 h-8 text-xs gap-1.5">
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sent ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          {sent ? "Invite sent" : "Send Invite"}
        </Button>
      </div>

      {/* House Rules */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>The Speakeasy Code</h3>
        <ul className="space-y-2">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-2 text-[11px] text-[#9CA0A8] leading-relaxed">
              <span className="text-[#C8A95B] font-bold">{i + 1}.</span> {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Socials */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Follow altshiftx.tech</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {SOCIALS.map(({ icon: Icon, label, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[#9CA0A8] hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Icon className="w-3.5 h-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* Coming soon — 10yr expansion */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#C8A95B] mb-3">Coming to the Lounge</p>
        {[
          { icon: Briefcase, label: "Job Listings", desc: "Hire & get hired inside the room" },
          { icon: Megaphone, label: "App Promotion", desc: "Spotlight your launches" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-2.5 py-2 opacity-70">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#D9DCE1]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">{label} <Lock className="w-2.5 h-2.5 text-[#6B6F76]" /></p>
              <p className="text-[10px] text-[#6B6F76]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}