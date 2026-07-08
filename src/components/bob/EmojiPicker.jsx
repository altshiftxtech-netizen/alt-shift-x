import React from "react";

const EMOJIS = [
  "😀","😂","🤔","👍","👏","🔥","💡","✅","❌","⚠️",
  "🚀","💎","🎯","📊","📈","💼","🤝","💬","⚡","🛡️",
  "🔑","📋","✨","🎉","💰","🏆","⚙️","🔧","📦","🔗",
  "❤️","😎","🤖","📝","🔍","🌟","💪","🎯","🎨","🧠",
];

export default function EmojiPicker({ onPick }) {
  return (
    <div className="absolute bottom-full mb-1 left-0 z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-2 w-64">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Insert Emoji</p>
      <div className="grid grid-cols-8 gap-0.5">
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onPick(emoji); }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-base transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}