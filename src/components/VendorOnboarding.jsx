import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Loader2, Phone, Mail, Building2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Contact Details", icon: Mail },
  { id: 3, label: "Banking Info", icon: Phone },
  { id: 4, label: "Review & Submit", icon: CheckCircle2 }
];

export default function VendorOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    tax_id: '',
    account_holder: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
    account_type: 'checking'
  });

  const handleSubmit = async () => {
    if (!formData.company_name || !formData.contact_email || !formData.tax_id) {
      alert('Fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newVendor = await base44.entities.Vendor.create({
        company_name: formData.company_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        tax_id: formData.tax_id,
        banking_info: {
          account_holder: formData.account_holder,
          account_number: formData.account_number,
          routing_number: formData.routing_number,
          bank_name: formData.bank_name,
          account_type: formData.account_type
        },
        status: 'active',
        verification_status: 'pending'
      });

      // Log audit trail
      await base44.functions.invoke('logAuditTrail', {
        action: 'create',
        entity_type: 'vendor',
        entity_id: newVendor.id,
        change_summary: `New vendor onboarded: ${formData.company_name}`,
        new_values: newVendor
      });

      setSuccess(true);
      setTimeout(() => {
        setFormData({
          company_name: '',
          contact_email: '',
          contact_phone: '',
          tax_id: '',
          account_holder: '',
          account_number: '',
          routing_number: '',
          bank_name: '',
          account_type: 'checking'
        });
        setStep(1);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      alert('Onboarding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-slate-900">Vendor Successfully Onboarded!</p>
          <p className="text-xs text-slate-600">Pending admin verification</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <button
              onClick={() => step >= s.id && setStep(s.id)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                step === s.id
                  ? 'bg-blue-600 text-white'
                  : step > s.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {s.label}
            </button>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Step {step}: {STEPS[step - 1].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Company Name *</label>
                <Input
                  placeholder="ABC Supplies Inc"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tax ID (EIN) *</label>
                <Input
                  placeholder="XX-XXXXXXX"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address *</label>
                <Input
                  type="email"
                  placeholder="contact@abc.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Banking */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Account Holder *</label>
                <Input
                  placeholder="Name on account"
                  value={formData.account_holder}
                  onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Bank Name *</label>
                <Input
                  placeholder="Chase Bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Routing # *</label>
                  <Input
                    placeholder="000000000"
                    value={formData.routing_number}
                    onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                    className="text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Account # *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded">
              <div className="flex justify-between text-xs"><span className="text-slate-600">Company:</span><span className="font-semibold">{formData.company_name}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Email:</span><span className="font-semibold">{formData.contact_email}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Tax ID:</span><span className="font-mono">{formData.tax_id}</span></div>
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-xs"><span className="text-slate-600">Bank:</span><span className="font-semibold">****{formData.account_number?.slice(-4)}</span></div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-3">
                <p className="text-xs text-blue-700">🔒 All information is encrypted and secure.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              variant="outline"
              className="flex-1 text-sm h-9"
            >
              Back
            </Button>
            {step === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Submit Application
              </Button>
            ) : (
              <Button
                onClick={() => setStep(Math.min(4, step + 1))}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}