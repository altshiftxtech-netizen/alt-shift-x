import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublishHeader from "@/components/builder-publish/PublishHeader";
import PublishStepper from "@/components/builder-publish/PublishStepper";
import StepSchema from "@/components/builder-publish/StepSchema";
import StepBenchmark from "@/components/builder-publish/StepBenchmark";
import StepCompliance from "@/components/builder-publish/StepCompliance";
import StepConfirm from "@/components/builder-publish/StepConfirm";

export const STEPS = [
  { id: 1, label: "Schema & Metadata" },
  { id: 2, label: "Benchmark Declaration" },
  { id: 3, label: "Compliance Checklist" },
  { id: 4, label: "Review & Submit" },
];

const INITIAL_FORM = {
  name: "",
  displayName: "",
  type: "",
  category: "",
  description: "",
  version: "",
  cycleTimeTarget: "",
  errorRateTarget: "",
  benchmarkDocCount: "",
  benchmarkAccuracy: "",
  checks: {
    noHardcodedData: false,
    graceefulDegradation: false,
    citationRequired: false,
    noExternalCalls: false,
    passStructureFollowed: false,
    schemaValidated: false,
    sandboxTested: false,
    reviewedGovernance: false,
  },
};

export default function BuilderPublish() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (updates) => setForm(prev => ({ ...prev, ...updates }));
  const updateChecks = (key, val) => setForm(prev => ({ ...prev, checks: { ...prev.checks, [key]: val } }));

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-lg text-center px-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Received</h2>
          <p className="text-slate-500 mb-6">
            <strong>{form.displayName || "Your component"}</strong> has been submitted for review. 
            Platform review typically takes 1–3 business days. You'll receive an email when it's approved or if changes are requested.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/builder/components" className="text-sm bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium">
              View My Components
            </Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm(INITIAL_FORM); }}
              className="text-sm text-violet-700 underline"
            >
              Submit another component
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PublishHeader />
        <PublishStepper steps={STEPS} current={step} />
        {step === 1 && <StepSchema form={form} onChange={updateForm} onNext={() => setStep(2)} />}
        {step === 2 && <StepBenchmark form={form} onChange={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepCompliance checks={form.checks} onChange={updateChecks} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <StepConfirm form={form} onSubmit={handleSubmit} onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}