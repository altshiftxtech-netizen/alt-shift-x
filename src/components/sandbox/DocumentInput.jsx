import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";

export default function DocumentInput({ value, onChange, componentName }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => onChange(evt.target.result);
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">Sample Document</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {value.length.toLocaleString()} chars
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => fileRef.current.click()}
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload .txt
            </Button>
            <input ref={fileRef} type="file" accept=".txt,.md,.text" className="hidden" onChange={handleFile} />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Pre-loaded with a sample {componentName} document. Edit freely or upload your own.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-72 text-xs font-mono leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
          placeholder="Paste your document text here..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}