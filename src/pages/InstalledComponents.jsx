import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2, ExternalLink, Terminal, Package, Download, Loader2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { exportInstalledComponentsPdf } from "@/utils/exportPdf";
import ComponentZipExport from "@/components/install/ComponentZipExport";
import { base44 } from "@/api/base44Client";

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

export default function InstalledComponents() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  // ZIP export is for standard paid accounts only — NOT developers or free plans.
  const [zipEligible, setZipEligible] = useState(false);

  // Load the user's REAL installed components from the database.
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const records = await base44.entities.InstalledComponent.filter({ user_id: me.id }, "-installed_at");
        setComponents(records);

        // Eligibility: paid plan AND not a developer/builder.
        const [subs, profiles, owned] = await Promise.all([
          base44.entities.Subscription.filter({ user_id: me.id }).catch(() => []),
          base44.entities.UserAdminProfile.filter({ user_id: me.id }).catch(() => []),
          base44.entities.Component.filter({ builder_id: me.id }).catch(() => []),
        ]);
        const plan = subs?.[0]?.plan || "free";
        const isDeveloper = profiles?.[0]?.resident_developer === true || (owned || []).length > 0;
        setZipEligible(plan !== "free" && !isDeveloper);
      } catch {
        setComponents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUninstall = async (recordId) => {
    await base44.entities.InstalledComponent.delete(recordId);
    setComponents((prev) => prev.filter((c) => c.id !== recordId));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Components</h1>
            <p className="text-sm text-slate-400">{components.length} active components</p>
          </div>
          <div className="flex items-center gap-2">
            <ComponentZipExport eligible={zipEligible} installs={components} />
            <Button variant="outline" className="text-sm h-9 gap-2" onClick={() => exportInstalledComponentsPdf(components)}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <Link to="/marketplace">
              <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm h-9 gap-2">
                <Package className="w-4 h-4" /> Add More
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {components.map((c) => (
                <Card key={c.id}>
                  <CardContent className="py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            {c.component_type && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.component_type] || "bg-slate-100 text-slate-600"}`}>{c.component_type}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{c.component_name}</h3>
                          {c.component_code && <p className="text-[10px] font-mono text-slate-400">{c.component_code}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-slate-500">
                        <div className="text-center">
                          <p className="font-bold text-slate-800">{(c.calls_this_month || 0).toLocaleString()}</p>
                          <p className="text-slate-400">calls/mo</p>
                        </div>
                        {typeof c.trust_score === "number" && (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                            <ShieldCheck className="w-4 h-4" />{c.trust_score}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Link to={`/dashboard/setup/${c.component_id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8" title="Open component"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </Link>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-300" onClick={() => handleUninstall(c.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>{c.installed_at ? `Installed ${c.installed_at}` : ""}</span>
                      <div className="flex items-center gap-3">
                        <Link to={`/dashboard/setup/${c.component_id}`} className="flex items-center gap-1 text-violet-600 font-semibold hover:underline">
                          <Terminal className="w-3 h-3" /> Setup Guide
                        </Link>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {components.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold mb-2">No components in your dashboard</p>
                <Link to="/marketplace"><Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm">Browse Marketplace</Button></Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}