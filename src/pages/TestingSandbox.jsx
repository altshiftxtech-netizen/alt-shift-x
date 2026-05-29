import React, { useState } from "react";
import SandboxHeader from "@/components/sandbox/SandboxHeader";
import ComponentSelector from "@/components/sandbox/ComponentSelector";
import DocumentInput from "@/components/sandbox/DocumentInput";
import RunControls from "@/components/sandbox/RunControls";
import ExtractionResults from "@/components/sandbox/ExtractionResults";
import LatencyPanel from "@/components/sandbox/LatencyPanel";
import HallucinationLog from "@/components/sandbox/HallucinationLog";

const MOCK_COMPONENTS = [
  { id: "rp-construction", name: "RP-CONSTRUCTION-1.0", displayName: "Ironclad Protocol", type: "X1", version: "v2.4.1", status: "draft" },
  { id: "pm-construction", name: "PM-CONSTRUCTION-BID", displayName: "Estimator's Eye", type: "X2", version: "v1.9.3", status: "published" },
  { id: "rc-construction", name: "RC-CONSTRUCTION", displayName: "The Site Board", type: "X4", version: "v3.1.0", status: "published" },
];

const SAMPLE_DOCS = {
  "rp-construction": `SUBCONTRACTOR AGREEMENT — REF: SC-2026-0471

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

LIQUIDATED DAMAGES: $2,500 per calendar day for delays attributable to Subcontractor.`,

  "pm-construction": `BID ESTIMATE — PROJECT: Westfield Office Expansion
Prepared by: Hawke & Sons Construction Estimating
Date: 27 May 2026
Bid Reference: BID-2026-WF-042

DIVISION 03 — CONCRETE
  03-100  Formwork & Shoring          $48,200
  03-200  Reinforcing Steel           $31,500
  03-300  Cast-in-Place Concrete      $87,400
  SUBTOTAL DIV 03:                   $167,100

DIVISION 05 — METALS
  05-100  Structural Steel            $214,000
  05-200  Steel Joists & Decking       $98,500
  SUBTOTAL DIV 05:                   $312,500

DIVISION 09 — FINISHES
  09-200  Plaster & Gypsum Board       $44,700
  09-600  Flooring                     $52,100
  09-900  Painting                     $18,300
  SUBTOTAL DIV 09:                   $115,100

GENERAL CONDITIONS:                   $62,400
OVERHEAD & PROFIT (12%):              $78,252
CONTINGENCY (5%):                     $36,768

TOTAL BASE BID:                      $772,120
ALTERNATE 01 (Premium glazing):      +$41,500
ALTERNATE 02 (Green roof system):    +$88,000

BID VALIDITY: 60 days from submission date`,

  "rc-construction": `DAILY SITE REPORT — DAY 47
Project: Tāmaki Riverside Apartments, Stage 2
Site Supervisor: Kevin Oram | Date: 28 May 2026
Weather: Overcast, 14°C, no rain | Wind: Light NW

WORKFORCE ON SITE TODAY:
  - Meridian (GC):           8 workers
  - Pacific Electrical:      5 workers
  - AquaFit Plumbing:        3 workers
  - TotalFix Concrete:       6 workers
  TOTAL:                    22 workers

WORK COMPLETED:
  ✓ Slab pour Level 4 — Section C (complete)
  ✓ Rough-in electrical Levels 2–3 (85% complete)
  ✓ Plumbing stacks Level 3 (complete)
  ✗ Curtain wall install Level 5 — DELAYED (glazing panels not delivered)

MATERIALS RECEIVED:
  - 12T reinforcing mesh (Inv #RM-0481)
  - 40x 2.4m H-frames (scaffold supplier)

INCIDENTS / NEAR MISSES: None

OPEN RFIs:
  RFI-014: Revised waterproof membrane spec — PENDING (Architect, 5 days overdue)
  RFI-017: Slab penetration locations Level 5 — OPEN

NOTES: Glazing delivery rescheduled to 3 June. Curtain wall install will push Level 5 handover by approximately 5 days. Programme impact to be assessed tomorrow.`,
};

