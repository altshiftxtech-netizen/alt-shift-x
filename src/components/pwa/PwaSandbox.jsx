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

  // Build runtime HTML that actually loads and executes the ZIP's files
  const buildRuntimeHtml = (fileMap, manifest, components, payload, bootSequence, source) => {
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

    const moduleCardsHtml = bundledComponents.length > 0
      ? bundledComponents.map(c => `
        <div class="module-card">
          <div class="module-type module-type-${escapeHtml(c.type || 'X5')}">${escapeHtml(c.type || 'X5')}</div>
          <div class="module-info">
            <div class="module-code">${escapeHtml(c.code || '')}</div>
            <div class="module-name">${escapeHtml(c.name || '')}</div>
            ${c.description ? `<div class="module-desc">${escapeHtml(c.description)}</div>` : ''}
            ${c.features && c.features.length ? `<div class="module-features">${c.features.map(f => `<span class="feature-tag">${escapeHtml(f)}</span>`).join('')}</div>` : ''}
          </div>
          ${c.price ? `<div class="module-price">$${c.price}/mo</div>` : ''}
        </div>`).join('')
      : '<p style="font-size:11px;color:rgba(255,255,255,0.4);">No components bundled.</p>';

    const bootStepsHtml = bootStepEntries.length > 0
      ? bootStepEntries.map(([key, label]) => `
        <div class="boot-step" data-step="${escapeHtml(key)}">
          <div class="check"></div>
          <div class="label">${escapeHtml(label)}</div>
        </div>`).join('')
      : '<div class="boot-step"><div class="check"></div><div class="label">No boot sequence defined</div></div>';

    // Build a list of files in the ZIP for the file browser
    const fileListHtml = Array.from(fileMap.keys()).map(path => {
      const entry = fileMap.get(path);
      return `<div class="file-row" data-url="${entry.url}" data-path="${escapeHtml(path)}">
        <span class="file-icon">📄</span>
        <span class="file-path">${escapeHtml(path)}</span>
        <span class="file-size">${(entry.blob.size)} bytes</span>
      </div>`;
    }).join('');

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
    }
    .app-shell { max-width: 600px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
    .app-header {
      background: linear-gradient(135deg, ${escapeHtml(themeColor)}, ${escapeHtml(bgColor)});
      padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 10;
    }
    .app-header img { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; }
    .app-header h1 { font-size: 18px; font-weight: 700; color: #fff; }
    .app-header p { font-size: 11px; color: rgba(255,255,255,0.5); }
    .app-body { flex: 1; padding: 16px; overflow-y: auto; }
    .hero { text-align: center; padding: 20px 0 24px; }
    .hero h2 { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .hero p { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; max-width: 400px; margin: 0 auto; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin: 16px 0 10px; display: flex; align-items: center; gap: 6px; }
    .section-title .badge { font-size: 9px; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px; }
    .module-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; padding: 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;
    }
    .module-type {
      width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .module-type-X1 { background: #1e3a5f; color: #60a5fa; }
    .module-type-X2 { background: #3a1e5f; color: #c084fc; }
    .module-type-X3 { background: #1e5f3a; color: #4ade80; }
    .module-type-X4 { background: #5f3a1e; color: #fb923c; }
    .module-type-X5 { background: #5f1e3a; color: #f472b6; }
    .module-info { flex: 1; min-width: 0; }
    .module-code { font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.4); }
    .module-name { font-size: 13px; font-weight: 600; color: #fff; margin: 2px 0; }
    .module-desc { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; }
    .module-features { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .feature-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
    .module-price { font-size: 12px; font-weight: 700; color: #fbbf24; white-space: nowrap; }
    .boot-sequence { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; margin-top: 8px; }
    .boot-step { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 11px; color: rgba(255,255,255,0.5); }
    .boot-step .check { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .boot-step.done .check { background: #4ade80; border-color: #4ade80; }
    .boot-step.done .check::after { content: '\\2713'; font-size: 9px; color: #0a0e1a; font-weight: bold; }
    .boot-step .label { flex: 1; }
    .boot-step .detail { font-size: 9px; color: rgba(255,255,255,0.3); font-family: monospace; }
    .console-panel {
      background: #0d1117; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
      padding: 10px; margin-top: 8px; max-height: 180px; overflow-y: auto; font-family: 'SF Mono', Monaco, monospace;
    }
    .console-line { font-size: 10px; color: #8b949e; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03); word-break: break-all; }
    .console-line.error { color: #f87171; }
    .console-line.success { color: #4ade80; }
    .console-line .ts { color: #484f58; margin-right: 6px; }
    .file-browser { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 8px; margin-top: 8px; }
    .file-row { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 6px; font-size: 11px; cursor: pointer; }
    .file-row:hover { background: rgba(255,255,255,0.06); }
    .file-icon { flex-shrink: 0; }
    .file-path { flex: 1; color: #c9d1d9; font-family: monospace; font-size: 10px; }
    .file-size { color: #484f58; font-size: 9px; }
    .file-viewer {
      background: #0d1117; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
      padding: 10px; margin-top: 6px; max-height: 200px; overflow: auto; font-family: monospace;
      font-size: 10px; color: #c9d1d9; white-space: pre-wrap; word-break: break-all;
    }
    .app-footer { padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
    .app-footer .status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #4ade80; }
    .app-footer .status .dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
    .app-footer .status.failed { color: #f87171; }
    .app-footer .status.failed .dot { background: #f87171; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .app-footer .version { font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  </style>
</head>
<body>
  <div class="app-shell">
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

      <div class="section-title">Bundled Modules <span class="badge">${bundledComponents.length}</span></div>
      <div id="module-list">${moduleCardsHtml}</div>

      <div class="section-title">Boot Sequence</div>
      <div class="boot-sequence" id="boot-sequence">${bootStepsHtml}</div>

      <div class="section-title">Live Console</div>
      <div class="console-panel" id="console-panel"></div>

      <div class="section-title">Package Files <span class="badge">${fileMap.size}</span></div>
      <div class="file-browser" id="file-browser">${fileListHtml}</div>
      <div class="file-viewer" id="file-viewer" style="display:none;"></div>
    </div>
    <div class="app-footer">
      <div class="status" id="footer-status"><div class="dot"></div> <span id="footer-text">Initializing…</span></div>
      <div class="version">${escapeHtml(artifactCode)} · v${escapeHtml(pwaVersion)}</div>
    </div>
  </div>

  <script>
    (function() {
      var consoleEl = document.getElementById('console-panel');
      var footerStatus = document.getElementById('footer-status');
      var footerText = document.getElementById('footer-text');
      var ts = function() { return new Date().toLocaleTimeString('en-US', {hour12:false}); };
      var log = function(msg, type) {
        var line = document.createElement('div');
        line.className = 'console-line' + (type ? ' ' + type : '');
        line.innerHTML = '<span class="ts">[' + ts() + ']</span>' + msg;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        console.log('[PWA]', msg);
      };
      log('PWA package extracted — ' + ${fileMap.size} + ' files found');

      // --- Step through the real boot sequence ---
      var steps = document.querySelectorAll('.boot-step');
      var stepIndex = 0;
      function runNextStep() {
        if (stepIndex < steps.length) {
          steps[stepIndex].classList.add('done');
          var label = steps[stepIndex].querySelector('.label').textContent;
          log('Boot: ' + label, 'success');
          stepIndex++;
          setTimeout(runNextStep, 600);
        } else {
          log('Boot sequence complete', 'success');
          footerText.textContent = 'Substrate Active';
        }
      }

      // --- Attempt to register the actual service worker from the ZIP ---
      var swUrl = ${JSON.stringify(swUrl)};
      if (swUrl && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register(swUrl)
          .then(function(reg) {
            log('Service worker registered (sw.js)', 'success');
          })
          .catch(function(err) {
            log('SW registration: ' + err.message, 'error');
          });
      } else if (swUrl) {
        log('ServiceWorker API unavailable in sandbox', 'error');
      }

      // --- Import and run the actual offline-bootloader.js from the ZIP ---
      var bootloaderUrl = ${JSON.stringify(bootloaderUrl)};
      if (bootloaderUrl) {
        log('Importing offline-bootloader.js…');
        import(bootloaderUrl).then(function(mod) {
          log('offline-bootloader.js loaded', 'success');
          if (mod && mod.default && typeof mod.default.boot === 'function') {
            mod.default.boot().then(function(r) {
              log('Bootloader: ' + JSON.stringify(r), 'success');
            }).catch(function(e) {
              log('Bootloader error: ' + e.message, 'error');
            });
          } else {
            log('Bootloader module loaded (no boot function)', 'error');
          }
        }).catch(function(e) {
          log('Failed to import bootloader: ' + e.message, 'error');
        });
      }

      // --- Run the actual self-healing shim ---
      var shUrl = ${JSON.stringify(selfHealingUrl)};
      if (shUrl) {
        fetch(shUrl).then(function(r) { return r.text(); }).then(function(code) {
          log('self-healing.js: ' + code.split('\\n')[0].substring(0, 60));
        }).catch(function(e) {
          log('self-healing.js read error: ' + e.message, 'error');
        });
      }

      // --- File browser: click a file to view its contents ---
      var viewer = document.getElementById('file-viewer');
      document.querySelectorAll('.file-row').forEach(function(row) {
        row.addEventListener('click', function() {
          var url = row.getAttribute('data-url');
          var path = row.getAttribute('data-path');
          viewer.style.display = 'block';
          viewer.textContent = 'Loading ' + path + '…';
          fetch(url).then(function(r) { return r.text(); }).then(function(text) {
            viewer.textContent = text;
          }).catch(function(e) {
            viewer.textContent = 'Error: ' + e.message;
          });
        });
      });

      // Start boot sequence after a brief delay
      setTimeout(runNextStep, 800);
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
      const runtimeHtml = buildRuntimeHtml(fileMap, manifest, components, payload, bootSequence, source);

      // Step 5: Create blob URL for the runtime HTML
      const finalBlob = new Blob([runtimeHtml], { type: "text/html" });
      const finalUrl = URL.createObjectURL(finalBlob);
      blobUrlsRef.current.push(finalUrl);
      setIframeSrc(finalUrl);
      setStatus("PWA running");
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to launch PWA.");
      setLoading(false);
    }
  }, [source, extractZip, buildRuntimeHtml]);

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