import React, { useState, useRef } from "react";
import { ShieldCheck, Upload, BadgeCheck, AlertTriangle, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const TIER_INFO = {
  standard: {
    label: "Standard Builder",
    escrow: "20%",
    badge: "Standard",
    color: "text-slate-300",
    bg: "bg-slate-800 border-slate-600",
  },
  insured: {
    label: "Safe Harbor (Insured)",
    escrow: "5%",
    badge: "Safe Harbor ✓",
    color: "text-emerald-300",
    bg: "bg-emerald-900/30 border-emerald-700",
  },
  verified: {
    label: "TMT-3 Verified ◆",
    escrow: "10%",
    badge: "Verified ◆",
    color: "text-violet-300",
    bg: "bg-violet-900/30 border-violet-700",
  },
};

export default function CredentialVault({ builderId, currentTier = "standard", onTierChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedCert, setUploadedCert] = useState(null);
  const [certExpiry, setCertExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const tierInfo = TIER_INFO[currentTier] || TIER_INFO.standard;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedCert({ name: file.name, url: file_url });
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    // Save to builder badge profile
    const badges = await base44.entities.BuilderBadge.filter({ builder_id: builderId });
    const badge = badges[0];
    const data = {
      ...(badge || {}),
      builder_id: builderId,
      insurance_cert_url: uploadedCert?.url || badge?.insurance_cert_url,
      insurance_cert_name: uploadedCert?.name || badge?.insurance_cert_name,
      insurance_expiry: certExpiry || badge?.insurance_expiry,
      policy_tier: currentTier,
    };
    if (badge) {
      await base44.entities.BuilderBadge.update(badge.id, data);
    } else {
      await base44.entities.BuilderBadge.create(data);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Credential Vault & Policy Tier</h3>
          <p className="text-xs text-slate-500">Manage your escrow tier, upload E&O insurance certificates, and unlock Safe Harbor status.</p>
        </div>
      </div>

      {/* Tier selector */}
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-2">Policy Tier</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TIER_INFO).map(([id, info]) => (
            <button key={id} onClick={() => onTierChange?.(id)}
              className={`border rounded-xl p-3 text-left transition-all text-xs ${currentTier === id ? info.bg + " border-2" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}>
              <p className={`font-bold ${currentTier === id ? info.color : "text-slate-600"}`}>{info.label}</p>
              <p className="text-slate-400 mt-0.5">{info.escrow} escrow</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current tier badge */}
      <div className={`border rounded-xl p-3 flex items-center gap-3 ${tierInfo.bg}`}>
        <BadgeCheck className={`w-4 h-4 shrink-0 ${tierInfo.color}`} />
        <div>
          <p className={`text-xs font-bold ${tierInfo.color}`}>{tierInfo.badge}</p>
          <p className="text-xs text-slate-500">{tierInfo.escrow} holdback · {currentTier === "insured" ? "E&O covers clawbacks" : currentTier === "verified" ? "TMT-3 audit verified" : "Standard clawback exposure"}</p>
        </div>
      </div>

      {/* E&O certificate upload — only shown for insured tier */}
      {currentTier === "insured" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Safe Harbor requires verified E&O insurance with minimum $1M coverage. Upload your ACORD certificate to activate reduced escrow.</p>
          </div>

          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />

          {uploadedCert ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs text-emerald-700 font-medium flex-1 truncate">{uploadedCert.name}</span>
              <button onClick={() => setUploadedCert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-xl p-4 text-center transition-all">
              {uploading
                ? <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                : <>
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Upload ACORD Certificate (PDF or Image)</p>
                </>}
            </button>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Policy Expiry Date</label>
            <input type="date" value={certExpiry} onChange={e => setCertExpiry(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400" />
            <p className="text-[10px] text-slate-400 mt-1">Automated alerts fire 30 days before expiry. Failure to renew triggers a Trust Score penalty.</p>
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving || saved} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldCheck className="w-4 h-4" />}
        {saved ? "Saved!" : "Save Policy Settings"}
      </Button>
    </div>
  );
}