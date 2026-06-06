import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PENDING_STATUSES = ["draft", "pending_review"];

// Approves every unauthorized (draft / pending_review) component by setting it to
// "published". Shows a live count badge of how many are awaiting approval.
export default function ApproveComponentsButton({ variant = "splash" }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const lists = await Promise.all(
        PENDING_STATUSES.map((s) => base44.entities.Component.filter({ status: s }, "-created_date", 200))
      );
      setPending(lists.flat());
    } catch {
      setPending([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Live-refresh the pending count whenever components change — so when the
    // UpKeeper agent approves/publishes components through chat, this badge
    // reverts to 0 (or the new pending total) without a manual refresh.
    const unsubscribe = base44.entities.Component.subscribe(() => load());
    return () => unsubscribe?.();
  }, []);

  const approveAll = async () => {
    if (!pending.length || working) return;
    setWorking(true);
    for (const c of pending) {
      await base44.entities.Component.update(c.id, { status: "published" });
    }
    await load();
    setWorking(false);
  };

  const count = pending.length;
  const disabled = working || loading || count === 0;

  const base = variant === "chat"
    ? "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
    : "flex items-center gap-3 w-full max-w-2xl px-4 py-3 rounded-xl transition-all text-left group";

  const tone = count > 0
    ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500"
    : "bg-[#241812] text-orange-200/50 border border-orange-900/40";

  if (variant === "chat") {
    return (
      <button onClick={approveAll} disabled={disabled} className={`${base} ${tone} disabled:opacity-60`}>
        {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
        {working ? "Approving…" : count > 0 ? "Approve Components" : "All Approved"}
        {count > 0 && (
          <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
        )}
      </button>
    );
  }

  return (
    <button onClick={approveAll} disabled={disabled} className={`${base} ${tone} disabled:opacity-70`}>
      <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
        {working ? <Loader2 className="w-4 h-4 animate-spin" /> : count > 0 ? <PackageCheck className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </span>
      <div className="flex-1">
        <p className="font-semibold">{working ? "Approving Components…" : count > 0 ? "Approve Pending Components" : "All Components Approved"}</p>
        <p className="text-[11px] opacity-70">{count > 0 ? "Publish every draft & pending-review component" : "Nothing awaiting approval right now"}</p>
      </div>
      {count > 0 && !working && (
        <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>
      )}
    </button>
  );
}