import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, CheckCircle2, XCircle, Crown, Sparkles, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ResidentDevRoster from "@/components/admin/ResidentDevRoster";

// Preset roster — quick-fill the two original Dev community members.
const PRESET = [
  { email: "daandrebrownthomas@gmail.com", name: "Da'Andre Brown Thomas" },
  { email: "kaliqbrownthomas@gmail.com", name: "Kaliq Brown Thomas" },
];

export default function OnboardResidentDevsTab() {
  const [rows, setRows] = useState([{ name: "", email: "" }]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [rosterRefresh, setRosterRefresh] = useState(0);

  const updateRow = (i, field, value) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((prev) => [...prev, { name: "", email: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const loadPreset = () => setRows(PRESET.map((p) => ({ ...p })));

  const run = async () => {
    const people = rows
      .map((r) => ({ name: r.name.trim(), email: r.email.trim() }))
      .filter((r) => r.email);
    if (people.length === 0) {
      setError("Add at least one email address.");
      return;
    }
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("onboardResidentDevs", { people });
      setResults(res.data?.results || []);
      setRosterRefresh((n) => n + 1);
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

              {/* Editable name + email rows */}
              <div className="mt-4 space-y-2">
                {rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Full name (optional)"
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={row.email}
                      onChange={(e) => updateRow(i, "email", e.target.value)}
                      className="h-9 text-sm flex-1"
                    />
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Button onClick={addRow} variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <Plus className="w-3.5 h-3.5" /> Add another
                </Button>
                <Button onClick={loadPreset} variant="outline" size="sm" className="text-xs h-8 text-slate-500">
                  Fill preset roster
                </Button>
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

      <ResidentDevRoster refreshSignal={rosterRefresh} />
    </div>
  );
}