import React, { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Terminal, Printer, CheckCircle2, Clock, ListOrdered, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNZIP_TILES } from "./unzipSeries";

const GOLD = "#C8A95B";
const PRESS_CODE = "SOVEREIGN-PRINT-PRESS-1.0";

// ^(x1-x5[,x1-x5]...)? print for <n> <hour|hours|minute|minutes>$
const COMMAND_RE = /^([xX][1-5](?:,\s*[xX][1-5])*)?\s*print\s+for\s+(\d+)\s+(hour|hours|minute|minutes)$/;

const TYPE_LABEL = {
  X1: "Reading Protocol", X2: "Prophecy Model", X3: "Speed Profile",
  X4: "Reason Council", X5: "Complete Agent",
};

// Demo compression: the real spec is "one log line every 5% of the duration
// window". We keep the 20-tick (5%) cadence exactly, but compress wall-clock
// time so a 1-hour print is watchable in the vault. Each 5% tick fires on this
// interval; the forensic log timestamps still read as the requested window.
const TICK_MS = 900;
const TICKS = 20; // 100% / 5%

function parseCommand(raw) {
  const command = String(raw || "").trim();
  const m = command.match(COMMAND_RE);
  if (!m) return { ok: false, error: "Syntax: [x1,x2] print for <n> hours (or minutes)" };
  const unit = m[3].toLowerCase();
  const amount = parseInt(m[2], 10);
  const durationHours = unit.startsWith("hour") ? amount : amount / 60;
  if (durationHours > 24) return { ok: false, error: "Max duration is 24 hours. Reject." };
  const types = m[1] ? [...new Set(m[1].split(",").map((t) => t.trim().toUpperCase()))] : ["X5"];
  return { ok: true, command, types, amount, unit, durationHours };
}

function pad2(n) { return String(n).padStart(2, "0"); }

/**
 * SovereignPrintPress — SOVEREIGN-PRINT-PRESS-1.0.
 *
 * Command syntax:  "x1,x2 print for 1 hour"  (types optional → defaults X5)
 *   - Max 24 hours; longer is rejected.
 *   - Jobs run SERIALLY. A command sent while a job is active is QUEUED.
 *   - Live progress: a mono-spaced Forensic Log emits one line every 5% of the
 *     duration window, driving an amber "Diamond Press" glow progress bar.
 *   - On completion, createComponentSafe is triggered (via diamondPress `print`)
 *     for each requested X-type from the selected Seed cluster.
 */
