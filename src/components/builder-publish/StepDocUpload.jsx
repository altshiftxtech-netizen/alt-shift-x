import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle, Sparkles, SkipForward } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function StepDocUpload({ onExtracted, onSkip }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
    setError("");
  };

  const handleProcess = async () => {
    if (!file) return;
    setError("");
    setUploading(true);

    // 1. Upload the file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    setExtracting(true);

    // 2. AI extraction to fill component fields
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a document about a software component/API that will be listed on a construction intelligence marketplace.
Extract all relevant information to fill in the component listing fields.
Return ONLY a JSON object with these fields (leave blank if not found):
- name: short slug code like RP-CONSTRUCTION-1.0 (uppercase, no spaces)
- displayName: human-readable component name
- type: one of X1, X2, X4
- category: one of "Risk & Compliance", "Project Management", "Site Reporting", "Cost Estimation", "Schedule Analysis"
- description: 1-2 sentence description (min 80 chars)
- longDescription: detailed paragraph description
- features: array of 3-6 feature strings
- schema: array of output field names this component returns
- price: suggested monthly price in USD (number)
- version: version string like v1.0.0`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          displayName: { type: "string" },
          type: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          longDescription: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          schema: { type: "array", items: { type: "string" } },
          price: { type: "number" },
          version: { type: "string" },
        }
      }
    });

    setExtracting(false);
    setDone(true);

    // Pass extracted data + file_url back to parent
    onExtracted({ ...result, documentUrl: file_url });
  };

  return (
    <Card className="border border-violet-200 shadow-sm bg-violet-50/30">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          Step 0 — Upload Component Document (Optional)
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Upload a PDF or Word doc describing your component. Our AI will auto-fill the form fields for you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!done ? (
          <>
            <label className="block w-full border-2 border-dashed border-violet-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 transition-colors bg-white">
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                  <FileText className="w-5 h-5 text-violet-600" />
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to upload PDF or Word doc</p>
                  <p className="text-xs mt-1">.pdf, .doc, .docx supported</p>
                </div>
              )}
            </label>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-slate-400 hover:text-slate-600 gap-1.5">
                <SkipForward className="w-3.5 h-3.5" /> Skip — fill manually
              </Button>
              <Button
                onClick={handleProcess}
                disabled={!file || uploading || extracting}
                className="bg-violet-700 hover:bg-violet-800 text-white gap-2"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> :
                 extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting with AI…</> :
                 <><Sparkles className="w-4 h-4" /> Auto-fill from Document</>}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 gap-3">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">Fields auto-filled successfully!</p>
            <p className="text-xs text-slate-400">Review and edit the form on the next step.</p>
            <Button onClick={onSkip} className="bg-violet-700 hover:bg-violet-800 text-white">
              Continue to Form →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}