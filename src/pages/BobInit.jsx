import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, Send, RotateCcw, Cpu, Shield, DollarSign, Wrench, Package, ChevronRight, MessageSquareText, History, Rocket, FileJson } from "lucide-react";
import { Link } from "react-router-dom";
import SharedNav from "@/components/SharedNav";
import BobInitLogo from "@/components/bob-init/BobInitLogo";
import BudgetGauge, { getBudgetTier } from "@/components/bob-init/BudgetGauge";
import BuildSequence from "@/components/bob-init/BuildSequence";
import DatabasePicker from "@/components/bob-init/DatabasePicker";
import HardeningConfigPanel, { DEFAULT_HARDENING } from "@/components/bob-init/HardeningConfigPanel";
import BobInitHandbook from "@/components/bob-init/BobInitHandbook";
import BobInitProjectJson from "@/components/bob-init/BobInitProjectJson";
import BobInitHistory, { loadHistory, saveBuildEntry } from "@/components/bob-init/BobInitHistory";
import { useAuth } from "@/lib/AuthContext";

// B.O.B.Init — the "Machine that Builds Machines."
// Admin terminal at /admin/bob-init that orchestrates B2B agent builds.
// BOB-INIT-UI-TERMINAL-1.0 → BOB-INIT-ENGINE-1.0 → BOB-INIT-REGISTRY-1.0

const HELP_TEXT = `Available commands:
  bob init --stack <stack> --shim <auto|manual>   Initialize a new B2B build
  bob init --database <mongodb|postgresql|...>    Set the PWA database engine
  bob build                                        Execute the build pipeline
  bob registry list                                List audited registry components
  bob status                                       Show current build state
  bob history                                      Show past build history
  bob help                                         Show this help message

Examples:
  bob init --stack nextjs --shim auto --database mongodb
  bob init --stack react --shim auto --budget 15000 --database postgresql
  bob build`;

