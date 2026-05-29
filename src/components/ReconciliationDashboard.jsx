import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertTriangle, Loader2, Download, RefreshCw, TrendingUp } from "lucide-react";

export default function ReconciliationDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    statement_date: '',
    statement_balance: '',
    transactions: []
  });

  const handleReconcile = async () => {
    if (!formData.statement_date || formData.statement_balance === '') {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Mock transactions for demo
      const mockTransactions = [
        { amount: 5000, date: formData.statement_date, description: 'Invoice payment batch 1' },
        { amount: 3500, date: formData.statement_date, description: 'Invoice payment batch 2' },
        { amount: 1200, date: formData.statement_date, description: 'Miscellaneous payment' }
      ];

      const res = await base44.functions.invoke('bankReconciliation', {
        statement_date: formData.statement_date,
        statement_balance: parseFloat(formData.statement_balance),
        transactions: mockTransactions
      });

      setResult(res.data.reconciliation);
    } catch (err) {
      alert('Reconciliation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Bank Statement Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Statement Date</label>
              <Input
                type="date"
                value={formData.statement_date}
                onChange={(e) => setFormData({ ...formData, statement_date: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Statement Balance</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.statement_balance}
                onChange={(e) => setFormData({ ...formData, statement_balance: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          <Button
            onClick={handleReconcile}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Run Reconciliation
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Results */}
          <Card className={result.discrepancies_count === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                {result.discrepancies_count === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-bold ${result.discrepancies_count === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {result.discrepancies_count === 0 ? 'Perfect Match!' : 'Discrepancies Found'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Expected: ${result.expected_balance.toFixed(2)} | Statement: ${result.statement_balance.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600">
                    Variance: ${result.variance.toFixed(2)} | Confidence: {Math.round(result.confidence_score)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-slate-600 mb-1">Matched</p>
                <p className="text-2xl font-bold text-emerald-600">{result.matched_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-slate-600 mb-1">Discrepancies</p>
                <p className="text-2xl font-bold text-amber-600">{result.discrepancies_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-slate-600 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(result.confidence_score)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Issues */}
          {result.discrepancies.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Issues to Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.discrepancies.map((issue, i) => (
                  <div key={i} className="bg-amber-50 p-3 rounded text-xs space-y-1">
                    <p className="font-semibold text-amber-900">{issue.type}</p>
                    <p className="text-amber-700">{issue.description || issue.invoice_number}</p>
                    <p className="text-amber-600">Amount: ${(issue.amount || issue.invoice_amount || 0).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Download Report */}
          <Button variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Download Reconciliation Report
          </Button>
        </>
      )}
    </div>
  );
}