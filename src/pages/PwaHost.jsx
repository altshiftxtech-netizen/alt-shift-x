import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import JSZip from "jszip";
import { Loader2, AlertTriangle } from "lucide-react";

export default function PwaHost() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Loading PWA…");
  const [iframeSrc, setIframeSrc] = useState(null);
  const blobUrlsRef = useRef([]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  // Extract a ZIP ArrayBuffer into a map of { path -> { url, blob } }
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

  // Build runtime HTML from the ZIP's files
  const buildRuntimeHtml = async (fileMap, manifest, payload, source) => {
    const manifestUrl = fileMap.get("manifest.json")?.url || "";
    const bootloaderUrl = fileMap.get("offline-bootloader.js")?.url || "";
    const pwaName = manifest?.name || source?.name || "PWA";
    const pwaVersion = manifest?.version || source?.version || payload?.version || "1.0.0";
    const pwaDesc = manifest?.description || payload?.description || source?.description || "";
    const themeColor = manifest?.theme_color || "#0a0e1a";
    const bgColor = manifest?.background_color || "#1a2332";
    const iconUrl = manifest?.icons?.[0]?.src || "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg";
    const artifactCode = payload?.artifact_code || manifest?.short_name || "";
    const bundledComponents = payload?.bundled_components || [];

    const escapeHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // If the ZIP contains an index.html, use it directly
    const indexHtmlEntry = fileMap.get("index.html") || fileMap.get("index.htm");
    if (indexHtmlEntry) {
      return await indexHtmlEntry.blob.text();
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ${manifestUrl ? '<link rel="manifest" href="' + manifestUrl + '">' : ""}
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
    }
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
        ${bundledComponents.length > 0 ? bundledComponents.map((c) => `
        <div class="module-card">
          <div class="module-type module-type-${escapeHtml(c.type || "X5")}">${escapeHtml(c.type || "X5")}</div>
          <div class="module-info">
            <div class="module-code">${escapeHtml(c.code || "")}</div>
            <div class="module-name">${escapeHtml(c.name || "")}</div>
            ${c.description ? `<div class="module-desc">${escapeHtml(c.description)}</div>` : ""}
          </div>
          ${c.price ? `<div class="module-price">$${c.price}/mo</div>` : ""}
        </div>`).join("") : '<p style="font-size:12px;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">No modules installed.</p>'}
      </div>
    </div>
    <div class="app-footer">
      <div class="status"><div class="dot"></div> Substrate Active</div>
      <div class="version">${escapeHtml(artifactCode)} · v${escapeHtml(pwaVersion)}</div>
    </div>
  </div>
  <script>
    (function() {
      var bootloaderUrl = ${JSON.stringify(bootloaderUrl)};
      if (bootloaderUrl) {
        import(bootloaderUrl).then(function(mod) {
          if (mod && mod.default && typeof mod.default.boot === "function") {
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
      setStatus("Loading PWA metadata…");
      const res = await base44.functions.invoke("getHostedPwa", { export_id: id });
      const data = res.data || res;
      if (!data?.ok && !data?.name) {
        setError(data?.error || "Failed to load PWA");
        setLoading(false);
        return;
      }

      // If there's an external launch_url, redirect to it
      if (data.launch_url && !data.launch_url.includes("/pwa-host/")) {
        window.location.href = data.launch_url;
        return;
      }

      // Otherwise, extract and render the ZIP inline
      let zipBuffer;
      if (data.zip) {
        // Server already generated the ZIP via service role — prefer inline payload
        setStatus("Decoding PWA package…");
        const binStr = atob(data.zip);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        zipBuffer = bytes.buffer;
      } else if (data.file_url) {
        setStatus("Downloading package…");
        const fetchRes = await fetch(data.file_url);
        if (!fetchRes.ok) throw new Error(`Download failed: ${fetchRes.status}`);
        zipBuffer = await fetchRes.arrayBuffer();
      } else {
        throw new Error("This PWA has no file_url or generate_function.");
      }

      setStatus("Extracting PWA files…");
      const fileMap = await extractZip(zipBuffer);
      if (fileMap.size === 0) throw new Error("ZIP package is empty.");

      setStatus("Reading PWA files…");
      const manifest = await readJsonFromZip(fileMap, "manifest.json");
      const payload = await readJsonFromZip(fileMap, "payload.json");

      setStatus("Launching PWA…");
      const runtimeHtml = await buildRuntimeHtml(fileMap, manifest, payload, data);

      const finalBlob = new Blob([runtimeHtml], { type: "text/html" });
      const finalUrl = URL.createObjectURL(finalBlob);
      blobUrlsRef.current.push(finalUrl);
      setIframeSrc(finalUrl);
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to launch PWA.");
      setLoading(false);
    }
  }, [id, extractZip]);

  useEffect(() => {
    if (id) launchPwa();
  }, [id, launchPwa]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <p className="text-xs text-slate-400">{status}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-2 p-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-red-300 text-center max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      src={iframeSrc}
      title="Hosted PWA"
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation"
      allow="geolocation; microphone; camera; autoplay; encrypted-media; fullscreen"
    />
  );
}