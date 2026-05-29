import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, AlertCircle, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SharedNav from '@/components/SharedNav';

export default function SpendIntelligenceDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAnalytics = async () => {
      try {
        const result = await base44.functions.invoke('generateSpendIntelligence', {});
        setAnalytics(result.data.analytics);
      } catch (error) {
        console.error('Failed to generate analytics:', error);
      }
      setLoading(false);
    };
    generateAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!analytics) return <div>No data</div>;

  const chartData = Object.entries(analytics.spend_by_vendor || {}).map(([vendor, amount]) => ({
    vendor: vendor.substring(0, 12),
    amount: Math.round(amount / 1000) // Divide by 1000 for chart display
  }));

  return (
    <div className="min-h-screen bg-background">
      <SharedNav mode="user" />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Spend Intelligence</h1>
          <p className="text-muted-foreground">AI-powered insights into your vendor spend & market position</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Spend</div>
              <div className="text-2xl font-bold">${(analytics.total_spend / 1000).toFixed(1)}K</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Vendors</div>
              <div className="text-2xl font-bold">{analytics.vendor_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Avg Payment</div>
              <div className="text-2xl font-bold">{analytics.avg_payment_days} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Market Position</div>
              <div className="text-2xl font-bold">{analytics.market_benchmark?.percentile || 50}th %ile</div>
            </CardContent>
          </Card>
        </div>

        {/* Spend by Vendor */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Spend by Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendor" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Cost Reduction Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Cost Reduction Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.cost_reduction_opportunities?.map((opp, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold">{opp.opportunity}</p>
                  <p className="text-sm text-green-600">Est. Savings: ${(opp.estimated_savings / 1000).toFixed(1)}K</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-bold">{opp.confidence}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Industry average spend: <span className="font-bold">${(analytics.market_benchmark?.industry_avg_spend / 1000).toFixed(1)}K</span></p>
            <p>You're spending <span className="font-bold">{Math.round((analytics.total_spend / analytics.market_benchmark?.industry_avg_spend) * 100)}%</span> of industry average</p>
            <p className="text-muted-foreground">{analytics.market_benchmark?.peers_in_industry} similar companies in your industry</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}