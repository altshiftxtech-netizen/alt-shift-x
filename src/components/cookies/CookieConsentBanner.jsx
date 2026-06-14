import React, { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { hasDecided, acceptAll, rejectAll } from "@/lib/cookieConsent";
import { onOpenCookiePreferences } from "./cookiePrefStore";
import CookiePreferenceCenter from "./CookiePreferenceCenter";

/**
 * CookieConsentBanner — shown on first visit until the user makes an active
 * choice. No pre-checked boxes, no auto-accept: non-essential cookies stay off
 * until "Accept all" or a saved preference. Also hosts the preference center,
 * which any "Cookie Settings" link can open via openCookiePreferences().
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    setVisible(!hasDecided());
    // Allow footer link (or anywhere) to open the preference center.
    return onOpenCookiePreferences(() => setPrefsOpen(true));
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setVisible(false);
  };

  return (
    <>
      {visible && (
        <div className="fixed bottom-0 inset-x-0 z-[100] p-4">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                We use strictly necessary cookies to run the site. With your consent, we also use{" "}
                <span className="font-medium text-slate-800">analytics and attribution</span> cookies. These stay off until you accept.{" "}
                <Link to="/privacy" className="text-violet-600 hover:underline">Learn more</Link>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button variant="ghost" size="sm" onClick={() => setPrefsOpen(true)}>Customize</Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll}>Reject all</Button>
              <Button size="sm" onClick={handleAcceptAll}>Accept all</Button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferenceCenter
        open={prefsOpen}
        onOpenChange={(o) => {
          setPrefsOpen(o);
          if (!o) setVisible(!hasDecided());
        }}
      />
    </>
  );
}