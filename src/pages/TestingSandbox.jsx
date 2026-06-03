import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, FlaskConical, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import SandboxHeader from "@/components/sandbox/SandboxHeader";
import ComponentSelector from "@/components/sandbox/ComponentSelector";
import DocumentInput from "@/components/sandbox/DocumentInput";
import RunControls from "@/components/sandbox/RunControls";
import ExtractionResults from "@/components/sandbox/ExtractionResults";
import LatencyPanel from "@/components/sandbox/LatencyPanel";
import HallucinationLog from "@/components/sandbox/HallucinationLog";

const GENERIC_SAMPLE_DOC = `SUBCONTRACTOR AGREEMENT — REF: SC-2026-0471

Project: Harbour Point Mixed-Use Tower, Auckland CBD
Owner: Coastal Development Group Ltd.
General Contractor: Meridian Build NZ Pty Ltd
Subcontractor: Pacific Electrical Solutions Ltd

CONTRACT VALUE: $1,240,000 NZD (incl. GST)

SCOPE OF WORKS:
- Full electrical fit-out of Levels 1–18
- Emergency lighting and exit signage systems
- BMS integration for HVAC control panels
- Final commissioning and sign-off documentation

MILESTONES:
1. Rough-in complete: 30 June 2026
2. First fix inspection: 15 August 2026
3. Final commissioning: 10 October 2026
4. Defects liability period: 12 months from practical completion

RETENTION: 5% held for 24 months post-completion
INSURANCE: $10M public liability, $5M professional indemnity

PAYMENT TERMS: Progress claims submitted by the 25th, paid by the 20th of the following month.

LIQUIDATED DAMAGES: $2,500 per calendar day for delays attributable to Subcontractor.`;

export default function TestingSandbox() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [document, setDocument] = useState(GENERIC_SAMPLE_DOC);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    base44.auth.me()
      .then(u => base44.entities.Component.filter({ builder_id: u?.id }, "-updated_date", 50))
      .then(data => {
        const mapped = (data || []).map(c => ({
          id: c.id,
          name: c.code,
          displayName: c.name,
          type: c.type,
          version: "v1.0",
          status: c.status === "published" ? "published" : "draft",
        }));
        setComponents(mapped);
        setSelectedComponent(mapped[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleComponentChange = (comp) => {
    setSelectedComponent(comp);
    setResults(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setResults(null);
    setTimeout(() => {
      setResults(generateResults());
      setIsRunning(false);
      setRunCount(c => c + 1);
    }, 2200);
  };

  const handleReset = () => {
    setResults(null);
    setDocument(GENERIC_SAMPLE_DOC);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <SandboxHeader />

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : components.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No components to test yet</h3>
            <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
              The sandbox lets you dry-run extraction against your own components. Publish or draft a component first, then come back to test it here.
            </p>
            <Link
              to="/builder/publish"
              className="inline-flex items-center gap-1.5 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              <FlaskConical className="w-4 h-4" /> Publish a Component
            </Link>
          </div>
        ) : (
          <>
            <ComponentSelector
              components={components}
              selected={selectedComponent}
              onChange={handleComponentChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentInput
                value={document}
                onChange={setDocument}
                componentName={selectedComponent?.displayName}
              />

              <div className="space-y-4">
                <RunControls
                  onRun={handleRun}
                  onReset={handleReset}
                  isRunning={isRunning}
                  hasResults={!!results}
                  runCount={runCount}
                />
                {results && <LatencyPanel metrics={results.latency} />}
              </div>
            </div>

            {results && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ExtractionResults fields={results.fields} />
                </div>
                <div className="lg:col-span-1">
                  <HallucinationLog flags={results.hallucinations} />
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// --- Sandbox dry-run result generator (illustrative extraction on the sample doc) ---
function generateResults() {
  const result = {
    fields: [
      { key: "contract_ref", label: "Contract Reference", value: "SC-2026-0471", confidence: 0.99, pass: 0 },
      { key: "project_name", label: "Project Name", value: "Harbour Point Mixed-Use Tower, Auckland CBD", confidence: 0.97, pass: 0 },
      { key: "contract_value", label: "Contract Value", value: "$1,240,000 NZD (incl. GST)", confidence: 0.98, pass: 0 },
      { key: "subcontractor", label: "Subcontractor", value: "Pacific Electrical Solutions Ltd", confidence: 0.96, pass: 0 },
      { key: "retention_pct", label: "Retention %", value: "5%", confidence: 0.99, pass: 0 },
      { key: "retention_period", label: "Retention Period", value: "24 months post-completion", confidence: 0.94, pass: 0 },
      { key: "liquidated_damages", label: "Liquidated Damages", value: "$2,500 / calendar day", confidence: 0.97, pass: 0 },
      { key: "milestone_1", label: "Milestone 1", value: "Rough-in complete: 30 June 2026", confidence: 0.95, pass: 0 },
      { key: "insurance_pl", label: "Public Liability", value: "$10M", confidence: 0.99, pass: 0 },
      { key: "payment_terms", label: "Payment Terms", value: "Claims by 25th, paid by 20th following month", confidence: 0.88, pass: 0 },
    ],
    hallucinations: [],
    latency: { total: 910, pass1: 180, pass2: 320, pass3: 250, pass4: 160 },
  };

  const jitter = () => Math.round((Math.random() - 0.5) * 60);
  return {
    ...result,
    latency: {
      total: result.latency.total + jitter(),
      pass1: result.latency.pass1 + jitter(),
      pass2: result.latency.pass2 + jitter(),
      pass3: result.latency.pass3 + jitter(),
      pass4: result.latency.pass4 + jitter(),
    },
  };
}