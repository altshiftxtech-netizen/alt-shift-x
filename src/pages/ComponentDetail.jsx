import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Download, ArrowLeft, CheckCircle2, ChevronRight, Users, FlaskConical, Loader2 } from "lucide-react";
import InstallButton from "@/components/InstallButton";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };
const tierConfig = { certified: "bg-emerald-100 text-emerald-700", official: "bg-violet-100 text-violet-700" };

export default function ComponentDetail() {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Component.list()
      .then(data => {
        const found = (data || []).find(item => item.id === id);
        if (found) {
          const c = found;
          setComponent({
            ...c,
            trustScore: c.trust_score,
            trustBreakdown: c.trust_breakdown || {},
            longDesc: c.long_description || c.description,
            features: c.features || [],
            schema: c.schema || [],
            reviews: c.reviews_count || 0,
            installs: c.installs_count || 0,
            builder: { name: c.builder_id || "Unknown", tier: c.certified ? "certified" : "official", avatar: (c.builder_id || "U")[0].toUpperCase() },
            recentReviews: [],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!component) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Component not found.</p>
        <Link to="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/marketplace" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-700 font-medium">{component.name}</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColors[component.type]}`}>{component.type}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{component.category}</span>
                {component.certified && <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Certified</span>}
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">{component.name}</h1>
              <p className="text-sm font-mono text-slate-400 mb-4">{component.code}</p>
              <p className="text-slate-600 leading-relaxed">{component.longDesc}</p>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">What it extracts</h3>
                <ul className="space-y-2">
                  {component.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Output Schema */}
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Output Schema Fields</h3>
                <div className="flex flex-wrap gap-2">
                  {component.schema.map(f => (
                    <span key={f} className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{f}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust breakdown */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Trust Score Breakdown</h3>
                  <div className="flex items-center gap-1 text-lg font-black text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />{component.trustScore}
                  </div>
                </div>
                {Object.entries(component.trustBreakdown).map(([key, val]) => (
                  <div key={key} className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1 capitalize">
                      <span>{key}</span><span className="font-semibold text-slate-700">{val}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${val}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Reviews</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <span className="text-sm font-bold text-slate-800">{component.rating}</span>
                    <span className="text-xs text-slate-400">({component.reviews})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {component.recentReviews.map((r, i) => (
                    <div key={i} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{r.author[0]}</div>
                        <span className="text-xs font-semibold text-slate-700">{r.author}</span>
                        <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />)}</div>
                      </div>
                      <p className="text-xs text-slate-500">{r.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardContent className="pt-5">
                <div className="text-2xl font-black text-slate-900 mb-1">${component.price}<span className="text-sm font-normal text-slate-400">/install</span></div>
                <p className="text-xs text-slate-400 mb-4">Per active installation per month</p>
                <div className="mb-3 w-full">
                  <InstallButton component={component} size="lg" />
                </div>
                <Link to="/builder/sandbox">
                  <Button variant="outline" className="w-full text-sm h-9 gap-2"><FlaskConical className="w-3.5 h-3.5" /> Try in Sandbox</Button>
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Installs</span><span className="font-semibold text-slate-700 flex items-center gap-1"><Download className="w-3 h-3" />{component.installs.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Trust Score</span><span className="font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{component.trustScore}/100</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Category</span><span className="font-semibold text-slate-700">{component.category}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Type</span><span className="font-semibold text-slate-700">{component.type}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Builder card */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Builder</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold">{component.builder.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{component.builder.name}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${tierConfig[component.builder.tier]}`}>{component.builder.tier}</span>
                  </div>
                </div>
                <Link to={`/builders/${component.builder.name.toLowerCase().replace(/\s+/g, '-')}`} className="block mt-3">
                  <Button variant="outline" className="w-full text-xs h-7 gap-1"><Users className="w-3 h-3" /> View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}