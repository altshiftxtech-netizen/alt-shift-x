import React from "react";
import { ShieldCheck, Clock, Code2, User } from "lucide-react";

const GOLD = "#C8A95B";

/**
 * StaffRegistryTable — the ExpertMinds Corporate "Staff Registry".
 * Columns: Member Name · Seat Type (Standard/Dev) · Forensic Status (Verified/Pending).
 * Sovereign-Gold theme, quiet data-table styling.
 */
export default function StaffRegistryTable({ seats = [] }) {
  if (seats.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: "#ffffff1f" }}>
        <User className="w-6 h-6 mx-auto mb-2 text-white/25" />
        <p className="text-sm text-white/45">No members yet. Invite your first seat to populate the registry.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${GOLD}33` }}>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ background: `${GOLD}12`, color: GOLD }}>
            <th className="px-4 py-3">Member Name</th>
            <th className="px-4 py-3">Seat Type</th>
            <th className="px-4 py-3">Forensic Status</th>
          </tr>
        </thead>
        <tbody>
          {seats.map((s) => {
            const verified = s.forensic_status === "verified";
            const dev = s.seat_type === "dev";
            return (
              <tr key={s.id} className="border-t" style={{ borderColor: "#ffffff0f" }}>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-white leading-tight">{s.member_name || "—"}</p>
                  <p className="text-[11px] text-white/40">{s.member_email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={dev
                      ? { background: "rgba(124,77,255,0.15)", color: "#b79dff", border: "1px solid rgba(124,77,255,0.35)" }
                      : { background: "rgba(255,255,255,0.06)", color: "#ffffffcc", border: "1px solid #ffffff22" }}
                  >
                    {dev ? <Code2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {dev ? "Dev" : "Standard"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={verified
                      ? { background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" }
                      : { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
                  >
                    {verified ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {verified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}