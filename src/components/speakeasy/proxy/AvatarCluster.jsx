import React, { useState } from "react";
import { MessageCircle, User } from "lucide-react";

// Initials from a name for the avatar bubble.
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

/**
 * Floating cluster of member avatars positioned across the room.
 * Hover an avatar → name tag + Message action. Caps visible avatars and shows
 * an "+N more" pill so a crowded room never overflows.
 */
export default function AvatarCluster({ members = [], meId, onMessage }) {
  const [hovered, setHovered] = useState(null);
  const visible = members.slice(0, 16);
  const overflow = members.length - visible.length;

  return (
    <>
      {visible.map((m) => {
        const isMe = m.user_id === meId;
        return (
          <div
            key={m.id || m.user_id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${m.pos_x ?? 50}%`, top: `${m.pos_y ?? 50}%` }}
            onMouseEnter={() => setHovered(m.user_id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-default transition-transform hover:scale-110 ${
                isMe
                  ? "bg-gradient-to-br from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] border-white/60"
                  : "bg-[#1a1530] text-[#C8A95B] border-[#C8A95B]/60"
              }`}
              style={{ boxShadow: "0 0 14px rgba(200,169,91,0.35)" }}
            >
              {initials(m.user_name)}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0C]" />
            </div>

            {hovered === m.user_id && (
              <div className="absolute left-1/2 -translate-x-1/2 top-12 z-30 w-max max-w-[180px] rounded-xl border border-[#C8A95B]/30 bg-[#0A0A0C]/95 backdrop-blur px-3 py-2 text-center shadow-xl">
                <p className="text-xs font-semibold text-white flex items-center gap-1 justify-center">
                  <User className="w-3 h-3 text-[#C8A95B]" />
                  {m.user_name}{isMe && <span className="text-[#C8A95B]/70">(you)</span>}
                </p>
                {!isMe && (
                  <button
                    onClick={() => onMessage?.(m)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#0A0A0C] bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] px-2.5 py-1 rounded-full hover:opacity-90"
                  >
                    <MessageCircle className="w-3 h-3" /> Message
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {overflow > 0 && (
        <div className="absolute z-20 left-1/2 bottom-4 -translate-x-1/2 text-[10px] text-[#C8A95B]/70 bg-black/50 border border-[#C8A95B]/20 rounded-full px-3 py-1">
          +{overflow} more in the room
        </div>
      )}
    </>
  );
}