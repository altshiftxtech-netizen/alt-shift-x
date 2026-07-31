import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Activity, Zap, Bug, Server, ShieldCheck, Wifi } from "lucide-react";

// SOV-APEX-SANDBOX-1.0 — The "Chaos Audit" Gauntlet
// Attacks the project with simulated logic-poisoning and server-side failures.
// The Damage Indicator shifts from Pain (red) → Gain (Sovereign Blue).

const ATTACKS = [
  { name: "Logic-Poisoning Injection", icon: Bug, detail: "Poisoning X4 Reason Council inputs with adversarial prompts..." },
  { name: "Server-Side Failure Cascade", icon: Server, detail: "Simulating 503 cascade across 5 fragment nodes..." },
  { name: "API Drift Desync", icon: Wifi, detail: "Injecting 0.85 drift threshold into Self-Healing Shim..." },
  { name: "Canary Token Exfiltration", icon: ShieldAlert, detail: "Attempting canary extraction via Shadow Reality..." },
];

export default function ApexSandbox({ selectedCount = 0 }) {
  const [auditing, setAuditing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeAttack, setActiveAttack] = useState(-1);
  const [pain, setPain] = useState(100);
  const [vulnsClosed, setVulnsClosed] = useState(0);
  const timerRef = useRef(null);

  // Base resilience scales with selected hardened modules
  const baseResilience = Math.min(95, 30 + selectedCount * 12);

  const runAudit = () => {
    if (auditing) return;
    setAuditing(true);
    setComplete(false);
    setProgress(0);
    setPain(100);
    setVulnsClosed(0);
    setActiveAttack(0);

    const totalSteps = 40;
    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      const pct = Math.round((step / totalSteps) * 100);
      setProgress(pct);
      setActiveAttack(Math.min(ATTACKS.length - 1, Math.floor((step / totalSteps) * ATTACKS.length)));
      const targetPain = 100 - baseResilience;
      setPain(Math.round(100 - (pct / 100) * (100 - targetPain)));
      setVulnsClosed(Math.round((pct / 100) * 12 + selectedCount * 3));

      if (step >= totalSteps) {
        clearInterval(timerRef.current);
        setAuditing(false);
        setComplete(true);
      }
    }, 100);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const gain = 100 - pain;
  const statusColor = pain > 60 ? "text-red-400" : pain > 30 ? "text-amber-400" : "text-cyan-400";

  return (
    <Card className="border-[#30363d] bg-[#0d1117]/90 backdrop-blur-sm">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> SOV-APEX-SANDBOX-1.0
          </h3>
          <span className="text-[10px] font-mono text-[#484f58]">Step 3 · Stress-Test</span>
        </div>
        <p className="text-[11px] text-[#8b949e] leading-relaxed">
          Trigger a <strong className="text-red-400">"Gauntlet"</strong> of simulated logic-poisoning and server-side failures. Watch the Damage Indicator shift from <span className="text-red-400 font-semibold">Pain</span> to <span className="text-cyan-400 font-semibold">Gain</span> as your modules harden the app.
        </p>

        {/* Damage Indicator */}
        <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-red-400">PAIN / RISK</span>
            <span className={`font-bold ${statusColor}`}>{pain}%</span>
            <span className="text-cyan-400">GAIN / RESILIENCE</span>
          </div>
          <div className="relative h-4 rounded-full bg-[#161b22] overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
              style={{ width: `${pain}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-cyan-500 to-cyan-600 transition-all duration-300"
              style={{ width: `${gain}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#484f58]">{complete ? "✓ Hardened" : auditing ? "⚠ Under Attack" : "○ Vulnerable"}</span>
            <span className="text-[#484f58]">{vulnsClosed} vulns auto-closed</span>
          </div>
        </div>

        {/* Active attack log */}
        {(auditing || complete) && activeAttack >= 0 && (
          <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3 space-y-1.5">
            {ATTACKS.map((atk, i) => {
              const Icon = atk.icon;
              const isActive = auditing && i === activeAttack;
              const isDone = complete || i < activeAttack;
              return (
                <div key={i} className={`flex items-center gap-2 text-[11px] font-mono transition-opacity ${isActive ? "opacity-100" : isDone ? "opacity-50" : "opacity-25"}`}>
                  <Icon className={`w-3 h-3 shrink-0 ${isActive ? "text-red-400 animate-pulse" : isDone ? "text-cyan-400" : "text-[#484f58]"}`} />
                  <span className={isActive ? "text-red-400" : isDone ? "text-[#8b949e]" : "text-[#484f58]"}>
                    {isActive ? atk.detail : isDone ? `✓ ${atk.name} repelled` : atk.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pain-Gain Ratio metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
            <p className="text-[9px] font-mono text-red-400/80 uppercase">Pain Reduction</p>
            <p className="text-lg font-black text-red-400">{complete ? `${baseResilience}%` : "—"}</p>
            <p className="text-[9px] text-[#484f58]">vulns auto-closed by B.O.B.Init</p>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5">
            <p className="text-[9px] font-mono text-cyan-400/80 uppercase">Gain Acceleration</p>
            <p className="text-lg font-black text-cyan-400">{complete ? `+${Math.round(baseResilience * 1.4)}%` : "—"}</p>
            <p className="text-[9px] text-[#484f58]">speed + trust via Ledger</p>
          </div>
        </div>

        <Button
          onClick={runAudit}
          disabled={auditing}
          className="w-full bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-bold text-xs gap-1.5"
        >
          {auditing ? (
            <><Activity className="w-3.5 h-3.5 animate-pulse" /> Auditing... {progress}%</>
          ) : complete ? (
            <><ShieldCheck className="w-3.5 h-3.5" /> Re-run Chaos Audit</>
          ) : (
            <><Zap className="w-3.5 h-3.5" /> Run Chaos Audit</>
          )}
        </Button>
        {selectedCount === 0 && !auditing && (
          <p className="text-[10px] text-amber-400/70 font-mono text-center">⚠ Select modules first — 0 modules means maximum pain.</p>
        )}
      </CardContent>
    </Card>
  );
}