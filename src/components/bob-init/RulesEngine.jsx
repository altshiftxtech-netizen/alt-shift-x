import React from "react";
import { MessageSquareText } from "lucide-react";

export default function RulesEngine({ rules, setRules }) {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareText className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">Rules of the House</h3>
      </div>
      <p className="text-[11px] text-[#8b949e] mb-3">
        Define the behavior of your agent in plain English. B.O.B.Init converts this into{" "}
        <code className="text-amber-400 font-mono">X4 Reason Council</code> consensus logic.
      </p>
      <textarea
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        rows={5}
        placeholder="e.g. Only allow managers to see financial data. If a player's health score drops below 70, alert the manager immediately."
        className="w-full rounded-lg border border-[#30363d] bg-[#010409] p-3 text-xs text-[#c9d1d9] font-mono leading-relaxed resize-y focus:outline-none focus:border-cyan-500/50 placeholder:text-[#484f58]"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#484f58] font-mono">{rules.length} chars</span>
        <span className="text-[10px] text-[#484f58] font-mono">→ X4-REASON-COUNCIL-1.0</span>
      </div>
    </div>
  );
}