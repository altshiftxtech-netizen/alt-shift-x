import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SharedNav from "@/components/SharedNav";
import { Plus, Zap, RotateCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SandboxManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', environment: 'staging' });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await base44.entities.SandboxAccount.list('-created_date', 20);
      setAccounts(data);
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!formData.name.trim()) return;
    try {
      const account = await base44.entities.SandboxAccount.create({
        name: formData.name,
        environment: formData.environment,
        account_id: `sandbox-${Date.now()}`,
        automation_enabled: true
      });
      setAccounts([account, ...accounts]);
      setFormData({ name: '', environment: 'staging' });
      setShowForm(false);
    } catch (err) {
      alert('Failed to create account: ' + err.message);
    }
  };

  const loadTestData = async (id) => {
    try {
      await base44.entities.SandboxAccount.update(id, { test_data_loaded: true });
      setAccounts(accounts.map(a => a.id === id ? { ...a, test_data_loaded: true } : a));
    } catch (err) {
      alert('Failed to load test data: ' + err.message);
    }
  };

  const runTests = async (id) => {
    try {
      await base44.entities.SandboxAccount.update(id, {
        test_runs_count: (accounts.find(a => a.id === id)?.test_runs_count || 0) + 1,
        last_accessed: new Date().toISOString()
      });
      setAccounts(accounts.map(a => a.id === id ? { ...a, last_accessed: new Date().toISOString(), test_runs_count: (a.test_runs_count || 0) + 1 } : a));
    } catch (err) {
      alert('Test run failed: ' + err.message);
    }
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('Delete this sandbox? This cannot be undone.')) return;
    try {
      await base44.entities.SandboxAccount.delete(id);
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Sandbox Management</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Sandbox
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Sandbox Name</label>
                <Input
                  placeholder="e.g., Staging DB Test"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Environment</label>
                <select value={formData.environment} onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="staging">Staging</option>
                  <option value="qa">QA</option>
                  <option value="dev">Development</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createAccount} className="bg-emerald-600 hover:bg-emerald-700">Create</Button>
                <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map(account => (
              <Card key={account.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        {account.name}
                        {account.status === 'active' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ID: {account.account_id}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{account.environment}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                    <div>
                      <p className="text-slate-500">Test Runs</p>
                      <p className="font-semibold text-slate-900">{account.test_runs_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Test Data</p>
                      <p className="font-semibold">{account.test_data_loaded ? '✓ Loaded' : 'Not loaded'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Automation</p>
                      <p className="font-semibold">{account.automation_enabled ? '✓ Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Last Accessed</p>
                      <p className="font-semibold">{account.last_accessed ? new Date(account.last_accessed).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!account.test_data_loaded && (
                      <Button size="sm" variant="outline" onClick={() => loadTestData(account.id)} className="text-xs">
                        Load Test Data
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => runTests(account.id)} className="text-xs gap-1">
                      <Zap className="w-3 h-3" /> Run Tests
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <RotateCw className="w-3 h-3" /> Reset
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteAccount(account.id)} className="text-xs text-red-600 hover:bg-red-50 gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-500 mb-4">No sandbox accounts yet. Create one to get started.</p>
              <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Create First Sandbox
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}