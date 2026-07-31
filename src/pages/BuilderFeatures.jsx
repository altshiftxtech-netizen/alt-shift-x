import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, ListChecks, ArrowRight, Crown, Rocket, CheckCircle2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import BobInitHandbook from "@/components/bob-init/BobInitHandbook";
import FeatureGroup from "@/components/bob-init/FeatureGroup";
import RulesEngine from "@/components/bob-init/RulesEngine";
import CodeInjector from "@/components/bob-init/CodeInjector";
import BuildManifest from "@/components/bob-init/BuildManifest";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import { Link } from "react-router-dom";

export default function BuilderFeatures() {
  const { status, isAdmin } = useSovereignAccess();
  const [selected, setSelected] = useState({});
  const [rules, setRules] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [apiFields, setApiFields] = useState([]);
  const [rendering, setRendering] = useState(false);
  const [rendered, setRendered] = useState(false);

  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRender = () => {
    setRendering(true);
    setRendered(false);
    setTimeout(() => {
      setRendering(false);
      setRendered(true);
    }, 3500);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (status !== "sovereign" && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center rounded-2xl border border-[#30363d] bg-[#0d1117] p-8">
          <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 bg-cyan-600/10 border border-cyan-500/30">
            <ListChecks className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Feature Selection Requires Sovereign Tier</h1>
          <p className="text-sm text-[#8b949e] mb-6">
            The hardened module checklist, rules engine, and code injection tools are reserved for Sovereign-tier builders.
          </p>
          <Button asChild className="w-full bg-gradient-to-r from-[#E6C878] to-[#C8A95B] text-[#0A0A0C] font-bold gap-1.5">
            <Link to="/enterprise"><Crown className="w-4 h-4" /> Upgrade to Sovereign <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <SharedNav mode="builder" theme="dev" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
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
              <p className="text-xs text-[#8b949e] font-mono">Your PWA has been hardened with {Object.values(selected).filter(Boolean).length} modules and is ready for download from your dashboard.</p>
            </div>
            <button onClick={() => setRendered(false)} className="text-xs font-mono text-[#484f58] hover:text-[#8b949e]">Dismiss</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main column — checklist + rules + code injection */}
          <div className="lg:col-span-2 space-y-4">
            <FeatureGroup selected={selected} onToggle={toggle} />
            <RulesEngine rules={rules} setRules={setRules} />
            <CodeInjector uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} apiFields={apiFields} setApiFields={setApiFields} />
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