export default function SovereignPrintPress() {
  const [seedId, setSeedId] = useState(UNZIP_TILES[0]?.id || "");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const [active, setActive] = useState(null); // { command, types, durationHours, pct }
  const [queue, setQueue] = useState([]);      // pending parsed jobs
  const [log, setLog] = useState([]);          // forensic log lines (strings)
  const [pct, setPct] = useState(0);

  const timerRef = useRef(null);
  const logEndRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  const appendLog = useCallback((line) => {
    const ts = new Date().toISOString().split("T")[1].replace("Z", "");
    setLog((prev) => [...prev, `[${ts}] ${line}`]);
  }, []);

  const runJob = useCallback(async (job) => {
    runningRef.current = true;
    setActive({ ...job, pct: 0 });
    setPct(0);
    setLog([]);
    const seed = UNZIP_TILES.find((t) => t.id === seedId);
    appendLog(`${PRESS_CODE} — job accepted.`);
    appendLog(`SEED ······· ${seed?.code || seedId}`);
    appendLog(`TYPES ······ ${job.types.join(", ")}`);
    appendLog(`WINDOW ····· ${job.amount} ${job.unit} (${job.durationHours}h)`);
    appendLog("──────────────────────────────────────");

    let step = 0;
    await new Promise((resolve) => {
      timerRef.current = setInterval(() => {
        step += 1;
        const p = Math.min(100, step * (100 / TICKS));
        setPct(p);
        // Simulated "as-of" clock across the requested window.
        const elapsedH = (p / 100) * job.durationHours;
        const hh = Math.floor(elapsedH);
        const mm = Math.floor((elapsedH - hh) * 60);
        appendLog(`+${pad2(hh)}:${pad2(mm)} ··· ${pad2(p)}% ··· distilling ${job.types.join("/")} seed refinement…`);
        if (step >= TICKS) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          resolve();
        }
      }, TICK_MS);
    });

    appendLog("──────────────────────────────────────");
    appendLog("100% window complete → triggering createComponentSafe…");

    try {
      const res = await base44.functions.invoke("diamondPress", {
        action: "print",
        component_id: seedId,
        command: job.command,
      });
      if (res.data?.ok) {
        const printed = res.data.printed || [];
        printed.forEach((r) => appendLog(`✅ ${r.action?.toUpperCase() || "OK"} ${r.code}`));
        appendLog(`PRESS COMPLETE — ${printed.length} component(s) sent to your dashboard as drafts.`);
      } else {
        appendLog(`✗ ${res.data?.error || "Press failed at handoff."}`);
      }
    } catch {
      appendLog("✗ Press failed at handoff.");
    }

    setActive(null);
    runningRef.current = false;
    // Serial queue → pick up the next job, if any.
    setQueue((prev) => {
      const [next, ...rest] = prev;
      if (next) setTimeout(() => runJob(next), 120);
      return rest;
    });
  }, [seedId, appendLog]);

  const submit = () => {
    setError("");
    const parsed = parseCommand(input);
    if (!parsed.ok) { setError(parsed.error); return; }
    setInput("");
    if (runningRef.current) {
      setQueue((prev) => [...prev, parsed]);
    } else {
      runJob(parsed);
    }
  };

  const removeQueued = (i) => setQueue((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>{PRESS_CODE}</p>
        <p className="text-xs text-white/55 max-w-md mx-auto">
          Command the press with syntax like <span className="font-mono text-white/75">x1,x2 print for 1 hour</span>. Jobs run serially;
          new commands queue. Max window 24 hours.
        </p>
      </div>

      {/* Seed + command bar */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: `${GOLD}33`, background: "rgba(255,255,255,0.02)" }}>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Seed cluster</label>
          <select
            value={seedId}
            onChange={(e) => setSeedId(e.target.value)}
            className="mt-1 w-full rounded-lg px-3 py-2 text-xs text-white bg-black/40 border border-white/15 focus:outline-none focus:border-[#C8A95B]"
          >
            {UNZIP_TILES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#12100b]">{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-black/40 border border-white/15 focus-within:border-[#C8A95B]">
          <Terminal className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="x1,x2 print for 1 hour"
            className="flex-1 bg-transparent text-sm text-white font-mono placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[#0A0A0C] shrink-0"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
          >
            <Printer className="w-3.5 h-3.5" /> Run
          </button>
        </div>
        {error && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> {error}</p>}
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="rounded-xl border p-3 space-y-1.5" style={{ borderColor: "#ffffff1a", background: "rgba(255,255,255,0.02)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5" /> Queued · serial
          </p>
          {queue.map((j, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] text-white/60 font-mono">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-amber-400/70" /> {j.command}</span>
              <button onClick={() => removeQueued(i)} className="text-white/30 hover:text-red-400"><XCircle className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Live forensic log — replaces the standard output window while printing */}
      {(active || log.length > 0) && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${GOLD}55`, background: "rgba(10,9,6,0.85)" }}>
          {/* Amber Diamond-Press glow progress bar */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                {active ? `Printing ${active.types.join(", ")}` : "Press idle"}
              </span>
              <span className="text-[11px] font-mono text-white/60">{pad2(Math.round(pct))}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#ffffff12" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${GOLD}, #F4E3B0)`,
                  boxShadow: `0 0 12px ${GOLD}, 0 0 24px ${GOLD}88`,
                }}
              />
            </div>
          </div>

          {/* Mono-spaced forensic log */}
          <div className="p-4 max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed">
            {log.map((line, i) => (
              <div key={i} className={line.includes("✅") || line.includes("COMPLETE") ? "text-emerald-300" : line.includes("✗") ? "text-red-400" : "text-white/55"}>
                {line}
              </div>
            ))}
            {active && (
              <div className="flex items-center gap-1.5 mt-1" style={{ color: GOLD }}>
                <Loader2 className="w-3 h-3 animate-spin" /> press running…
              </div>
            )}
            {!active && log.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1 text-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> press idle — ready for next command.
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}