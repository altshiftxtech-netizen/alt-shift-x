import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FEATURE_GROUPS, calculateEsi } from "@/components/bob-init/featureData";
import SharedNav from "@/components/SharedNav";
import BobInitHandbook from "@/components/bob-init/BobInitHandbook";
import FeatureGroup from "@/components/bob-init/FeatureGroup";
import RulesEngine from "@/components/bob-init/RulesEngine";
import CodeInjector from "@/components/bob-init/CodeInjector";
import BuildManifest from "@/components/bob-init/BuildManifest";
import ApexSandbox from "@/components/bob-init/ApexSandbox";
import ProjectPreview from "@/components/bob-init/ProjectPreview";

export default function BuilderFeatures() {
  const [selected, setSelected] = useState({});
  const [rules, setRules] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [apiFields, setApiFields] = useState([]);
  const [rendering, setRendering] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);

  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRender = async () => {
    const selectedIds = Object.keys(selected).filter((k) => selected[k]);
    if (selectedIds.length === 0) return;
    setRendering(true);
    setRendered(false);
    setRenderError(null);
    try {
      const feature_labels = FEATURE_GROUPS.flatMap((g) =>
        g.features.filter((f) => selected[f.id]).map((f) => f.label.split("(")[0].trim())
      );
      const esi_score = calculateEsi(selected);
      const res = await base44.functions.invoke("saveBobBuild", {
        selected_features: selectedIds,
        feature_labels,
        rules,
        code_files: uploadedFiles.map((f) => f.name || f),
        api_fields: apiFields.filter((f) => f.key && f.key.trim()),
        esi_score,
        pwa_name: "Alt+Shift+X PWA",
      });
      setRendering(false);
      setRendered(true);
    } catch (e) {
      setRendering(false);
      setRenderError(e?.response?.data?.error || e.message || "Render failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] relative overflow-hidden">
      {/* Video background */}
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none">
        <source src="https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/fec84752f_288132b88_generated_video.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-[#0d1117]/50 pointer-events-none" />

      <SharedNav mode="builder" theme="dev" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Feature Selection <span className="text-cyan-400 text-sm font-mono">&lt;manifest&gt;</span>
              </h1>
              <p className="text-xs text-[#8b949e] font-mono">BOB-INIT-FEATURE-PAGE-1.0 · Architect hardened components before render</p>
            </div>
          </div>
          <BobInitHandbook />
        </div>

        {rendered && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-green-400">Build manifest rendered successfully.</p>
              <p className="text-xs text-[#8b949e] font-mono">Your PWA has been hardened with {Object.values(selected).filter(Boolean).length} modules and saved to your account. Install or download it from the <Link to="/dashboard/pwa" className="text-cyan-400 hover:underline">PWA Portal</Link>.</p>
            </div>
            <button onClick={() => setRendered(false)} className="text-xs font-mono text-[#484f58] hover:text-[#8b949e]">Dismiss</button>
          </div>
        )}

        {renderError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400">Render failed.</p>
              <p className="text-xs text-[#8b949e] font-mono">{renderError}</p>
            </div>
            <button onClick={() => setRenderError(null)} className="text-xs font-mono text-[#484f58] hover:text-[#8b949e]">Dismiss</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main column — checklist + rules + code injection */}
          <div className="lg:col-span-2 space-y-4">
            <FeatureGroup selected={selected} onToggle={toggle} />
            <RulesEngine rules={rules} setRules={setRules} />
            <CodeInjector uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} apiFields={apiFields} setApiFields={setApiFields} />
            <ApexSandbox selectedCount={Object.values(selected).filter(Boolean).length} />
            <ProjectPreview selected={selected} />
          </div>

          {/* Sidebar — build manifest */}
          <div>
            <BuildManifest
              selected={selected}
              rules={rules}
              uploadedFiles={uploadedFiles}
              apiFields={apiFields}
              onRender={handleRender}
              rendering={rendering}
            />
          </div>
        </div>
      </div>
    </div>
  );
}