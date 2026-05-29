import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import SharedNav from '@/components/SharedNav';

export default function VendorScorecardDashboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateScores = async () => {
      try {
        const result = await base44.functions.invoke('generateVendorScores', {});
        setScores(result.data.data || []);
      } catch (error) {
        console.error('Failed to generate scores:', error);
      }
      setLoading(false);
    };
    generateScores();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (health) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[health] || colors.at_risk;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <SharedNav mode="user" />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Performance Scorecards</h1>
          <p className="text-muted-foreground">Real-time risk & performance monitoring</p>
        </div>

        {scores.length === 0 ? (
          <p className="text-muted-foreground">No vendor scores yet.</p>
        ) : (
          <div className="space-y-4">
            {scores.map((score) => (
              <Card key={score.id} className="hover:shadow-lg transition">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div>
                    <CardTitle>Vendor {score.vendor_id.substring(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{score.invoice_count} invoices • ${(score.total_spend / 1000).toFixed(1)}K YTD</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(score.overall_score)}`}>
                      {score.overall_score}
                    </div>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subscores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                      <p className="text-lg font-bold">{score.on_time_delivery}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quality</p>
                      <p className="text-lg font-bold">{score.quality_score}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                      <p className="text-lg font-bold">{score.compliance_score}%</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Financial Health:</span>
                    <Badge className={getHealthBadge(score.financial_health)}>
                      {score.financial_health}
                    </Badge>
                  </div>

                  {/* Risk Flags */}
                  {score.risk_flags?.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      {score.risk_flags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-red-700">{flag.flag}</p>
                            <p className="text-red-600">{flag.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {score.risk_flags?.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      No risk flags
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}