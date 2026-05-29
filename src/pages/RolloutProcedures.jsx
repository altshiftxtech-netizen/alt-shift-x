import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import { CheckCircle2, AlertCircle, Download, FileText } from "lucide-react";

const ROLLOUT_PHASES = [
  {
    phase: 1,
    name: 'Pre-Rollout Validation',
    checklist: [
      'All automated tests pass in compliance mode',
      'Security audit shows no critical issues',
      'Performance benchmarks meet SLA targets',
      'Data backup completed and verified',
      'Rollback procedure documented and tested',
      'Stakeholders notified of deployment window',
      'Monitoring alerts configured'
    ]
  },
  {
    phase: 2,
    name: 'Sandbox Testing',
    checklist: [
      'Deploy to staging environment',
      'Run full SOC2 compliance test suite',
      'Execute smoke tests on all features',
      'Verify data integrity and migrations',
      'Load test with expected traffic patterns',
      'Security team validates changes',
      'Document any issues found'
    ]
  },
  {
    phase: 3,
    name: 'Staged Rollout',
    checklist: [
      'Deploy to 10% of production infrastructure',
      'Monitor metrics and error rates for 1 hour',
      'Verify customer impact is minimal',
      'Increase to 50% if metrics healthy',
      'Continue monitoring for issues',
      'Document any anomalies',
      'Prepare rollback if needed'
    ]
  },
  {
    phase: 4,
    name: 'Full Production Deployment',
    checklist: [
      'Deploy to remaining 50% of infrastructure',
      'Continuous monitoring for 24 hours',
      'Performance metrics within baseline',
      'Zero critical errors in logs',
      'Customer feedback monitored',
      'Update status page',
      'Post-deployment report generated'
    ]
  },
  {
    phase: 5,
    name: 'Post-Rollout',
    checklist: [
      'Run full compliance suite one final time',
      'Collect performance data across all metrics',
      'Generate compliance report',
      'Generate performance recommendations',
      'Update documentation with lessons learned',
      'Schedule post-mortem meeting',
      'Archive deployment artifacts'
    ]
  }
];

export default function RolloutProcedures() {
  const [completed, setCompleted] = useState({});
  const [expandedPhase, setExpandedPhase] = useState(0);

  const toggleChecklist = (phase, index) => {
    const key = `${phase}-${index}`;
    setCompleted(c => ({ ...c, [key]: !c[key] }));
  };

  const phaseProgress = (phase) => {
    const items = ROLLOUT_PHASES[phase].checklist;
    const done = items.filter((_, i) => completed[`${phase}-${i}`]).length;
    return Math.round((done / items.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Rollout Procedures</h1>
          <p className="text-slate-600">Full-proof deployment checklist with SOC2 compliance validation at each stage</p>
        </div>

        {/* Overview */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {ROLLOUT_PHASES.map((p, i) => (
                <div key={i} className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 ${phaseProgress(i) === 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                    {phaseProgress(i)}%
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Phase {p.phase}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <div className="space-y-4">
          {ROLLOUT_PHASES.map((phase, idx) => (
            <Card key={idx} className="cursor-pointer hover:border-slate-300" onClick={() => setExpandedPhase(expandedPhase === idx ? -1 : idx)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Phase {phase.phase}: {phase.name}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 transition-all" style={{ width: `${phaseProgress(idx)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-10">{phaseProgress(idx)}%</span>
                  </div>
                </div>
              </CardHeader>

              {expandedPhase === idx && (
                <CardContent className="space-y-3 pt-0 border-t border-slate-200">
                  {phase.checklist.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={completed[`${idx}-${i}`] || false}
                        onChange={() => toggleChecklist(idx, i)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-sm ${completed[`${idx}-${i}`] ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Deployment Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Key Principles:</p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>✓ All automated tests must pass before proceeding to next phase</li>
                <li>✓ Monitoring must show healthy metrics at each stage gate</li>
                <li>✓ Rollback procedure must be tested before deployment</li>
                <li>✓ Post-deployment SOC2 report must be generated within 24 hours</li>
                <li>✓ All team members must acknowledge understanding of procedure</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button variant="outline">Print Procedure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}