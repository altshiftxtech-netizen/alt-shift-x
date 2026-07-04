import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Trophy } from "lucide-react";

/**
 * ScavengerPlaque — an integrated Brass & Noir wall plaque listing the top
 * scavenger-hunt builders. Etched gold lettering on brushed metal. No gamer
 * colors. Columns: Rank · Builder (masked handle) · Seeds Found · Founder's Mark.
 *
 * Hover a name → their Genetic Specialization. Click → their public profile.
 * Data comes from the scavengerLeaderboard function (ranked, trust tie-broken).
 */
export default function ScavengerPlaque({ style }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("scavengerLeaderboard", {});
        setRows(res.data?.rows || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute z-20 w-[248px] rounded-md overflow-hidden select-none origin-top-left transition-transform duration-300 ease-out"
      style={{
        ...style,
        // Small by default, expands to full size on hover.
        transform: `${style?.transform || ""} scale(${hovered ? 1 : 0.42})`,
        zIndex: hovered ? 40 : 20,
        // Brushed dark-metal background with a subtle vertical grain.
        background:
          "linear-gradient(180deg,#20180f,#181109), repeating-linear-gradient(90deg, rgba(255,225,160,.04) 0px, rgba(255,225,160,.04) 1px, transparent 1px, transparent 3px)",
        border: "1px solid rgba(200,169,91,0.55)",
        boxShadow:
          "0 0 24px rgba(0,0,0,.6), inset 0 0 22px rgba(0,0,0,.6), inset 0 1px 0 rgba(230,200,120,.25)",
      }}
    >
      {/* Beveled inner frame */}
      <div className="m-1.5 rounded-[3px]" style={{ border: "1px solid rgba(200,169,91,0.3)" }}>
        {/* Header */}
        <div className="px-3 pt-2.5 pb-2 text-center border-b" style={{ borderColor: "rgba(200,169,91,0.25)" }}>
          <div className="flex items-center justify-center gap-1.5">
            <Trophy className="w-3 h-3 text-[#C8A95B]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#C8A95B]">Seed Hunters</p>
          </div>
          <h3 className="text-[13px] font-bold text-[#E6C878] leading-tight mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Founder's Board
          </h3>
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-[26px_1fr_44px_28px] gap-1 px-3 py-1.5 text-[7.5px] font-bold uppercase tracking-[0.12em] text-[#C8A95B]/60 border-b" style={{ borderColor: "rgba(200,169,91,0.15)" }}>
          <span>Rank</span>
          <span>Builder</span>
          <span className="text-center">Seeds</span>
          <span className="text-center">EB</span>
        </div>

        {/* Rows */}
        <div className="max-h-[220px] overflow-y-auto no-scrollbar px-1.5 py-1">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-[#C8A95B]/60" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-[9px] text-[#9CA0A8] py-6 px-2 leading-relaxed">
              No seeds found yet. Be the first name etched here.
            </p>
          ) : (
            rows.map((r) => (
              <button
                key={r.user_id}
                onClick={() => navigate(`/builders/${r.user_id}`)}
                title={r.specialization}
                className="group w-full grid grid-cols-[26px_1fr_44px_28px] gap-1 items-center px-1.5 py-1 rounded-sm text-left hover:bg-[#C8A95B]/10 transition-colors"
              >
                <span className="text-[10px] font-bold text-[#C8A95B]/80 tabular-nums">
                  {r.rank}
                </span>
                <span className="text-[10.5px] text-[#E8DFC8] truncate group-hover:text-[#FCE7B0]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {r.handle}
                </span>
                <span className="text-center text-[10px] font-semibold text-[#E6C878] tabular-nums">
                  {r.seeds}/{r.total}
                </span>
                <span className="text-center">
                  {r.founder_mark ? (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[7px] font-black text-[#1a1207]"
                      style={{ background: "linear-gradient(135deg,#F5D890,#C8A95B)", boxShadow: "0 0 6px rgba(230,200,120,.6)" }}
                    >
                      EB
                    </span>
                  ) : (
                    <span className="text-[#C8A95B]/20 text-[10px]">—</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}