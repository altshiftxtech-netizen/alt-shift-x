import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VendorLoginForm() {
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await base44.functions.invoke('vendorLogin', {
        email,
        tax_id: taxId
      });

      if (response.data.success) {
        setSuccess({
          vendor_id: response.data.vendor_id,
          company_name: response.data.company_name,
          token: response.data.token
        });
        localStorage.setItem('vendor_token', response.data.token);
        localStorage.setItem('vendor_id', response.data.vendor_id);
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = '/vendor-portal';
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="py-6 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-slate-900">Welcome, {success.company_name}!</p>
          <p className="text-xs text-slate-600">Redirecting to your vendor portal...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">Vendor Portal Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded p-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Tax ID (EIN)</label>
            <Input
              placeholder="XX-XXXXXXX"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              required
              className="text-sm font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Login to Vendor Portal
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Don't have an account? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}