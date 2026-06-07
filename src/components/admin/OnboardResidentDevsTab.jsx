import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2, XCircle, Mail, Crown, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

// The two new Dev community members to onboard with complimentary top-tier
// (Sovereign Commander) accounts + Resident Developer status + welcome email.
const ROSTER = [
  { email: "daandrebrownthomas@gmail.com", name: "Da'Andre Brown Thomas" },
  { email: "kaliqbrownthomas@gmail.com", name: "Kaliq Brown Thomas" },
];

export default function OnboardResidentDevsTab() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("onboardResidentDevs", { people: ROSTER });
      setResults(res.data?.results || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-violet-100">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-violet-100 rounded-xl"><Crown className="w-5 h-5 text-violet-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Onboard New Resident Developers</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Invites each member, grants a complimentary <strong>Sovereign Commander</strong> (top-tier) account,
                marks them as a <strong>Resident Developer</strong>, and sends a welcome email to the Dev community.
              </p>
              <div className="mt-3 space-y-1.5">
                {ROSTER.map((p) => (
                  <div key={p.email} className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-slate-400">· {p.email}</span>
                  </div>
                ))}
              </div>
              <Button onClick={run} disabled={running} className="mt-4 bg-violet-600 hover:bg-violet-700 text-sm gap-2">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {running ? "Onboarding…" : "Invite & Grant Accounts"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="py-4 flex items-center gap-2 text-sm text-red-600">
            <XCircle className="w-4 h-4" /> {error}
          </CardContent>
        </Card>
      )}

      {results && results.map((r) => (
        <Card key={r.email}>
          <CardContent className="py-4">
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" /> {r.email}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[
                ["Invited", r.invited],
                ["Top-tier sub", r.subscription],
                ["Resident Dev", r.resident],
                ["Welcomed", r.welcomed],
              ].map(([label, ok]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                  <span className={ok ? "text-slate-700" : "text-slate-400"}>{label}</span>
                </div>
              ))}
            </div>
            {(r.invite_note || r.error || r.welcome_note) && (
              <p className="text-[11px] text-slate-400 mt-2">{r.error || r.invite_note || r.welcome_note}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}