import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, Trash2 } from "lucide-react";

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

  const handleInstall = async () => {
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

  const handleUninstall = async () => {
    setLoading(true);
    await base44.entities.InstalledComponent.delete(localRecord.id);
    setLocalRecord(null);
    if (onUninstalled) onUninstalled(component.id);
    setLoading(false);
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
    <Button size={size} onClick={handleInstall}
      className="gap-2 bg-violet-700 hover:bg-violet-800 text-white">
      <Download className="w-4 h-4" /> Install
    </Button>
  );
}