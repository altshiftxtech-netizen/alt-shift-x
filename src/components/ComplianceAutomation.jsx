import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Loader2, Shield, BarChart3 } from "lucide-react";

export default function ComplianceAutomation() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      // Mock automation status
      setAutomations([
        {
          id: 1,
          name: 'Daily Budget Alert Check',
          type: 'scheduled',
          frequency: 'Daily at 9:00 AM PT',
          status: 'active',
          last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Invoice Approval Monitoring',
          type: 'entity',
          frequency: 'On invoice submission',
          status: 'active',
          last_run: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          events_processed: 12
        },
        {
          id: 3,
          name: 'Weekly Compliance Report',
          type: 'scheduled',
          frequency: 'Every Monday at 9:00 AM PT',
          status: 'active',
          last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          name: 'Vendor Verification Check',
          type: 'scheduled',
          frequency: 'Monthly on 1st',
          status: 'active',
          last_run: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to load automations:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAutomation = async (automationId) => {
    setRunning(true);
    try {
      await base44.functions.invoke('generateComplianceReport', {
        automation_id: automationId
      });
      await loadAutomations();
      alert('Automation triggered successfully');
    } catch (err) {
      alert('Failed to trigger automation: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Compliance Automations
        </h2>
        <Button onClick={loadAutomations} variant="outline" size="sm">
          <Clock className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {automations.map(auto => (
          <Card key={auto.id} className={auto.status === 'active' ? 'border-emerald-200' : 'border-slate-200 opacity-60'}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{auto.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      auto.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {auto.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{auto.frequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-2 rounded text-xs">
                <div>
                  <p className="text-slate-500">Last Run</p>
                  <p className="font-mono text-slate-700">{new Date(auto.last_run).toLocaleString()}</p>
                </div>
                {auto.next_run && (
                  <div>
                    <p className="text-slate-500">Next Run</p>
                    <p className="font-mono text-slate-700">{new Date(auto.next_run).toLocaleString()}</p>
                  </div>
                )}
                {auto.events_processed && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Events Processed</p>
                    <p className="font-bold text-slate-700">{auto.events_processed}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => triggerAutomation(auto.id)}
                disabled={running}
                variant="outline"
                className="w-full text-xs h-8"
              >
                {running ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Run Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm font-semibold text-blue-900">✅ All automations running</p>
          <p className="text-xs text-blue-700">4 active automations • 0 errors • Last check: 2 hours ago</p>
        </CardContent>
      </Card>
    </div>
  );
}