export default function BobInit({ navMode = "user" }) {
  const { user } = useAuth();
  const [budget, setBudget] = useState(9500);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([{ type: "system", text: "B.O.B.Init Terminal v1.0 — BOB-INIT-UI-TERMINAL-1.0\nType 'bob help' to get started." }]);
  const [buildActive, setBuildActive] = useState(false);
  const [buildDone, setBuildDone] = useState(false);
  const [stackConfig, setStackConfig] = useState(null);
  const [chatToCode, setChatToCode] = useState(false); // Plain-English mode for non-coders
  const [historyRefresh, setHistoryRefresh] = useState(0); // bump to reload history panel
  const [expandedPipeline, setExpandedPipeline] = useState(null);
  const [database, setDatabase] = useState("");
  const [hardening, setHardening] = useState(DEFAULT_HARDENING);
  const [workflow, setWorkflow] = useState("prompt"); // "prompt" (Windows-style command) | "projectjson"
  const terminalRef = useRef(null);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll ONLY the terminal container — never the page. scrollIntoView on the
  // end-marker was scrolling the nearest scrollable ancestor (the page itself),
  // which made the whole layout "creep" upward on every new line.
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  const appendLine = (type, text, plain) => setHistory((h) => [...h, { type, text, plain }]);

  const parseCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    appendLine("input", `PS C:\\Users\\casey> ${trimmed}`);

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
      } else if (sub === "history") {
        handleHistoryCmd();
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
    let stack = null, shim = "auto", budgetFlag = null, dbFlag = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--stack") stack = args[++i];
      else if (args[i] === "--shim") shim = args[++i];
      else if (args[i] === "--budget") budgetFlag = Number(args[++i]);
      else if (args[i] === "--database") dbFlag = args[++i];
    }
    if (dbFlag) setDatabase(dbFlag);

    if (!stack) {
      appendLine("error", "Missing --stack argument. Example: bob init --stack nextjs --shim auto");
      return;
    }

    if (budgetFlag !== null) setBudget(budgetFlag);

    const config = { stack, shim, budget: budgetFlag ?? budget, database: dbFlag || database };
    setStackConfig(config);
    setBuildDone(false);
    appendLine("system", `✓ Stack initialized: ${stack}`, `Great! B.O.B. is now set up to build a ${stack} application.`);
    appendLine("system", `  Shim mode: ${shim}`, `Self-healing is set to ${shim} — this means your app will auto-fix itself if APIs change.`);
    appendLine("system", `  Budget: $${(budgetFlag ?? budget).toLocaleString()}`, `Your budget is set to $${(budgetFlag ?? budget).toLocaleString()}.`);
    appendLine("system", `  Database: ${dbFlag || database || "none selected"}`, `Database is set to ${dbFlag || database || "none — pick one from the sidebar"}.`);
    appendLine("system", `  Hardening: ${hardening.hallucination_guard ? "110% ✓" : "off"}`, `Hardening is ${hardening.hallucination_guard ? "enabled (110% standard)" : "off — enable it from the sidebar"}.`);
    appendLine("system", `  Tier: ${getBudgetTier(budgetFlag ?? budget).label}`, `This qualifies for the "${getBudgetTier(budgetFlag ?? budget).label}" tier of features.`);
    appendLine("system", `Ready. Run 'bob build' to execute the pipeline.`, `Everything looks good! Type "bob build" and hit Run to start building your app.`);
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
    appendLine("system", `Executing build pipeline for ${stackConfig.stack} (${tier.label} tier)...`, `B.O.B. is now building your ${stackConfig.stack} app. This takes a few seconds...`);
    setBuildActive(true);
  };

  const handleRegistryList = () => {
    appendLine("system", "BOB-INIT-REGISTRY-1.0 — Audited Components:", "Here are the pre-approved building blocks B.O.B. can use:", true);
    appendLine("system", "  • nextjs-wrapper-v2.1     (X3)  ✓ seL4 hardened", "Next.js web framework — security-verified");
    appendLine("system", "  • go-middleware-v1.4      (X3)  ✓ OCap verified", "Go backend layer — access-controlled");
    appendLine("system", "  • react-pwa-shell-v3.0    (X1)  ✓ Fragmented storage", "React mobile app shell — data is split for privacy");
    appendLine("system", "  • self-healing-shim-v1.1  (X2)  ✓ drift_threshold: 0.85", "The self-healing layer — auto-fixes broken API connections");
    appendLine("system", "  • fpga-boolean-gate-v9.1  (X4)  ✓ Stateless boolean", "Hardware-level security gate — blocks bad traffic");
  };

  const handleStatus = () => {
    if (buildDone) {
      appendLine("system", `Build: COMPLETE — ${stackConfig?.stack || "n/a"} (${getBudgetTier(stackConfig?.budget || 0).label})`, `Your ${stackConfig?.stack || ""} app has been built successfully!`);
      appendLine("system", `  Output: ${stackConfig?.stack?.toUpperCase()}-AGENT-1.0`, `The finished product is called ${stackConfig?.stack?.toUpperCase()}-AGENT-1.0`);
      appendLine("system", `  Shim: BOB-INIT-SELF-HEALING-SHIM-1.0 (active)`, `Self-healing is turned on — your app will auto-repair if things break`);
      appendLine("system", `  Maintenance: $${Math.max(1, Math.floor((stackConfig?.budget || 9500) / 9500)) * 500}/mo`, `You'll pay $${Math.max(1, Math.floor((stackConfig?.budget || 9500) / 9500)) * 500}/month for ongoing maintenance`);
    } else if (buildActive) {
      appendLine("system", "Build: IN PROGRESS...", "B.O.B. is currently building your app. Please wait...");
    } else if (stackConfig) {
      appendLine("system", `Build: READY — ${stackConfig.stack} (${getBudgetTier(stackConfig.budget).label})`, `Your ${stackConfig.stack} app is configured and ready to build.`);
      appendLine("system", "  Run 'bob build' to execute.", `Type "bob build" and hit Run to start.`);
    } else {
      appendLine("system", "Build: IDLE — no stack initialized.", "Nothing has been set up yet. Type a command like 'bob init --stack nextjs' to begin.");
    }
  };

  const handleHistoryCmd = () => {
    const entries = loadHistory();
    if (entries.length === 0) {
      appendLine("system", "No build history found. Run 'bob build' to create your first entry.", "You haven't built anything yet. Type 'bob build' after setting up a stack to start.");
      return;
    }
    appendLine("system", `Build History (${entries.length} entries):`, `Here are your past ${entries.length} build${entries.length === 1 ? "" : "s"}:`);
    entries.slice(0, 10).forEach((e, i) => {
      appendLine("system", `  [${i + 1}] ${e.stack?.toUpperCase()}-AGENT-1.0 · $${e.budget?.toLocaleString()} · ${e.tier} · ${new Date(e.timestamp).toLocaleDateString()}`, `${e.stack} app built for $${e.budget?.toLocaleString()} (${e.tier} tier) on ${new Date(e.timestamp).toLocaleDateString()}`);
    });
  };

  const restoreBuild = (entry) => {
    const config = { stack: entry.stack, shim: entry.shim, budget: entry.budget };
    setStackConfig(config);
    setBudget(entry.budget);
    setBuildDone(false);
    appendLine("system", `↩ Restored build config: ${entry.stack} ($${entry.budget?.toLocaleString()}, ${entry.tier})`, `Loaded your previous ${entry.stack} build setup. Type 'bob build' to rebuild it.`);
    inputRef.current?.focus();
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

  // project.json workflow — the form assembles a project.json, which prints into
  // the terminal and follows the existing build gate. A paragraph (text-to-code)
  // and reference documents (concept/white paper/valuation/10-year plan) feed the
  // plan. The build path is half-price — an incentive to learn to code.
  const handleProjectJson = ({ projectJson, docFiles, paragraph }) => {
    const pName = projectJson.name || "Project";
    appendLine("input", `> B.O.B.Init: INITIALIZING PROJECT '${pName}'...`);
    appendLine("system", `> LOADING SUBSTRATE V110.0...`);
    appendLine("system", `> REGISTRY SYNC: SUCCESS`);
    if (paragraph) appendLine("system", `> Text-to-Code: paragraph accepted (${paragraph.length} chars). Assumptions applied for missing fields.`);
    if (docFiles?.length) appendLine("system", `> ${docFiles.length} reference document(s) attached — building for the plan.`);
    appendLine("system", "project.json submitted — following the current process/gate:");
    appendLine("system", JSON.stringify(projectJson, null, 2));
    appendLine("system", `> Build Execution Log:`);
    appendLine("system", `  [SUCCESS] Frontend: ${projectJson.stack?.frontend} scaffolding generated.`);
    appendLine("system", `  [SUCCESS] Middleware: ${projectJson.stack?.middleware} shims injected.`);
    appendLine("system", `  [SUCCESS] Backend: ${projectJson.stack?.backend} sealed with BOB-INIT-REGISTRY-1.0.`);
    appendLine("system", `  [ACTIVE] Quality Audit: scanning dependencies... 0 Vulnerabilities Found.`);
    appendLine("system", `> project.json workflow — half-price PWA incentive applied. Ready. Run 'bob build'.`);
    const stack = String(projectJson.stack?.frontend || "nextjs").toLowerCase().replace(/[^a-z]/g, "");
    setStackConfig({ stack, shim: "auto", budget, database: database || "none", projectJson });
    setBuildDone(false);
    setWorkflow("prompt"); // show the printed project.json in the terminal
    inputRef.current?.focus();
  };

  const tier = getBudgetTier(stackConfig?.budget ?? budget);
  const buildPrice = 9500;
  const maintenanceFee = Math.max(1, Math.floor((stackConfig?.budget ?? budget) / 9500)) * 500;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <SharedNav mode={navMode} theme="dev" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BobInitLogo size="lg" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                B.O.B.Init <span className="text-cyan-400 text-sm font-mono">&lt;init&gt;</span>
              </h1>
              <p className="text-xs text-[#8b949e] font-mono">BOB-INIT-UI-TERMINAL-1.0 · The Machine that Builds Machines</p>
            </div>
          </div>
          <BobInitHandbook />
        </div>

        {/* Workflow switcher — Windows command prompt vs project.json form */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWorkflow("prompt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${workflow === "prompt" ? "bg-[#3fb950]/15 border-[#3fb950]/60 text-[#3fb950]" : "border-[#30363d] text-[#8b949e] hover:bg-[#161b22]"}`}
          >
            <TerminalIcon className="w-3.5 h-3.5" /> Command Prompt
          </button>
          <button
            onClick={() => setWorkflow("projectjson")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${workflow === "projectjson" ? "bg-[#3fb950]/15 border-[#3fb950]/60 text-[#3fb950]" : "border-[#30363d] text-[#8b949e] hover:bg-[#161b22]"}`}
          >
            <FileJson className="w-3.5 h-3.5" /> project.json Workflow
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Terminal — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {workflow === "projectjson" ? (
              <BobInitProjectJson onSubmit={handleProjectJson} />
            ) : (
            <>
            {/* PowerShell-style terminal — output + prompt in one large flat window */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col bg-[#0c0c0c] border border-[#1f1f1f] h-[60vh] min-h-[440px] font-mono text-[#f2f2f2]"
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1f1f1f] text-[11px] text-[#9a9a9a] shrink-0">
                <span className="text-[#2478d5] font-bold">▣</span>
                <span>B.O.B. Powershell · B.O.B.Init Terminal</span>
              </div>

              {/* Body — the screen IS the prompt field. Output streams, then the
                  live PS prompt line sits inline at the bottom. Enter echoes the
                  command as output and yields a fresh prompt — exactly like
                  Windows PowerShell, but with bob init commands + project.json. */}
              <div
                ref={terminalRef}
                onClick={() => inputRef.current?.focus()}
                className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed no-scrollbar"
              >
                {history.map((line, idx) => (
                  <div key={idx} className="mb-1">
                    <div className={`whitespace-pre-wrap ${line.type === "input" ? "text-[#f2f2f2]" : line.type === "error" ? "text-[#ff6b6b]" : "text-[#cccccc]"}`}>
                      {line.text}
                    </div>
                    {chatToCode && line.plain && (
                      <div className="ml-3 mb-1 pl-2 border-l-2 border-[#2478d5]/40 text-[#bfbfbf] text-[12px] leading-relaxed">
                        <span className="text-[#2478d5]">» </span>{line.plain}
                      </div>
                    )}
                  </div>
                ))}

                {/* Live prompt — inline at the end of the stream; no separate field */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[#f2f2f2] whitespace-nowrap">PS C:\Users\casey&gt;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="bob init --stack nextjs --shim auto"
                    className="flex-1 min-w-0 bg-transparent text-[#f2f2f2] text-[13px] focus:outline-none placeholder:text-[#555] caret-[#f2f2f2]"
                    autoFocus
                  />
                </div>
                <div ref={terminalEndRef} />
              </div>
            </form>

            {/* Chat-to-Code toggle — plain-English mode for non-coders */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatToCode((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${chatToCode ? "bg-cyan-600/20 border-cyan-500 text-cyan-400" : "border-[#30363d] text-[#8b949e] hover:bg-[#161b22]"}`}
                title="Toggle plain-English explanations of terminal output"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                Chat to Code: {chatToCode ? "ON" : "OFF"}
              </button>
              <span className="text-[10px] text-[#484f58] font-mono">
                {chatToCode ? "Plain-English explanations shown under each line" : "Turn on to see plain-English explanations"}
              </span>
            </div>

            {/* Build sequence */}
            <BuildSequence active={buildActive} onComplete={() => {
              setBuildActive(false);
              setBuildDone(true);
              const buildTier = getBudgetTier(stackConfig?.budget ?? budget);
              saveBuildEntry({
                stack: stackConfig?.stack,
                shim: stackConfig?.shim,
                budget: stackConfig?.budget ?? budget,
                database,
                hardening,
                tier: buildTier.label,
                tierColor: buildTier.color,
                timestamp: new Date().toISOString(),
              });
              // Persist config so the Feature Selection page + saveBobBuild can pick it up
              try { localStorage.setItem("bob_init_config", JSON.stringify({ database, hardening })); } catch {}
              setHistoryRefresh((r) => r + 1);
              appendLine("system", "✓ Build pipeline complete. Output ready for deployment.", "All done! Your app has been built, audited, and is ready to deploy. The self-healing layer is active so it will auto-fix itself if APIs change.");
              appendLine("system", "  ✓ Saved to build history.", "This build was saved to your history — click 'Build History' in the sidebar to view or restore it anytime.");
            }} />

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
              <Button onClick={() => { setCommand("bob history"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> history
              </Button>
              <Button onClick={() => { setCommand("bob help"); }} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1">
                <ChevronRight className="w-3 h-3" /> help
              </Button>
              <Button onClick={reset} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-red-400 font-mono text-xs gap-1">
                <RotateCcw className="w-3 h-3" /> reset
              </Button>
            </div>
          </>
          )}
          </div>

          {/* Sidebar — budget + build summary + history */}
          <div className="space-y-4">
            <BudgetGauge budget={budget} setBudget={setBudget} />
            <DatabasePicker database={database} onChange={setDatabase} />
            <HardeningConfigPanel hardening={hardening} onChange={setHardening} />
            <BobInitHistory refreshKey={historyRefresh} onRestore={restoreBuild} />

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
                    <div className="flex justify-between"><span className="text-[#8b949e]">Database</span><span className="text-cyan-400">{database || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Hardening</span><span className="text-cyan-400">{hardening.hallucination_guard ? "110% ✓" : "Off"}</span></div>
                    <div className="border-t border-[#30363d] pt-2 space-y-1">
                      <div className="flex justify-between"><span className="text-[#8b949e]">Build Fee</span><span className="text-[#3fb950]">${buildPrice.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-[#8b949e]">Maintenance</span><span className="text-amber-400">${maintenanceFee}/mo</span></div>
                    </div>
                    {buildDone && (
                      <>
                        <div className="mt-2 rounded-md bg-[#3fb950]/10 border border-[#3fb950]/30 px-2 py-1.5 text-[#3fb950]">
                          ✓ {stackConfig.stack.toUpperCase()}-AGENT-1.0 ready
                        </div>
                        <Link to="/builder/features" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-xs py-2.5 transition-all hover:from-cyan-500 hover:to-cyan-400">
                          <Rocket className="w-4 h-4" /> Render PWA
                        </Link>
                      </>
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
                  { icon: TerminalIcon, label: "UI Terminal", code: "BOB-INIT-UI-1.0", desc: "The command-line interface where you type 'bob init' and 'bob build'. This is the entry point for all B.O.B.Init operations — it parses your commands and routes them to the Engine." },
                  { icon: Cpu, label: "Engine", code: "BOB-INIT-ENGINE-1.0", desc: "The core build engine that assembles hardened components from the audited registry into a deployable PWA. It orchestrates the full build pipeline from init to render." },
                  { icon: Package, label: "Registry", code: "BOB-INIT-REGISTRY-1.0", desc: "The curated catalog of seL4-verified, OCap-audited components. Every dependency is checked against the Unzipped Catalog hash before it enters your build." },
                  { icon: Shield, label: "Self-Healing Shim", code: "BOB-INIT-SHIM-1.0", desc: "The auto-repair layer. When external APIs drift or break, the shim detects the change and patches your app automatically — no manual redeploy required." },
                ].map(({ icon: Icon, label, code, desc }) => {
                  const isOpen = expandedPipeline === code;
                  return (
                    <div key={code}>
                      <button
                        onClick={() => setExpandedPipeline(isOpen ? null : code)}
                        className="w-full flex items-center gap-2 text-left hover:bg-[#161b22] rounded-lg p-1 -m-1 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#c9d1d9]">{label}</p>
                          <p className="text-[10px] text-[#484f58] font-mono">{code}</p>
                        </div>
                        <ChevronRight className={`w-3 h-3 text-[#484f58] transition-transform shrink-0 ${isOpen ? "rotate-90 text-cyan-400" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="ml-6 mt-1 mb-1 text-[11px] text-[#8b949e] leading-relaxed">{desc}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}