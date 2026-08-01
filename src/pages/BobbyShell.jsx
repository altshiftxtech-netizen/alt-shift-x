import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import BobbyHeader from "@/components/bobby/BobbyHeader";
import BobbySidebar from "@/components/bobby/BobbySidebar";
import BobbyPaperView from "@/components/bobby/BobbyPaperView";
import BobbyGate from "@/components/bobby/BobbyGate";
import BobbyChatBar from "@/components/bobby/BobbyChatBar";
import BobbyTopBar from "@/components/bobby/BobbyTopBar";

// BOBbyShell — the developer's canvas. Server-gated by fn_initGate.
// Layout: header (bob init dropdown) · left sidebar 20% (TOC) · right pane 80% (papers).
// Pure-black canvas (#000000) with metallic gold (#D4AF37) and a CSS-only twinkle overlay
// (no JS particle loops — preserves iPhone 16/17 battery life).
export default function BobbyShell() {
  const [sealStatus, setSealStatus] = useState("unverified");
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [document, setDocument] = useState(null);
  const [esiSeal, setEsiSeal] = useState(null);
  const [sealedAt, setSealedAt] = useState(null);
  const [sealing, setSealing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial status check — establishes the gate state on mount.
  const fetchStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fn_initGate", {});
      const data = res.data || res;
      setSealStatus(data.status === "sealed" ? "sealed" : "unverified");
      setModules(data.modules || []);
    } catch {
      setSealStatus("unverified");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Seal the session — authorizes all enabled modules, then refresh status.
  const sealSession = async () => {
    setSealing(true);
    try {
      await base44.functions.invoke("fn_initGate", { seal: true });
      await fetchStatus();
    } finally {
      setSealing(false);
    }
  };

  // Select a module via the bob init dropdown → triggers the gate.
  const selectModule = async (moduleKey) => {
    try {
      const res = await base44.functions.invoke("fn_initGate", { moduleKey });
      const data = res.data || res;
      if (data.status === "authorized") {
        setActiveModule(moduleKey);
        setDocument(data.document);
        setEsiSeal(data.esiSeal);
        setSealedAt(data.sealedAt);
      } else {
        // denied — show the inline gate (no redirect).
        setSealStatus("denied");
        setActiveModule(null);
        setDocument(null);
      }
    } catch {
      setSealStatus("denied");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* ── CSS-only twinkle overlay (fixed background layer, no JS loops) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bobby-twinkle-layer" />
        <div className="absolute inset-0 bobby-twinkle-layer-2" />
      </div>
      <style>{`
        .bobby-twinkle-layer {
          background-image:
            radial-gradient(1.2px 1.2px at 12% 18%, rgba(212,175,55,0.7) 0, transparent 60%),
            radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,0.5) 0, transparent 60%),
            radial-gradient(1.4px 1.4px at 64% 34%, rgba(212,175,55,0.5) 0, transparent 60%),
            radial-gradient(1px 1px at 82% 12%, rgba(255,255,255,0.4) 0, transparent 60%),
            radial-gradient(1px 1px at 48% 88%, rgba(212,175,55,0.5) 0, transparent 60%);
          animation: bobby-twinkle 4s ease-in-out infinite;
        }
        .bobby-twinkle-layer-2 {
          background-image:
            radial-gradient(1px 1px at 22% 52%, rgba(255,255,255,0.4) 0, transparent 60%),
            radial-gradient(1.2px 1.2px at 72% 64%, rgba(212,175,55,0.5) 0, transparent 60%),
            radial-gradient(1px 1px at 38% 24%, rgba(255,255,255,0.35) 0, transparent 60%),
            radial-gradient(1px 1px at 90% 82%, rgba(212,175,55,0.4) 0, transparent 60%);
          animation: bobby-twinkle 6s ease-in-out infinite reverse;
          opacity: 0.7;
        }
        @keyframes bobby-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.85; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col h-screen">
        <BobbyTopBar />
        <BobbyHeader
          sealStatus={sealStatus}
          modules={modules}
          activeModule={activeModule}
          onSelectModule={selectModule}
          sealing={sealing}
        />

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-w-0">
          <BobbySidebar
            modules={modules}
            activeModule={activeModule}
            document={document}
            onSelectModule={selectModule}
            sealStatus={sealStatus}
          />

          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {sealStatus === "sealed" ? (
              <BobbyPaperView document={document} esiSeal={esiSeal} sealedAt={sealedAt} />
            ) : (
              <BobbyGate sealStatus={sealStatus} onSeal={sealSession} sealing={sealing} />
            )}
          </div>
        </div>

        <BobbyChatBar document={document} />
      </div>
    </div>
  );
}