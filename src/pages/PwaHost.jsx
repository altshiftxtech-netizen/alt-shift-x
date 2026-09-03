import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Package, Shield, Cpu, FileCode } from "lucide-react";

export default function PwaHost() {
  const { id } = useParams();
  const [pwa, setPwa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    base44.functions.invoke("getHostedPwa", { export_id: id })
      .then((res) => {
        const data = res.data || res;
        if (data?.ok || data?.name) {
          setPwa(data);
        } else {
          setError(data?.error || "Failed to load PWA");
        }
        setLoading(false);
      })
      .catch((e) => { setError(e.message || "Failed to load PWA"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !pwa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-red-400 text-sm">{error || "PWA not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* PWA Shell Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-100 truncate">{pwa.name}</h1>
            <p className="text-[10px] text-slate-500">v{pwa.version || "1.0.0"}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            SOV-PWA-SERVER-HOST-1.0
          </span>
        </div>
      </header>

      {/* PWA Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-1">{pwa.name}</h2>
          <p className="text-xs text-slate-400 mb-3">Version {pwa.version || "1.0.0"}</p>
          {pwa.description && (
            <p className="text-sm text-slate-300 leading-relaxed">{pwa.description}</p>
          )}
        </div>

        {/* Component Codes */}
        {pwa.component_codes?.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">Bundled Components</h3>
              <span className="text-[10px] text-slate-500 ml-auto">{pwa.component_codes.length} modules</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pwa.component_codes.map((code, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-950 border border-slate-700 text-slate-300">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Status</h3>
            </div>
            <p className="text-xs text-slate-400 capitalize">{pwa.status || "active"}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200">Date Wired</h3>
            </div>
            <p className="text-xs text-slate-400">
              {pwa.date_wired ? new Date(pwa.date_wired).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] text-slate-600">
            Hosted by SOV-PWA-SERVER-HOST-1.0 · Sovereign PWA Hosting Protocol
          </p>
        </div>
      </main>
    </div>
  );
}