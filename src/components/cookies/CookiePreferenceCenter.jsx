import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { COOKIE_CATEGORIES, getConsent, saveConsent, acceptAll } from "@/lib/cookieConsent";

/**
 * CookiePreferenceCenter — per-category granular consent. Non-essential
 * toggles default OFF and are never pre-checked, satisfying GDPR/PECR.
 */
export default function CookiePreferenceCenter({ open, onOpenChange }) {
  const [selections, setSelections] = useState({ functional: false, analytics: false, marketing: false });

  // When opened, reflect any previously saved choices (still OFF if undecided).
  useEffect(() => {
    if (open) {
      const consent = getConsent();
      const cats = (consent && consent.categories) || {};
      setSelections({
        functional: !!cats.functional,
        analytics: !!cats.analytics,
        marketing: !!cats.marketing,
      });
    }
  }, [open]);

  const toggle = (id) => setSelections((s) => ({ ...s, [id]: !s[id] }));

  const handleSave = () => {
    saveConsent(selections);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage which cookies we may use. Strictly necessary cookies are always on; everything else stays off until you turn it on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {COOKIE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
              </div>
              <Switch
                checked={cat.required ? true : !!selections[cat.id]}
                disabled={cat.required}
                onCheckedChange={() => !cat.required && toggle(cat.id)}
              />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          Read our full <Link to="/legal/cookies" className="text-violet-600 hover:underline" onClick={() => onOpenChange(false)}>Cookie Policy</Link>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleSave}>Save preferences</Button>
          <Button onClick={handleAcceptAll}>Accept all</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}