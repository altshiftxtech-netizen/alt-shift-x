import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import {
  GitBranch, Clock, ChevronRight, AlertTriangle, CheckCircle2,
  RotateCcw, Loader2, Tag, FileText, TrendingUp, ArrowLeft
} from "lucide-react";

const STATUS_COLORS = {
  published: "bg-emerald-100 text-emerald-700",
  deprecated: "bg-amber-100 text-amber-700",
  rollback: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-500",
};

export default function ComponentVersionHistory() {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [snapshotting, setSnapshotting] = useState(false);
  const [changelog, setChangelog] = useState("");
  const [showReleaseForm, setShowReleaseForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      base44.entities.Component.filter({ id }),
      base44.entities.ComponentVersion.filter({ component_id: id }, "-created_date", 50),
    ]).then(([comps, vers]) => {
      setComponent(comps[0] || null);
      setVersions(vers);
      setSelected(vers[0] || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSnapshot = async (breaking = false) => {
    setSnapshotting(true);
    const res = await base44.functions.invoke("snapshotComponentVersion", {
      component_id: id, changelog, breaking_change: breaking,
    });
    if (res.data?.version) {
      const vers = await base44.entities.ComponentVersion.filter({ component_id: id }, "-created_date", 50);
      setVersions(vers);
      setSelected(vers[0]);
      setChangelog("");
      setShowReleaseForm(false);
    }
    setSnapshotting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/builder/components">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"><ArrowLeft className="w-3.5 h-3.5" />Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-violet-600" />
              {component?.name || "Component"} — Version History
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">{versions.length} versions · {component?.code}</p>
          </div>
          <Button onClick={() => setShowReleaseForm(true)} className="ml-auto bg-violet-600 hover:bg-violet-700 gap-2 text-sm">
            <Tag className="w-4 h-4" /> Release Version
          </Button>
        </div>

        {/* Release Form */}
        {showReleaseForm && (
          <Card className="border-violet-200 bg-violet-50">
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-bold text-violet-900">Create New Version Snapshot</p>
              <textarea value={changelog} onChange={e => setChangelog(e.target.value)}
                placeholder="Describe what changed in this version..."
                className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white resize-none" rows={3} />
              <div className="flex gap-2">
                <Button onClick={() => handleSnapshot(false)} disabled={snapshotting || !changelog.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5">
                  {snapshotting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                  Patch Release (1.x.x)
                </Button>
                <Button onClick={() => handleSnapshot(true)} disabled={snapshotting || !changelog.trim()}
                  variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 text-xs gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Breaking Release (x.0.0)
                </Button>
                <Button onClick={() => setShowReleaseForm(false)} variant="ghost" size="sm" className="text-xs text-slate-500">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Version list */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Versions</p>
            {versions.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No versions yet.<br />Release your first version above.</div>
            )}
            {versions.map((v, i) => (
              <button key={v.id} onClick={() => setSelected(v)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selected?.id === v.id ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 hover:border-violet-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${selected?.id === v.id ? "text-white" : "text-violet-700"}`}>v{v.version}</span>
                    {i === 0 && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${selected?.id === v.id ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>LATEST</span>}
                    {v.breaking_change && <AlertTriangle className={`w-3 h-3 ${selected?.id === v.id ? "text-amber-300" : "text-amber-500"}`} />}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${selected?.id === v.id ? "text-white/60" : "text-slate-300"}`} />
                </div>
                <p className={`text-[10px] mt-1 truncate ${selected?.id === v.id ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(v.published_at || v.created_date).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Version detail */}
          <div className="md:col-span-2">
            {selected ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-slate-900">v{selected.version}</CardTitle>
                    <div className="flex items-center gap-2">
                      {selected.breaking_change && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Breaking Change
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[selected.status] || STATUS_COLORS.draft}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Released {new Date(selected.published_at || selected.created_date).toLocaleString()}
                    · Trust score at publish: <strong>{selected.trust_score_at_publish || "—"}</strong>
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Changelog */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Changelog</p>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3">{selected.changelog || "No changelog provided."}</p>
                  </div>

                  {/* Diff */}
                  {selected.diff_summary && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Changes vs Previous</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Added", fields: selected.diff_summary.added, color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                          { label: "Modified", fields: selected.diff_summary.modified, color: "text-blue-700 bg-blue-50 border-blue-100" },
                          { label: "Removed", fields: selected.diff_summary.removed, color: "text-red-700 bg-red-50 border-red-100" },
                        ].map(({ label, fields, color }) => (
                          <div key={label} className={`border rounded-xl p-3 ${color}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-2">{label} ({fields?.length || 0})</p>
                            {(fields || []).length === 0
                              ? <p className="text-[10px] opacity-60">None</p>
                              : (fields || []).map(f => <p key={f} className="text-[10px] font-mono">{f}</p>)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auto-upgrade badge */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {selected.auto_upgrade_eligible
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                    <p className="text-xs text-slate-600">
                      {selected.auto_upgrade_eligible
                        ? "Subscribers will be auto-upgraded to this version (non-breaking)."
                        : "Subscribers must manually migrate — breaking change detected."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-sm">
                Select a version to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}