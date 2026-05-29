import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2, ExternalLink, ChevronRight, Package } from "lucide-react";

const INSTALLED = [
  { id: "ironclad-protocol", name: "Ironclad Protocol", code: "RP-CONSTRUCTION-1.0", type: "X1", category: "Risk & Compliance", trustScore: 91, price: 5, callsThisMonth: 1240, installedDate: "Jan 15, 2026", status: "active" },
  { id: "the-site-board", name: "The Site Board", code: "RC-CONSTRUCTION", type: "X4", category: "Site Reporting", trustScore: 93, price: 4, callsThisMonth: 876, installedDate: "Feb 3, 2026", status: "active" },
  { id: "estimators-eye", name: "Estimator's Eye", code: "PM-CONSTRUCTION-BID", type: "X2", category: "Project Management", trustScore: 87, price: 6, callsThisMonth: 334, installedDate: "Mar 10, 2026", status: "active" },
];

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

export default function InstalledComponents() {
  const [components, setComponents] = useState(INSTALLED);

  const handleUninstall = (id) => setComponents(prev => prev.filter(c => c.id !== id));

  const totalMonthly = components.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-700 font-medium">Installed Components</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Installed Components</h1>
            <p className="text-sm text-slate-400">{components.length} active · ${totalMonthly}/mo estimated</p>
          </div>
          <Link to="/marketplace">
            <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm h-9 gap-2">
              <Package className="w-4 h-4" /> Add More
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {components.map(c => (
            <Card key={c.id}>
              <CardContent className="py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{c.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-500">
                    <div className="text-center">
                      <p className="font-bold text-slate-800">{c.callsThisMonth.toLocaleString()}</p>
                      <p className="text-slate-400">calls/mo</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800">${c.price}</p>
                      <p className="text-slate-400">per install/mo</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />{c.trustScore}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/marketplace/${c.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                      </Link>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-300" onClick={() => handleUninstall(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Installed {c.installedDate}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {components.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold mb-2">No components installed</p>
            <Link to="/marketplace"><Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm">Browse Marketplace</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}