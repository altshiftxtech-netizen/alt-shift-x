import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * Contextual memory bridge. On load, greets the builder by name and — if they
 * have a prior draft — offers to resume it. Silent (renders nothing) for guests
 * or users with no history, so it never adds empty chrome.
 */
export default function MemoryGreeting({ onResume, tierLabel }) {
  const [state, setState] = useState({ name: null, last: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        const first = (user?.full_name || "").trim().split(" ")[0] || null;
        let last = null;
        try {
          const docs = await base44.entities.BizDocument.filter({ owner_id: user.id }, "-updated_date", 1);
          last = docs[0] || null;
        } catch { /* no history */ }
        if (alive) setState({ name: first, last });
      } catch { /* guest */ }
    })();
    return () => { alive = false; };
  }, []);

  if (!state.name) return null;

  return (
    <div className="rounded-xl border border-[#C8A95B]/25 bg-[#C8A95B]/[0.06] px-4 py-3 flex items-center gap-3 mb-5">
      <Sparkles className="w-4 h-4 text-[#C8A95B] shrink-0" />
      <p className="text-sm text-white/80 flex-1 min-w-0">
        Welcome back, <span className="font-bold text-white">{state.name}</span>
        {tierLabel && <span className="text-[#C8A95B]/80"> · {tierLabel}</span>}.
        {state.last ? (
          <> You were last working on a <span className="font-semibold text-white">{state.last.template_label}</span>
          {state.last.title ? <> for <span className="font-semibold text-white">{state.last.title}</span></> : null}.
          Shall we finish it?</>
        ) : (
          <> Pick a template below to draft your first document.</>
        )}
      </p>
      {state.last && onResume && (
        <button
          onClick={() => onResume(state.last)}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#1a1207] bg-[#C8A95B] hover:opacity-90 rounded-full px-3 py-1.5"
        >
          Resume <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}