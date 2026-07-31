import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, Send, RotateCcw, Cpu, Shield, DollarSign, Wrench, Package, ChevronRight } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import BobInitLogo from "@/components/bob-init/BobInitLogo";
import BudgetGauge, { getBudgetTier } from "@/components/bob-init/BudgetGauge";
import BuildSequence from "@/components/bob-init/BuildSequence";
import { useAuth } from "@/lib/AuthContext";

// B.O.B.Init — the "Machine that Builds Machines."
// Admin terminal at /admin/bob-init that orchestrates B2B agent builds.
// BOB-INIT-UI-TERMINAL-1.0 → BOB-INIT-ENGINE-1.0 → BOB-INIT-REGISTRY-1.0

const HELP_TEXT = `Available commands:
  bob init --stack <stack> --shim <auto|manual>   Initialize a new B2B build
  bob build                                        Execute the build pipeline
  bob registry list                                List audited registry components
  bob status                                       Show current build state
  bob help                                         Show this help message

Examples:
  bob init --stack nextjs --shim auto
  bob init --stack react --shim auto --budget 15000
  bob build`;

export default function BobInit() {
  const { user } = useAuth();
  const [budget, setBudget] = useState(9500);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([{ type: "system", text: "B.O.B.Init Terminal v1.0 — BOB-INIT-UI-TERMINAL-1.0\nType 'bob help' to get started." }]);
  const [buildActive, setBuildActive] = useState(false);
  const [buildDone, setBuildDone] = useState(false);
  const [stackConfig, setStackConfig] = useState(null);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const appendLine = (type, text) => setHistory((h) => [...h, { type, text }]);

  const parseCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    appendLine("input", `$ ${trimmed}`);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];

    if (cmd === "bob" || cmd === "bob.init") {
      const sub = parts[1];
      if (sub === "help" || (!sub && parts.length === 1)) {
        appendLine("system", HELP_TEXT);
      } else if (sub === "init") {
        handleBobInit(parts.slice(2));
      } else if (sub === "build") {
        handleBobBuild();
      } else if (sub === "registry") {
        if (parts[2] === "list") handleRegistryList();
        else appendLine("error", "Unknown registry subcommand. Try: bob registry list");
      } else if (sub === "status") {
        handleStatus();
      } else {
        appendLine("error", `Unknown subcommand: ${sub}. Type 'bob help'.`);
      }
    } else if (cmd === "clear") {
      setHistory([]);
    } else {
      appendLine("error", `Command not found: ${cmd}. Type 'bob help'.`);
    }
  };

  const handleBobInit = (args) => {
    let stack = null, shim = "auto", budgetFlag = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--stack") stack = args[++i];
      else if (args[i] === "--shim") shim = args[++i];
      else if (args[i] === "--budget") budgetFlag = Number(args[++i]);
    }

    if (!stack) {
      appendLine("error", "Missing --stack argument. Example: bob init --stack nextjs --shim auto");
      return;
    }

    if (budgetFlag !== null) setBudget(budgetFlag);

    const config = { stack, shim, budget: budgetFlag ?? budget };
    setStackConfig(config);
    setBuildDone(false);
    appendLine("system", `✓ Stack initialized: ${stack}`);
    appendLine("system", `  Shim mode: ${shim}`);
    appendLine("system", `  Budget: $${(budgetFlag ?? budget).toLocaleString()}`);
    appendLine("system", `  Tier: ${getBudgetTier(budgetFlag ?? budget).label}`);
    appendLine("system", `Ready. Run 'bob build' to execute the pipeline.`);
  };

  const handleBobBuild = () => {
    if (!stackConfig) {
      appendLine("error", "No stack initialized. Run 'bob init --stack <stack>' first.");
      return;
    }
    const tier = getBudgetTier(stackConfig.budget);
    if (stackConfig.budget < 9500) {
      appendLine("error", `Insufficient budget ($${stackConfig.budget.toLocaleString()}). Production Build requires $9,500 minimum.`);
      return;
    }
    appendLine("system", `Executing build pipeline for ${stackConfig.stack} (${tier.label} tier)...`);
    setBuildActive(true);
  };

  const handleRegistryList = () => {
    appendLine("system", "BOB-INIT-REGISTRY-1.0 — Audited Components:");
    appendLine("system", "  • nextjs-wrapper-v2.1     (X3)  ✓ seL4 hardened");
    appendLine("system", "  • go-middleware-v1.4      (X3)  ✓ OCap verified");
    appendLine("system", "  • react-pwa-shell-v3.0    (X1)  ✓ Fragmented storage");
    appendLine("system", "  • self-healing-shim-v1.1  (X2)  ✓ drift_threshold: 0.85");
    appendLine("system", "  • fpga-boolean-gate-v9.1  (X4)  ✓ Stateless boolean");
  };

  const handleStatus = () => {
    if (buildDone) {
      appendLine("system", `Build: COMPLETE — ${stackConfig?.stack || "n/a"} (${getBudgetTier(stackConfig?.budget || 0).label})`);
      appendLine("system", `  Output: ${stackConfig?.stack?.toUpperCase()}-AGENT-1.0`);
      appendLine("system", `  Shim: BOB-INIT-SELF-HEALING-SHIM-1.0 (active)`);
      appendLine("system", `  Maintenance: $${Math.max(1, Math.floor((stackConfig?.budget || 9500) / 9500)) * 500}/mo`);
    } else if (buildActive) {
      appendLine("system", "Build: IN PROGRESS...");
    } else if (stackConfig) {
      appendLine("system", `Build: READY — ${stackConfig.stack} (${getBudgetTier(stackConfig.budget).label})`);
      appendLine("system", "  Run 'bob build' to execute.");
    } else {
      appendLine("system", "Build: IDLE — no stack initialized.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseCommand(command);
    setCommand("");
  };

  const reset = () => {
    setStackConfig(null);
    setBuildActive(false);
    setBuildDone(false);
    appendLine("system", "Terminal reset. Ready for new build.");
  };

  const tier = getBudgetTier(stackConfig?.budget ?? budget);
  const buildPrice = 9500;
  const maintenanceFee = Math.max(1, Math.floor((stackConfig?.budget ?? budget) / 9500)) * 500;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <SharedNav mode="user" theme="dev" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BobInitLogo size="lg" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
              B.O.B.Init <span className="text-cyan-400 text-sm font-mono">&lt;init&gt;</span>
            </h1>
            <p className="text-xs text-[#8b949e] font-mono">BOB-INIT-UI-TERMINAL-1.0 · The Machine that Builds Machines</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Terminal — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {/* Terminal output */}
            <div
              className="rounded-xl border border-[#30363d] bg-[#010409] p-4 font-mono text-xs h-80 overflow-y-auto no-scrollbar"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, idx) => (
                <div key={idx} className={`whitespace-pre-wrap mb-1 ${line.type === "input" ? "text-cyan-400" : line.type === "error" ? "text-red-400" : "text-[#8b949e]"}`}>
                  {line.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Command input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#010409] px-3">
                <TerminalIcon className="w-4 h-4 text-[#3fb950] shrink-0" />
                <span className="text-[#3fb950] font-mono text-sm">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="bob init --stack nextjs --shim auto"
                  className="flex-1 bg-transparent text-[#c9d1d9] font-mono text-sm py-2 focus:outline-none placeholder:text-[#484f58]"
                  autoFocus
                />
              </div>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5">
                <Send className="w-3.5 h-3.5" /> Run
              </Button>
            </form>

            {/* Build sequence */}
            <BuildSequence active={buildActive} onComplete={() => { setBuildActive(false); setBuildDone(true); appendLine("system", "✓ Build pipeline complete. Output ready for deployment."); }} />

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { setCommand("bob init --stack nextjs --shim auto"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> init nextjs
              </Button>
              <Button onClick={() => { setCommand("bob init --stack react --shim auto --budget 15000"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> init react enterprise
              </Button>
              <Button onClick={() => { setCommand("bob build"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#3fb950] font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> build
              </Button>
              <Button onClick={() => { setCommand("bob registry list"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> registry
              </Button>
              <Button onClick={() => { setCommand("bob help"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> help
              </Button>
              <Button onClick={reset} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-red-400 font-mono text-xs gap-1">
                <RotateCcw className="w-3 h-3" /> reset
              </Button>
            </div>
          </div>

          {/* Sidebar — budget + build summary */}
          <div className="space-y-4">
            <BudgetGauge budget={budget} setBudget={setBudget} />

            {/* Build summary */}
            <Card className="border-[#30363d] bg-[#0d1117]">
              <CardContent className="pt-4 pb-4 space-y-3">
                <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Build Summary
                </h3>
                {stackConfig ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-[#8b949e]">Stack</span><span className="text-cyan-400">{stackConfig.stack}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Shim</span><span className="text-cyan-400">{stackConfig.shim}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Tier</span><span className={tier.color}>{tier.label}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Budget</span><span className="text-[#3fb950]">${stackConfig.budget.toLocaleString()}</span></div>
                    <div className="border-t border-[#30363d] pt-2 space-y-1">
                      <div className="flex justify-between"><span className="text-[#8b949e]">Build Fee</span><span className="text-[#3fb950]">${buildPrice.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-[#8b949e]">Maintenance</span><span className="text-amber-400">${maintenanceFee}/mo</span></div>
                    </div>
                    {buildDone && (
                      <div className="mt-2 rounded-md bg-[#3fb950]/10 border border-[#3fb950]/30 px-2 py-1.5 text-[#3fb950]">
                        ✓ {stackConfig.stack.toUpperCase()}-AGENT-1.0 ready
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#484f58] font-mono">No stack initialized. Run <span className="text-cyan-400">bob init</span> to begin.</p>
                )}
              </CardContent>
            </Card>

            {/* Pipeline reference */}
            <Card className="border-[#30363d] bg-[#0d1117]">
              <CardContent className="pt-4 pb-4 space-y-2">
                <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Pipeline
                </h3>
                {[
                  { icon: TerminalIcon, label: "UI Terminal", code: "BOB-INIT-UI-1.0" },
                  { icon: Cpu, label: "Engine", code: "BOB-INIT-ENGINE-1.0" },
                  { icon: Package, label: "Registry", code: "BOB-INIT-REGISTRY-1.0" },
                  { icon: Shield, label: "Self-Healing Shim", code: "BOB-INIT-SHIM-1.0" },
                ].map(({ icon: Icon, label, code }, idx, arr) => (
                  <div key={code} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#c9d1d9]">{label}</p>
                      <p className="text-[10px] text-[#484f58] font-mono">{code}</p>
                    </div>
                    {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-[#30363d]" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}