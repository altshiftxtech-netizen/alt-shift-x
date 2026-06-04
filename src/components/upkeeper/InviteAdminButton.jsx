import React, { useState } from "react";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ADMIN_EMAILS = [
  "altshiftx.tech@gmail.com",
  "administration@magnalorem.management",
];

// Admin-only one-click invite for the platform admin + backup admin accounts.
export default function InviteAdminButton({ variant = "splash" }) {
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const invite = async () => {
    if (working) return;
    setWorking(true); setError("");
    try {
      for (const email of ADMIN_EMAILS) {
        await base44.functions.invoke("inviteAdminUser", { email });
      }
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Invite failed");
    }
    setWorking(false);
  };

  if (variant === "chat") {
    return (
      <button onClick={invite} disabled={working || done}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white border border-orange-500 transition-all">
        {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
        {working ? "Inviting…" : done ? "Admins Invited" : "Invite Admins"}
      </button>
    );
  }

  return (
    <button onClick={invite} disabled={working || done}
      className="flex items-center gap-3 w-full max-w-2xl px-4 py-3 rounded-xl bg-orange-900/30 hover:bg-orange-800/40 border border-orange-700/50 hover:border-orange-500 text-orange-200/80 hover:text-white transition-all text-left group disabled:opacity-70">
      <span className="w-8 h-8 rounded-lg bg-orange-800/60 flex items-center justify-center flex-shrink-0">
        {working ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </span>
      <div className="flex-1">
        <p className="font-semibold">{done ? "Admin Invites Sent" : "Invite Admin Accounts"}</p>
        <p className="text-[11px] text-orange-200/50">
          {error ? <span className="text-red-400">{error}</span> : "altshiftx.tech@gmail.com · administration@magnalorem.management (backup)"}
        </p>
      </div>
    </button>
  );
}