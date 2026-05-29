import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Loader2 } from "lucide-react";

export default function ForecastPanel({ componentId = null }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("next_30_days");

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateForecast', {
        component_id: componentId,
        period,
        forecast_type: 'budget_variance'
      });
      if (response.data.success) {
        setForecast(response.data.forecast);
      }
    } catch (err) {
      alert("Failed to generate forecast: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const varianceColor = forecast?.variance_direction === 'overbudget' 
    ? 'text-red-600 bg-red-50' 
    : forecast?.variance_direction === 'underbudget' 
    ? 'text-emerald-600 bg-emerald-50' 
    : 'text-blue-600 bg-blue-50';

  const accuracyColor = forecast?.forecast_accuracy === 'high'
    ? 'bg-emerald-100 text-emerald-700'
    : forecast?.forecast_accuracy === 'medium'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Budget Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!forecast ? (
          <>
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-semibold">Forecast Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-slate-700"
              >
                <option value="next_30_days">Next 30 Days</option>
                <option value="next_quarter">Next Quarter</option>
                <option value="next_year">Next Year</option>
              </select>
            </div>
            <Button 
              onClick={generateForecast} 
              disabled={loading}
              className="w-full text-xs bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
              Generate Forecast
            </Button>
          </>
        ) : (
          <>
            <div className={`p-3 rounded-lg ${varianceColor}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">Predicted Variance</p>
                {forecast.variance_direction === 'overbudget' && <TrendingUp className="w-4 h-4" />}
                {forecast.variance_direction === 'underbudget' && <TrendingDown className="w-4 h-4" />}
              </div>
              <p className="text-sm font-bold">${Math.abs(forecast.predicted_variance)?.toFixed(0)}</p>
              <p className="text-[10px] opacity-80 capitalize">{forecast.variance_direction}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">Confidence</p>
                <span className={`text-xs px-2 py-1 rounded ${accuracyColor}`}>
                  {forecast.confidence_score}% ({forecast.forecast_accuracy})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${forecast.confidence_score}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-slate-700">Resource Projection</p>
              <p className="text-sm font-bold text-slate-900">
                {forecast.predicted_resource_usage?.toLocaleString()} {forecast.resource_unit}
              </p>
            </div>

            {forecast.risk_factors?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <p className="text-[10px] font-semibold text-amber-700">Risk Factors</p>
                </div>
                <ul className="text-[10px] text-amber-700 space-y-0.5">
                  {forecast.risk_factors.slice(0, 3).map((risk, i) => (
                    <li key={i} className="flex gap-1">
                      <span>•</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {forecast.recommendations?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                <p className="text-[10px] font-semibold text-blue-700">Recommendations</p>
                <ul className="text-[10px] text-blue-700 space-y-0.5">
                  {forecast.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} className="flex gap-1">
                      <span>•</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant="outline"
              size="sm"
              onClick={() => setForecast(null)}
              className="w-full text-xs"
            >
              Generate New Forecast
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}