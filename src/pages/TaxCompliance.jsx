import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";
import W9Form from "@/components/tax/W9Form";

const TAX_YEAR = new Date().getFullYear();

export default function TaxCompliance() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const recs = await base44.entities.TaxForm1099.filter({ builder_id: me.id, tax_year: TAX_YEAR });
    setRecord(recs[0] || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const completed = record?.w9_completed;
  const exempt = record?.tax_exempt_1099;

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
              {exempt ? (
                <p className="text-sm text-slate-600">
                  As a {record.tax_classification === "c_corporation" ? "C Corporation" : "S Corporation"}, you are <strong>exempt from 1099-NEC reporting</strong>. Your W-9 is kept on file for compliance, but no 1099 form will be issued.
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  Your Form 1099-NEC will be prepared, audited, and filed automatically by January 31. We'll report your annual nonemployee compensation once it reaches the $600 threshold.
                </p>
              )}
              <div className="text-sm text-slate-500 border-t border-slate-100 pt-3 space-y-1">
                <p><strong>{record.is_business ? "Legal entity name" : "Legal name"}:</strong> {record.legal_name}</p>
                <p><strong>TIN:</strong> {record.tin_type?.toUpperCase()} •••••{String(record.tin || "").slice(-4)}</p>
                <p><strong>Address:</strong> {[record.address_line1, record.city, record.state, record.zip].filter(Boolean).join(", ")}</p>
              </div>
              <button
                className="text-xs text-slate-500 underline hover:text-slate-700"
                onClick={() => setRecord({ ...record, w9_completed: false })}
              >
                Update my W-9
              </button>
            </CardContent>
          </Card>
        ) : (
          <W9Form
            record={record}
            userId={user?.id}
            userEmail={user?.email}
            onSaved={load}
          />
        )}
      </div>
    </div>
  );
}