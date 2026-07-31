import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Clock, Shield, Loader2, Cpu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PwaBuildInstall from "@/components/pwa/PwaBuildInstall";

// MyBuilds — lists the current builder's persisted B.O.B.Init builds, each
// with install + ZIP-download actions. Renders inside the PWA Portal.
export default function MyBuilds() {
  const [builds, setBuilds] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) { setBuilds([]); return; }
      const list = await base44.entities.BobBuild.filter(
        { builder_id: user.id },
        "-created_date",
        50
      );
      setBuilds(list);
    } catch (e) {
      setError(e.message || "Could not load builds");
      setBuilds([]);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-900">My B.O.B.Init Builds</h2>
        </div>
        <p className="text-sm text-slate-500 -mt-2">
          Builds you render on the <Link to="/builder/features" className="text-violet-600 hover:underline">Feature Selection</Link> page are persisted here — install them as PWAs or download a deployable ZIP package.
        </p>

        {builds === null ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading builds…
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 py-4 text-center">{error}</div>
        ) : builds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No builds yet.</p>
            <Link to="/builder/features" className="text-sm text-violet-600 hover:underline font-semibold">
              Render your first PWA →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {builds.map((b) => (
              <div key={b.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {b.pwa_name || b.build_code || "Alt+Shift+X PWA"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      {b.build_code && <span className="font-mono">{b.build_code}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.created_date ? new Date(b.created_date).toLocaleDateString() : "—"}</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" />ESI {b.esi_score || 0}/100</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded bg-violet-50 text-violet-700">
                    {(b.feature_labels || []).length} modules
                  </span>
                </div>

                {(b.feature_labels || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {b.feature_labels.slice(0, 6).map((l, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{l}</span>
                    ))}
                    {b.feature_labels.length > 6 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400">+{b.feature_labels.length - 6} more</span>
                    )}
                  </div>
                )}

                <PwaBuildInstall build={b} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}