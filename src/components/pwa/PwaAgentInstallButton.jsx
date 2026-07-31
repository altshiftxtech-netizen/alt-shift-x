import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, CheckCircle2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// PWA-AGENT-WRAPPER-1.0 Install Button.
// Swaps the <link rel="manifest"> to the agent wrapper manifest before
// triggering the install prompt, then restores the main site manifest.
// Also provides a "Download Manifest" fallback for browsers that don't
// support a second install from the same origin.
const AGENT_MANIFEST = "/manifest-agent.json";
const MAIN_MANIFEST = "/manifest.json";

export default function PwaAgentInstallButton({ disabled }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const originalManifestRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
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
      // Restore main manifest on unmount if we swapped.
      if (originalManifestRef.current) {
        const link = document.querySelector('link[rel="manifest"]');
        if (link) link.href = originalManifestRef.current;
      }
    };
  }, []);

  const swapToAgentManifest = () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      if (!originalManifestRef.current) originalManifestRef.current = link.href;
      link.href = AGENT_MANIFEST;
      setSwapped(true);
    }
  };

  const restoreManifest = () => {
    if (originalManifestRef.current) {
      const link = document.querySelector('link[rel="manifest"]');
      if (link) link.href = originalManifestRef.current;
      setSwapped(false);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    swapToAgentManifest();
    // Give the browser a tick to register the new manifest.
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
    link.href = AGENT_MANIFEST;
    link.download = "manifest-agent.json";
    link.click();
  };

  if (installed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> Agent Wrapper PWA installed
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleInstall} disabled={disabled || installing || !deferredPrompt} className="bg-slate-800 hover:bg-slate-900 text-white gap-2">
          {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {installing ? "Installing..." : "Install Agent Wrapper"}
        </Button>
        <Button onClick={downloadManifest} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-2">
          <FileDown className="w-4 h-4" /> Download Manifest
        </Button>
      </div>
      {!deferredPrompt && (
        <p className="text-xs text-slate-400">
          If install isn't available, download the manifest and host it on your client's domain, or use your browser's "Add to Home Screen" while on the <Link to="/agent" className="underline">Agent page</Link>.
        </p>
      )}
    </div>
  );
}