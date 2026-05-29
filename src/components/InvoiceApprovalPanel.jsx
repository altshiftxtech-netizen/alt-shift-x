import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, FileText, Loader2, AlertCircle } from "lucide-react";

export default function InvoiceApprovalPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    loadPendingInvoices();
  }, []);

  const loadPendingInvoices = async () => {
    setLoading(true);
    try {
      const allInvoices = await base44.entities.InvoiceSubmission.list('-created_date', 50);
      const pending = allInvoices.filter(inv => inv.status === 'submitted' || inv.status === 'under_review');
      setInvoices(pending);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (invoiceId, action) => {
    if (action === 'approve' && !paymentDate) {
      alert('Please select a payment date');
      return;
    }

    setApproving(invoiceId);
    try {
      await base44.functions.invoke('approveInvoice', {
        invoice_id: invoiceId,
        action,
        notes: notes || 'No notes',
        scheduled_payment_date: paymentDate
      });

      await loadPendingInvoices();
      setSelectedInvoice(null);
      setNotes('');
      setPaymentDate('');
      alert(`Invoice ${action}d successfully!`);
    } catch (err) {
      alert(`Failed to ${action} invoice: ${err.message}`);
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Invoice Approvals</h2>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{invoices.length} Pending</span>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">All invoices approved!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => (
            <Card key={invoice.id} className={selectedInvoice?.id === invoice.id ? "border-blue-500" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="font-bold text-slate-900">{invoice.invoice_number}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Date: {invoice.invoice_date}</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-slate-900">${(invoice.amount / 100).toFixed(2)}</p>
                </div>

                {selectedInvoice?.id === invoice.id ? (
                  <div className="bg-slate-50 p-3 rounded space-y-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add review notes..."
                        className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Date (for approval)</label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveReject(invoice.id, 'approve')}
                        disabled={approving === invoice.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                      >
                        {approving === invoice.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproveReject(invoice.id, 'reject')}
                        disabled={approving === invoice.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                      >
                        {approving === invoice.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedInvoice(null);
                          setNotes('');
                          setPaymentDate('');
                        }}
                        variant="outline"
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setPaymentDate(new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
                    }}
                    variant="outline"
                    className="w-full text-xs h-8"
                  >
                    Review & Approve
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}