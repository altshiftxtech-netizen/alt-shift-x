import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { DollarSign, Edit2, Check, X, Plus, Upload, Calendar } from "lucide-react";

const DEFAULT_METRICS = [
  { metric_key: "revenue_share_pct", label: "Builder Revenue Share", value: 70, unit: "%", category: "revenue" },
  { metric_key: "platform_fee_pct", label: "Platform Fee", value: 30, unit: "%", category: "fee" },
  { metric_key: "payment_net_days", label: "Net Payment Days", value: 30, unit: "days", category: "payment" },
  { metric_key: "api_overage_rate", label: "API Overage Rate", value: 0.001, unit: "USD/call", category: "fee" },
  { metric_key: "min_payout", label: "Minimum Payout Threshold", value: 50, unit: "USD", category: "payment" },
];

export default function FinancialMetricsTab() {
  const [metrics, setMetrics] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newAgreement, setNewAgreement] = useState({ title: "", effective_date: "", content: "", applies_to: "all" });
  const [showNewAgreement, setShowNewAgreement] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.FinancialMetric.list('-created_date', 50),
      base44.entities.PaymentAgreement.list('-created_date', 20)
    ]).then(([m, a]) => {
      setMetrics(m.length > 0 ? m : DEFAULT_METRICS);
      setAgreements(a);
      setLoading(false);
    }).catch(() => {
      setMetrics(DEFAULT_METRICS);
      setLoading(false);
    });
  }, []);

  const startEdit = (m) => {
    setEditingId(m.metric_key || m.id);
    setEditValue(String(m.value));
  };

  const saveEdit = async (m) => {
    const updated = { ...m, value: parseFloat(editValue) };
    if (m.id) {
      await base44.entities.FinancialMetric.update(m.id, { value: parseFloat(editValue) });
    } else {
      await base44.entities.FinancialMetric.create(updated);
    }
    setMetrics(prev => prev.map(x => (x.metric_key === m.metric_key ? updated : x)));
    setEditingId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewAgreement(prev => ({ ...prev, document_url: file_url }));
    setUploadingFile(false);
  };

  const saveAgreement = async () => {
    if (!newAgreement.title || !newAgreement.effective_date) return;
    const created = await base44.entities.PaymentAgreement.create({
      ...newAgreement,
      status: "active",
      version: "1." + (agreements.length + 1)
    });
    setAgreements(prev => [created, ...prev]);
    setShowNewAgreement(false);
    setNewAgreement({ title: "", effective_date: "", content: "", applies_to: "all" });
  };

  const categoryColors = {
    revenue: "bg-emerald-100 text-emerald-700",
    fee: "bg-violet-100 text-violet-700",
    payment: "bg-blue-100 text-blue-700",
    subscription: "bg-amber-100 text-amber-700",
    compliance: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Financial Metrics</h2>
        <p className="text-sm text-slate-500 mb-4">Update platform fees, revenue share, and payment terms. Changes take effect on the specified date.</p>
        <div className="space-y-3">
          {metrics.map((m) => {
            const isEditing = editingId === (m.metric_key || m.id);
            return (
              <Card key={m.metric_key || m.id}>
                <CardContent className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${categoryColors[m.category] || "bg-slate-100 text-slate-600"}`}>{m.category}</span>
                        {m.scheduled_change && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Scheduled change on {m.scheduled_change.change_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right"
                          autoFocus
                        />
                        <span className="text-sm text-slate-500">{m.unit}</span>
                        <button onClick={() => saveEdit(m)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-slate-900">{m.value}<span className="text-sm font-normal text-slate-500 ml-1">{m.unit}</span></span>
                        <button onClick={() => startEdit(m)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Agreements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment Agreements</h2>
            <p className="text-sm text-slate-500">Upload signed or scheduled agreements. These can be set to activate on a future date.</p>
          </div>
          <Button size="sm" onClick={() => setShowNewAgreement(!showNewAgreement)} className="gap-1.5">
            <Plus className="w-4 h-4" /> New Agreement
          </Button>
        </div>

        {showNewAgreement && (
          <Card className="mb-4 border-violet-200">
            <CardContent className="pt-4 space-y-3">
              <input placeholder="Agreement Title" value={newAgreement.title} onChange={e => setNewAgreement(p => ({...p, title: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Effective Date</label>
                  <input type="date" value={newAgreement.effective_date} onChange={e => setNewAgreement(p => ({...p, effective_date: e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Applies To</label>
                  <select value={newAgreement.applies_to} onChange={e => setNewAgreement(p => ({...p, applies_to: e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="all">All Users</option>
                    <option value="builders">Builders</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="api_partners">API Partners</option>
                  </select>
                </div>
              </div>
              <textarea placeholder="Agreement content or terms (markdown supported)..." value={newAgreement.content}
                onChange={e => setNewAgreement(p => ({...p, content: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-28 resize-none" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-violet-700 hover:text-violet-800 font-medium">
                  <Upload className="w-4 h-4" />
                  {uploadingFile ? "Uploading..." : "Upload PDF"}
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </label>
                {newAgreement.document_url && <span className="text-xs text-emerald-600">✓ File uploaded</span>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveAgreement}>Save Agreement</Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewAgreement(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {agreements.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No payment agreements yet</div>}
          {agreements.map(a => (
            <Card key={a.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">v{a.version} · Effective {a.effective_date} · {a.applies_to}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-emerald-100 text-emerald-700' : a.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                    {a.status}
                  </span>
                  {a.document_url && <a href={a.document_url} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline">View PDF</a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}