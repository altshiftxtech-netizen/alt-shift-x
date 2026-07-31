import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import SchedulePicker from "@/components/consultation/SchedulePicker";
import ConsultationPolicyFooter from "@/components/consultation/ConsultationPolicyFooter";
import {
  Crown, Lock, ChevronRight, ChevronLeft, Upload, FileText,
  CheckCircle2, Loader2, ShieldCheck, Calendar, Video, AlertCircle, Building2,
  CreditCard, Tag, Mail, Clock, Sparkles,
} from "lucide-react";

const STEPS = [
  { id: "dossier", label: "Forensic Dossier", icon: ShieldCheck },
  { id: "intent", label: "The Intent Map", icon: FileText },
  { id: "schedule", label: "Scheduling", icon: Calendar },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "checkout", label: "Billing", icon: CreditCard },
];

const DISCLAIMER = `SOV-SHELL-DISCLAIMER-1.0: By submitting this consultation request, you acknowledge that the Sovereign Consultation Gateway is an architectural advisory service. Alt+Shift+X provides strategic intelligence and component architecture guidance. We do not guarantee specific business outcomes, revenue results, or legal compliance. All consultations are logged under GSP-MASTER-INDEX-1.0 for forensic integrity. Your intake data is protected under the Sovereign Privacy Veil and will not be shared with third parties.`;

const PRE_ALPHA_BUILDER_ID = "6a19363c90f06323c4cfff74";
const CONSULTATION_COMPONENT_CODE = "SOV-APEX-CONSULTATION-EXECUTIVE-1.0";
const NONPROFIT_PROMO = "SOV-NONPROFIT-2027";
const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/a40ebfb38_081bbfb03_generated_video.mp4";

