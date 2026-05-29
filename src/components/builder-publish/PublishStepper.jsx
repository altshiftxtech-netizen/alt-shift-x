import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function PublishStepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-emerald-500 text-white" : active ? "bg-violet-700 text-white ring-4 ring-violet-100" : "bg-slate-200 text-slate-400"
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-[10px] mt-1 font-semibold text-center max-w-16 ${active ? "text-violet-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}