import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Building2, User, MapPin, Briefcase, ShieldCheck } from "lucide-react";

const STEPS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "company", label: "Company", icon: Building2 },
  { id: "location", label: "Location", icon: MapPin },
  { id: "usecase", label: "Use Case", icon: Briefcase },
  { id: "confirm", label: "Confirm", icon: ShieldCheck },
];

const INDUSTRIES = ["General Contractor", "Subcontractor", "Owner/Developer", "Architecture & Engineering", "Construction Management", "Government/Public Sector", "Other"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const REFERRAL_SOURCES = ["Google Search", "LinkedIn", "Colleague Referral", "Industry Conference", "Trade Publication", "Other"];

export default function UserOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "",
    company_name: "", job_title: "", industry: "", company_size: "",
    country: "", state_province: "",
    use_case: "", how_did_you_hear: "",
    agreed_to_terms: false, agreed_to_privacy: false, agreed_to_builder: false,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, email: u.email, first_name: u.full_name?.split(" ")[0] || "", last_name: u.full_name?.split(" ").slice(1).join(" ") || "" }));
    }).catch(() => navigate("/login"));
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profileData = { ...form, user_id: user.id, email: user.email };
      // Save to entity
      const existing = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (existing && existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      // Send emails
      await base44.functions.invoke("sendIntakeEmail", { profile: profileData });
      setDone(true);
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">You're all set!</h1>
            <p className="text-slate-500 text-sm">A confirmation has been sent to <strong>{user?.email}</strong> with your application details.</p>
            <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white" onClick={() => navigate("/dashboard")}>
              Go to Dashboard →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Welcome to Alt+Shift+X</h1>
          <p className="text-slate-500 mt-2 text-sm">Complete your profile to get started</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-violet-700 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-4">
            {/* Step 0 — Personal */}
            {step === 0 && (
              <>
                <h2 className="font-bold text-slate-900">Personal Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">First Name *</label><Input value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="Jane" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Last Name *</label><Input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Smith" /></div>
                </div>
                <div><label className="text-xs text-slate-500 mb-1 block">Email *</label><Input value={user?.email || ""} disabled className="bg-slate-50 text-slate-400" /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Phone Number</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
              </>
            )}

            {/* Step 1 — Company */}
            {step === 1 && (
              <>
                <h2 className="font-bold text-slate-900">Company Details</h2>
                <div><label className="text-xs text-slate-500 mb-1 block">Company Name *</label><Input value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Acme Construction" /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Your Job Title *</label><Input value={form.job_title} onChange={e => set("job_title", e.target.value)} placeholder="Project Manager" /></div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Industry *</label>
                  <select value={form.industry} onChange={e => set("industry", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Company Size</label>
                  <select value={form.company_size} onChange={e => set("company_size", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
                    <option value="">Select size...</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Step 2 — Location */}
            {step === 2 && (
              <>
                <h2 className="font-bold text-slate-900">Your Location</h2>
                <div><label className="text-xs text-slate-500 mb-1 block">Country *</label><Input value={form.country} onChange={e => set("country", e.target.value)} placeholder="United States" /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">State / Province</label><Input value={form.state_province} onChange={e => set("state_province", e.target.value)} placeholder="California" /></div>
              </>
            )}

            {/* Step 3 — Use Case */}
            {step === 3 && (
              <>
                <h2 className="font-bold text-slate-900">How will you use Alt+Shift+X?</h2>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Primary Use Case *</label>
                  <textarea
                    value={form.use_case}
                    onChange={e => set("use_case", e.target.value)}
                    placeholder="e.g. We want to automate contract risk extraction for our subcontractor agreements..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400 h-28 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">How did you hear about us?</label>
                  <select value={form.how_did_you_hear} onChange={e => set("how_did_you_hear", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
                    <option value="">Select...</option>
                    {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Step 4 — Confirm */}
            {step === 4 && (
              <>
                <h2 className="font-bold text-slate-900">Review & Confirm</h2>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  {[
                    ["Name", `${form.first_name} ${form.last_name}`],
                    ["Email", user?.email],
                    ["Phone", form.phone || "—"],
                    ["Company", form.company_name],
                    ["Job Title", form.job_title],
                    ["Industry", form.industry],
                    ["Company Size", form.company_size ? `${form.company_size} employees` : "—"],
                    ["Country", form.country],
                    ["State/Province", form.state_province || "—"],
                    ["Use Case", form.use_case],
                    ["Referral", form.how_did_you_hear || "—"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-slate-400 w-32 shrink-0">{label}:</span>
                      <span className="text-slate-800 font-medium break-words">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreed_to_terms} onChange={e => set("agreed_to_terms", e.target.checked)} className="mt-0.5" />
                    <span className="text-xs text-slate-600">I agree to the <a href="/terms" target="_blank" className="text-violet-700 hover:underline">Terms of Service</a> *</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreed_to_privacy} onChange={e => set("agreed_to_privacy", e.target.checked)} className="mt-0.5" />
                    <span className="text-xs text-slate-600">I agree to the <a href="/privacy" target="_blank" className="text-violet-700 hover:underline">Privacy Policy</a> *</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreed_to_builder} onChange={e => set("agreed_to_builder", e.target.checked)} className="mt-0.5" />
                    <span className="text-xs text-slate-600">I have read and agree to the <a href="/builder/agreement" target="_blank" className="text-violet-700 hover:underline">Builder Agreement</a> *</span>
                  </label>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="text-sm">← Back</Button>
              ) : (
                <Button variant="outline" onClick={() => navigate("/")} className="text-sm">Exit</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm" onClick={() => setStep(s => s + 1)}
                  disabled={
                    (step === 0 && (!form.first_name || !form.last_name)) ||
                    (step === 1 && (!form.company_name || !form.job_title || !form.industry)) ||
                    (step === 2 && !form.country) ||
                    (step === 3 && !form.use_case)
                  }
                >
                  Next →
                </Button>
              ) : (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                  onClick={handleSubmit}
                  disabled={submitting || !form.agreed_to_terms || !form.agreed_to_privacy || !form.agreed_to_builder}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Submitting...</> : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}