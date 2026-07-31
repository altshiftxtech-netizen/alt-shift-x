import React, { useEffect, useState } from "react";
import { Download, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// PWA Install Button — captures the beforeinstallprompt event and triggers the
// native install dialog only when the user explicitly clicks install.
export default function PwaInstallButton({ disabled }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)?
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    // If no beforeinstallprompt fires within 3s, the browser doesn't support
    // install (iOS Safari, desktop Firefox, etc.) — show a fallback message.
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !installed) setUnsupported(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, installed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
    if (outcome === "accepted") setInstalled(true);
  };

  if (installed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> PWA installed on this device
      </div>
    );
  }

  if (unsupported) {
    return (
      <div className="space-y-2">
        <Button disabled className="bg-slate-700 text-white gap-2">
          <Download className="w-4 h-4" /> Install Not Available
        </Button>
        <p className="text-xs text-slate-400">
          This browser doesn't support PWA install. On iOS, tap the Share icon → "Add to Home Screen". On desktop Chrome/Edge, look for the install icon in the address bar.
        </p>
      </div>
    );
  }

  return (
    <Button onClick={handleInstall} disabled={disabled || installing || !deferredPrompt} className="bg-slate-800 hover:bg-slate-900 text-white gap-2">
      {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {installing ? "Installing..." : "Install Now"}
    </Button>
  );
}