import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { History, ChevronDown, Trash2, Clock, Cpu, DollarSign } from "lucide-react";

const STORAGE_KEY = "bob-init-history";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveBuildEntry(entry) {
  try {
    const existing = loadHistory();
    const updated = [{ ...entry, id: Date.now().toString() }, ...existing].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch { return loadHistory(); }
}

export function clearHistory() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

export default function BobInitHistory({ refreshKey, onRestore }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(loadHistory());
  }, [refreshKey]);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <Card className="border-[#30363d] bg-[#0d1117]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 pt-4 pb-3 text-left"
      >
        <History className="w-4 h-4 text-cyan-400" />
        <h3 className="flex-1 text-xs font-mono text-[#8b949e] uppercase tracking-wider">Build History</h3>
        <span className="text-[10px] font-mono text-[#484f58]">{entries.length} {entries.length === 1 ? "build" : "builds"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#484f58] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <CardContent className="pt-0 pb-3 space-y-1.5">
          {entries.length === 0 ? (
            <p className="text-[11px] text-[#484f58] font-mono px-1 py-2">No builds yet. Run <span className="text-cyan-400">bob build</span> to create your first history entry.</p>
          ) : (
            <>
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 hover:border-cyan-500/40 cursor-pointer transition-colors"
                  onClick={() => onRestore?.(e)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-mono text-[#c9d1d9] flex-1 truncate">{e.stack?.toUpperCase()}-AGENT-1.0</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${e.tierColor || "text-cyan-400"}`}>{e.tier}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#484f58]">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{new Date(e.timestamp).toLocaleString()}</span>
                    <span className="flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />{e.budget?.toLocaleString()}</span>
                    {e.shim && <span>shim: {e.shim}</span>}
                  </div>
                </div>
              ))}
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[10px] font-mono text-[#484f58] hover:text-red-400 px-1 pt-1"
              >
                <Trash2 className="w-3 h-3" /> Clear history
              </button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}