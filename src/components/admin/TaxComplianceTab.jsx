import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, FileText, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TaxComplianceTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filing, setFiling] = useState(false);

  const load = async () => {
    const list = await base44.entities.TaxComplianceSettings.list();
    setSettings(list[0] || {
      cpa_email: "", cpa_name: "", filing_enabled: true, reporting_threshold: 600,
    });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const save = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const payload = {
      cpa_email: settings.cpa_email || "",
      cpa_name: settings.cpa_name || "",
      filing_enabled: settings.filing_enabled !== false,
      reporting_threshold: Number(settings.reporting_threshold) || 600,
      updated_by: me?.full_name || me?.email || "admin",
    };
    if (settings.id) {
      await base44.entities.TaxComplianceSettings.update(settings.id, payload);
    } else {
      const created = await base44.entities.TaxComplianceSettings.create(payload);
      setSettings((s) => ({ ...s, id: created.id }));
    }
    setSaving(false);
    toast.success("Tax compliance settings saved");
  };

  const runNow = async () => {
    setFiling(true);
    try {
      const res = await base44.functions.invoke("fileAnnual1099s", {});
      const d = res.data || {};
      if (d.skipped) {
        toast.message("Filing skipped", { description: d.reason });
      } else {
        toast.success(`1099 package sent to ${d.sent_to}`, { description: `${d.contractors_reported} contractors, $${(d.total_reported || 0).toLocaleString()} reported` });
      }
      load();
    } catch (e) {
      toast.error("Filing failed", { description: e.message });
    }
    setFiling(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">1099 Filing — CPA Delivery</h3>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Each year on January 31, the platform audits all contractor earnings, adjusts the 1099 totals,
            and emails the compiled 1099-NEC package to your CPA. The IRS does not accept 1099s by raw email —
            your CPA e-files via FIRE or an authorized provider.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">CPA / Filing agent email</label>
              <Input type="email" placeholder="cpa@firm.com" value={settings.cpa_email || ""}
                onChange={(e) => update({ cpa_email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">CPA / Firm name</label>
              <Input placeholder="Smith & Co. CPAs" value={settings.cpa_name || ""}
                onChange={(e) => update({ cpa_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Reporting threshold (USD)</label>
              <Input type="number" value={settings.reporting_threshold ?? 600}
                onChange={(e) => update({ reporting_threshold: e.target.value })} />
            </div>
            <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3">
              <div>
                <p className="text-xs font-semibold text-slate-700">Annual filing enabled</p>
                <p className="text-[10px] text-slate-400">Turn off to skip the Jan 31 delivery</p>
              </div>
              <Switch checked={settings.filing_enabled !== false}
                onCheckedChange={(v) => update({ filing_enabled: v })} />
            </div>
          </div>

          {settings.last_filed_at && (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Last filed for tax year {settings.last_filed_year} on {new Date(settings.last_filed_at).toLocaleDateString()}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button onClick={save} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-xs h-9 gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save settings
            </Button>
            <Button onClick={runNow} disabled={filing || !settings.cpa_email} variant="outline" className="text-xs h-9 gap-1.5">
              {filing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Run filing now (test)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}