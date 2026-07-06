import React, { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOLD = "#C8A95B";

/**
 * InviteMemberModal — Org Admin invites a member seat.
 * Each invite creates a pending EXPERT-MINDS-MEMBER-LICENSE-1.0 ($999/mo) charge
 * and issues a Vana-Voice handshake code the member must complete to activate.
 */
export default function InviteMemberModal({ open, onClose, onInvited }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seatType, setSeatType] = useState("standard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    if (!email.trim()) { setError("A member email is required."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", {
        action: "invite_member",
        member_email: email.trim(),
        member_name: name.trim(),
        seat_type: seatType,
      });
      if (res.data?.ok) {
        onInvited?.(res.data.seat);
        setName(""); setEmail(""); setSeatType("standard");
        onClose?.();
      } else {
        setError(res.data?.error || "Could not send the invitation.");
      }
    } catch {
      setError("Could not send the invitation.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border overflow-hidden" style={{ background: "#0b0d14", borderColor: `${GOLD}55` }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <UserPlus className="w-5 h-5" style={{ color: GOLD }} />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Member License · $999/mo</p>
            <h3 className="text-base font-bold text-white">Invite Member</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1">Member name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1">Member email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1">Seat type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "standard", label: "Standard" },
                { key: "dev", label: "Dev" },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setSeatType(o.key)}
                  className="rounded-lg py-2 text-xs font-bold border transition-colors"
                  style={seatType === o.key
                    ? { background: `${GOLD}22`, borderColor: `${GOLD}66`, color: GOLD }
                    : { background: "rgba(255,255,255,0.03)", borderColor: "#ffffff1f", color: "#ffffffaa" }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-white/40 leading-relaxed">
            This invite triggers a pending <span style={{ color: GOLD }}>$999/mo</span> seat charge. The member activates their
            seat by completing their Vana-Voice biological handshake. Registered under your org in GSP-MASTER-INDEX-1.0.
          </p>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button onClick={onClose} className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/10">Cancel</button>
          <button
            disabled={busy}
            onClick={submit}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg text-[#0A0A0C] disabled:opacity-60"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}