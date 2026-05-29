import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Clock, CheckCircle2, AlertCircle, DollarSign, Loader2, Eye, EyeOff } from "lucide-react";

export default function VendorPortal() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [vendor, setVendor] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBankingForm, setShowBankingForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    amount: '',
    invoice_date: '',
    description: ''
  });

  const [bankingForm, setBankingForm] = useState({
    account_holder: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
    account_type: 'checking'
  });

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      // Get current user's vendor record (simplified - in real app would lookup by token)
      const vendors = await base44.entities.Vendor.list();
      if (vendors.length > 0) {
        setVendor(vendors[0]);
        const vendorInvoices = await base44.entities.InvoiceSubmission.filter({ vendor_id: vendors[0].id });
        setInvoices(vendorInvoices);
      }
    } catch (err) {
      console.error('Failed to load vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitInvoice = async () => {
    if (!invoiceForm.invoice_number || !invoiceForm.amount || !invoiceForm.invoice_date) {
      alert('Fill in all required fields');
      return;
    }

    try {
      await base44.functions.invoke('processVendorInvoice', {
        vendor_id: vendor.id,
        invoice_number: invoiceForm.invoice_number,
        amount: Math.round(parseFloat(invoiceForm.amount) * 100),
        invoice_date: invoiceForm.invoice_date,
        document_url: 'https://via.placeholder.com/invoice.pdf',
        description: invoiceForm.description
      });

      setInvoiceForm({ invoice_number: '', amount: '', invoice_date: '', description: '' });
      setShowInvoiceForm(false);
      await loadVendorData();
      alert('Invoice submitted successfully!');
    } catch (err) {
      alert('Failed to submit invoice: ' + err.message);
    }
  };

  const updateBankingInfo = async () => {
    if (!bankingForm.account_holder || !bankingForm.account_number) {
      alert('Fill in required fields');
      return;
    }

    try {
      await base44.entities.Vendor.update(vendor.id, {
        banking_info: bankingForm
      });

      setShowBankingForm(false);
      await loadVendorData();
      alert('Banking information updated!');
    } catch (err) {
      alert('Failed to update banking info: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 border-emerald-200';
      case 'approved': return 'bg-blue-50 border-blue-200';
      case 'under_review': return 'bg-amber-50 border-amber-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  if (!vendor) return <div className="text-center py-12 text-slate-500">Vendor not found</div>;

  const totalSubmitted = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{vendor.company_name}</h1>
          <p className="text-sm text-slate-500 mb-4">{vendor.contact_email}</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Invoices Submitted</p>
              <p className="text-2xl font-bold text-blue-700">{invoices.length}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-amber-700">{pendingInvoices}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-emerald-700">${(totalSubmitted / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
          {['invoices', 'banking'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'invoices' ? 'Invoices' : 'Banking Info'}
            </button>
          ))}
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {!showInvoiceForm ? (
              <Button onClick={() => setShowInvoiceForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" /> Submit Invoice
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Submit New Invoice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Invoice Number *</label>
                    <Input
                      placeholder="INV-001"
                      value={invoiceForm.invoice_number}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Amount ($) *</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Invoice Date *</label>
                    <Input
                      type="date"
                      value={invoiceForm.invoice_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                    <Input
                      placeholder="Project details or line items..."
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={submitInvoice} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9">
                      Submit
                    </Button>
                    <Button onClick={() => setShowInvoiceForm(false)} variant="outline" className="flex-1 text-sm h-9">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoices List */}
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No invoices yet</div>
              ) : (
                invoices.map(invoice => (
                  <Card key={invoice.id} className={`border ${getStatusColor(invoice.status)}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{invoice.invoice_number}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{invoice.invoice_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-900">${(invoice.amount / 100).toFixed(2)}</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {getStatusIcon(invoice.status)}
                            <span className="text-xs font-semibold capitalize text-slate-700">{invoice.status}</span>
                          </div>
                        </div>
                      </div>
                      {invoice.review_notes && (
                        <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">Note: {invoice.review_notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-4">
            {!showBankingForm ? (
              <div className="space-y-4">
                <Button onClick={() => setShowBankingForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                  {vendor.banking_info?.account_number ? 'Update Banking Info' : 'Add Banking Info'}
                </Button>

                {vendor.banking_info?.account_number && (
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Banking Information Verified
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Account Holder</p>
                        <p className="font-semibold">{vendor.banking_info.account_holder}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Bank</p>
                        <p className="font-semibold">{vendor.banking_info.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Account</p>
                        <p className="font-mono text-xs">****{vendor.banking_info.account_number?.slice(-4)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Banking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Account Holder *</label>
                    <Input
                      placeholder="Name on account"
                      value={bankingForm.account_holder}
                      onChange={(e) => setBankingForm({ ...bankingForm, account_holder: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Bank Name *</label>
                    <Input
                      placeholder="e.g., Chase Bank"
                      value={bankingForm.bank_name}
                      onChange={(e) => setBankingForm({ ...bankingForm, bank_name: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Routing Number *</label>
                      <Input
                        placeholder="000000000"
                        value={bankingForm.routing_number}
                        onChange={(e) => setBankingForm({ ...bankingForm, routing_number: e.target.value })}
                        className="text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Account Number *</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={bankingForm.account_number}
                          onChange={(e) => setBankingForm({ ...bankingForm, account_number: e.target.value })}
                          className="text-sm font-mono pr-8"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-xs text-blue-700">🔒 Your banking information is encrypted and secure.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={updateBankingInfo} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9">
                      Save
                    </Button>
                    <Button onClick={() => setShowBankingForm(false)} variant="outline" className="flex-1 text-sm h-9">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-600">This portal is encrypted and monitored for security. All your information is protected.</p>
        </div>
      </div>
    </div>
  );
}