import React, { useEffect, useState, useRef } from "react";
import { Download, Loader2, CheckCircle2, Share, PlusCircle, FileDown, Monitor, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadBuildZip } from "@/lib/buildPackage";

// PwaBuildInstall — installs a specific B.O.B.Init build as a PWA using its
// dynamically-generated manifest (stored in manifest_json). Works across all
// browsers the same way UniversalPwaInstall does, plus offers a ZIP download.
export default function PwaBuildInstall({ build }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const manifestUrlRef = useRef(null);
  const injectedLinkRef = useRef(null);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isFirefox = /Firefox/.test(ua) && !/Seammony/.test(ua);
  const isSafariDesktop = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua) && !isIOS;
  const pwaName = build.pwa_name || build.build_code || "Alt+Shift+X PWA";

  // Inject a dynamic manifest as a blob URL so the browser treats this build
  // as its own installable PWA.
  useEffect(() => {
    let blobUrl = null;
    try {
      const blob = new Blob([build.manifest_json || "{}"], { type: "application/manifest+json" });
      blobUrl = URL.createObjectURL(blob);
      manifestUrlRef.current = blobUrl;
      const link = document.querySelector('link[rel="manifest"]');
      if (link) {
        injectedLinkRef.current = link.href;
        link.href = blobUrl;
      }
    } catch { /* noop */ }

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (injectedLinkRef.current) {
        const link = document.querySelector('link[rel="manifest"]');
        if (link) link.href = injectedLinkRef.current;
      }
    };
  }, [build.id]);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
    if (outcome === "accepted") setInstalled(true);
  };

  const handleZip = async () => {
    setZipping(true);
    try { await downloadBuildZip(build); } finally { setZipping(false); }
  };

  if (installed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> {pwaName} installed on this device
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isIOS ? (
        <>
          <Button onClick={() => setShowInstructions((v) => !v)} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
            <PlusCircle className="w-4 h-4" /> Add to Home Screen
          </Button>
          {showInstructions && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-[#343A40] text-xs mb-1">Install on iOS:</p>
              <p>1. Tap the <Share className="inline w-3 h-3" /> <span className="font-semibold">Share</span> icon.</p>
              <p>2. Select <span className="font-semibold">"Add to Home Screen"</span>.</p>
              <p>3. Tap <span className="font-semibold">"Add"</span> — {pwaName} appears as a standalone app.</p>
            </div>
          )}
        </>
      ) : deferredPrompt ? (
        <Button onClick={handleInstall} disabled={installing} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
          {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {installing ? "Installing..." : "Install Now"}
        </Button>
      ) : (
        <Button onClick={() => setShowInstructions((v) => !v)} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 w-full">
          <Monitor className="w-4 h-4" /> Show Install Instructions
        </Button>
      )}

      <Button onClick={handleZip} disabled={zipping} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2 w-full text-xs">
        {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
        {zipping ? "Packaging..." : "Download ZIP"}
      </Button>
    </div>
  );
}