import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import JSZip from "jszip";
import { Loader2, AlertTriangle, Pen, Eraser, Square, Circle, Type, Image, Layers, Palette, Download, RotateCcw } from "lucide-react";

export default function PwaViewer() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  const [pwaMeta, setPwaMeta] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [activeTool, setActiveTool] = useState("pen");
  const [activeColor, setActiveColor] = useState("#fbbf24");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);

  const COLORS = ["#fbbf24", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#ffffff", "#0f172a"];

  // Provision substrate identity
  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem("pm1a_identity"); } catch {}
    if (stored && stored.startsWith("6a21")) {
      setIdentity(stored);
    } else {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const newId = "6a21" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
      try { localStorage.setItem("pm1a_identity", newId); } catch {}
      setIdentity(newId);
    }
  }, []);

  // Fetch PWA metadata + ZIP, extract payload.json
  const loadPayload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHostedPwa", { export_id: id });
      const data = res.data || res;
      if (!data?.ok && !data?.name) {
        setError(data?.error || "Failed to load PWA");
        setLoading(false);
        return;
      }
      setPwaMeta({ name: data.name, version: data.version, description: data.description, artifactCode: data.artifact_code });

      let zipBuffer;
      if (data.zip) {
        const binStr = atob(data.zip);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        zipBuffer = bytes.buffer;
      } else if (data.file_url) {
        const fetchRes = await fetch(data.file_url);
        if (!fetchRes.ok) throw new Error(`Download failed: ${fetchRes.status}`);
        zipBuffer = await fetchRes.arrayBuffer();
      } else {
        throw new Error("No ZIP payload available.");
      }

      const zip = await JSZip.loadAsync(zipBuffer);
      const payloadEntry = zip.file("payload.json");
      if (!payloadEntry) {
        throw new Error("payload.json not found in ZIP.");
      }
      const payloadText = await payloadEntry.async("text");
      const parsed = JSON.parse(payloadText);
      setPayload(parsed);
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to load PWA payload.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadPayload();
  }, [id, loadPayload]);

  // Initialize canvas
  useEffect(() => {
    if (loading || error) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    // Fill background
    ctx.fillStyle = "#0b1117";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [loading, error]);

  const getPointer = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPoint.current = getPointer(e);
    const ctx = ctxRef.current;
    if (activeTool === "pen" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    }
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    const pt = getPointer(e);
    if (activeTool === "pen") {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else if (activeTool === "eraser") {
      ctx.strokeStyle = "#0b1117";
      ctx.lineWidth = strokeWidth * 3;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else if (activeTool === "rect" || activeTool === "circle") {
      // Live preview: save snapshot, draw shape
      const rect = canvasRef.current.getBoundingClientRect();
      if (!canvasHistory.length || canvasHistory[canvasHistory.length - 1]._preview) {
        const snapshot = ctx.getImageData(0, 0, rect.width, rect.height);
        snapshot._preview = true;
        setCanvasHistory(prev => [...prev, snapshot]);
      }
      ctx.putImageData(canvasHistory.find(h => h._preview) || canvasHistory[canvasHistory.length - 1], 0, 0);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      if (activeTool === "rect") {
        ctx.rect(lastPoint.current.x, lastPoint.current.y, pt.x - lastPoint.current.x, pt.y - lastPoint.current.y);
      } else {
        const r = Math.hypot(pt.x - lastPoint.current.x, pt.y - lastPoint.current.y);
        ctx.arc(lastPoint.current.x, lastPoint.current.y, r, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    const ctx = ctxRef.current;
    ctx.globalCompositeOperation = "source-over";
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#0b1117";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setCanvasHistory([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${pwaMeta?.name || "pwa"}-canvas.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const TOOLS = [
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "rect", icon: Square, label: "Rect" },
    { id: "circle", icon: Circle, label: "Circle" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1117] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <p className="text-xs text-slate-400">Loading Hi-Viz Canvas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1117] gap-2 p-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-red-300 text-center max-w-xs">{error}</p>
      </div>
    );
  }

  const components = payload?.bundled_components || [];
  const bootSteps = payload?.boot_sequence || {};
  const apex = payload?.apex_verification || {};

  return (
    <div className="min-h-screen bg-[#0b1117] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#0f172a] border-b border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-[#0b1117] font-black text-sm">CX</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-white truncate">{pwaMeta?.name || "PWA"}</h1>
          <p className="text-[10px] text-slate-500">v{pwaMeta?.version || "1.0.0"}</p>
        </div>
        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#1a472a] text-green-400 border border-green-900">
          ACTIVE
        </span>
      </header>

      {/* Substrate Identity Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#052e16] border-b border-green-900/50 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[10px] font-semibold text-green-400">Substrate Identity</span>
        <span className="text-[10px] font-mono text-slate-500 ml-auto truncate">{identity?.substring(0, 24) || "—"}…</span>
      </div>

      {/* Canvas Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#0f172a] border-b border-slate-800 overflow-x-auto no-scrollbar flex-shrink-0">
        {TOOLS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === t.id ? "bg-amber-500 text-[#0b1117]" : "text-slate-400 hover:bg-slate-800"}`}
              title={t.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="w-px h-5 bg-slate-700 mx-1 flex-shrink-0" />
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className={`w-5 h-5 rounded-full flex-shrink-0 border-2 transition-transform ${activeColor === c ? "border-white scale-110" : "border-slate-600"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="w-px h-5 bg-slate-700 mx-1 flex-shrink-0" />
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[9px] text-slate-500">W</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={e => setStrokeWidth(parseInt(e.target.value))}
            className="w-16 accent-amber-400"
          />
        </div>
        <div className="w-px h-5 bg-slate-700 mx-1 flex-shrink-0" />
        <button onClick={clearCanvas} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 flex-shrink-0" title="Clear">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={downloadCanvas} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 flex-shrink-0" title="Export PNG">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas + Side Panels */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative bg-[#0b1117]">
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            className="w-full h-full touch-none cursor-crosshair"
          />
          <div className="absolute bottom-2 left-2 text-[9px] text-slate-600 font-mono bg-[#0b1117]/80 px-2 py-1 rounded">
            {activeTool.toUpperCase()} · {activeColor} · {strokeWidth}px
          </div>
        </div>

        {/* Character Vault (right panel) */}
        <aside className="w-60 border-l border-slate-800 bg-[#0f172a] overflow-y-auto flex-shrink-0 hidden sm:block">
          <div className="px-3 py-2 border-b border-slate-800">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Character Vault
            </h3>
          </div>
          <div className="p-2 space-y-2">
            {components.length > 0 ? components.map((c, i) => {
              const type = c.type || "X5";
              const typeColors = {
                X1: "bg-blue-950 text-blue-400",
                X2: "bg-purple-950 text-purple-400",
                X3: "bg-green-950 text-green-400",
                X4: "bg-orange-950 text-orange-400",
                X5: "bg-pink-950 text-pink-400",
              };
              return (
                <div key={i} className="bg-[#161e29] border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${typeColors[type] || typeColors.X5}`}>
                      {type}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-mono text-slate-600">{c.code}</div>
                      <div className="text-xs font-semibold text-slate-200 truncate">{c.name}</div>
                      {c.description && <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</div>}
                      {c.features && c.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.features.slice(0, 3).map((f, j) => (
                            <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{f}</span>
                          ))}
                        </div>
                      )}
                      {c.price > 0 && <div className="text-[11px] font-bold text-amber-400 mt-1">${c.price}/mo</div>}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-[10px] text-slate-600 text-center py-4">No modules in payload.</p>
            )}
          </div>

          {/* Apex Verification */}
          {apex && (
            <div className="p-2">
              <div className="px-2 py-1 border-t border-slate-800">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Apex Verification</h3>
              </div>
              <div className="px-2 py-2">
                <div className={`text-[10px] font-semibold ${apex.verified ? "text-green-400" : "text-slate-500"}`}>
                  {apex.verified ? "✓ Verified" : "✗ Not Verified"}
                </div>
                {apex.enterprise_key_label && <div className="text-[9px] text-slate-600 mt-0.5">{apex.enterprise_key_label}</div>}
              </div>
            </div>
          )}

          {/* Boot Sequence */}
          {Object.keys(bootSteps).length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 border-t border-slate-800">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Boot Sequence</h3>
              </div>
              <div className="px-2 py-2 space-y-1">
                {Object.entries(bootSteps).map(([step, desc]) => (
                  <div key={step} className="text-[9px] text-slate-500 flex gap-1.5">
                    <span className="text-green-400">✓</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}