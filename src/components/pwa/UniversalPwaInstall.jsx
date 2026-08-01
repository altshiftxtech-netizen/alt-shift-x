import React, { useEffect, useState, useRef } from "react";
import { Download, Loader2, CheckCircle2, Share, PlusCircle, FileDown, Monitor, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadStaticPwaZip } from "@/lib/buildPackage";

// UniversalPwaInstall — works across ALL browsers:
//  • Chrome / Edge / Android: native beforeinstallprompt install button
//  • iOS Safari: step-by-step "Share → Add to Home Screen" instructions
//  • Firefox / desktop Safari / other: manifest download + manual instructions
// Always includes a "Download Manifest" fallback so every browser can access the PWA.
//
// Props:
//   manifestUrl  — the manifest this PWA uses (default /manifest.json for the site mirror)
//   pwaName      — display name shown in copy
//   swapManifest — if true (Agent Wrapper), the <link rel="manifest"> is swapped to
//                  manifestUrl before triggering install, then restored afterward
export default function UniversalPwaInstall({
  manifestUrl = "/manifest.json",
  pwaName = "Alt+Shift+X",
  swapManifest = false,
  domainLocked = false,
  disabled = false,
  zipName = null,
  zipSubtitle = "",
  zipThemeColor = "#0d1117",
  iconUrl = null,
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const originalManifestRef = useRef(null);

  // Browser / platform detection
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isFirefox = /Firefox/.test(ua) && !/Seammony/.test(ua);
  const isSafariDesktop = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua) && !isIOS;

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      if (originalManifestRef.current) {
        const link = document.querySelector('link[rel="manifest"]');
        if (link) link.href = originalManifestRef.current;
      }
    };
  }, []);

  const swapToManifest = () => {
    if (!swapManifest) return;
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      if (!originalManifestRef.current) originalManifestRef.current = link.href;
      link.href = manifestUrl;
    }
  };
  const restoreManifest = () => {
    if (swapManifest && originalManifestRef.current) {
      const link = document.querySelector('link[rel="manifest"]');
      if (link) link.href = originalManifestRef.current;
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    swapToManifest();
    await new Promise((r) => setTimeout(r, 300));
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
    restoreManifest();
    if (outcome === "accepted") setInstalled(true);
  };

  const downloadManifest = () => {
    const link = document.createElement("a");
    link.href = manifestUrl;
    link.download = "manifest.json";
    link.click();
  };

  const handleZip = async () => {
    setZipping(true);
    try {
      await downloadStaticPwaZip(manifestUrl, zipName || pwaName, {
        subtitle: zipSubtitle,
        themeColor: zipThemeColor,
        iconUrl,
      });
    } finally { setZipping(false); }
  };

  const ZipButton = () => (
    <Button onClick={handleZip} disabled={zipping} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2 w-full text-xs">
      {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
      {zipping ? "Packaging..." : "Download ZIP"}
    </Button>
  );

  // ── Already installed ──
  if (installed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> {pwaName} PWA installed on this device
      </div>
    );
  }

  // ── iOS Safari — no beforeinstallprompt, needs manual Share → Add to Home Screen ──
  if (isIOS) {
    return (
      <div className="space-y-3">
        <Button onClick={() => setShowInstructions((v) => !v)} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
          <PlusCircle className="w-4 h-4" /> Add to Home Screen
        </Button>
        <Button onClick={downloadManifest} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2 w-full text-xs">
          <FileDown className="w-3.5 h-3.5" /> Download Manifest
        </Button>
        {zipName && <ZipButton />}
        {showInstructions && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
            <p className="font-bold text-[#343A40] text-xs mb-1">Install on iOS:</p>
            <p>1. Tap the <Share className="inline w-3 h-3" /> <span className="font-semibold">Share</span> icon in Safari's toolbar (square with up arrow).</p>
            <p>2. Scroll and select <span className="font-semibold">"Add to Home Screen"</span>.</p>
            <p>3. Tap <span className="font-semibold">"Add"</span> — {pwaName} will appear as a standalone app.</p>
          </div>
        )}
      </div>
    );
  }

  // ── Chrome / Edge / Android — native install prompt available ──
  if (deferredPrompt) {
    return (
      <div className="space-y-2">
        <Button onClick={handleInstall} disabled={disabled || installing} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
          {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {installing ? "Installing..." : "Install Now"}
        </Button>
        <Button onClick={downloadManifest} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2 w-full text-xs">
          <FileDown className="w-3.5 h-3.5" /> Download Manifest
        </Button>
        {zipName && <ZipButton />}
      </div>
    );
  }

  // ── Firefox / desktop Safari / other — no beforeinstallprompt ──
  return (
    <div className="space-y-2">
      <Button onClick={() => setShowInstructions((v) => !v)} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
        <Monitor className="w-4 h-4" /> Show Install Instructions
      </Button>
      <Button onClick={downloadManifest} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2 w-full text-xs">
        <FileDown className="w-3.5 h-3.5" /> Download Manifest
      </Button>
      {zipName && <ZipButton />}
      {showInstructions && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
          {isFirefox ? (
            <>
              <p className="font-bold text-[#343A40] text-xs mb-1">Install on Firefox:</p>
              <p>1. Look for the <span className="font-semibold">install icon</span> in the address bar.</p>
              <p>2. Click it and confirm "Install" to add {pwaName} as a desktop app.</p>
              <p>3. Or use the menu → "Install this site as an app".</p>
            </>
          ) : isSafariDesktop ? (
            <>
              <p className="font-bold text-[#343A40] text-xs mb-1">Install on Safari (desktop):</p>
              <p>1. Safari doesn't support PWA install natively on macOS.</p>
              <p>2. Open this page in <span className="font-semibold">Chrome</span> or <span className="font-semibold">Edge</span> to install.</p>
              <p>3. Or download the manifest and host it on your own domain.</p>
            </>
          ) : (
            <>
              <p className="font-bold text-[#343A40] text-xs mb-1">Install on this browser:</p>
              <p>1. Look for an <span className="font-semibold">install icon</span> in the address bar or browser menu.</p>
              <p>2. On mobile, use your browser's "Add to Home Screen" option.</p>
              {domainLocked && (
                <p className="text-slate-400 italic">The PWA domain is locked to <span className="font-mono font-semibold">pwa.altshiftx.tech</span> and cannot be changed.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}