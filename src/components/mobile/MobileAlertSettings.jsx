import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail, MessageSquare, Bell, Zap, Key, Package, Star, ShieldCheck, DollarSign, AlertCircle, Loader2, CheckCircle2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-violet-600" : "bg-slate-200"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function PrefRow({ icon: Icon, label, sub, prefKey, prefs, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-100 rounded-lg"><Icon className="w-3.5 h-3.5 text-slate-500" /></div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
        </div>
      </div>
      <Toggle checked={!!prefs[prefKey]} onChange={(v) => onChange(prefKey, v)} />
    </div>
  );
}

export default function MobileAlertSettings({ onClose, user }) {
  const [prefs, setPrefs] = useState({
    email_enabled: true, sms_enabled: false, in_app_enabled: true,
    emergency_only_sms: true,
    notify_quota_warning: true, notify_quota_critical: true,
    notify_api_key_created: true, notify_api_key_revoked: true,
    notify_component_published: true, notify_component_rejected: true,
    notify_new_review: true, notify_new_install: false,
    notify_trust_flag: true, notify_payout: true,
  });
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefId, setPrefId] = useState(null);

  useEffect(() => {
    base44.entities.NotificationPreference.filter({ user_id: user?.id }, "-created_date", 1)
      .then(data => {
        if (data && data[0]) {
          const p = data[0];
          setPrefId(p.id);
          setPrefs({
            email_enabled: p.email_enabled !== false,
            sms_enabled: !!p.sms_enabled,
            in_app_enabled: p.in_app_enabled !== false,
            emergency_only_sms: p.emergency_only_sms !== false,
            notify_quota_warning: p.notify_quota_warning !== false,
            notify_quota_critical: p.notify_quota_critical !== false,
            notify_api_key_created: p.notify_api_key_created !== false,
            notify_api_key_revoked: p.notify_api_key_revoked !== false,
            notify_component_published: p.notify_component_published !== false,
            notify_component_rejected: p.notify_component_rejected !== false,
            notify_new_review: p.notify_new_review !== false,
            notify_new_install: !!p.notify_new_install,
            notify_trust_flag: p.notify_trust_flag !== false,
            notify_payout: p.notify_payout !== false,
          });
          if (p.email) setEmail(p.email);
          if (p.phone) setPhone(p.phone);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const handleToggle = (key, val) => setPrefs(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      user_id: user?.id,
      email: email || user?.email,
      phone,
      ...prefs,
    };
    try {
      if (prefId) {
        await base44.entities.NotificationPreference.update(prefId, payload);
      } else {
        const rec = await base44.entities.NotificationPreference.create(payload);
        setPrefId(rec.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Save failed: " + e.message);
    }
    setSaving(false);
  };

  const testNotification = async () => {
    try {
      await base44.functions.invoke("sendNotification", {
        user_id: user?.id,
        type: "api_key_created",
        severity: "info",
        title: "Test Notification",
        message: "This is a test notification from Alt+Shift+X. Your email and SMS settings are working correctly.",
        force_email: prefs.email_enabled,
      });
      alert("Test notification sent! Check your email.");
    } catch (e) {
      alert("Test failed: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 pb-6 pt-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Alert Settings</h2>
            <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <>
              {/* Delivery Channels */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Delivery Channels</p>

                {/* Email */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-800">Email Notifications</span>
                    </div>
                    <Toggle checked={prefs.email_enabled} onChange={v => handleToggle("email_enabled", v)} />
                  </div>
                  {prefs.email_enabled && (
                    <Input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="text-sm bg-white"
                    />
                  )}
                </div>

                {/* SMS */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-800">SMS / Text Alerts</span>
                    </div>
                    <Toggle checked={prefs.sms_enabled} onChange={v => handleToggle("sms_enabled", v)} />
                  </div>
                  {prefs.sms_enabled && (
                    <>
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        className="text-sm bg-white"
                        type="tel"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-700">Emergency only</p>
                          <p className="text-[10px] text-slate-400">Only text for critical/emergency events</p>
                        </div>
                        <Toggle checked={prefs.emergency_only_sms} onChange={v => handleToggle("emergency_only_sms", v)} />
                      </div>
                    </>
                  )}
                </div>

                {/* In-app */}
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-800">In-App Alerts</span>
                    </div>
                    <Toggle checked={prefs.in_app_enabled} onChange={v => handleToggle("in_app_enabled", v)} />
                  </div>
                </div>
              </div>

              {/* Event Types */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notify Me About</p>
                <div className="bg-white rounded-2xl border border-slate-200 px-4">
                  <PrefRow icon={Zap} label="Quota Warning (80%)" sub="API usage approaching limit" prefKey="notify_quota_warning" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={AlertCircle} label="Quota Critical (95%)" sub="Emergency — SMS always sent" prefKey="notify_quota_critical" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Key} label="API Key Created" prefKey="notify_api_key_created" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Key} label="API Key Revoked" prefKey="notify_api_key_revoked" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Package} label="Component Published" prefKey="notify_component_published" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Package} label="Component Rejected" prefKey="notify_component_rejected" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Star} label="New Review" prefKey="notify_new_review" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={Package} label="New Install" prefKey="notify_new_install" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={ShieldCheck} label="Trust Flag" sub="Trust score issue detected" prefKey="notify_trust_flag" prefs={prefs} onChange={handleToggle} />
                  <PrefRow icon={DollarSign} label="Payout Processed" prefKey="notify_payout" prefs={prefs} onChange={handleToggle} />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                   : saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</>
                   : "Save Preferences"}
                </Button>
                <button
                  onClick={testNotification}
                  className="w-full text-sm text-violet-600 font-semibold py-2 border border-violet-200 rounded-xl bg-violet-50"
                >
                  Send Test Notification
                </button>
              </div>
            </>
          )}
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}