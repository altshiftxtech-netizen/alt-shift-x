import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Heart, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";
import SocialFeedStream from "@/components/speakeasy/social/SocialFeedStream";
import ParticipationStanding from "@/components/speakeasy/social/ParticipationStanding";
import CommunityHighlights from "@/components/speakeasy/social/CommunityHighlights";
import SpeakeasyLogo from "@/components/speakeasy/SpeakeasyLogo";
import LevelUpCelebration from "@/components/speakeasy/social/LevelUpCelebration";
import WeeklyRecap from "@/components/speakeasy/social/WeeklyRecap";
import useParticipation from "@/hooks/useParticipation";

function SocialFeedInner() {
  const navigate = useNavigate();
  const { score, award, reload, leveledUpTo, clearLevelUp } = useParticipation();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="min-h-screen relative">
      <SpeakeasyVideoBackground />

      <header className="relative z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/speakeasy/proxy-room")} className="text-[#9CA0A8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <SpeakeasyLogo size={36} />
            <div>
              <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Feed</h1>
              <p className="text-[10px] text-[#9CA0A8] mt-0.5">A calmer social room — built for genuine connection, not endless scrolling.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/speakeasy/groups")}
              className="flex items-center gap-1.5 text-xs text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors">
              <Users className="w-3.5 h-3.5 text-[#C8A95B]" /> Circles
            </button>
            {score && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/20 rounded-full px-3 py-1">
                <Heart className="w-3.5 h-3.5" /> {(score.points || 0).toLocaleString()} pts · {score.level}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <SocialFeedStream user={user} award={award} onActivity={reload} />

          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <ParticipationStanding score={score} />
            <WeeklyRecap score={score} />
            <CommunityHighlights />
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B] mb-2">How points work</p>
              <ul className="text-[11px] text-[#9CA0A8] space-y-1.5 leading-relaxed">
                <li>✍️ <strong className="text-white">+5</strong> — share a post</li>
                <li>💬 <strong className="text-white">+3</strong> — a thoughtful reply</li>
                <li>❤️ <strong className="text-white">+1</strong> — appreciate someone's post</li>
              </ul>
              <p className="text-[10px] text-[#6B6F76] mt-2.5">No streaks. No countdowns. Just genuine participation, gently recognized.</p>
            </div>
          </div>
        </div>
      </main>

      {leveledUpTo && <LevelUpCelebration level={leveledUpTo} onClose={clearLevelUp} />}
    </div>
  );
}

export default function SpeakeasySocial() {
  return (
    <ProxyRoomGate>
      <SocialFeedInner />
    </ProxyRoomGate>
  );
}