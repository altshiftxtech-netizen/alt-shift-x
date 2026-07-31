import React, { useEffect, useRef, useState } from "react";
import { Terminal, Loader2, CheckCircle2, AlertCircle, Cpu, Shield, Wrench } from "lucide-react";

// BuildSequence — animates the B.O.B.Init build pipeline stages.
// Each stage represents a step in the "Machine that Builds Machines" flow:
//   1. Parse Command → 2. Query Registry → 3. Assemble Components →
//   4. Inject Self-Healing Shim → 5. Registry Audit → 6. Finalize Output
const STAGES = [
  { id: "parse", label: "Parsing stack configuration", icon: Terminal },
  { id: "registry", label: "Querying BOB-INIT-REGISTRY-1.0 for audited components", icon: Cpu },
  { id: "assemble", label: "Assembling component graph (createComponentSafe)", icon: Wrench },
  { id: "shim", label: "Injecting BOB-INIT-SELF-HEALING-SHIM-1.0 (drift_threshold: 0.85)", icon: Shield },
  { id: "audit", label: "Running Registry Audit against GSP-MASTER-INDEX-1.0", icon: CheckCircle2 },
  { id: "finalize", label: "Finalizing output Component record + Maintenance Manifest", icon: CheckCircle2 },
];

export default function BuildSequence({ active, onComplete }) {
  const [currentStage, setCurrentStage] = useState(-1);
  const [done, setDone] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!active) { setCurrentStage(-1); setDone(false); return; }

    let i = 0;
    setCurrentStage(0);
    const interval = setInterval(() => {
      i++;
      if (i >= STAGES.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
        return;
      }
      setCurrentStage(i);
    }, 900);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentStage]);

  if (!active && !done) return null;

  return (
    <div ref={scrollRef} className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4 font-mono text-xs space-y-2 max-h-72 overflow-y-auto no-scrollbar">
      {STAGES.map((stage, idx) => {
        const isCurrent = idx === currentStage;
        const isComplete = idx < currentStage || done;
        const Icon = stage.icon;
        return (
          <div key={stage.id} className={`flex items-center gap-2 ${isComplete ? "text-[#3fb950]" : isCurrent ? "text-cyan-400" : "text-[#484f58]"}`}>
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : isCurrent ? (
              <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
            ) : (
              <Icon className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {isComplete ? "✓ " : isCurrent ? "→ " : "  "}
              {stage.label}
            </span>
          </div>
        );
      })}
      {done && (
        <div className="pt-2 border-t border-[#30363d] text-[#3fb950]">
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
          Build complete. Output Component + Maintenance Manifest generated.
        </div>
      )}
    </div>
  );
}