import React, { useEffect, useState } from "react";
import { Award, X } from "lucide-react";

/**
 * A gentle, dismissible level-up celebration — recognition, not a slot-machine.
 * No confetti spam, no sound; just a warm acknowledgement of genuine
 * contribution. Render when an award returns leveled_up=true.
 */
export default function LevelUpCelebration({ level, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setShow(false); onClose?.(); }, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!show || !level) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 rounded-2xl border border-[#C8A95B]/40 bg-[#0E0E12]/95 backdrop-blur-xl px-5 py-3.5 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9DCE1] to-[#C8A95B] flex items-center justify-center">
          <Award className="w-5 h-5 text-[#0A0A0C]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B]">New Standing</p>
          <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            You're now a {level}
          </p>
          <p className="text-[11px] text-[#9CA0A8]">Thank you for shaping this room. 🥂</p>
        </div>
        <button onClick={() => { setShow(false); onClose?.(); }} className="text-[#6B6F76] hover:text-white ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}