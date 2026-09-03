import React, { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Loader2, X, Maximize2, Minimize2, RefreshCw, AlertTriangle } from "lucide-react";
import { PWA_TEST_TEMPLATE as testTemplate } from "./pwaTestTemplate";

/**
 * PwaSandbox — downloads a PWA ZIP, extracts it client-side, and renders
 * the actual app in an iframe (like it's installed on a device).
 *
 * Props:
 *   source: { file_url?, generate_function?, name, version }
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

  // Extract a ZIP ArrayBuffer into a map of { path -> blobUrl }
  const extractZip = useCallback(async (arrayBuffer) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const fileMap = new Map(); // path -> { blob, blobUrl }
    const blobUrls = [];

    // Collect all files
    const entries = Object.values(zip.files);
    for (const entry of entries) {
      if (entry.dir) continue;
      const content = await entry.async("arraybuffer");
      const path = entry.name;
      // Determine mime type from extension
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
        eot: "application/vnd.ms-fontobject",
        mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
        mp4: "video/mp4", webm: "video/webm",
        txt: "text/plain", xml: "application/xml",
        wasm: "application/wasm",
      };
      const mime = mimeTypes[ext] || "application/octet-stream";
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      fileMap.set(path, { url, content, blob });
    }
    blobUrlsRef.current = blobUrls;
    return fileMap;
  }, []);

  // Parse a JSON file from the extracted ZIP (manifest.json, components.json, etc.)
  const readJsonFromZip = async (fileMap, filename) => {
    const entry = fileMap.get(filename);
    if (!entry) return null;
    try {
      return JSON.parse(await entry.blob.text());
    } catch {
      return null;
    }
  };

  // Build the module cards HTML from component metadata
  const buildModulesHtml = (components) => {
    if (!components || components.length === 0) return '<p style="font-size:11px;color:rgba(255,255,255,0.4);">No components bundled.</p>';
    return components.map(c => `
      <div class="module-card">
        <div class="module-type module-type-${c.type || 'X5'}">${c.type || 'X5'}</div>
        <div class="module-info">
          <div class="module-code">${c.code || ''}</div>
          <div class="module-name">${c.name || ''}</div>
          ${c.description ? `<div class="module-desc">${c.description}</div>` : ''}
          ${c.features && c.features.length ? `<div class="module-features">${c.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}</div>` : ''}
        </div>
        ${c.price ? `<div class="module-price">$${c.price}/mo</div>` : ''}
      </div>`).join('');
  };

  // Inject PWA metadata into the test template
  const renderTemplate = (template, data) => {
    const escape = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return template
      .replace(/__PWA_NAME__/g, escape(data.name))
      .replace(/__PWA_VERSION__/g, escape(data.version))
      .replace(/__PWA_DESCRIPTION__/g, escape(data.description))
      .replace(/__THEME_COLOR__/g, escape(data.themeColor))
      .replace(/__BG_COLOR__/g, escape(data.bgColor))
      .replace(/__ICON_URL__/g, escape(data.iconUrl))
      .replace(/__MODULE_COUNT__/g, data.moduleCount)
      .replace(/__MODULES_HTML__/g, data.modulesHtml)
      .replace(/__ARTIFACT_CODE__/g, escape(data.artifactCode));
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
        // Convert base64 to ArrayBuffer
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

      // Step 3: Read manifest and component metadata from the ZIP
      setStatus("Reading PWA manifest…");
      const manifest = await readJsonFromZip(fileMap, "manifest.json");
      const components = await readJsonFromZip(fileMap, "components.json");
      const payload = await readJsonFromZip(fileMap, "payload.json");

      // Step 4: Inject PWA metadata into the test template
      setStatus("Rendering PWA…");
      const renderedHtml = renderTemplate(testTemplate, {
        name: manifest?.name || source.name,
        version: manifest?.version || source.version || "1.0.0",
        description: manifest?.description || payload?.description || "",
        themeColor: manifest?.theme_color || "#0a0e1a",
        bgColor: manifest?.background_color || "#1a2332",
        iconUrl: manifest?.icons?.[0]?.src || "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg",
        moduleCount: components?.length || 0,
        modulesHtml: buildModulesHtml(components || payload?.bundled_components || []),
        artifactCode: payload?.artifact_code || manifest?.short_name || "",
      });

      // Step 5: Create blob URL for the rendered HTML
      const finalBlob = new Blob([renderedHtml], { type: "text/html" });
      const finalUrl = URL.createObjectURL(finalBlob);
      blobUrlsRef.current.push(finalUrl);
      setIframeSrc(finalUrl);
      setStatus("PWA running");
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to launch PWA.");
      setLoading(false);
    }
  }, [source, extractZip, readJsonFromZip, renderTemplate, buildModulesHtml]);

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