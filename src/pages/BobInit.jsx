import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, RotateCcw, Cpu, Shield, Package, ChevronRight, MessageSquareText, Rocket, FileJson, FileText, Check, Trash2, GraduationCap, BadgePercent, Play } from "lucide-react";
import { Link } from "react-router-dom";
import SharedNav from "@/components/SharedNav";
import BobInitLogo from "@/components/bob-init/BobInitLogo";
import BudgetGauge, { getBudgetTier } from "@/components/bob-init/BudgetGauge";
import BuildSequence from "@/components/bob-init/BuildSequence";
import DatabasePicker from "@/components/bob-init/DatabasePicker";
import HardeningConfigPanel, { DEFAULT_HARDENING } from "@/components/bob-init/HardeningConfigPanel";
import BobInitHandbook from "@/components/bob-init/BobInitHandbook";
import BobInitProjectJson from "@/components/bob-init/BobInitProjectJson";
import BobInitCodeMode from "@/components/bob-init/BobInitCodeMode";
import BobInitCapabilities from "@/components/bob-init/BobInitCapabilities";
import PwaFunctionalityTest from "@/components/bob-init/PwaFunctionalityTest";
import BobInitHistory, { loadHistory, saveBuildEntry } from "@/components/bob-init/BobInitHistory";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { speak } from "@/lib/bobSounds";
import useBridgeDraft from '@/components/suite/bridges/useBridgeDraft';

// B.O.B.Init — the "Machine that Builds Machines."
// Three authoring modes, all teaching you to code while they build:
//   • Command Prompt  — type `bob init` / `bob build` (full price)
//   • project.json    — write the raw manifest by hand (HALF-PRICE — learn-to-code)
//   • Text to Code     — guided form; a paragraph writes the code for you (full price)
// Every mode shares the same capabilities: brand mirror, reference docs, copyable preview.
// All modes produce PWA Agent Wrappers only.

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

const MODES = [
  { value: "command", label: "Command Prompt" },
  { value: "projectjson", label: "project.json — Code Mode (Half-Price)" },
  { value: "texttocode", label: "Text to Code (Form)" },
];

const inputCls = "w-full bg-[#010409] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#3fb950]/60 font-mono";

