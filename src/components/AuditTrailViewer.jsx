import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export default function AuditTrailViewer() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAuditTrail();
  }, [filter]);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      let logs = await base44.entities.AuditTrail.list('-timestamp', 50);
      if (filter !== 'all') {
        logs = logs.filter(log => log.risk_level === filter || log.action === filter);
      }
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'delete': return <AlertTriangle className="w-3 h-3" />;
      case 'approve': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Compliance Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'reconcile', 'delete'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2 py-1 rounded capitalize ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No audit entries</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="border border-slate-200 rounded-lg p-2 space-y-1 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`p-1 rounded ${getRiskColor(log.risk_level)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 capitalize">{log.action}</p>
                      <p className="text-[10px] text-slate-500">{log.change_summary}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getRiskColor(log.risk_level)}`}>
                    {log.risk_level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{log.user_email}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                {log.approval_required && !log.approved_by && (
                  <div className="bg-yellow-50 border border-yellow-200 text-[10px] text-yellow-700 px-2 py-1 rounded">
                    ⚠️ Awaiting approval
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}