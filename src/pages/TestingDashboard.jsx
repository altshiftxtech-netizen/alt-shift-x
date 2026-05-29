import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import { Play, CheckCircle2, AlertCircle, Clock, BarChart3, FileText } from "lucide-react";

const TEST_MODES = [
  { id: 'smoke', name: 'Smoke Test', desc: 'Quick health check', duration: '2 min' },
  { id: 'security', name: 'Security Audit', desc: 'Comprehensive security scan', duration: '15 min' },
  { id: 'performance', name: 'Performance Test', desc: 'Load & optimization checks', duration: '10 min' },
  { id: 'compliance', name: 'SOC 2 Compliance', desc: 'Full compliance verification', duration: '20 min' },
];

export default function TestingDashboard() {
  const [testRuns, setTestRuns] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [runs, rpts] = await Promise.all([
        base44.entities.TestRun.list('-created_date', 20),
        base44.entities.ComplianceReport.list('-created_date', 10)
      ]);
      setTestRuns(runs);
      setReports(rpts);
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (mode) => {
    setRunning(mode);
    try {
      const res = await base44.functions.invoke('runAutomatedTests', { mode });
      setTestRuns([res.data.summary, ...testRuns]);
      setTimeout(() => loadData(), 2000);
    } catch (err) {
      alert('Test failed: ' + err.message);
    } finally {
      setRunning(null);
    }
  };

  const generateReport = async () => {
    try {
      await base44.functions.invoke('generateComplianceReport', {});
      setTimeout(() => loadData(), 1000);
    } catch (err) {
      alert('Report generation failed: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;

  const latestRun = testRuns[0];
  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Testing & Compliance</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Total Tests Run</p>
            <p className="text-2xl font-bold">{testRuns.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Pass Rate</p>
            <p className="text-2xl font-bold text-emerald-600">{latestRun?.pass_rate || 0}%</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Reports Generated</p>
            <p className="text-2xl font-bold">{reports.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold">Healthy</p>
            </div>
          </CardContent></Card>
        </div>

        {/* Test Modes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" /> Available Test Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEST_MODES.map(mode => (
                <div key={mode.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition">
                  <p className="font-semibold text-slate-900">{mode.name}</p>
                  <p className="text-xs text-slate-500 my-2">{mode.desc}</p>
                  <p className="text-xs text-slate-400 mb-3">Duration: {mode.duration}</p>
                  <Button 
                    size="sm" 
                    onClick={() => runTest(mode.id)}
                    disabled={running !== null}
                    className="w-full bg-blue-600 hover:bg-blue-700">
                    {running === mode.id ? 'Running...' : 'Run Test'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Test Run */}
        {latestRun && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {latestRun.status === 'passed' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                Latest Test Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><p className="text-xs text-slate-500">Mode</p><p className="font-semibold">{latestRun.test_mode}</p></div>
                <div><p className="text-xs text-slate-500">Status</p><p className="font-semibold capitalize">{latestRun.status}</p></div>
                <div><p className="text-xs text-slate-500">Duration</p><p className="font-semibold">{latestRun.duration_seconds}s</p></div>
                <div><p className="text-xs text-slate-500">Results</p><p className="font-semibold">{latestRun.passed}/{latestRun.total_tests} passed</p></div>
              </div>
              {latestRun.recommendations && (
                <div className="bg-slate-100 rounded p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Recommendations:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {latestRun.recommendations.map((rec, i) => <li key={i}>• {rec}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Compliance Reports
              </CardTitle>
              <Button size="sm" onClick={generateReport} className="bg-emerald-600 hover:bg-emerald-700">
                Generate Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="border border-slate-200 rounded p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{report.report_type.toUpperCase()} Report</p>
                        <p className="text-xs text-slate-500">{report.period_start} to {report.period_end}</p>
                        <div className="flex gap-6 mt-2">
                          <span className="text-xs"><span className="font-semibold">{report.pass_rate}%</span> Pass Rate</span>
                          <span className="text-xs"><span className="font-semibold">{report.critical_issues}</span> Critical Issues</span>
                          <span className="text-xs"><span className="font-semibold">{report.warnings}</span> Warnings</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">No reports generated yet. Click "Generate Report" to create one.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}