import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const TEST_MODES = [
  { id: 'smoke', name: 'Smoke Test', desc: 'Quick health check - 2 min' },
  { id: 'security', name: 'Security Audit', desc: 'Comprehensive security scan - 15 min' },
  { id: 'performance', name: 'Performance Test', desc: 'Load & optimization - 10 min' },
  { id: 'compliance', name: 'SOC 2 Compliance', desc: 'Full compliance verification - 20 min' },
];

export default function TestModeSelector() {
  const [enabled, setEnabled] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('test_modes_enabled');
    if (saved) setEnabled(JSON.parse(saved));
  }, []);

  const handleToggle = (id, value) => {
    const updated = { ...enabled, [id]: value };
    setEnabled(updated);
    localStorage.setItem('test_modes_enabled', JSON.stringify(updated));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-bold text-slate-900 mb-4">Enable Automated Test Modes</p>
        <p className="text-xs text-slate-500 mb-4">Select which tests should run on schedule</p>
        <div className="space-y-3">
          {TEST_MODES.map(mode => (
            <div key={mode.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-900">{mode.name}</p>
                <p className="text-xs text-slate-500">{mode.desc}</p>
              </div>
              <Switch 
                checked={enabled[mode.id] || false}
                onCheckedChange={(value) => handleToggle(mode.id, value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}