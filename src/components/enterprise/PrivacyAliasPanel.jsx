import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCog, EyeOff, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

/**
 * Enterprise identity-protection controls for Speakeasy rooms:
 * - Alias name: displayed instead of the member's real name on their bubble.
 * - Ghost mode: hides their bubble entirely. In exchange, they cannot see or
 *   interact with other members' bubbles while it is on.
 *
 * Persisted on the user via base44.auth.updateMe.
 */
export default function PrivacyAliasPanel({ user }) {
  const [alias, setAlias] = useState("");
  const [ghost, setGhost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = user || (await base44.auth.me());
        if (!active) return;
        setAlias(me?.speakeasy_alias || "");
        setGhost(!!me?.speakeasy_ghost_mode);
      } catch { /* noop */ }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ speakeasy_alias: alias.trim(), speakeasy_ghost_mode: ghost });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch { /* noop */ }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-[#E6C878]" />
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Identity Protection</h3>
      </div>
      <p className="text-xs text-white/45 mb-5">Protect your identity across Speakeasy rooms with an alias, or stay fully hidden with ghost mode.</p>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
      ) : (
        <div className="space-y-5">
          {/* Alias name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-1.5">
              <UserCog className="w-3.5 h-3.5 text-[#E6C878]" /> Alias name
            </label>
            <Input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. Sovereign-7 (leave blank to use your real name)"
              className="bg-white/[0.04] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#C8A95B]/40"
            />
            <p className="text-[11px] text-white/35 mt-1.5">Shown on your bubble instead of your real name. Blank uses your account name.</p>
          </div>

          {/* Ghost mode */}
          <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <EyeOff className="w-4 h-4 text-[#E6C878]" /> Ghost mode
              </p>
              <p className="text-[11px] text-white/45 mt-1">
                Hide your bubble in the Ballroom entirely. While on, you <span className="text-white/70 font-medium">cannot see or interact with</span> other members' bubbles.
              </p>
            </div>
            <button
              onClick={() => setGhost((g) => !g)}
              className={`mt-0.5 w-11 h-6 rounded-full transition-colors shrink-0 ${ghost ? "bg-[#C8A95B]" : "bg-white/15"}`}
              aria-pressed={ghost}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${ghost ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className={`${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#C8A95B] hover:bg-[#b8974a]"} text-black font-bold text-sm h-9 gap-2`}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Privacy Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}