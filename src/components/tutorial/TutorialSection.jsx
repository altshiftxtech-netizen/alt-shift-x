import React, { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TutorialSection({ index, section }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <h3 className="font-medium text-slate-900">{section.title}</h3>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>

        {open && (
          <ol className="mt-4 ml-11 space-y-2.5">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}