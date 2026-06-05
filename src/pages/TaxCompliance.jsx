import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import W9Form from "@/components/tax/W9Form";

const TAX_YEAR = new Date().getFullYear();

export default function TaxCompliance() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const recs = await base44.entities.TaxForm1099.filter({ builder_id: me.id, tax_year: TAX_YEAR });
    setRecord(recs[0] || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (form) => {
    setSaving(true);
    const data = {
      builder_id: user.id,
      builder_email: user.email,
      builder_name: user.full_name || "",
      tax_year: TAX_YEAR,
      w9_completed: true,
      w9_completed_at: new Date().toISOString(),
      legal_name: form.legal_name,
      business_name: form.business_name,
      tax_classification: form.tax_classification,
      tin_type: form.tin_type,
      tin: form.tin,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };
    if (record) await base44.entities.TaxForm1099.update(record.id, data);
    else await base44.entities.TaxForm1099.create(data);
    toast.success("W-9 submitted — you're 1099-ready.");
    setSaving(false);
    load();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const completed = record?.w9_completed;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-900" />
          <h1 className="text-2xl font-black text-slate-900">1099 Tax Compliance</h1>
        </div>

        {completed ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-lg font-bold">W-9 on file for {TAX_YEAR}</h2>
              </div>
              <p className="text-sm text-slate-600">
                Your Form 1099-NEC will be prepared, audited, and filed automatically by January 31. We'll report your annual nonemployee compensation once it reaches the $600 threshold.
              </p>
              <div className="text-sm text-slate-500 border-t border-slate-100 pt-3 space-y-1">
                <p><strong>Legal name:</strong> {record.legal_name}</p>
                <p><strong>TIN:</strong> {record.tin_type?.toUpperCase()} •••••{String(record.tin || "").slice(-4)}</p>
                <p><strong>Address:</strong> {[record.address_line1, record.city, record.state, record.zip].filter(Boolean).join(", ")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <W9Form initial={record || {}} onSubmit={handleSubmit} saving={saving} />
        )}
      </div>
    </div>
  );
}