export default function TestingSandbox() {
  const [selectedComponent, setSelectedComponent] = useState(MOCK_COMPONENTS[0]);
  const [document, setDocument] = useState(SAMPLE_DOCS["rp-construction"]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [runCount, setRunCount] = useState(0);

  const handleComponentChange = (comp) => {
    setSelectedComponent(comp);
    setDocument(SAMPLE_DOCS[comp.id] || "");
    setResults(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setResults(null);

    // Simulate progressive extraction with realistic timing
    setTimeout(() => {
      setResults(generateMockResults(selectedComponent));
      setIsRunning(false);
      setRunCount(c => c + 1);
    }, 2200);
  };

  const handleReset = () => {
    setResults(null);
    setDocument(SAMPLE_DOCS[selectedComponent.id] || "");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <SandboxHeader />

        <ComponentSelector
          components={MOCK_COMPONENTS}
          selected={selectedComponent}
          onChange={handleComponentChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DocumentInput
            value={document}
            onChange={setDocument}
            componentName={selectedComponent.displayName}
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

      </div>
    </div>
  );
}

// --- Mock result generator ---
function generateMockResults(component) {
  const base = {
    "rp-construction": {
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
    },
    "pm-construction": {
      fields: [
        { key: "bid_ref", label: "Bid Reference", value: "BID-2026-WF-042", confidence: 0.99, pass: 0 },
        { key: "project_name", label: "Project Name", value: "Westfield Office Expansion", confidence: 0.97, pass: 0 },
        { key: "prepared_by", label: "Prepared By", value: "Hawke & Sons Construction Estimating", confidence: 0.96, pass: 0 },
        { key: "total_base_bid", label: "Total Base Bid", value: "$772,120", confidence: 0.99, pass: 0 },
        { key: "div03_subtotal", label: "Division 03 Subtotal", value: "$167,100", confidence: 0.98, pass: 0 },
        { key: "div05_subtotal", label: "Division 05 Subtotal", value: "$312,500", confidence: 0.98, pass: 0 },
        { key: "div09_subtotal", label: "Division 09 Subtotal", value: "$115,100", confidence: 0.97, pass: 0 },
        { key: "overhead_profit", label: "Overhead & Profit", value: "$78,252 (12%)", confidence: 0.96, pass: 0 },
        { key: "alt_01", label: "Alternate 01", value: "+$41,500 (Premium glazing)", confidence: 0.94, pass: 0 },
        { key: "bid_validity", label: "Bid Validity", value: "60 days from submission", confidence: 0.92, pass: 0 },
        { key: "structural_steel", label: "Structural Steel Cost", value: "$214,000 — FLAGGED: document states $218,000 on cover sheet", confidence: 0.61, pass: 1, hallucination: true },
      ],
      hallucinations: [
        { field: "structural_steel", label: "Structural Steel Cost", severity: "medium", type: "Contradiction", detail: "Extracted value ($214,000) conflicts with a figure on the document cover sheet ($218,000). Verify which line item is authoritative.", confidence: 0.61 },
      ],
      latency: { total: 1140, pass1: 210, pass2: 390, pass3: 310, pass4: 230 },
    },
    "rc-construction": {
      fields: [
        { key: "report_day", label: "Report Day", value: "Day 47", confidence: 0.99, pass: 0 },
        { key: "project", label: "Project", value: "Tāmaki Riverside Apartments, Stage 2", confidence: 0.97, pass: 0 },
        { key: "supervisor", label: "Site Supervisor", value: "Kevin Oram", confidence: 0.99, pass: 0 },
        { key: "date", label: "Report Date", value: "28 May 2026", confidence: 0.99, pass: 0 },
        { key: "total_workforce", label: "Total Workforce", value: "22 workers", confidence: 0.98, pass: 0 },
        { key: "work_delayed", label: "Delayed Work Item", value: "Curtain wall install Level 5 — glazing panels not delivered", confidence: 0.96, pass: 0 },
        { key: "open_rfis", label: "Open RFIs", value: "RFI-014 (5 days overdue), RFI-017 (Open)", confidence: 0.93, pass: 0 },
        { key: "incidents", label: "Incidents / Near Misses", value: "None", confidence: 0.99, pass: 0 },
        { key: "programme_impact", label: "Programme Impact", value: "~5 day delay to Level 5 handover", confidence: 0.91, pass: 0 },
        { key: "next_delivery", label: "Glazing Delivery Rescheduled", value: "3 June 2026", confidence: 0.97, pass: 0 },
      ],
      hallucinations: [],
      latency: { total: 740, pass1: 140, pass2: 270, pass3: 200, pass4: 130 },
    },
  };

  const result = base[component.id] || base["rp-construction"];

  // Add small random jitter to latency to simulate real runs
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