export default function BobInit({ navMode = "user", workspaceActions = null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budget, setBudget] = useState(9500);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([{ type: "system", text: "B.O.B.Init Terminal v1.0 — BOB-INIT-UI-TERMINAL-1.0\nType 'bob help' to get started." }]);
  const [buildActive, setBuildActive] = useState(false);
  const [buildDone, setBuildDone] = useState(false);
  const [stackConfig, setStackConfig] = useState(null);
  const [chatToCode, setChatToCode] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [expandedPipeline, setExpandedPipeline] = useState(null);
  const [database, setDatabase] = useState("");
  const [hardening, setHardening] = useState(DEFAULT_HARDENING);
  const [mode, setMode] = useState("command");
  const [brand, setBrand] = useState({ logoUrl: "[PENDING_UPLOAD]", colorway: "Generic_Office_Slate", colorHex: "#D4AF37", colors: ["#D4AF37"], url: "" });
  const [docs, setDocs] = useState({});
  const [projectName, setProjectName] = useState("");
  const [nameLocked, setNameLocked] = useState(false);
  const [version, setVersion] = useState("1.0.0");
  const [reverted, setReverted] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [formDraft, setFormDraft] = useState(null);
  const commandDraft = stackConfig || projectName.trim() ? { ...stackConfig, name: projectName || stackConfig?.name, version, database, hardening, branding: brand } : null;
  useBridgeDraft('builder', mode === 'command' ? commandDraft : formDraft);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  // Command mode: auto-extract the project name from the reference documents.
  // Stops overwriting once the user locks their own edit (check) — re-enables
  // when they clear it (trash).
  useEffect(() => {
    if (nameLocked) return;
    const doc = docs?.concept || docs?.whitepaper || Object.values(docs || {})[0];
    if (doc?.name) {
      const base = doc.name.replace(/\.[^.]+$/, "").replace(/[-_ ]?(concept|whitepaper|white[-_ ]?paper|valuation|10[-_ ]?year[-_ ]?plan)/gi, "").trim();
      setProjectName(base || "Untitled Project");
    }
  }, [docs, nameLocked]);

  const appendLine = (type, text, plain) => setHistory((h) => [...h, { type, text, plain }]);

  // Half-price applies ONLY to the project.json code mode (the learn-to-code path).
  const activeMode = stackConfig?.mode || mode;
  const halfPrice = activeMode === "projectjson";
  const buildPrice = halfPrice ? 4750 : 9500;
  const minBudget = halfPrice ? 4750 : 9500;

  const parseCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    appendLine("input", `PS C:\\Users\\casey> ${trimmed}`);
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    if (cmd === "bob" || cmd === "bob.init") {
      const sub = parts[1];
      if (sub === "help" || (!sub && parts.length === 1)) appendLine("system", HELP_TEXT);
      else if (sub === "init") handleBobInit(parts.slice(2));
      else if (sub === "build") handleBobBuild();
      else if (sub === "registry") { if (parts[2] === "list") handleRegistryList(); else appendLine("error", "Unknown registry subcommand. Try: bob registry list"); }
      else if (sub === "status") handleStatus();
      else if (sub === "history") handleHistoryCmd();
      else appendLine("error", `Unknown subcommand: ${sub}. Type 'bob help'.`);
    } else if (cmd === "clear") setHistory([]);
    else appendLine("error", `Command not found: ${cmd}. Type 'bob help'.`);
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
    if (!stack) { appendLine("error", "Missing --stack argument. Example: bob init --stack nextjs --shim auto"); return; }
    if (budgetFlag !== null) setBudget(budgetFlag);
    const config = { stack, shim, budget: budgetFlag ?? budget, database: dbFlag || database, mode: "command", halfPrice: false, name: projectName || "Untitled Project", version };
    setStackConfig(config);
    setBuildDone(false);
    setReverted(false);
    appendLine("system", `✓ Stack initialized: ${stack}`, `Great! B.O.B. is now set up to build a ${stack} application.`);
    appendLine("system", `  Name: ${projectName || "(awaiting reference docs)"}`, `Project name extracted from your reference documents.`);
    appendLine("system", `  Version: ${version}`, `Version set to ${version}.`);
    appendLine("system", `  Shim mode: ${shim}`, `Self-healing is set to ${shim} — your app auto-fixes if APIs change.`);
    appendLine("system", `  Budget: $${(budgetFlag ?? budget).toLocaleString()}`, `Budget set to $${(budgetFlag ?? budget).toLocaleString()}.`);
    appendLine("system", `  Database: ${dbFlag || database || "none selected"}`, `Database is ${dbFlag || database || "none — pick one from the sidebar"}.`);
    appendLine("system", `  Hardening: ${hardening.hallucination_guard ? "110% ✓" : "off"}`, `Hardening is ${hardening.hallucination_guard ? "enabled (110% standard)" : "off"}.`);
    appendLine("system", `  Tier: ${getBudgetTier(budgetFlag ?? budget).label}`, `This qualifies for the "${getBudgetTier(budgetFlag ?? budget).label}" tier.`);
    appendLine("system", `  Build fee: $${(9500).toLocaleString()} (command mode — full price)`, `Tip: write the project.json by hand in Code Mode to unlock the half-price build.`);
    appendLine("system", `Ready. Run 'bob build' to execute the pipeline.`, `Everything looks good! Type "bob build" and hit Run to start.`);
  };

  const persistConfig = (cfg) => {
    try {
      localStorage.setItem("bob_init_config", JSON.stringify({
        database, hardening, mode: cfg?.mode || "command", halfPrice: !!cfg?.halfPrice, brand,
      }));
    } catch {}
  };

  const handleBobBuild = () => {
    if (!stackConfig) { appendLine("error", "No stack initialized. Run 'bob init --stack <stack>' first."); return; }
    const isHalf = stackConfig.mode === "projectjson";
    const min = isHalf ? 4750 : 9500;
    if ((stackConfig.budget ?? budget) < min) {
      appendLine("error", `Insufficient budget ($${(stackConfig.budget ?? budget).toLocaleString()}). ${isHalf ? "Code-mode" : "Production"} build requires $${min.toLocaleString()} minimum${isHalf ? " (half-price gate)." : "."}`);
      return;
    }
    appendLine("system", `Executing build pipeline (${isHalf ? "CODE MODE — half-price" : "full price"})...`, `B.O.B. is now building your app. This takes a few seconds...`);
    setBuildActive(true);
  };

  const handleRegistryList = () => {
    appendLine("system", "BOB-INIT-REGISTRY-1.0 — Audited Components:", "Here are the pre-approved building blocks B.O.B. can use:");
    appendLine("system", "  • nextjs-wrapper-v2.1     (X3)  ✓ seL4 hardened", "Next.js web framework — security-verified");
    appendLine("system", "  • go-middleware-v1.4      (X3)  ✓ OCap verified", "Go backend layer — access-controlled");
    appendLine("system", "  • react-pwa-shell-v3.0    (X1)  ✓ Fragmented storage", "React mobile app shell — data split for privacy");
    appendLine("system", "  • self-healing-shim-v1.1  (X2)  ✓ drift_threshold: 0.85", "The self-healing layer — auto-fixes broken APIs");
    appendLine("system", "  • fpga-boolean-gate-v9.1  (X4)  ✓ Stateless boolean", "Hardware-level security gate — blocks bad traffic");
  };

  const handleStatus = () => {
    if (buildDone) {
      appendLine("system", `Build: COMPLETE — ${stackConfig?.stack || "n/a"} (${getBudgetTier(stackConfig?.budget || 0).label})`, `Your app has been built successfully!`);
      appendLine("system", `  Output: ${stackConfig?.stack?.toUpperCase()}-AGENT-1.0 (PWA Agent Wrapper)`, `The finished product is a PWA Agent Wrapper.`);
      appendLine("system", `  Shim: BOB-INIT-SELF-HEALING-SHIM-1.0 (active)`, `Self-healing is on.`);
      appendLine("system", `  Fee paid: $${(stackConfig?.mode === "projectjson" ? 4750 : 9500).toLocaleString()}`, `You paid the ${stackConfig?.mode === "projectjson" ? "half-price" : "full"} build fee.`);
    } else if (buildActive) appendLine("system", "Build: IN PROGRESS...", "B.O.B. is building. Please wait...");
    else if (stackConfig) appendLine("system", `Build: READY — ${stackConfig.stack} (${getBudgetTier(stackConfig.budget).label})`, `Type "bob build" or click Execute Build.`);
    else appendLine("system", "Build: IDLE — no stack initialized.", "Nothing set up yet. Type a command or pick a mode above.");
  };

  const handleHistoryCmd = () => {
    const entries = loadHistory();
    if (!entries.length) { appendLine("system", "No build history found. Run 'bob build' to create your first entry.", "You haven't built anything yet."); return; }
    appendLine("system", `Build History (${entries.length} entries):`, `Here are your past ${entries.length} build${entries.length === 1 ? "" : "s"}:`);
    entries.slice(0, 10).forEach((e, i) => {
      appendLine("system", `  [${i + 1}] ${e.stack?.toUpperCase()}-AGENT-1.0 · $${e.budget?.toLocaleString()} · ${e.tier} · ${e.halfPrice ? "HALF-PRICE" : "full"} · ${new Date(e.timestamp).toLocaleDateString()}`, `${e.stack} app, ${e.halfPrice ? "half-price" : "full-price"} build.`);
    });
  };

  const restoreBuild = (entry) => {
    setStackConfig({ stack: entry.stack, shim: entry.shim, budget: entry.budget, mode: "texttocode", halfPrice: !!entry.halfPrice, name: entry.name, version: entry.version });
    setBudget(entry.budget);
    setMode("texttocode");
    if (entry.name) setProjectName(entry.name);
    if (entry.version) setVersion(entry.version);
    setBuildDone(false);
    setReverted(true);
    appendLine("system", `↩ Restored build: ${entry.stack} ($${entry.budget?.toLocaleString()}, ${entry.tier}${entry.halfPrice ? ", HALF-PRICE" : ""}) — locked to Text-to-Code mode`, `Loaded a previous build. Editing is locked to Text-to-Code mode — switch modes to start a new build.`);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => { e.preventDefault(); parseCommand(command); setCommand(""); };

  const reset = () => {
    setStackConfig(null);
    setBuildActive(false);
    setBuildDone(false);
    setReverted(false);
    appendLine("system", "Terminal reset. Ready for new build.");
  };

  // project.json / text-to-code submission from the form modes.
  const handleProjectJson = ({ projectJson, docFiles, paragraph, mode: submitMode }) => {
    const pName = projectJson.name || "Project";
    const isHalf = submitMode === "projectjson";
    appendLine("input", `> B.O.B.Init: INITIALIZING PROJECT '${pName}'...`);
    appendLine("system", `> LOADING SUBSTRATE V110.0...`);
    appendLine("system", `> REGISTRY SYNC: SUCCESS`);
    if (paragraph) appendLine("system", `> Text-to-Code: paragraph accepted (${paragraph.length} chars). Assumptions applied for missing fields.`);
    if (docFiles?.length) appendLine("system", `> ${docFiles.length} reference document(s) attached — building for the plan.`);
    appendLine("system", `> project.json submitted — following the current process/gate:`);
    appendLine("system", JSON.stringify(projectJson, null, 2));
    appendLine("system", `> Build Execution Log:`);
    appendLine("system", `  [SUCCESS] Frontend: ${projectJson.stack?.frontend} scaffolding generated.`);
    appendLine("system", `  [SUCCESS] Middleware: ${projectJson.stack?.middleware} shims injected.`);
    appendLine("system", `  [SUCCESS] Backend: ${projectJson.stack?.backend} sealed with BOB-INIT-REGISTRY-1.0.`);
    appendLine("system", `  [ACTIVE] Quality Audit: scanning dependencies... 0 Vulnerabilities Found.`);
    appendLine("system", isHalf
      ? `> CODE MODE: half-price PWA incentive APPLIED — build fee $4,750 (50% off).`
      : `> Build fee: $9,500 (full price). Tip: switch to project.json Code Mode to learn to code and unlock half-price.`);
    appendLine("system", `Ready. Run 'bob build' (or click Execute Build) to render.`);
    const stack = String(projectJson.stack?.frontend || "nextjs").toLowerCase().replace(/[^a-z]/g, "");
    const cfg = { stack, shim: "auto", budget, database: database || "none", projectJson, mode: submitMode, halfPrice: isHalf };
    setStackConfig(cfg);
    setFormDraft(projectJson);
    persistConfig(cfg);
    setBuildDone(false);
    setReverted(false);
  };

  const tier = getBudgetTier(stackConfig?.budget ?? budget);
  const maintenanceFee = Math.max(1, Math.floor((stackConfig?.budget ?? budget) / 9500)) * 500;

  const onBuildComplete = () => {
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
      mode: stackConfig?.mode || "command",
      halfPrice: stackConfig?.mode === "projectjson",
      name: stackConfig?.name,
      version: stackConfig?.version,
      timestamp: new Date().toISOString(),
    });
    persistConfig({ mode: stackConfig?.mode, halfPrice: stackConfig?.mode === "projectjson" });
    setHistoryRefresh((r) => r + 1);
    appendLine("system", "✓ Build pipeline complete. Output ready for deployment.", "All done! Your PWA Agent Wrapper is built, audited, and ready to deploy.");
    appendLine("system", "  ✓ Saved to build history.", "Saved to history — click Build History to view or restore.");
  };

  // Fires ~2s before the build sequence finishes — the cockney vocalization
  // and toast land early so you hear it the moment the build is wrapping up.
  const onPreComplete = () => {
    toast({
      title: "🎉 Oi, that's B.O.B in-it!",
      description: "Right, guv'nor — your build's wrapped up proper and tucked away in the history. Lovely jubbly! Cheers, mate!",
    });
    speak("Oi! That's B.O.B in-it! Your build's wrapped up proper, guv'nor. Lovely jubbly! Cheers, mate!", { rateBoost: 1.15 });
  };

  // Build Summary + Pipeline cards — extracted so the sidebar can reorder them
  // per authoring mode (code mode hoists Hardening to the top, drops Budget/DB).
  const buildSummaryCard = (
            <Card className="border-[#30363d] bg-[#0d1117]">
              <CardContent className="pt-4 pb-4 space-y-3">
                <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Build Summary</h3>
                {stackConfig ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-[#8b949e]">Name</span><span className="text-cyan-400 truncate ml-2">{stackConfig.name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Version</span><span className="text-cyan-400">{stackConfig.version || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Stack</span><span className="text-cyan-400">{stackConfig.stack}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Mode</span><span className={halfPrice ? "text-[#3fb950]" : "text-cyan-400"}>{stackConfig.mode === "projectjson" ? "Code (½ price)" : stackConfig.mode === "texttocode" ? "Text-to-Code" : "Command"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Tier</span><span className={tier.color}>{tier.label}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Budget</span><span className="text-[#3fb950]">${stackConfig.budget.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Database</span><span className="text-cyan-400">{database || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Hardening</span><span className="text-cyan-400">{hardening.hallucination_guard ? "110% ✓" : "Off"}</span></div>
                    <div className="border-t border-[#30363d] pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#8b949e]">Build Fee</span>
                        <span className={halfPrice ? "text-[#3fb950]" : "text-[#3fb950]"}>
                          ${buildPrice.toLocaleString()}{halfPrice && <span className="text-[9px] text-[#484f58] line-through ml-1">$9,500</span>}
                        </span>
                      </div>
                      <div className="flex justify-between"><span className="text-[#8b949e]">Maintenance</span><span className="text-amber-400">${maintenanceFee}/mo</span></div>
                      {halfPrice && <div className="flex items-center gap-1 text-[9px] text-[#3fb950]"><BadgePercent className="w-2.5 h-2.5" /> Half-price applied (code mode)</div>}
                    </div>
                    {buildDone ? (
                      <>
                        <div className="mt-2 rounded-md bg-[#3fb950]/10 border border-[#3fb950]/30 px-2 py-1.5 text-[#3fb950]">✓ {stackConfig.stack.toUpperCase()}-AGENT-1.0 ready</div>
                        <Link to="/builder/features" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-xs py-2.5 transition-all hover:from-cyan-500 hover:to-cyan-400"><Rocket className="w-4 h-4" /> Render PWA</Link>
                      </>
                    ) : !buildActive && (
                      <Button onClick={handleBobBuild} className="w-full mt-2 bg-[#3fb950] hover:bg-[#3fb950]/90 text-black font-bold font-mono text-xs gap-1.5"><Play className="w-3.5 h-3.5" /> Execute Build{halfPrice ? " · ½ price" : ""}</Button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#484f58] font-mono">No project initialized. Pick a mode and initialize to begin.</p>
                )}
              </CardContent>
            </Card>
  );
  const pipelineCard = (
            <Card className="border-[#30363d] bg-[#0d1117]">
              <CardContent className="pt-4 pb-4 space-y-2">
                <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Pipeline</h3>
                {[
                  { icon: TerminalIcon, label: "UI Terminal", code: "BOB-INIT-UI-1.0", desc: "The command-line interface where you type 'bob init' and 'bob build'. The entry point for all B.O.B.Init operations." },
                  { icon: Cpu, label: "Engine", code: "BOB-INIT-ENGINE-1.0", desc: "The core build engine that assembles hardened components from the audited registry into a deployable PWA." },
                  { icon: Package, label: "Registry", code: "BOB-INIT-REGISTRY-1.0", desc: "The curated catalog of seL4-verified, OCap-audited components. Every dependency is checked before it enters your build." },
                  { icon: Shield, label: "Self-Healing Shim", code: "BOB-INIT-SHIM-1.0", desc: "The auto-repair layer. When external APIs drift or break, the shim patches your app automatically." },
                ].map(({ icon: Icon, label, code, desc }) => {
                  const isOpen = expandedPipeline === code;
                  return (
                    <div key={code}>
                      <button onClick={() => setExpandedPipeline(isOpen ? null : code)} className="w-full flex items-center gap-2 text-left hover:bg-[#161b22] rounded-lg p-1 -m-1 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0"><p className="text-xs text-[#c9d1d9]">{label}</p><p className="text-[10px] text-[#484f58] font-mono">{code}</p></div>
                        <ChevronRight className={`w-3 h-3 text-[#484f58] transition-transform shrink-0 ${isOpen ? "rotate-90 text-cyan-400" : ""}`} />
                      </button>
                      {isOpen && <p className="ml-6 mt-1 mb-1 text-[11px] text-[#8b949e] leading-relaxed">{desc}</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
  );

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
              <p className="text-xs text-[#8b949e] font-mono">BOB-INIT-UI-TERMINAL-1.0 · The Machine that Builds Machines · PWA Agent Wrappers</p>
            </div>
          </div>
          <BobInitHandbook />
        </div>

        {workspaceActions}

        {/* Learn-to-code banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3">
          <GraduationCap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-xs text-[#8b949e] leading-relaxed">
            <span className="text-cyan-400 font-mono">B.O.B.Init teaches you to code while it builds.</span> Pick a mode below. Write the raw <span className="text-[#3fb950] font-mono">project.json</span> yourself in Code Mode and your build is <span className="text-[#3fb950] font-mono">half-price</span> — because you did the coding. Every mode shows the real config behind your app in a copyable JSON preview.
          </p>
        </div>

        {/* Mode switcher (dropdown) */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] tracking-[0.2em] text-[#3fb950]/70 font-mono">AUTHORING MODE</span>
          <select value={mode} onChange={(e) => { setFormDraft(null); setMode(e.target.value); }} disabled={reverted} className={`${inputCls} max-w-sm ${reverted ? "opacity-60 cursor-not-allowed" : ""}`}>
            {MODES.map((m) => <option key={m.value} value={m.value} className="bg-[#0d1117]">{m.label}</option>)}
          </select>
          {reverted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-1">
              <RotateCcw className="w-3 h-3" /> Reverted — Text-to-Code only
            </span>
          )}
          {mode === "projectjson" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-2 py-1">
              <BadgePercent className="w-3 h-3" /> Half-price at checkout
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main column — active mode */}
          <div className="lg:col-span-2 space-y-4">
            {mode === "projectjson" ? (
              <BobInitCodeMode brand={brand} setBrand={setBrand} docs={docs} setDocs={setDocs} onSubmit={handleProjectJson} onDraftChange={setFormDraft} />
            ) : mode === "texttocode" ? (
              <BobInitProjectJson brand={brand} setBrand={setBrand} docs={docs} setDocs={setDocs} onSubmit={handleProjectJson} onDraftChange={setFormDraft} />
            ) : (
              <>
                {/* PowerShell-style terminal */}
                <form onSubmit={handleSubmit} className="flex flex-col bg-[#0c0c0c] border border-[#1f1f1f] h-[52vh] min-h-[420px] font-mono text-[#f2f2f2]">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1f1f1f] text-[11px] text-[#9a9a9a] shrink-0">
                    <span className="text-[#2478d5] font-bold">▣</span>
                    <span>B.O.B. Powershell · B.O.B.Init Terminal</span>
                  </div>
                  <div ref={terminalRef} onClick={() => inputRef.current?.focus()} className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed no-scrollbar">
                    {history.map((line, idx) => (
                      <div key={idx} className="mb-1">
                        <div className={`whitespace-pre-wrap ${line.type === "input" ? "text-[#f2f2f2]" : line.type === "error" ? "text-[#ff6b6b]" : "text-[#cccccc]"}`}>{line.text}</div>
                        {chatToCode && line.plain && (
                          <div className="ml-3 mb-1 pl-2 border-l-2 border-[#2478d5]/40 text-[#bfbfbf] text-[12px] leading-relaxed">
                            <span className="text-[#2478d5]">» </span>{line.plain}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[#f2f2f2] whitespace-nowrap">PS C:\Users\casey&gt;</span>
                      <input ref={inputRef} type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="bob init --stack nextjs --shim auto" className="flex-1 min-w-0 bg-transparent text-[#f2f2f2] text-[13px] focus:outline-none placeholder:text-[#555] caret-[#f2f2f2]" autoFocus />
                    </div>
                  </div>
                </form>

                {/* Project identity — name auto-extracted from reference docs, version user-set */}
                <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#3fb950]/70 font-mono"><FileJson className="w-3 h-3" /> PROJECT IDENTITY</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-[#484f58] block mb-1">NAME (from reference docs)</label>
                      <div className={`flex items-center gap-1.5 bg-[#0d1117] border rounded-lg px-2.5 py-2 ${nameLocked ? "border-[#3fb950]/60" : "border-[#30363d]"}`}>
                        <FileText className={`w-3 h-3 shrink-0 ${nameLocked ? "text-[#3fb950]" : "text-cyan-400"}`} />
                        <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="— upload a reference doc" className="flex-1 min-w-0 bg-transparent text-xs font-mono text-[#c9d1d9] focus:outline-none placeholder:text-[#484f58]" />
                        <button type="button" onClick={() => setNameLocked(true)} title="Save this name (stop auto-populate)" className={`shrink-0 ${nameLocked ? "text-[#3fb950]" : "text-[#8b949e] hover:text-[#3fb950]"}`}><Check className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => { setProjectName(""); setNameLocked(false); }} title="Clear name (re-enable auto-populate)" className="shrink-0 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      {nameLocked && <p className="text-[9px] font-mono text-[#3fb950] mt-1">✓ Name locked — auto-populate off</p>}
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-[#484f58] block mb-1">VERSION</label>
                      <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-2 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#3fb950]/60" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setChatToCode((v) => !v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${chatToCode ? "bg-cyan-600/20 border-cyan-500 text-cyan-400" : "border-[#30363d] text-[#8b949e] hover:bg-[#161b22]"}`} title="Toggle plain-English explanations">
                    <MessageSquareText className="w-3.5 h-3.5" /> Chat to Code: {chatToCode ? "ON" : "OFF"}
                  </button>
                  <span className="text-[10px] text-[#484f58] font-mono">{chatToCode ? "Plain-English explanations shown under each line" : "Turn on to see plain-English explanations"}</span>
                </div>

                {/* Command mode gets the same shared capabilities */}
                <BobInitCapabilities brand={brand} setBrand={setBrand} docs={docs} setDocs={setDocs} projectJson={stackConfig?.projectJson || null} />

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setCommand("bob init --stack nextjs --shim auto")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> init nextjs</Button>
                  <Button onClick={() => setCommand("bob init --stack react --shim auto --budget 15000")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> init react enterprise</Button>
                  <Button onClick={() => setCommand("bob build")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#3fb950] font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> build</Button>
                  <Button onClick={() => setCommand("bob registry list")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> registry</Button>
                  <Button onClick={() => setCommand("bob history")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> history</Button>
                  <Button onClick={() => setCommand("bob help")} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1"><ChevronRight className="w-3 h-3" /> help</Button>
                  <Button onClick={reset} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-red-400 font-mono text-xs gap-1"><RotateCcw className="w-3 h-3" /> reset</Button>
                </div>
              </>
            )}

            {/* PWA functionality test — available in every mode */}
            <PwaFunctionalityTest stackConfig={stackConfig} hardening={hardening} brand={brand} database={database} mode={mode} />

            {/* Build sequence — common to all modes */}
            {buildActive && <BuildSequence active={buildActive} onComplete={onBuildComplete} onPreComplete={onPreComplete} />}
          </div>

          {/* Sidebar — code mode hoists Hardening to the top (Budget/DB live in the code) */}
          <div className="space-y-4">
            {mode === "projectjson" ? (
              <>
                <HardeningConfigPanel hardening={hardening} onChange={setHardening} />
                {buildSummaryCard}
                {pipelineCard}
                <BobInitHistory refreshKey={historyRefresh} onRestore={restoreBuild} />
              </>
            ) : (
              <>
                <BudgetGauge budget={budget} setBudget={setBudget} />
                <DatabasePicker database={database} onChange={setDatabase} />
                {buildSummaryCard}
                {pipelineCard}
                <HardeningConfigPanel hardening={hardening} onChange={setHardening} />
                <BobInitHistory refreshKey={historyRefresh} onRestore={restoreBuild} />
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-[#484f58] pt-2">
          Every mode teaches code: read the JSON preview, write it by hand in Code Mode, and earn the half-price build.
        </p>
      </div>
    </div>
  );
}