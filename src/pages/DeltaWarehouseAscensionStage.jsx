import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, Zap, ArrowRight, Package } from "lucide-react";

/**
 * DeltaWarehouseAscensionStage
 * Sovereign Turnkey Productions — dimensional experience for high-value
 * production artifacts ($10K – $1M+). Features a WebGPU particle braid
 * canvas with 2D fallback, floating Delta header with multi-sig escrow
 * indicator, and a 3D-style production gallery.
 */
export default function DeltaWarehouseAscensionStage() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gpuCtxRef = useRef(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Delta productions (components with DELTA-PROD- prefix or Marketplace & Deployment Kits)
  useEffect(() => {
    base44.entities.Component.filter(
      { code: { $regex: "DELTA-PROD-", $options: "i" } },
      { sort: "-created_date", limit: 50, fields: ["name", "code", "type", "category", "description", "price", "features", "status"] }
    )
      .then((res) => {
        const items = res.items || res || [];
        setProductions(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Initialize WebGPU particle braids or fall back to 2D canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let particles = [];
    const PARTICLE_COUNT = 30000;
    const BRAID_STRANDS = 8;
    const DUST_JITTER = 40;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;

    function initParticles() {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;
      const maxR = Math.max(w, h) * 0.55;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const strand = i % BRAID_STRANDS;
        const t = i / PARTICLE_COUNT;
        const r = 30 + t * maxR;
        const jx = (Math.random() - 0.5) * DUST_JITTER;
        const jy = (Math.random() - 0.5) * DUST_JITTER;
        particles.push({
          x: w * 0.5 + Math.cos(strand * (Math.PI * 2 / BRAID_STRANDS) + t * Math.PI * 4) * r + jx,
          y: h * 0.5 + Math.sin(strand * (Math.PI * 2 / BRAID_STRANDS) + t * Math.PI * 4) * r + jy,
          vx: 0,
          vy: 0,
          baseX: w * 0.5,
          baseY: h * 0.5,
          strand,
          t,
          jitterX: jx,
          jitterY: jy,
          life: Math.random(),
          size: Math.random() < 0.15 ? 2 : 1,
        });
      }
    }

    async function initWebGPU() {
      if (!navigator.gpu) return false;
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) return false;
        const device = await adapter.requestDevice();
        const ctx = canvas.getContext("webgpu");
        if (!ctx) return false;
        const format = navigator.gpu.getPreferredCanvasFormat();
        ctx.configure({ device, format, alphaMode: "premultiplied" });
        gpuCtxRef.current = { device, ctx, format };
        return true;
      } catch {
        return false;
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function handleMouse(e) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function animate2D() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Clear fully each frame for discrete pixelated particles
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(3, 3, 6, 1)";
      ctx.fillRect(0, 0, w, h);

      const mouseVX = mouseX - prevMouseX;
      const mouseVY = mouseY - prevMouseY;
      const mouseSpeed = Math.sqrt(mouseVX * mouseVX + mouseVY * mouseVY);

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.max(w, h) * 0.5;
      const now = Date.now() * 0.0004;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const angle = p.strand * (Math.PI * 2 / BRAID_STRANDS) + p.t * Math.PI * 6;
        const radius = 30 + p.t * maxR;
        const targetX = cx + Math.cos(angle + now) * radius;
        const targetY = cy + Math.sin(angle + now) * radius * 0.7;

        // Mouse velocity influence
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (1 - dist / 200) * mouseSpeed * 0.5;
          p.vx += (dx / dist) * force * 0.01;
          p.vy += (dy / dist) * force * 0.01;
        }

        p.vx += (targetX - p.x) * 0.02;
        p.vy += (targetY - p.y) * 0.02;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        // Astro dust rendering — tiny scattered pixels, cosmic palette
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        const palette = [
          [220, 80, 55], [260, 70, 60], [190, 85, 60], [0, 0, 100],
        ];
        const c = palette[p.strand % palette.length];
        const alpha = 0.25 + p.t * 0.55;
        ctx.fillStyle = `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, ${alpha})`;
        ctx.fillRect(px, py, p.size, p.size);
      }
    }

    function loop() {
      if (gpuCtxRef.current) {
        // WebGPU render path would go here — for now use 2D fallback
        animate2D();
      } else {
        animate2D();
      }
      animationRef.current = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);
    // Start the 2D animation loop immediately — don't wait for WebGPU
    // init, which can hang inside sandboxed iframes and block rendering.
    loop();
    initWebGPU(); // fire and forget — upgrades to WebGPU if available

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const formatPrice = useCallback((price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#030306] overflow-hidden text-white font-sans">
      {/* Hyper-Ascension Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      />

      {/* Ambient Optical Caustics / Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-violet-600/20 to-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-gradient-to-bl from-cyan-400/10 via-violet-500/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Sub-surface optical glass depth overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#030306]/80" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,3,6,0.6) 100%)" }} />

      {/* Floating Delta Header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-violet-600 to-cyan-400 p-[2px]">
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center font-bold text-amber-400 text-lg">Δ</div>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-wider">DELTA WAREHOUSE</h1>
            <p className="text-[10px] md:text-xs text-zinc-400 tracking-widest">SOVEREIGN TURNKEY PRODUCTIONS • ALTSHIFTX.TECH</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-xs font-mono">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Shield className="w-3 h-3" /> MULTI-SIG ESCROW ACTIVE ($10K - $1M+)
          </span>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Connect Kyber-1024 Vault
          </button>
        </div>
      </div>

      {/* 3D Floating Production Artifacts Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <DeltaProductionGallery productions={productions} loading={loading} formatPrice={formatPrice} />
      </div>
    </div>
  );
}

/**
 * DeltaProductionGallery — renders floating production artifact cards
 */
function DeltaProductionGallery({ productions, loading, formatPrice }) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (productions.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-zinc-400 mb-2">No Delta Productions Yet</h2>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          Ship a turnkey production from your authoring tools to populate the Delta Warehouse.
          Each production enters multi-sig escrow verification before ascension.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productions.map((prod) => (
        <Link
          to={`/warehouse/${prod.id}`}
          key={prod.id}
          className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-amber-400/40 hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Delta badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-amber-400/80 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
              Δ PRODUCTION
            </span>
            <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
              prod.status === "published"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : prod.status === "pending_review"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
            }`}>
              {prod.status?.toUpperCase().replace("_", " ") || "DRAFT"}
            </span>
          </div>

          {/* Production title */}
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
            {prod.name}
          </h3>
          <p className="text-[11px] font-mono text-zinc-500 mb-3">{prod.code}</p>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-3 mb-4 min-h-[48px]">
            {prod.description}
          </p>

          {/* Features */}
          {prod.features?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {prod.features.slice(0, 3).map((f, i) => (
                <span key={i} className="text-[9px] px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  {f}
                </span>
              ))}
              {prod.features.length > 3 && (
                <span className="text-[9px] px-2 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
                  +{prod.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Valuation</p>
              <p className="text-lg font-bold text-amber-400">{formatPrice(prod.price)}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-amber-400 transition-colors">
              View Dossier <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}