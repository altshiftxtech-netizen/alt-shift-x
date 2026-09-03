import React, { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Loader2, X, Maximize2, Minimize2, RefreshCw, AlertTriangle } from "lucide-react";

/**
 * PwaSandbox — downloads a PWA ZIP, extracts it client-side, and runs the
 * actual files inside an iframe: links the real manifest.json, imports and
 * executes offline-bootloader.js, attempts sw.js registration, and steps
 * through the real boot-sequence.json — capturing live console output.
 *
 * Props:
 *   source: { file_url?, generate_function?, name, version, id }
 *   onClose: () => void
 */
export default function PwaSandbox({ source, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeSrc, setIframeSrc] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [status, setStatus] = useState("Downloading package…");
  const iframeRef = useRef(null);
  const blobUrlsRef = useRef([]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  // Extract a ZIP ArrayBuffer into a map of { path -> { blobUrl, blob, text } }
  const extractZip = useCallback(async (arrayBuffer) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const fileMap = new Map();
    const blobUrls = [];

    const entries = Object.values(zip.files);
    for (const entry of entries) {
      if (entry.dir) continue;
      const content = await entry.async("arraybuffer");
      const path = entry.name;
      const ext = path.split(".").pop()?.toLowerCase() || "";
      const mimeTypes = {
        html: "text/html", htm: "text/html",
        css: "text/css",
        js: "application/javascript", mjs: "application/javascript",
        json: "application/json",
        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
        gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
        ico: "image/x-icon", bmp: "image/bmp",
        woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf",
        mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
        mp4: "video/mp4", webm: "video/webm",
        txt: "text/plain", xml: "application/xml",
        wasm: "application/wasm",
      };
      const mime = mimeTypes[ext] || "application/octet-stream";
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      fileMap.set(path, { url, blob, content });
    }
    blobUrlsRef.current = blobUrls;
    return fileMap;
  }, []);

  // Read a JSON file from the extracted ZIP
  const readJsonFromZip = async (fileMap, filename) => {
    const entry = fileMap.get(filename);
    if (!entry) return null;
    try {
      return JSON.parse(await entry.blob.text());
    } catch {
      return null;
    }
  };

  // Read a text file from the extracted ZIP
  const readTextFromZip = async (fileMap, filename) => {
    const entry = fileMap.get(filename);
    if (!entry) return null;
    try {
      return await entry.blob.text();
    } catch {
      return null;
    }
  };

  // Build runtime HTML — renders the actual PWA app from the ZIP's files
  const buildRuntimeHtml = async (fileMap, manifest, components, payload, bootSequence, source) => {
    const manifestUrl = fileMap.get("manifest.json")?.url || "";
    const bootloaderUrl = fileMap.get("offline-bootloader.js")?.url || "";
    const swUrl = fileMap.get("sw.js")?.url || "";
    const selfHealingUrl = fileMap.get("self-healing.js")?.url || "";
    const pwaName = manifest?.name || source.name || "PWA";
    const pwaVersion = manifest?.version || source.version || payload?.version || "1.0.0";
    const pwaDesc = manifest?.description || payload?.description || "";
    const themeColor = manifest?.theme_color || "#0a0e1a";
    const bgColor = manifest?.background_color || "#1a2332";
    const iconUrl = manifest?.icons?.[0]?.src || "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg";
    const artifactCode = payload?.artifact_code || manifest?.short_name || "";
    const bootSteps = bootSequence || payload?.boot_sequence || {};
    const bootStepEntries = Object.entries(bootSteps).sort((a, b) => {
      const na = parseInt(a[0].match(/\d+/)?.[0] || 0);
      const nb = parseInt(b[0].match(/\d+/)?.[0] || 0);
      return na - nb;
    });
    const bundledComponents = components || payload?.bundled_components || [];

    const escapeHtml = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // If the ZIP contains an index.html, use it directly — it's the actual PWA app
    // (with its own splash page if one was programmed). Otherwise, render the app
    // canvas from the manifest/component metadata with no synthetic splash.
    const indexHtmlEntry = fileMap.get("index.html") || fileMap.get("index.htm");
    if (indexHtmlEntry) {
      return await indexHtmlEntry.blob.text();
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ${manifestUrl ? '<link rel="manifest" href="' + manifestUrl + '">' : ''}
  <meta name="theme-color" content="${escapeHtml(themeColor)}">
  <title>${escapeHtml(pwaName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${escapeHtml(bgColor)}; color: #e2e8f0; min-height: 100vh;
      overflow-x: hidden;
    }
    .app-header {
      background: linear-gradient(135deg, ${escapeHtml(themeColor)}, ${escapeHtml(bgColor)});
      padding: 20px 16px; display: flex; align-items: center; gap: 12px;
      position: sticky; top: 0; z-index: 10;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .app-header img { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
    .app-header h1 { font-size: 17px; font-weight: 700; color: #fff; }
    .app-header p { font-size: 11px; color: rgba(255,255,255,0.5); }
    .app-body { max-width: 640px; margin: 0 auto; padding: 20px 16px 40px; }
    .hero { text-align: center; margin-bottom: 24px; }
    .hero h2 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; }
    .hero p { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; max-width: 420px; margin: 0 auto; }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      color: rgba(255,255,255,0.35); margin: 20px 0 12px;
    }
    .module-grid { display: grid; gap: 10px; }
    .module-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; padding: 16px; display: flex; gap: 14px; align-items: flex-start;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .module-card:active { transform: scale(0.98); }
    .module-type {
      width: 40px; height: 40px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .module-type-X1 { background: #1e3a5f; color: #60a5fa; }
    .module-type-X2 { background: #3a1e5f; color: #c084fc; }
    .module-type-X3 { background: #1e5f3a; color: #4ade80; }
    .module-type-X4 { background: #5f3a1e; color: #fb923c; }
    .module-type-X5 { background: #5f1e3a; color: #f472b6; }
    .module-info { flex: 1; min-width: 0; }
    .module-code { font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.35); }
    .module-name { font-size: 14px; font-weight: 600; color: #fff; margin: 3px 0; }
    .module-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; }
    .module-features { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .feature-tag { font-size: 9px; padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
    .module-price { font-size: 13px; font-weight: 700; color: #fbbf24; white-space: nowrap; }
    .app-footer {
      padding: 20px 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 20px;
    }
    .app-footer .status {
      display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #4ade80; font-weight: 600;
    }
    .app-footer .status .dot {
      width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .app-footer .version { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 6px; }
  </style>
</head>
<body>

  <!-- App Canvas -->
  <div class="app" id="app" style="opacity:1;">
    <div class="app-header">
      <img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(pwaName)}">
      <div>
        <h1>${escapeHtml(pwaName)}</h1>
        <p>v${escapeHtml(pwaVersion)}</p>
      </div>
    </div>
    <div class="app-body">
      <div class="hero">
        <h2>${escapeHtml(pwaName)}</h2>
        <p>${escapeHtml(pwaDesc)}</p>
      </div>

      <div class="section-label">Installed Modules</div>
      <div class="module-grid">
        ${bundledComponents.length > 0 ? bundledComponents.map(c => `
        <div class="module-card">
          <div class="module-type module-type-${escapeHtml(c.type || 'X5')}">${escapeHtml(c.type || 'X5')}</div>
          <div class="module-info">
            <div class="module-code">${escapeHtml(c.code || '')}</div>
            <div class="module-name">${escapeHtml(c.name || '')}</div>
            ${c.description ? `<div class="module-desc">${escapeHtml(c.description)}</div>` : ''}
            ${c.features && c.features.length ? `<div class="module-features">${c.features.map(f => `<span class="feature-tag">${escapeHtml(f)}</span>`).join('')}</div>` : ''}
          </div>
          ${c.price ? `<div class="module-price">$${c.price}/mo</div>` : ''}
        </div>`).join('') : '<p style="font-size:12px;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">No modules installed.</p>'}
      </div>
    </div>
    <div class="app-footer">
      <div class="status"><div class="dot"></div> Substrate Active</div>
      <div class="version">${escapeHtml(artifactCode)} · v${escapeHtml(pwaVersion)}</div>
    </div>
  </div>

  <script>
    (function() {
      // Import and run the actual offline-bootloader.js from the ZIP
      var bootloaderUrl = ${JSON.stringify(bootloaderUrl)};
      if (bootloaderUrl) {
        import(bootloaderUrl).then(function(mod) {
          if (mod && mod.default && typeof mod.default.boot === 'function') {
            mod.default.boot().catch(function() {});
          }
        }).catch(function() {});
      }
    })();
  </script>
</body>
</html>`;
  };

  // Main launch function
  const launchPwa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Get the ZIP
      setStatus("Downloading package…");
      let zipBuffer;
      if (source.file_url) {
        const res = await fetch(source.file_url);
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        zipBuffer = await res.arrayBuffer();
      } else if (source.generate_function) {
        setStatus("Generating PWA package…");
        const { base44 } = await import("@/api/base44Client");
        const response = await base44.functions.invoke(source.generate_function, {
          export_id: source.id,
        });
        const data = response.data ?? response;
        const b64 = data?.zip;
        if (!b64) throw new Error("No zip payload returned from generator.");
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        zipBuffer = bytes.buffer;
      } else {
        throw new Error("No file_url or generate_function available.");
      }

      // Step 2: Extract ZIP
      setStatus("Extracting PWA files…");
      const fileMap = await extractZip(zipBuffer);
      if (fileMap.size === 0) throw new Error("ZIP package is empty.");

      // Step 3: Read actual files from the ZIP
      setStatus("Reading PWA files…");
      const manifest = await readJsonFromZip(fileMap, "manifest.json");
      const components = await readJsonFromZip(fileMap, "components.json");
      const payload = await readJsonFromZip(fileMap, "payload.json");
      const bootSequence = await readJsonFromZip(fileMap, "boot-sequence.json");

      // Step 4: Build runtime HTML that loads and executes the actual files
      setStatus("Launching PWA runtime…");
      const runtimeHtml = await buildRuntimeHtml(fileMap, manifest, components, payload, bootSequence, source);

      // Step 5: Open the PWA app in a new browser tab
      const finalBlob = new Blob([runtimeHtml], { type: "text/html" });
      const finalUrl = URL.createObjectURL(finalBlob);
      blobUrlsRef.current.push(finalUrl);
      setStatus("Opening PWA in new tab…");
      window.open(finalUrl, "_blank", "noopener,noreferrer");
      setLoading(false);
      setTimeout(() => onClose(), 500);
    } catch (e) {
      setError(e.message || "Failed to launch PWA.");
      setLoading(false);
    }
  }, [source, extractZip]);

  useEffect(() => {
    if (source) launchPwa();
  }, [source]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-slate-950 ${fullscreen ? "" : "p-4"}`}>
      {/* Sandbox toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {source?.name} v{source?.version || "1.0.0"}
          </span>
          {loading && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {status}
            </span>
          )}
          {!loading && !error && (
            <span className="text-[10px] text-emerald-500 font-semibold">{status}</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !iframeSrc}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-30"
          title="Reload PWA"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setFullscreen(f => !f)}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-30"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-red-950 text-slate-400 hover:text-red-400"
          title="Close sandbox"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Iframe container */}
      <div className="flex-1 relative bg-slate-950 border border-t-0 border-slate-700 rounded-b-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-xs text-slate-400">{status}</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-300 text-center max-w-xs">{error}</p>
          </div>
        )}
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={`${source?.name} PWA Sandbox`}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation"
            allow="geolocation; microphone; camera; autoplay; encrypted-media; fullscreen"
          />
        )}
      </div>
    </div>
  );
}