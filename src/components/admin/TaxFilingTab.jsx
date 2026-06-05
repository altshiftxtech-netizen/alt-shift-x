import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Send, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TaxFilingTab() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ irs_filing_email: "", payer_name: "", payer_tin: "", payer_address: "", reporting_threshold: 600 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filing, setFiling] = useState(false);
  const [forms, setForms] = useState([]);

  const load = async () => {
    const cfgs = await base44.entities.TaxFilingConfig.list();
    const cfg = cfgs[0] || null;
    setConfig(cfg);
    if (cfg) setForm({
      irs_filing_email: cfg.irs_filing_email || "",
      payer_name: cfg.payer_name || "",
      payer_tin: cfg.payer_tin || "",
      payer_address: cfg.payer_address || "",
      reporting_threshold: cfg.reporting_threshold ?? 600,
    });
    const recs = await base44.entities.TaxForm1099.list("-tax_year", 200);
    setForms(recs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const data = { ...form, reporting_threshold: Number(form.reporting_threshold) || 600, updated_by: me.full_name || me.email };
    if (config) await base44.entities.TaxFilingConfig.update(config.id, data);
    else await base44.entities.TaxFilingConfig.create(data);
    toast.success("Tax filing settings saved.");
    setSaving(false);
    load();
  };

  const fileNow = async (year) => {
    setFiling(true);
    try {
      const res = await base44.functions.invoke("fileAnnual1099s", { tax_year: year });
      toast.success(`Filed ${res.data.forms_filed} forms ($${res.data.total_reportable?.toFixed(2)}) → ${res.data.delivered_to}`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Filing failed.");
    }
    setFiling(false);
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;

  const w9Done = forms.filter((f) => f.w9_completed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2"><FileText className="w-5 h-5" /><h2 className="text-lg font-bold">1099-NEC Filing Settings</h2></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>IRS / filing-agent delivery email *</Label>
              <Input value={form.irs_filing_email} onChange={(e) => set("irs_filing_email", e.target.value)} placeholder="filings@your-efile-provider.com" />
              <p className="text-xs text-slate-400 mt-1">The IRS does not accept 1099s by raw email. Use your FIRE/e-file provider or compliance records inbox.</p>
            </div>
            <div><Label>Payer legal name</Label><Input value={form.payer_name} onChange={(e) => set("payer_name", e.target.value)} /></div>
            <div><Label>Payer EIN</Label><Input value={form.payer_tin} onChange={(e) => set("payer_tin", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Payer address</Label><Input value={form.payer_address} onChange={(e) => set("payer_address", e.target.value)} /></div>
            <div><Label>Reporting threshold ($)</Label><Input type="number" value={form.reporting_threshold} onChange={(e) => set("reporting_threshold", e.target.value)} /></div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save settings"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-lg font-bold">Recipients ({forms.length}) · W-9 complete: {w9Done}/{forms.length}</h2>
          <p className="text-sm text-slate-500">Automatic filing runs every January 31. You can also file manually below.</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={filing} onClick={() => fileNow(new Date().getFullYear() - 1)}>
              {filing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} File {new Date().getFullYear() - 1} now
            </Button>
          </div>
          <div className="border-t border-slate-100 pt-3 space-y-1.5 max-h-80 overflow-auto">
            {forms.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-700">{f.legal_name || f.builder_name || f.builder_email || f.builder_id} · {f.tax_year}</span>
                <span className="flex items-center gap-3 text-slate-500">
                  <span>${(f.reportable_amount || 0).toLocaleString()}</span>
                  {f.w9_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-xs text-amber-600">No W-9</span>}
                  <span className="text-xs">{f.filing_status}</span>
                </span>
              </div>
            ))}
            {!forms.length && <p className="text-sm text-slate-400">No 1099 records yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}