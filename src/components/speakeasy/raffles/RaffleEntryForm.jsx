import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { evaluateAgePolicy } from "@/lib/ageCheck";

/**
 * Config-driven raffle entry form. Runs the AgePolicy DOB check BEFORE counting
 * an entry: age < min_age is hard-blocked and recorded as ineligible (age_fail),
 * never counted as a valid entry.
 */
export default function RaffleEntryForm({ raffle, policy }) {
  const [dob, setDob] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(null); // message string when blocked
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBlocked(null);

    const verdict = evaluateAgePolicy(dob, policy, raffle);
    const user = await base44.auth.me();

    if (!verdict.ok) {
      // Record the ineligible attempt but do NOT count it as a valid entry.
      await base44.entities.RaffleEntry.create({
        raffle_id: raffle.id, raffle_title: raffle.title,
        user_id: user.id, user_name: user.full_name || user.email, email: user.email,
        dob, age_at_as_of: verdict.age ?? undefined,
        eligible: false, ineligible_reason: "age_fail", winner_status: "entrant",
      });
      setBlocked(verdict.message);
      return;
    }

    setSubmitting(true);
    await base44.entities.RaffleEntry.create({
      raffle_id: raffle.id, raffle_title: raffle.title,
      user_id: user.id, user_name: user.full_name || user.email, email: user.email,
      dob, age_at_as_of: verdict.age, eligible: true, winner_status: "entrant",
    });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <p className="text-white font-semibold">You're entered!</p>
        <p className="text-white/60 text-sm mt-1">Good luck. Winners are drawn after {raffle.end_date}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-white/80 mb-1.5">
          <CalendarDays className="w-4 h-4 text-[#8FD8FF]" /> Date of birth
        </label>
        <input
          type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg bg-black/40 border border-white/15 text-white px-3 py-2.5 focus:outline-none focus:border-[#8FD8FF]/60"
        />
        <p className="text-[11px] text-white/45 mt-1.5">
          {policy?.public_entry_message || "Entry requires participants to be 16 or older."}
        </p>
      </div>

      {blocked && (
        <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{blocked}</p>
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#8FD8FF] hover:bg-[#a8e2ff] text-[#05030f] font-semibold py-2.5 transition-colors disabled:opacity-60">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Entering…</> : "Enter Raffle"}
      </button>
    </form>
  );
}