import React, { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Loader2, X, Maximize2, Minimize2, RefreshCw, AlertTriangle } from "lucide-react";

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

  // Find the entry HTML file
  const findEntryHtml = (fileMap) => {
    // Prefer index.html at root
    const candidates = [
      "index.html", "index.htm",
      "app/index.html", "app/index.htm",
      "public/index.html", "public/index.htm",
      "src/index.html", "src/index.htm",
    ];
    for (const candidate of candidates) {
      if (fileMap.has(candidate)) return candidate;
    }
    // Fallback: any .html file, prefer shortest path
    const htmlFiles = [...fileMap.keys()].filter(p => /\.html?$/i.test(p));
    if (htmlFiles.length === 0) return null;
    htmlFiles.sort((a, b) => a.split("/").length - b.split("/").length);
    return htmlFiles[0];
  };

  // Rewrite all asset references in HTML to use blob URLs
  const rewriteHtml = (htmlContent, fileMap, basePath) => {
    let html = htmlContent;

    // basePath is the directory of the index.html relative to zip root
    // e.g. if entry is "app/index.html", basePath is "app/"
    const baseDir = basePath.includes("/") ? basePath.substring(0, basePath.lastIndexOf("/") + 1) : "";

    // Resolve a relative path to a full zip path
    const resolvePath = (relPath) => {
      if (/^https?:\/\//.test(relPath) || relPath.startsWith("blob:") || relPath.startsWith("data:")) {
        return null; // Skip absolute URLs
      }
      if (relPath.startsWith("/")) relPath = relPath.substring(1);
      // Remove leading ./
      if (relPath.startsWith("./")) relPath = relPath.substring(2);
      const full = baseDir + relPath;
      // Try direct match
      if (fileMap.has(full)) return full;
      // Try without baseDir (root relative)
      if (fileMap.has(relPath)) return relPath;
      // Try matching by filename
      const filename = relPath.split("/").pop();
      const match = [...fileMap.keys()].find(k => k.endsWith("/" + filename) || k === filename);
      return match || null;
    };

    // Rewrite src="..." and href="..." attributes
    const attrRegex = /(\b(?:src|href|action)\s*=\s*)(["'])([^"']+)\2/gi;
    html = html.replace(attrRegex, (match, attr, quote, url) => {
      const resolved = resolvePath(url);
      if (resolved && fileMap.has(resolved)) {
        return `${attr}${quote}${fileMap.get(resolved).url}${quote}`;
      }
      return match;
    });

    // Rewrite CSS url(...) in inline styles
    html = html.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (match, url) => {
      const resolved = resolvePath(url);
      if (resolved && fileMap.has(resolved)) {
        return `url(${fileMap.get(resolved).url})`;
      }
      return match;
    });

    // Rewrite ES module imports in inline scripts
    html = html.replace(/(<script[^>]*type=["']module["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (match, openTag, code, closeTag) => {
      const rewrittenCode = code.replace(/import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/gi, (m, importPath) => {
        const resolved = resolvePath(importPath);
        if (resolved && fileMap.has(resolved)) {
          return m.replace(importPath, fileMap.get(resolved).url);
        }
        return m;
      });
      return `${openTag}${rewrittenCode}${closeTag}`;
    });

    // Rewrite <link rel="stylesheet" href="..."> for CSS files with @import or url()
    // (already handled by attr regex above for href)

    return html;
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

      // Step 3: Find entry HTML
      const entryHtml = findEntryHtml(fileMap);
      if (!entryHtml) throw new Error("No HTML entry point found in package.");

      // Step 4: Rewrite HTML with blob URLs
      setStatus("Initializing PWA sandbox…");
      const htmlFile = fileMap.get(entryHtml);
      const htmlText = await htmlFile.blob.text();
      const rewrittenHtml = rewriteHtml(htmlText, fileMap, entryHtml);

      // Step 5: Create blob URL for the rewritten HTML
      const finalBlob = new Blob([rewrittenHtml], { type: "text/html" });
      const finalUrl = URL.createObjectURL(finalBlob);
      blobUrlsRef.current.push(finalUrl);
      setIframeSrc(finalUrl);
      setStatus("PWA running");
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to launch PWA.");
      setLoading(false);
    }
  }, [source, extractZip, rewriteHtml, findEntryHtml]);

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