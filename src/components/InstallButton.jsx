import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, Trash2 } from "lucide-react";
import NonMagnaReminderDialog from "@/components/install/NonMagnaReminderDialog";
import SafeguardLegalGate from "@/components/install/SafeguardLegalGate";

// Accounts that are only provisioned with Magna Dev components.
const RESTRICTED_ROLES = ["staff", "builder"];
const isMagnaDev = (component) =>
  (component?.builder_name || "").trim().toLowerCase() === "magna dev";

/**
 * InstallButton — expects pre-fetched data from parent to avoid N+1 auth/DB calls.
 * Props:
 *   component      — the component record
 *   userId         — current user id (or null if not logged in)
 *   installedRecord — InstalledComponent record if already installed, else null
 *   onInstalled    — called with the new InstalledComponent record after install (via webhook, we just redirect)
 *   onUninstalled  — called after uninstall so parent can update state
 *   size           — button size
 */
export default function InstallButton({ component, userId, installedRecord, onUninstalled, size = "default" }) {
  const [loading, setLoading] = useState(false);
  const [localRecord, setLocalRecord] = useState(installedRecord);
  const [showReminder, setShowReminder] = useState(false);
  const [userRole, setUserRole] = useState(null);
  // Legal gating (e.g. SAFEGUARD): walkthrough must be accepted before checkout.
  const [showLegalGate, setShowLegalGate] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(null); // "card" | "paypal"

  // Figure out if this is a restricted (staff/builder) account + any prior legal acceptance.
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUserRole(me?.role || null);
        if (component?.requires_legal_acceptance && me?.id) {
          const prior = await base44.entities.LegalAcceptance
            .filter({ user_id: me.id, component_code: component.code })
            .catch(() => []);
          if (prior && prior.length > 0) setLegalAccepted(true);
        }
      } catch {
        setUserRole(null);
      }
    })();
  }, [component?.id]);

  const isRestricted = RESTRICTED_ROLES.includes(userRole);
  const needsReminder = isRestricted && !isMagnaDev(component);
  const needsLegalGate = !!component?.requires_legal_acceptance && !legalAccepted;

  const proceedToCardCheckout = async () => {
    setShowReminder(false);
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open the live URL.");
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke("createCheckoutSession", { componentId: component.id });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    // Legally-gated components require the disclaimer walkthrough first.
    if (needsLegalGate) {
      setPendingProvider("card");
      setShowLegalGate(true);
      return;
    }
    // Staff/builder accounts get a friendly reminder before any non-Magna purchase.
    if (needsReminder) {
      setShowReminder(true);
      return;
    }
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open the live URL.");
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke("createCheckoutSession", { componentId: component.id });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handlePaypalInstall = async () => {
    if (needsLegalGate) {
      setPendingProvider("paypal");
      setShowLegalGate(true);
      return;
    }
    if (needsReminder) {
      setShowReminder(true);
      return;
    }
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open the live URL.");
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke("createPaypalCheckout", { componentId: component.id });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Could not start PayPal checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    await base44.entities.InstalledComponent.delete(localRecord.id);
    setLocalRecord(null);
    if (onUninstalled) onUninstalled(component.id);
    setLoading(false);
  };

  // After the legal walkthrough is accepted, resume the originally-clicked checkout
  // directly (don't re-call the handlers — legalAccepted state hasn't flushed yet).
  const onLegalAccepted = async () => {
    setLegalAccepted(true);
    const provider = pendingProvider;
    setPendingProvider(null);
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open the live URL.");
      return;
    }
    setLoading(true);
    const fn = provider === "paypal" ? "createPaypalCheckout" : "createCheckoutSession";
    const res = await base44.functions.invoke(fn, { componentId: component.id });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled size={size} variant="outline" className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </Button>
    );
  }

  if (localRecord) {
    return (
      <Button size={size} variant="outline" onClick={handleUninstall}
        className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300">
        <Trash2 className="w-4 h-4" /> Uninstall
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size={size} onClick={handleInstall}
        className="gap-2 bg-violet-700 hover:bg-violet-800 text-white">
        <Download className="w-4 h-4" /> Install (Card)
      </Button>
      <Button size={size} onClick={handlePaypalInstall}
        className="gap-2 bg-[#ffc439] hover:bg-[#f0b72e] text-[#003087] font-semibold">
        Pay with PayPal
      </Button>

      <NonMagnaReminderDialog
        open={showReminder}
        onOpenChange={setShowReminder}
        componentName={component?.name}
        onProceed={proceedToCardCheckout}
      />

      <SafeguardLegalGate
        open={showLegalGate}
        onOpenChange={setShowLegalGate}
        component={component}
        onAccepted={onLegalAccepted}
      />
    </div>
  );
}