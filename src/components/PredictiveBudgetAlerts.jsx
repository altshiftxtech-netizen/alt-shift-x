import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Clock, Zap, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PredictiveBudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateBudgetAlerts();
    const interval = setInterval(calculateBudgetAlerts, 3600000); // Hourly
    return () => clearInterval(interval);
  }, []);

  const calculateBudgetAlerts = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('calculatePredictiveBudgetAlert', {});
      setAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Failed to calculate budget alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-emerald-50 border-emerald-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default: return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Budget Alerts</h2>
        <Button onClick={calculateBudgetAlerts} variant="outline" size="sm" className="text-xs">
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-slate-500">No budget alerts yet. Create a budget alert to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => {
            const spendPercentage = (alert.current_spend / alert.monthly_budget) * 100;
            return (
              <Card key={alert.id} className={`border ${getStatusColor(alert.alert_status)}`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(alert.alert_status)}
                        <div>
                          <h3 className="font-bold text-slate-900">{alert.budget_category}</h3>
                          <p className={`text-xs font-semibold uppercase tracking-wide ${
                            alert.alert_status === 'critical' ? 'text-red-600' :
                            alert.alert_status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {alert.alert_status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">${alert.current_spend?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">of ${alert.monthly_budget?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            alert.alert_status === 'critical' ? 'bg-red-600' :
                            alert.alert_status === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 text-right">{Math.round(spendPercentage)}% spent</p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-white/60 rounded p-2">
                        <p className="text-slate-600 mb-0.5">Daily Burn</p>
                        <p className="font-bold text-slate-900">${alert.daily_burn_rate?.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/60 rounded p-2">
                        <p className="text-slate-600 mb-0.5">Projected End</p>
                        <p className="font-bold text-slate-900">${alert.projected_month_end?.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/60 rounded p-2">
                        <p className="text-slate-600 mb-0.5">Days Left</p>
                        <p className="font-bold text-slate-900">{alert.days_remaining}</p>
                      </div>
                    </div>

                    {/* Variance */}
                    {alert.variance_percentage && (
                      <div className={`p-3 rounded-lg ${
                        alert.variance_percentage > 0 ? 'bg-red-100' : 'bg-emerald-100'
                      }`}>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Variance Analysis</p>
                        <p className={`text-sm font-bold ${
                          alert.variance_percentage > 0 ? 'text-red-700' : 'text-emerald-700'
                        }`}>
                          {alert.variance_percentage > 0 ? '+' : ''}{Math.round(alert.variance_percentage)}% vs budget
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {alert.recommendations?.length > 0 && (
                      <div className="bg-white/60 rounded p-3 space-y-1">
                        <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Recommendations
                        </p>
                        {alert.recommendations.map((rec, i) => (
                          <p key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="mt-0.5">•</span> {rec}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Last Updated */}
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Updated {new Date(alert.last_calculated).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}