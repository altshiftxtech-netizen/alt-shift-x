import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Plus, Copy, Check, Loader2, MousePointerClick, UserPlus, DollarSign, Sparkles } from "lucide-react";

const DESTINATIONS = [
  { id: "home", label: "Homepage", path: "/" },
  { id: "pricing", label: "Pricing (builder subs)", path: "/pricing" },
  { id: "marketplace", label: "Marketplace (Super Dev)", path: "/marketplace" },
  { id: "product", label: "Product page (e.g. SAFEGUARD)", path: "/marketplace" },
];

function buildUrl(link) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  // Product links land directly on the component detail page.
  if (link.destination === "product" && link.product_id) {
    return `${base}/marketplace/${link.product_id}?ref=${link.code}`;
  }
  const dest = DESTINATIONS.find(d => d.id === link.destination) || DESTINATIONS[0];
  return `${base}${dest.path}?ref=${link.code}`;
}

export default function AffiliateTab() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ campaign: "", label: "", destination: "home", product_id: "" });

  const load = async () => {
    const data = await base44.entities.AffiliateLink.list("-created_date", 200).catch(() => []);
    setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Component.list("-created_date", 200).then(setProducts).catch(() => {});
    load();
  }, []);

  const genCode = () =>
    (form.campaign || "ref").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 12) +
    "-" + Math.random().toString(36).slice(2, 7);

  const create = async () => {
    if (form.destination === "product" && !form.product_id) {
      alert("Pick a product for a product link.");
      return;
    }
    setCreating(true);
    const prod = products.find((p) => p.id === form.product_id);
    await base44.entities.AffiliateLink.create({
      code: genCode(),
      campaign: form.campaign,
      label: form.label,
      destination: form.destination,
      product_id: form.destination === "product" ? form.product_id : undefined,
      product_name: form.destination === "product" ? (prod?.name || "") : undefined,
      owner_id: user?.id || "",
      owner_name: user?.full_name || "Admin",
      clicks: 0, signups: 0, paid_conversions: 0, revenue_total: 0, active: true,
    });
    setForm({ campaign: "", label: "", destination: "home", product_id: "" });
    await load();
    setCreating(false);
  };

  const copy = (link) => {
    navigator.clipboard.writeText(buildUrl(link));
    setCopied(link.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const seedVested100 = async () => {
    setSeeding(true);
    const res = await base44.functions.invoke("seedVested100Links", {}).catch(e => ({ data: { error: e.message } }));
    if (res?.data?.error) alert("Seeding failed: " + res.data.error);
    else await load();
    setSeeding(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  const totals = links.reduce((a, l) => ({
    clicks: a.clicks + (l.clicks || 0),
    signups: a.signups + (l.signups || 0),
    conv: a.conv + (l.paid_conversions || 0),
    rev: a.rev + (l.revenue_total || 0),
  }), { clicks: 0, signups: 0, conv: 0, rev: 0 });

  return (
    <div className="space-y-5">
      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Clicks", value: totals.clicks.toLocaleString(), icon: MousePointerClick, color: "text-blue-600" },
          { label: "Signups", value: totals.signups.toLocaleString(), icon: UserPlus, color: "text-violet-600" },
          { label: "Paid Conversions", value: totals.conv.toLocaleString(), icon: Check, color: "text-emerald-600" },
          { label: "Attributed Revenue", value: `$${totals.rev.toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4 pb-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div><p className="text-lg font-black text-slate-900">{s.value}</p><p className="text-[10px] text-slate-400">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Create */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4" /> Create Affiliate Link</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="Campaign (e.g. Vested100 Beta)" value={form.campaign} onChange={e => setForm(f => ({ ...f, campaign: e.target.value }))} />
            <Input placeholder="Label (e.g. Twitter Post #1)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            <select value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          {form.destination === "product" && (
            <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={create} disabled={creating} className="bg-slate-900 hover:bg-slate-800 text-white text-sm gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Generate Link
            </Button>
            <Button onClick={seedVested100} disabled={seeding} variant="outline" className="text-sm gap-2 border-violet-300 text-violet-700 hover:bg-violet-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Seed Vested100 Campaign (20 links)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-2">
        {links.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No affiliate links yet</div>}
        {links.map(l => (
          <Card key={l.id}>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {l.campaign && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">{l.campaign}</span>}
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{l.destination}</span>
                    {l.product_name && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{l.product_name}</span>}
                    {l.label && <span className="text-xs text-slate-500">{l.label}</span>}
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1 truncate">{buildUrl(l)}</p>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-center"><p className="font-bold text-slate-700">{l.clicks || 0}</p><p className="text-slate-400 text-[10px]">clicks</p></div>
                  <div className="text-center"><p className="font-bold text-slate-700">{l.signups || 0}</p><p className="text-slate-400 text-[10px]">signups</p></div>
                  <div className="text-center"><p className="font-bold text-emerald-600">{l.paid_conversions || 0}</p><p className="text-slate-400 text-[10px]">paid</p></div>
                  <div className="text-center"><p className="font-bold text-amber-600">${(l.revenue_total || 0).toLocaleString()}</p><p className="text-slate-400 text-[10px]">revenue</p></div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => copy(l)}>
                    {copied === l.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === l.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}