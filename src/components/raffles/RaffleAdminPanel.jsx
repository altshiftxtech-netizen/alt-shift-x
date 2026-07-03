import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, CheckCircle2, XCircle, Package, Mail, Users } from "lucide-react";

const STATUS_COLORS = {
  entrant: "bg-slate-100 text-slate-600",
  pending_verification: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  pending_claim: "bg-purple-100 text-purple-700",
  claimed: "bg-indigo-100 text-indigo-700",
  fulfilled: "bg-emerald-100 text-emerald-700",
};

export default function RaffleAdminPanel({ raffle }) {
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const rows = await base44.entities.RaffleEntry.filter({ raffle_id: raffle.id }, "-eligible", 500);
    setEntries(rows);
    setLoading(false);
  };
  useEffect(() => { load(); }, [raffle.id]);

  const draw = async () => {
    setBusy("draw");
    await base44.functions.invoke("drawRaffleWinners", { raffle_id: raffle.id });
    await load();
    setBusy("");
  };

  const act = async (entry_id, action, reason) => {
    setBusy(entry_id);
    await base44.functions.invoke("processRaffleWinner", { entry_id, action, reason });
    await load();
    setBusy("");
  };

  const eligible = entries.filter((e) => e.eligible);
  const ineligible = entries.filter((e) => !e.eligible);
  const winners = entries.filter((e) => e.eligible && e.winner_status !== "entrant");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {eligible.length} eligible</span>
          <span className="text-slate-400">{ineligible.length} blocked (under-age)</span>
        </div>
        <Button onClick={draw} disabled={busy === "draw"} className="gap-2">
          {busy === "draw" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
          {raffle.status === "drawn" ? "Re-draw" : "Draw Winners"}
        </Button>
      </div>

      {winners.length > 0 && (
        <div className="rounded-xl border border-slate-200 divide-y">
          <div className="px-4 py-2 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Winners &amp; Alternates
          </div>
          {winners.sort((a, b) => (a.is_alternate ? 1 : 0) - (b.is_alternate ? 1 : 0)).map((w) => (
            <div key={w.id} className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-slate-800">
                  {w.user_name} {w.is_alternate && <span className="text-xs text-slate-400">alt #{w.alternate_rank}</span>}
                </p>
                <p className="text-xs text-slate-500">{w.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-2 py-1 rounded ${STATUS_COLORS[w.winner_status] || "bg-slate-100"}`}>
                  {w.winner_status.replace(/_/g, " ")}
                </span>
                {["pending_verification"].includes(w.winner_status) && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1 text-emerald-700 border-emerald-200"
                      disabled={busy === w.id} onClick={() => act(w.id, "verify")}>
                      {busy === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Verify
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200"
                      disabled={busy === w.id} onClick={() => act(w.id, "fail", "unreachable")}>
                      <XCircle className="w-3.5 h-3.5" /> Fail
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}
    </div>
  );
}