import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import {
  Crown, Lock, ChevronRight, ChevronLeft, Upload, FileText,
  CheckCircle2, Loader2, ShieldCheck, Calendar, Video, AlertCircle, Building2,
} from "lucide-react";

const STEPS = [
  { id: "dossier", label: "Forensic Dossier", icon: ShieldCheck },
  { id: "intent", label: "The Intent Map", icon: FileText },
  { id: "schedule", label: "Scheduling", icon: Calendar },
];

const DISCLAIMER = `SOV-SHELL-DISCLAIMER-1.0: By submitting this consultation request, you acknowledge that the Sovereign Consultation Gateway is an architectural advisory service. Alt+Shift+X provides strategic intelligence and component architecture guidance. We do not guarantee specific business outcomes, revenue results, or legal compliance. All consultations are logged under GSP-MASTER-INDEX-1.0 for forensic integrity. Your intake data is protected under the Sovereign Privacy Veil and will not be shared with third parties.`;

const PRE_ALPHA_BUILDER_ID = "6a19363c90f06323c4cfff74";

export default function Consultation() {
  const { status, user, isAdmin } = useSovereignAccess();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");

  // Step A — Forensic Dossier
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("For-Profit");
  const [taxId, setTaxId] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Step B — Intent Map
  const [objective, setObjective] = useState("");
  const [intentDoc, setIntentDoc] = useState(null);

  // Step C — Scheduling
  const [startTime, setStartTime] = useState("");

  const isPreAlphaBuilder = user?.id === PRE_ALPHA_BUILDER_ID;
  const isNonProfit = entityType === "Non-Profit" && taxId.trim().length > 0;
  const canProceedDossier = fullName.trim() && entityName.trim() && role.trim() && disclaimerAccepted;
  const canProceedIntent = objective.trim().length >= 10;
  const canProceedSchedule = !!startTime;
  const canNext = step === 0 ? canProceedDossier : step === 1 ? canProceedIntent : canProceedSchedule;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      let finalDocUrl = "";
      if (intentDoc) {
        try {
          const uploadRes = await base44.integrations.Core.UploadFile({ file: intentDoc });
          finalDocUrl = uploadRes.file_url || "";
        } catch (uploadErr) {
          console.error("Doc upload failed", uploadErr);
        }
      }

      const topicText = `[${entityType}] ${objective.substring(0, 200)}`;
      const companyField = `${entityName} — ${role}${isNonProfit ? " (Non-Profit: $0 Credit)" : ""}${finalDocUrl ? ` | Brief: ${finalDocUrl}` : ""}`;

      const res = await base44.functions.invoke("bookSovereignConsultation", {
        topic: topicText,
        start: new Date(startTime).toISOString(),
        company_name: companyField,
      });

      if (res.data?.consultation) {
        setBooked(res.data.consultation);
      } else {
        setError(res.data?.error || res.error || "Booking failed. Please try again.");
      }
    } catch (e) {
      setError(e.message || "Booking failed. Please try again.");
    }
    setSubmitting(false);
  };

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C8A95B] animate-spin" />
      </div>
    );
  }

  // Guest — not authenticated
  if (status === "guest") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <Card className="border-[#30363d] bg-[#0d1117] max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C8A95B]/10 border border-[#C8A95B]/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#C8A95B]" />
            </div>
            <h2 className="text-xl font-black text-white">Authentication Required</h2>
            <p className="text-sm text-[#8b949e]">You must be signed in to request a Sovereign Consultation.</p>
            <Button onClick={() => base44.auth.redirectToLogin("/consultation")} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold w-full">
              <Lock className="w-4 h-4 mr-1" /> Sign in to Continue
            </Button>
            <Link to="/" className="block text-xs text-[#484f58] hover:text-[#8b949e]">← Back to home</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tier gate — non-Sovereign, non-admin, non-pre-alpha
  if (status === "denied" && !isAdmin && !isPreAlphaBuilder) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <Card className="border-[#C8A95B]/30 bg-[#0d1117] max-w-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C8A95B]/10 border border-[#C8A95B]/30 flex items-center justify-center">
              <Crown className="w-7 h-7 text-[#C8A95B]" />
            </div>
            <h2 className="text-2xl font-black text-white">Sovereign Access Required</h2>
            <p className="text-sm text-[#8b949e]">V35+ Consultations are currently limited to Vested 100 and Sovereign-Tier members.</p>
            <div className="rounded-lg bg-[#C8A95B]/5 border border-[#C8A95B]/20 p-3 text-left">
              <p className="text-[11px] text-[#C8A95B] font-mono mb-1">NON-PROFIT?</p>
              <p className="text-xs text-[#8b949e]">If you are a registered Non-Profit, enter your Tax ID during intake to trigger the $0 Sovereign Credit — but you must be Sovereign-Tier first.</p>
            </div>
            <Link to="/enterprise">
              <Button className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold w-full">Upgrade Now</Button>
            </Link>
            <Link to="/pricing" className="block text-xs text-[#484f58] hover:text-[#8b949e]">← Back to pricing</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success screen
  if (booked) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <Card className="border-green-500/30 bg-[#0d1117] max-w-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">Consultation Scheduled</h2>
            <p className="text-sm text-[#8b949e]">Your Sovereign Consultation has been booked. A Google Calendar invite with a Meet link has been sent to your email.</p>
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-left space-y-2 font-mono text-xs">
              <div><span className="text-[#484f58]">Topic:</span> <span className="text-[#c9d1d9]">{booked.topic}</span></div>
              <div><span className="text-[#484f58]">When:</span> <span className="text-[#c9d1d9]">{new Date(booked.start).toLocaleString()}</span></div>
              {booked.meet_link && (
                <div className="flex items-center gap-2">
                  <span className="text-[#484f58]">Meet:</span>
                  <a href={booked.meet_link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate flex items-center gap-1">
                    <Video className="w-3 h-3" /> Join Google Meet
                  </a>
                </div>
              )}
              <div><span className="text-[#484f58]">Status:</span> <span className="text-green-400">{booked.status}</span></div>
            </div>
            {isNonProfit && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-2 text-xs text-green-400 font-mono">✓ $0 Sovereign Credit Applied (Non-Profit)</div>
            )}
            <Link to="/dashboard">
              <Button variant="outline" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22]">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multi-step intake form
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <SharedNav mode="user" theme="dev" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A95B]/10 border border-[#C8A95B]/30">
            <Crown className="w-3.5 h-3.5 text-[#C8A95B]" />
            <span className="text-[10px] font-mono text-[#C8A95B] uppercase tracking-wider">SOV-APEX-CONSULTATION-EXECUTIVE-1.0</span>
          </div>
          <h1 className="text-2xl font-black text-white">Sovereign Consultation Gateway</h1>
          <p className="text-sm text-[#8b949e]">High-stakes architectural advisory. Forensic intake required before the SpeakEasy tunnel opens.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {STEPS.map((s, idx) => (
            <span key={s.id} className="flex items-center">
              <button
                onClick={() => idx < step && setStep(idx)}
                disabled={idx >= step}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono transition-all ${
                  idx === step
                    ? "bg-[#C8A95B]/15 text-[#C8A95B] border border-[#C8A95B]/40"
                    : idx < step
                    ? "text-green-400 hover:bg-[#161b22] cursor-pointer"
                    : "text-[#484f58] cursor-default"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#30363d]" />}
            </span>
          ))}
        </div>

        {/* Step content */}
        <Card className="border-[#30363d] bg-[#0d1117]/80 backdrop-blur-md">
          <CardContent className="pt-6 space-y-4">
            {step === 0 && (
              <>
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Step A — Forensic Dossier
                </h3>
                <p className="text-xs text-[#8b949e]">Legal hardening. This data is encrypted and logged under GSP-MASTER-INDEX-1.0.</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8b949e] font-mono">Full Name *</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50" />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] font-mono">Role / Title *</label>
                    <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50" />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] font-mono">Entity Name *</label>
                    <input value={entityName} onChange={(e) => setEntityName(e.target.value)} className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50" />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] font-mono">Entity Type</label>
                    <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50">
                      <option>For-Profit</option>
                      <option>Non-Profit</option>
                      <option>Government</option>
                      <option>Individual</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#8b949e] font-mono">
                      Tax ID {entityType === "Non-Profit" && "(for $0 Credit verification)"}
                    </label>
                    <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50" placeholder="EIN / Tax Registration #" />
                    {isNonProfit && (
                      <p className="mt-1 text-[10px] text-green-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> $0 Sovereign Credit activated.
                      </p>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-2 p-3 rounded-lg border border-[#30363d] bg-[#010409] cursor-pointer hover:border-[#C8A95B]/30">
                  <input type="checkbox" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#C8A95B] shrink-0" />
                  <span className="text-[10px] text-[#8b949e] leading-relaxed">{DISCLAIMER}</span>
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Step B — The Intent Map
                </h3>
                <p className="text-xs text-[#8b949e]">Define your primary strategic objective. B.O.B.Init routes this to the appropriate Reason Council.</p>

                <div>
                  <label className="text-xs text-[#8b949e] font-mono">Primary Strategic Objective *</label>
                  <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    rows={5}
                    className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50 resize-y"
                    placeholder="e.g. We need an agent architecture that audits carbon credits across 14 jurisdictions with real-time compliance checking..."
                  />
                  <p className="mt-1 text-[10px] text-[#484f58] font-mono">{objective.length} chars (min 10)</p>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] font-mono">Secure Document Upload (optional)</label>
                  <div
                    className="mt-1 rounded-lg border-2 border-dashed border-[#30363d] p-4 text-center hover:border-[#C8A95B]/40 cursor-pointer transition-colors"
                    onClick={() => document.getElementById("intent-doc").click()}
                  >
                    <input id="intent-doc" type="file" className="hidden" onChange={(e) => setIntentDoc(e.target.files[0])} accept=".pdf,.doc,.docx,.md,.txt" />
                    {intentDoc ? (
                      <p className="text-xs text-green-400 flex items-center justify-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {intentDoc.name} <span className="text-[#484f58]">({(intentDoc.size / 1024).toFixed(1)}KB)</span>
                      </p>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#484f58] mx-auto mb-1" />
                        <p className="text-[10px] text-[#8b949e]">Drag or click — PDF, DOC, MD, TXT</p>
                        <p className="text-[9px] text-[#484f58] mt-0.5">Linked to intake_document_registry_path</p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Step C — Scheduling
                </h3>
                <p className="text-xs text-[#8b949e]">Select your preferred consultation window. Scheduling opens Monday for Tuesday appointments.</p>

                <div>
                  <label className="text-xs text-[#8b949e] font-mono">Preferred Start Time *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50"
                  />
                  <p className="mt-1 text-[10px] text-[#484f58] font-mono">A Google Meet link will be generated and sent to your email.</p>
                </div>

                {/* Intake summary */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-[#484f58] uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Intake Summary
                  </p>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Entity:</span> {entityName} ({entityType})</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Contact:</span> {fullName}, {role}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Objective:</span> {objective.substring(0, 80)}{objective.length > 80 && "..."}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Document:</span> {intentDoc?.name || "None"}</div>
                  <div className="text-[11px] text-[#8b949e]">
                    <span className="text-[#484f58]">Credit:</span>{" "}
                    {isNonProfit ? <span className="text-green-400">$0 (Non-Profit)</span> : <span className="text-[#C8A95B]">Sovereign (included)</span>}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
              <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] font-mono text-xs">
                <ChevronLeft className="w-3 h-3" /> Back
              </Button>
              {step < 2 ? (
                <Button size="sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold text-xs">
                  Continue <ChevronRight className="w-3 h-3" />
                </Button>
              ) : (
                <Button size="sm" disabled={!canNext || submitting} onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />} Schedule Consultation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-mono text-[#484f58]">ROADMAP INTEGRITY: 115% · GATE STATUS: ARMED · PRIVACY VEIL: HOLDING</p>
        </div>
      </div>
    </div>
  );
}