import React from "react";
import { Users, MessageCircle } from "lucide-react";

/**
 * A single community circle card in the Groups directory.
 */
export default function GroupCard({ group, joined, onOpen }) {
  return (
    <button onClick={() => onOpen(group)}
      className="text-left rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl p-4 hover:border-[#C8A95B]/40 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10"
          style={{ background: `linear-gradient(135deg, ${group.accent || "#C8A95B"}33, transparent)` }}>
          {group.emoji || "🛋️"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white truncate group-hover:text-[#C8A95B] transition-colors">{group.name}</h3>
            {joined && <span className="text-[9px] font-bold uppercase tracking-wider text-[#C8A95B] bg-[#C8A95B]/15 px-1.5 py-0.5 rounded-full">Joined</span>}
          </div>
          <p className="text-xs text-[#9CA0A8] mt-1 line-clamp-2 leading-relaxed">{group.description || "A circle within the Speakeasy."}</p>
          <div className="flex items-center gap-3 mt-2.5 text-[10px] text-[#6B6F76]">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {group.post_count || 0}</span>
          </div>
        </div>
      </div>
    </button>
  );
}