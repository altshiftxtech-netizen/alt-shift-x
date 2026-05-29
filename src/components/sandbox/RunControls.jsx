import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2, Zap } from "lucide-react";

export default function RunControls({ onRun, onReset, isRunning, hasResults, runCount }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3">
          <Button
            onClick={onRun}
            disabled={isRunning}
            className="flex-1 bg-violet-700 hover:bg-violet-800 text-white font-semibold h-11 text-sm gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running extraction...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Extraction
              </>
            )}
          </Button>
          {hasResults && (
            <Button
              variant="outline"
              onClick={onReset}
              className="h-11 px-4"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isRunning && (
          <div className="mt-4 space-y-2">
            {["Pass 1: Document classification", "Pass 2: Field extraction", "Pass 3: Cross-reference validation", "Pass 4: Hallucination audit"].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-violet-500 animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.15}s` }} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        )}

        {runCount > 0 && !isRunning && (
          <div className="mt-3 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-slate-400">Run #{runCount} complete</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sandbox Mode</p>
          {[
            "Results are never published or stored",
            "Simulates your component's 4-pass pipeline",
            "Hallucination audit runs on every test",
          ].map((note, i) => (
            <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
              <span className="text-slate-300 mt-0.5">•</span> {note}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}