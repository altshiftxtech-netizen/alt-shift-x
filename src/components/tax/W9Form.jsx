import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const CLASSES = [
  { v: "individual_sole_proprietor", l: "Individual / Sole proprietor" },
  { v: "llc", l: "LLC" },
  { v: "partnership", l: "Partnership" },
  { v: "c_corporation", l: "C Corporation" },
  { v: "s_corporation", l: "S Corporation" },
  { v: "trust_estate", l: "Trust / Estate" },
  { v: "other", l: "Other" },
];

/**
 * W9Form — collects a contractor's W-9 info. Required for all builders/contractors.
 * `record` is an existing TaxForm1099 (or null). Calls onSaved() after a successful save.
 */
export default function W9Form({ record, userId, userEmail, onSaved }) {
  const [form, setForm] = useState(() => ({
    legal_name: record?.legal_name || "",
    business_name: record?.business_name || "",
    tax_classification: record?.tax_classification || "individual_sole_proprietor",
    tin_type: record?.tin_type || "ssn",
    tin: record?.tin || "",
    address_line1: record?.address_line1 || "",
    address_line2: record?.address_line2 || "",
    city: record?.city || "",
    state: record?.state || "",
    zip: record?.zip || "",
    country: record?.country || "United States",
  }));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.legal_name || !form.tin || !form.address_line1 || !form.city || !form.state || !form.zip) {
      toast.error("Please complete all required fields");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      builder_id: userId,
      builder_email: userEmail || "",
      tax_year: record?.tax_year || new Date().getFullYear(),
      w9_completed: true,
      w9_completed_at: new Date().toISOString(),
    };
    try {
      if (record?.id) {
        await base44.entities.TaxForm1099.update(record.id, payload);
      } else {
        await base44.entities.TaxForm1099.create(payload);
      }
      toast.success("W-9 submitted — 1099 compliance complete");
      onSaved?.();
    } catch (err) {
      toast.error("Could not submit W-9. Please try again.");
      console.error("W-9 submit failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Legal name *</label>
          <Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} placeholder="As shown on your tax return" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Business name (if different)</label>
          <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Tax classification *</label>
          <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={form.tax_classification} onChange={(e) => set("tax_classification", e.target.value)}>
            {CLASSES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">TIN type *</label>
          <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={form.tin_type} onChange={(e) => set("tin_type", e.target.value)}>
            <option value="ssn">SSN</option>
            <option value="ein">EIN</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">{form.tin_type === "ein" ? "EIN" : "SSN"} *</label>
          <Input value={form.tin} onChange={(e) => set("tin", e.target.value)} placeholder={form.tin_type === "ein" ? "12-3456789" : "123-45-6789"} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Address line 1 *</label>
        <Input value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Address line 2</label>
        <Input value={form.address_line2} onChange={(e) => set("address_line2", e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">City *</label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">State *</label>
          <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">ZIP *</label>
          <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} />
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-lg p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        By submitting, you certify the information is correct under IRS Form W-9. Your TIN is stored securely and only the last 4 digits appear in summaries.
      </div>

      <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-sm gap-1.5">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit W-9
      </Button>
    </form>
  );
}