function VideoBg() {
  return (
    <>
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-[#0d1117]/50 pointer-events-none" />
    </>
  );
}

export default function Consultation() {
  const { status, user, isAdmin } = useSovereignAccess();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");
  const [pendingPay, setPendingPay] = useState(null);
  const [noBilling, setNoBilling] = useState(false);

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

  // Step D — Billing
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [consultationFee, setConsultationFee] = useState(null);

  const isPreAlphaBuilder = user?.id === PRE_ALPHA_BUILDER_ID;
  const isNonProfit = entityType === "Non-Profit" && taxId.trim().length > 0;
  const canProceedDossier = fullName.trim() && entityName.trim() && role.trim() && disclaimerAccepted;
  const canProceedIntent = objective.trim().length >= 10;
  const canProceedSchedule = !!startTime;
  const canNext = step === 0 ? canProceedDossier : step === 1 ? canProceedIntent : step === 2 ? canProceedSchedule : true;

  // Fetch consultation fee from Component entity
  useEffect(() => {
    if (step === 4 && !noBilling && consultationFee === null) {
      base44.entities.Component.filter({ code: CONSULTATION_COMPONENT_CODE })
        .then((comps) => {
          if (comps[0]?.price != null) setConsultationFee(comps[0].price);
          else setConsultationFee(2499);
        })
        .catch(() => setConsultationFee(2499));
    }
  }, [step]);

  // Handle Stripe redirect return — ?consultation=success&id=xxx
  // Also detect ?no_billing=true for Sovereign-member sessions (no payment step)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("consultation") === "success" && params.get("id")) {
      setPendingPay(params.get("id"));
      window.history.replaceState({}, "", "/consultation");
    }
    if (params.get("no_billing") === "true") {
      setNoBilling(true);
    }
  }, []);

  // Poll for payment confirmation after Stripe redirect
  useEffect(() => {
    if (!pendingPay) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const c = await base44.entities.SovereignConsultation.get(pendingPay);
        if (cancelled) return;
        if (c.payment_status === "paid" || c.payment_status === "promo_applied") {
          setBooked(c);
          setPendingPay(null);
          return true;
        }
      } catch (e) { /* keep polling */ }
      return false;
    };
    poll();
    const interval = setInterval(poll, 3000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!cancelled) {
        setPendingPay(null);
        setError("Payment confirmation timed out. If you completed payment, check your email for confirmation.");
      }
    }, 60000);
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout); };
  }, [pendingPay]);

  const finalPrice = promoApplied ? 0 : (consultationFee || 0);

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoApplied(false);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === NONPROFIT_PROMO) {
      if (!isNonProfit) {
        setPromoError("This promo code requires a Non-Profit entity type with a valid Tax ID in Step A.");
        return;
      }
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code.");
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Iframe guard — Stripe checkout only works from the published app (skip for $0 sovereign-member path)
      if (!noBilling && window.self !== window.top) {
        setError("Checkout is only available from the published app. Please open the live URL to complete payment.");
        setSubmitting(false);
        return;
      }

      // 1. Upload intent doc if present
      let finalDocUrl = "";
      if (intentDoc) {
        try {
          const uploadRes = await base44.integrations.Core.UploadFile({ file: intentDoc });
          finalDocUrl = uploadRes.file_url || "";
        } catch (e) { /* non-critical */ }
      }

      // 2. Create consultation record (pending payment)
      const topicText = `[${entityType}] ${objective.substring(0, 200)}`;
      const bookRes = await base44.functions.invoke("bookSovereignConsultation", {
        topic: topicText,
        start: startTime,
        company_name: entityName,
        full_name: fullName,
        role_title: role,
        entity_type: entityType,
        tax_id: taxId,
        doc_url: finalDocUrl,
      });

      const consultation = bookRes.data?.consultation;
      if (!consultation?.id) {
        setError(bookRes.data?.error || "Failed to create consultation.");
        setSubmitting(false);
        return;
      }

      // 3. Create checkout (Stripe redirect or $0 promo finalize)
      const successUrl = `${window.location.origin}/consultation?consultation=success&id=${consultation.id}`;
      const checkoutRes = await base44.functions.invoke("createConsultationCheckout", {
        consultation_id: consultation.id,
        promo_code: promoApplied ? NONPROFIT_PROMO : "",
        success_url: successUrl,
        sovereign_member: noBilling,
      });

      // Stripe redirect path
      if (checkoutRes.data?.checkout_url) {
        window.location.href = checkoutRes.data.checkout_url;
        return;
      }

      // $0 promo path — already finalized
      if (checkoutRes.data?.success) {
        const finalized = await base44.entities.SovereignConsultation.get(consultation.id);
        setBooked(finalized);
        setSubmitting(false);
        return;
      }

      setError(checkoutRes.data?.error || "Checkout failed. Please try again.");
    } catch (e) {
      setError(e.message || "Checkout failed. Please try again.");
    }
    setSubmitting(false);
  };

  // ── Loading ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center relative overflow-hidden">
        <VideoBg />
        <Loader2 className="w-8 h-8 text-[#C8A95B] animate-spin relative z-10" />
      </div>
    );
  }

  // ── Guest ──
  if (status === "guest") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 relative overflow-hidden">
        <VideoBg />
        <Card className="border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md max-w-md relative z-10">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C8A95B]/10 border border-[#C8A95B]/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#C8A95B]" />
            </div>
            <h2 className="text-xl font-black text-white">Authentication Required</h2>
            <p className="text-sm text-[#8b949e]">You must be signed in to request a Sovereign Consultation.</p>
            <Button onClick={() => base44.auth.redirectToLogin("/consultation")} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold w-full">
              <Lock className="w-4 h-4 mr-1" /> Sign in to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Tier gate ──
  if (status === "denied" && !isAdmin && !isPreAlphaBuilder) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 relative overflow-hidden">
        <VideoBg />
        <Card className="border-[#C8A95B]/30 bg-[#0d1117]/60 backdrop-blur-md max-w-lg relative z-10">
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
            <p className="text-[11px] text-[#484f58] font-mono">Upgrade through the Sovereign Tier to unlock consultations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Processing payment (Stripe redirect return) ──
  if (pendingPay) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 relative overflow-hidden">
        <VideoBg />
        <Card className="border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md max-w-md relative z-10">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#C8A95B] animate-spin mx-auto" />
            <h2 className="text-lg font-black text-white">Confirming Your Payment…</h2>
            <p className="text-sm text-[#8b949e]">Your consultation is being finalized. This takes a few seconds.</p>
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-left space-y-1.5 font-mono text-[10px] text-[#484f58]">
              <p>✓ PAYMENT GATE: VERIFYING</p>
              <p>✓ CALENDAR EVENT: QUEUED</p>
              <p>✓ DUAL-TRACK EMAIL: STAGED</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Congratulations (post-payment success) ──
  if (booked) {
    const invoiceId = `INV-SOV-${booked.id.slice(-8).toUpperCase()}`;
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <VideoBg />
        <Card className="border-green-500/30 bg-[#0d1117]/60 backdrop-blur-md max-w-2xl relative z-10 w-full">
          <CardContent className="pt-8 space-y-5">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Congratulations</h2>
              <p className="text-sm text-[#8b949e]">Your Sovereign Consultation has been confirmed and your session is secured.</p>
            </div>

            {/* Next Steps */}
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">Next Steps</p>
              <div className="space-y-2.5 text-xs text-[#8b949e]">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#C8A95B] shrink-0 mt-0.5" />
                  <span><strong className="text-[#c9d1d9]">Appointment Email:</strong> A calendar invite (.ics) with your Google Meet link has been sent to your email.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-[#C8A95B] shrink-0 mt-0.5" />
                  <span><strong className="text-[#c9d1d9]">Invoice Email:</strong> A separate tax-compliant receipt has been sent for your records.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Video className="w-3.5 h-3.5 text-[#C8A95B] shrink-0 mt-0.5" />
                  <span><strong className="text-[#c9d1d9]">SpeakEasy Access:</strong> Your secure meeting room credentials have been provisioned.</span>
                </div>
              </div>
            </div>

            {/* Session details */}
            <div className="rounded-lg border border-[#30363d] bg-[#010409] p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between gap-2"><span className="text-[#484f58] shrink-0">Session:</span><span className="text-[#c9d1d9] text-right">{booked.topic}</span></div>
              <div className="flex justify-between"><span className="text-[#484f58]">When:</span><span className="text-[#c9d1d9]">{new Date(booked.start).toLocaleString()}</span></div>
              {booked.meet_link && (
                <div className="flex items-center gap-2">
                  <span className="text-[#484f58]">Meet:</span>
                  <a href={booked.meet_link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 truncate">
                    <Video className="w-3 h-3" /> Join Google Meet
                  </a>
                </div>
              )}
              <div className="flex justify-between"><span className="text-[#484f58]">Invoice:</span><span className="text-[#C8A95B]">{invoiceId}</span></div>
              <div className="flex justify-between"><span className="text-[#484f58]">Payment:</span><span className="text-green-400">{booked.payment_status === "promo_applied" ? "Non-Profit Credit ($0)" : "Paid"}</span></div>
              <div className="flex justify-between gap-2"><span className="text-[#484f58] shrink-0">Txn ID:</span><span className="text-[#c9d1d9] truncate">{booked.payment_confirmation_id}</span></div>
            </div>

            <p className="text-center text-[11px] text-[#484f58] font-mono">Keep your invoice email for your year-end Sovereign tax-deduction audit.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Multi-step intake form ──
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] relative overflow-hidden">
      <VideoBg />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
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
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          {STEPS.filter((s) => !noBilling || s.id !== "checkout").map((s, idx) => (
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
        <Card className="border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md">
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
                        <CheckCircle2 className="w-3 h-3" /> $0 Sovereign Credit eligible — use promo code SOV-NONPROFIT-2027 at checkout.
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
                <p className="text-xs text-[#8b949e]">Select your preferred date and time. Consultations are available Monday–Friday, 9 AM – 6 PM, with a 1–3 PM break.</p>

                <SchedulePicker value={startTime} onChange={setStartTime} />
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Step D — Intake Review
                </h3>
                <p className="text-xs text-[#8b949e]">Review your complete forensic dossier, intent map, and scheduled session before proceeding to billing.</p>

                {/* Dossier review */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-[#484f58] uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Forensic Dossier
                  </p>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Name:</span> {fullName}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Role:</span> {role}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Entity:</span> {entityName} ({entityType})</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Tax ID:</span> {taxId || "—"}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Disclaimer:</span> <span className="text-green-400">Accepted</span></div>
                </div>

                {/* Intent review */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-[#484f58] uppercase flex items-center gap-1">
                    <FileText className="w-3 h-3" /> The Intent Map
                  </p>
                  <div className="text-[11px] text-[#8b949e] leading-relaxed">{objective}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Document:</span> {intentDoc?.name || "None attached"}</div>
                </div>

                {/* Schedule review */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-[#484f58] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Scheduling
                  </p>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Session:</span> {startTime ? new Date(startTime).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</div>
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">Duration:</span> 45 minutes</div>
                </div>

                <div className="rounded-lg border border-[#C8A95B]/30 bg-[#C8A95B]/5 p-3 text-center">
                  <p className="text-[11px] text-[#C8A95B] font-mono">✓ All intake fields verified. Proceed to Billing to finalize your session.</p>
                </div>
              </>
            )}

            {step === 4 && !noBilling && (
              <>
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Step E — Billing & Checkout
                </h3>
                <p className="text-xs text-[#8b949e]">Your consultation is finalized only upon successful payment. Have a Non-Profit Promo Code? Enter it below for $0 setup.</p>

                {/* Fee breakdown */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8b949e] font-mono">Consultation Fee</span>
                    <span className="text-sm text-[#c9d1d9] font-mono">{consultationFee != null ? `$${consultationFee.toLocaleString()}.00` : "Loading…"}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex items-center justify-between text-green-400">
                      <span className="text-xs font-mono flex items-center gap-1"><Tag className="w-3 h-3" /> Non-Profit Credit</span>
                      <span className="text-sm font-mono">-${(consultationFee || 0).toLocaleString()}.00</span>
                    </div>
                  )}
                  <div className="border-t border-[#30363d] pt-2 flex items-center justify-between">
                    <span className="text-xs text-[#c9d1d9] font-bold font-mono">Total</span>
                    <span className={`text-lg font-black font-mono ${finalPrice === 0 ? "text-green-400" : "text-[#C8A95B]"}`}>${finalPrice.toLocaleString()}.00</span>
                  </div>
                </div>

                {/* Promo code */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8b949e] font-mono flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoApplied(false); setPromoError(""); }}
                      disabled={promoApplied}
                      placeholder="e.g. SOV-NONPROFIT-2027"
                      className="flex-1 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#C8A95B]/50 disabled:opacity-50"
                    />
                    {promoApplied ? (
                      <Button type="button" size="sm" onClick={() => { setPromoCode(""); setPromoApplied(false); }} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-xs">
                        Remove
                      </Button>
                    ) : (
                      <Button type="button" size="sm" onClick={handleApplyPromo} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold text-xs">
                        Apply
                      </Button>
                    )}
                  </div>
                  {promoApplied && (
                    <p className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> $0 Sovereign Credit applied. No payment required.
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {promoError}
                    </p>
                  )}
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
                  <div className="text-[11px] text-[#8b949e]"><span className="text-[#484f58]">When:</span> {startTime ? new Date(startTime).toLocaleString() : "—"}</div>
                  <div className="text-[11px] text-[#8b949e]">
                    <span className="text-[#484f58]">Credit:</span>{" "}
                    {promoApplied ? <span className="text-green-400">$0 (Non-Profit Grant)</span> : <span className="text-[#C8A95B]">Sovereign (paid)</span>}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="rounded-lg border border-[#30363d] bg-[#010409] p-2.5 text-[10px] font-mono text-[#484f58] space-y-0.5">
                  <p>Upon confirmation you will receive:</p>
                  <p>• Email A — Appointment Confirmation (calendar invite + Meet link)</p>
                  <p>• Email B — Tax Invoice / Receipt (for your records)</p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
              <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] font-mono text-xs">
                <ChevronLeft className="w-3 h-3" /> Back
              </Button>
              {step < (noBilling ? 3 : 4) ? (
                <Button size="sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold text-xs">
                  Continue <ChevronRight className="w-3 h-3" />
                </Button>
              ) : noBilling ? (
                <Button size="sm" disabled={!canNext || submitting} onClick={handleCheckout} className="bg-[#C8A95B] hover:bg-[#E6C878] text-[#0A0A0C] font-bold text-xs">
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Confirm Consultation
                </Button>
              ) : (
                <Button size="sm" disabled={!canNext || submitting} onClick={handleCheckout} className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />} Confirm & Pay {finalPrice === 0 ? "($0 Credit)" : `$${finalPrice.toLocaleString()}`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status footer */}
        <div className="text-center">
          <ConsultationPolicyFooter />
        </div>
      </div>
    </div>
  );
}