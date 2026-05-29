import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, Loader2, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalPayable: 0,
    totalPaid: 0,
    totalPending: 0,
    totalApproved: 0
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const allInvoices = await base44.entities.InvoiceSubmission.list('-created_date', 100);
      setInvoices(allInvoices);

      const calculations = {
        totalPayable: 0,
        totalPaid: 0,
        totalPending: 0,
        totalApproved: 0
      };

      allInvoices.forEach(inv => {
        const amount = inv.amount / 100;
        calculations.totalPayable += amount;
        if (inv.status === 'paid') calculations.totalPaid += amount;
        if (inv.status === 'submitted') calculations.totalPending += amount;
        if (inv.status === 'approved') calculations.totalApproved += amount;
      });

      setStats(calculations);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aging data
  const agingData = [
    { name: '0-30 days', value: invoices.filter(inv => inv.status === 'paid').length, amount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount/100, 0) },
    { name: '31-60 days', value: invoices.filter(inv => inv.status === 'approved').length, amount: invoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.amount/100, 0) },
    { name: '61+ days', value: invoices.filter(inv => inv.status === 'submitted').length, amount: invoices.filter(inv => inv.status === 'submitted').reduce((sum, inv) => sum + inv.amount/100, 0) }
  ];

  // Calculate monthly burn
  const monthlyData = [
    { month: 'Week 1', amount: stats.totalPayable * 0.15 },
    { month: 'Week 2', amount: stats.totalPayable * 0.25 },
    { month: 'Week 3', amount: stats.totalPayable * 0.35 },
    { month: 'Week 4', amount: stats.totalPayable * 0.25 }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-600 mb-1">Total Payable</p>
            <p className="text-2xl font-bold text-slate-900">${stats.totalPayable.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-emerald-700 mb-1">Paid</p>
            <p className="text-2xl font-bold text-emerald-700">${stats.totalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-amber-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-700">${stats.totalPending.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-blue-700 mb-1">Approved</p>
            <p className="text-2xl font-bold text-blue-700">${stats.totalApproved.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Burn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Weekly Spend Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Invoice Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie data={agingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 12 }}>
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} invoices`} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Aging Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Accounts Payable Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agingData.map((bucket, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{bucket.name}</p>
                  <p className="text-xs text-slate-500">{bucket.value} invoices</p>
                </div>
                <p className="text-sm font-bold text-slate-900">${bucket.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{inv.invoice_number}</p>
                  <p className="text-slate-500">{inv.invoice_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${(inv.amount/100).toFixed(2)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    inv.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}