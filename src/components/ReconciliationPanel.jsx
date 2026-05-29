import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle2, Upload, Loader2 } from "lucide-react";

export default function ReconciliationPanel() {
  const [invoiceData, setInvoiceData] = useState(null);
  const [reconciliation, setReconciliation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor: '',
    amount: '',
    date: ''
  });

  const runReconciliation = async () => {
    if (!formData.invoice_number || !formData.amount) {
      alert('Fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('reconcileInvoices', {
        invoice_data: {
          invoice_number: formData.invoice_number,
          vendor: formData.vendor,
          amount: parseFloat(formData.amount),
          date: formData.date,
          items: []
        },
        budget_data: { allocated_amount: 50000, spent_amount: 35000, remaining_budget: 15000 },
        po_data: null
      });

      if (response.data.success) {
        setReconciliation(response.data.reconciliation);
        setShowForm(false);
        setFormData({ invoice_number: '', vendor: '', amount: '', date: '' });
      }
    } catch (err) {
      alert('Reconciliation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Invoice Reconciliation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reconciliation ? (
          <>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full text-xs bg-blue-600 hover:bg-blue-700">
                New Reconciliation
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Invoice Number</label>
                  <Input
                    placeholder="INV-001"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Vendor</label>
                  <Input
                    placeholder="Vendor name"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runReconciliation} disabled={loading} className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    Reconcile
                  </Button>
                  <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              reconciliation.match_status === 'flagged' ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              {reconciliation.match_status === 'flagged' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900 mb-1">
                  Invoice {reconciliation.invoice_data?.invoice_number}
                </p>
                <p className={`text-xs font-semibold capitalize ${
                  reconciliation.match_status === 'flagged' ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  Status: {reconciliation.match_status}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Confidence</p>
                <span className="text-xs font-bold text-slate-900">{reconciliation.confidence_score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${reconciliation.confidence_score}%` }} />
              </div>
            </div>

            {reconciliation.discrepancies?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                <p className="text-[10px] font-semibold text-amber-700">Discrepancies ({reconciliation.discrepancies.length})</p>
                {reconciliation.discrepancies.slice(0, 3).map((d, i) => (
                  <div key={i} className="text-[10px] text-amber-700">
                    <span className="font-semibold">{d.type}:</span> {d.description}
                    {d.variance_amount && <span className="ml-1">(${Math.abs(d.variance_amount)})</span>}
                  </div>
                ))}
              </div>
            )}

            <Button onClick={() => setReconciliation(null)} variant="outline" className="w-full text-xs">
              New Reconciliation
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}