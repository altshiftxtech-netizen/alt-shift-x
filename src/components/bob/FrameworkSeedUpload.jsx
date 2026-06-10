import React, { useRef, useState } from "react";
import { Upload, Loader2, Sparkles, FileUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildDocContext } from "@/lib/extractDocText";

// Open to EVERY builder: upload an existing component (code or doc) and BOB will
// draft YOUR OWN framework from it. Magna Dev's do-no-harm + governance baseline
// always applies underneath — this is the builder's own spin on top of it.
export default function FrameworkSeedUpload({ frameworkName, onSeed }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push({ name: file.name, url: file_url });
      }
      const fileList = uploaded.map((f) => f.name).join(", ");
      const docContext = await buildDocContext(uploaded);
      const seed =
        `Build me MY OWN component framework from the component I'm uploading.\n\n` +
        `[Attached: ${fileList}]\n` +
        `Read it, infer its structure, and draft a reusable framework named "${frameworkName}" that captures my ` +
        `approach to building components. Keep Magna Dev's Do-No-Harm and governance standards as the baseline, ` +
        `but make the framework my own spin. Lay out each section (project, component identity, AI behavior, ` +
        `input/output, compliance, pricing, deployment, branding) so I can save and reuse it.${docContext}`;
      onSeed(seed, uploaded.map((f) => f.url));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-violet-700/50 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-violet-900/60 flex items-center justify-center flex-shrink-0">
          <FileUp className="w-4 h-4 text-violet-300" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Make it your own
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Upload an existing component and BOB will draft <strong className="text-violet-300">your own framework</strong> from it.
            The Magna Dev Do-No-Harm baseline always applies — this just adds your spin.
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.csv,.doc,.docx,.txt,.json,.xlsx,.xls,.js,.jsx,.ts,.py,.md"
            className="hidden"
            onChange={handleFiles}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 px-3 py-2 rounded-lg transition-colors"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {busy ? "Uploading…" : "Upload a component to seed my framework"}
          </button>
        </div>
      </div>
    </div>
  );
}