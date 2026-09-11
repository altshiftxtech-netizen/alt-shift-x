import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import JSZip from "jszip";
import { Loader2, AlertTriangle, Download } from "lucide-react";
// install.bat / install.sh injection helper — used by both download paths
const INSTALL_BAT = '@echo off\r\nstart "" "%~dp0index.html"\r\n';
const INSTALL_SH = '#!/bin/bash\nopen "index.html" 2>/dev/null || xdg-open "index.html"\n';
async function injectInstallers(zipBytes) {
  try {
    const zip = await JSZip.loadAsync(zipBytes);
    if (!zip.files["install.bat"]) zip.file("install.bat", INSTALL_BAT);
    if (!zip.files["install.sh"]) zip.file("install.sh", INSTALL_SH);
    return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  } catch {
    return new Blob([zipBytes], { type: "application/zip" });
  }
}

export default function PwaHost() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Loading PWA…");
  const [iframeSrc, setIframeSrc] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);
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

  // Build runtime HTML — always renders the functional component UI
  const buildRuntimeHtml = async (fileMap, manifest, payload, source) => {
    const manifestUrl = fileMap.get("manifest.json")?.url || "";
    const pwaName = manifest?.name || source?.name || "PWA";
    const pwaVersion = manifest?.version || source?.version || payload?.version || "1.0.0";
    const pwaDesc = manifest?.description || payload?.description || source?.description || "";
    const artifactCode = payload?.artifact_code || manifest?.short_name || "";
    const bundledComponents = payload?.bundled_components || [];

    const escapeHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // Always use the primary component to drive the UI
    const primary = bundledComponents[0] || {};
    const compType = primary.type || "X5";
    const compName = primary.name || pwaName;
    const compDesc = primary.description || pwaDesc;
    const compFeatures = primary.features || [];
    const compSchema = primary.schema || [];
    const compCode = primary.code || artifactCode;

    const typeMeta = {
      X1: { label: "Reading Protocol", icon: "📖", action: "Read", placeholder: "Enter text or upload a document to analyze…" },
      X2: { label: "Prophecy Model", icon: "🔮", action: "Predict", placeholder: "Enter a scenario to forecast…" },
      X3: { label: "Speed Profile", icon: "⚡", action: "Run", placeholder: "Enter a task to optimize…" },
      X4: { label: "Reason Council", icon: "🧠", action: "Deliberate", placeholder: "Enter a question for the council…" },
      X5: { label: "Agent", icon: "🤖", action: "Send", placeholder: "Ask the agent anything…" },
    };
    const tm = typeMeta[compType] || typeMeta.X5;

    const featureChips = compFeatures.length > 0
      ? compFeatures.slice(0, 6).map(f => '<span class="chip">' + escapeHtml(f) + "</span>").join("")
      : "";

    const schemaFieldsHtml = compSchema.length > 0
      ? compSchema.slice(0, 5).map(field => {
          const fld = (field || "").toString();
          return '<div class="schema-field"><label>' + escapeHtml(fld) + "</label>" +
                 '<input type="text" data-field="' + escapeHtml(fld) + '" placeholder="Enter ' + escapeHtml(fld) + '…"></div>';
        }).join("")
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ${manifestUrl ? '<link rel="manifest" href="' + manifestUrl + '">' : ""}
  <meta name="theme-color" content="#0a0e1a">
  <title>${escapeHtml(compName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e1a; color: #e2e8f0; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: linear-gradient(135deg, #0a0e1a, #1a2332); padding: 12px 16px; display: flex; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #1e293b; box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
    .header .logo { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
    .header .title-wrap { flex: 1; min-width: 0; }
    .header h1 { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header .subtitle { font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px; }
    .header .type-badge { font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 5px; }
    .type-X1 { background: #172554; color: #60a5fa; }
    .type-X2 { background: #3b0764; color: #c084fc; }
    .type-X3 { background: #052e16; color: #4ade80; }
    .type-X4 { background: #451a03; color: #fb923c; }
    .type-X5 { background: #500724; color: #f472b6; }
    .main { flex: 1; display: flex; flex-direction: column; max-width: 720px; width: 100%; margin: 0 auto; padding: 16px; }
    .hero { text-align: center; margin-bottom: 16px; }
    .hero .icon { font-size: 40px; margin-bottom: 8px; }
    .hero h2 { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .hero p { font-size: 12px; color: #64748b; line-height: 1.5; max-width: 420px; margin: 0 auto; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px; }
    .chip { font-size: 10px; padding: 4px 10px; border-radius: 12px; background: #1e293b; color: #94a3b8; }
    .interaction { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .output { flex: 1; min-height: 180px; max-height: 340px; overflow-y: auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; font-size: 13px; line-height: 1.6; color: #cbd5e1; }
    .output .msg-user { text-align: right; margin-bottom: 10px; }
    .output .msg-user .bubble { display: inline-block; background: #1e3a5f; color: #dbeafe; padding: 8px 12px; border-radius: 12px 12px 2px 12px; max-width: 80%; }
    .output .msg-agent { margin-bottom: 10px; }
    .output .msg-agent .bubble { display: inline-block; background: #1a2332; color: #e2e8f0; padding: 8px 12px; border-radius: 12px 12px 12px 2px; max-width: 85%; }
    .output .msg-agent .label { font-size: 9px; color: #64748b; margin-bottom: 3px; }
    .output .empty { color: #475569; text-align: center; padding: 40px 0; font-size: 13px; }
    .input-row { display: flex; gap: 8px; align-items: flex-end; }
    .input-row textarea { flex: 1; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 12px; color: #e2e8f0; font-size: 13px; font-family: inherit; resize: none; min-height: 42px; max-height: 120px; outline: none; transition: border-color 0.15s; }
    .input-row textarea:focus { border-color: #fbbf24; }
    .input-row button { background: #fbbf24; color: #0a0e1a; border: none; border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform 0.1s; }
    .input-row button:active { transform: scale(0.95); }
    .input-row button:disabled { opacity: 0.5; cursor: default; }
    .schema-fields { display: none; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .schema-fields.visible { display: flex; }
    .schema-field label { font-size: 10px; color: #64748b; display: block; margin-bottom: 3px; }
    .schema-field input { width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 8px 10px; color: #e2e8f0; font-size: 12px; outline: none; }
    .schema-field input:focus { border-color: #fbbf24; }
    .toolbar { display: flex; gap: 6px; margin-bottom: 10px; }
    .toolbar button { background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 6px 10px; font-size: 11px; cursor: pointer; }
    .toolbar button.active { background: #334155; color: #fbbf24; }
    .footer { padding: 10px 16px; text-align: center; border-top: 1px solid #1e293b; }
    .footer .ver { font-size: 9px; color: #334155; }
    .thinking-dots::after { content: '...'; animation: think-pulse 1.2s infinite; }
    @keyframes think-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
    .msg-agent.thinking .bubble { opacity: 0.75; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg" alt="${escapeHtml(compName)}">
    <div class="title-wrap">
      <h1>${escapeHtml(compName)}</h1>
      <div class="subtitle">
        <span class="type-badge type-${escapeHtml(compType)}">${escapeHtml(compType)} · ${escapeHtml(tm.label)}</span>
        <span>v${escapeHtml(pwaVersion)}</span>
      </div>
    </div>
  </div>
  <div class="main">
    <div class="hero">
      <div class="icon">${tm.icon}</div>
      <h2>${escapeHtml(compName)}</h2>
      <p>${escapeHtml(compDesc)}</p>
      ${featureChips ? '<div class="chips">' + featureChips + "</div>" : ""}
    </div>
    <div class="interaction">
      <div class="toolbar">
        <button id="btn-chat" class="active">${escapeHtml(tm.action)}</button>
        ${schemaFieldsHtml ? '<button id="btn-schema">Configure</button>' : ""}
      </div>
      ${schemaFieldsHtml ? '<div class="schema-fields" id="schema-fields">' + schemaFieldsHtml + "</div>" : ""}
      <div class="output" id="output">
        <div class="empty">${escapeHtml(tm.label)} ready. ${escapeHtml(tm.placeholder)}</div>
      </div>
      <div class="input-row">
        <textarea id="input" placeholder="${escapeHtml(tm.placeholder)}" rows="1"></textarea>
        <button id="send-btn">${escapeHtml(tm.action)}</button>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="ver">${escapeHtml(compCode)} · v${escapeHtml(pwaVersion)}</div>
  </div>
  <script>
    const COMP_TYPE = ${JSON.stringify(compType)};
    const COMP_NAME = ${JSON.stringify(compName)};
    const TM = ${JSON.stringify(tm)};
    const COMP_CODE = ${JSON.stringify(compCode)};
    const PWA_VERSION = ${JSON.stringify(pwaVersion)};
    const PERSONA = ${JSON.stringify(payload?.persona || 'obsidian')};
    const API_ENDPOINT = '/functions/pwaQueryEngine';
    const SESSION_KEY = 'SOVEREIGN_SESSION_HISTORY';
    const MAX_HISTORY = 50;

    function loadHistory() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; } }
    function saveHistory(h) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(h.slice(-MAX_HISTORY))); } catch {} }
    function addToHistory(role, text) { var h = loadHistory(); h.push({ role: role, text: text, ts: Date.now() }); saveHistory(h); }
    function renderHistory() {
      var h = loadHistory(); if (h.length === 0) return;
      var e = output.querySelector('.empty'); if (e) e.remove();
      h.forEach(function(msg) {
        var w = document.createElement('div'); w.className = 'msg-' + msg.role;
        if (msg.role === 'agent') { var l = document.createElement('div'); l.className = 'label'; l.textContent = COMP_NAME; w.appendChild(l); }
        var b = document.createElement('div'); b.className = 'bubble'; b.textContent = msg.text; w.appendChild(b);
        output.appendChild(w);
      });
      output.scrollTop = output.scrollHeight;
    }
    function showThinking(msg) {
      var e = output.querySelector('.empty'); if (e) e.remove();
      var w = document.createElement('div'); w.className = 'msg-agent thinking'; w.id = 'thinking-indicator';
      var l = document.createElement('div'); l.className = 'label'; l.textContent = COMP_NAME; w.appendChild(l);
      var b = document.createElement('div'); b.className = 'bubble';
      var s = document.createElement('span'); s.className = 'thinking-dots'; s.textContent = msg;
      b.appendChild(s); w.appendChild(b); output.appendChild(w);
      output.scrollTop = output.scrollHeight;
    }
    function hideThinking() { var t = document.getElementById('thinking-indicator'); if (t) t.remove(); }
    function rotateThinking(phrases) {
      var i = 0; var d = document.querySelector('#thinking-indicator .thinking-dots'); if (!d) return null;
      return setInterval(function() { i = (i + 1) % phrases.length; d.textContent = phrases[i]; }, 1800);
    }
    async function fetchAIResponse(query, history) {
      try {
        var res = await fetch(API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ component_code: COMP_CODE, query: query, history: history, persona: PERSONA }) });
        if (!res.ok) return null; var data = await res.json(); return data.response || null;
      } catch (e) { return null; }
    }
    async function executeQuery(text, thinkingPhrases, offlineEngine) {
      addToHistory('user', text);
      showThinking(thinkingPhrases[0]);
      var rotator = rotateThinking(thinkingPhrases);
      var history = loadHistory();
      var response = await fetchAIResponse(text, history);
      if (rotator) clearInterval(rotator);
      hideThinking();
      if (!response) response = offlineEngine(text);
      addToHistory('agent', response);
      addMessage('agent', response);
      sendBtn.disabled = false; input.focus();
    }
    function pm1aOfflineFallback(query) {
      return 'Forensic Dossier Analysis (offline mode):\\n\\n1. ASSESSMENT: Query received for forensic analysis under Blackstone Protocol.\\n2. KEY FINDINGS: Offline mode active — connect to the internet for full LLM-powered analysis.\\n3. RISK VECTORS: Cannot verify Sovereign Ledger or golden hash without network access.\\n4. RECOMMENDED ACTIONS: Reconnect to the app\\'s online AI gateway for complete jurisprudence and forensic analysis.\\n\\nProtocol: Blackstone | Mode: Air-gapped';
    }

    const output = document.getElementById("output");
    const input = document.getElementById("input");
    const sendBtn = document.getElementById("send-btn");
    const btnChat = document.getElementById("btn-chat");
    const btnSchema = document.getElementById("btn-schema");
    const schemaFields = document.getElementById("schema-fields");
    input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } });
    sendBtn.addEventListener("click", doSend);
    if (btnSchema) {
      btnSchema.addEventListener("click", () => { schemaFields.classList.toggle("visible"); btnSchema.classList.toggle("active"); btnChat.classList.toggle("active"); });
      btnChat.addEventListener("click", () => { schemaFields.classList.remove("visible"); btnSchema.classList.remove("active"); btnChat.classList.add("active"); });
    }
    function addMessage(role, text) {
      const empty = output.querySelector(".empty"); if (empty) empty.remove();
      const wrap = document.createElement("div"); wrap.className = "msg-" + role;
      if (role === "agent") { const label = document.createElement("div"); label.className = "label"; label.textContent = COMP_NAME; wrap.appendChild(label); }
      const bubble = document.createElement("div"); bubble.className = "bubble"; bubble.textContent = text; wrap.appendChild(bubble);
      output.appendChild(wrap); output.scrollTop = output.scrollHeight;
    }
    function doSend() {
      const text = input.value.trim(); if (!text) return;
      addMessage("user", text); input.value = ""; input.style.height = "auto"; sendBtn.disabled = true;
      var thinkingPhrases = ['Synthesizing response...', 'Analyzing query...', 'Processing through AI engine...', 'Evaluating context...', 'Formulating answer...'];
      executeQuery(text, thinkingPhrases, pm1aOfflineFallback);
    }
    renderHistory();
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

      // Binary pass-through: if the server flagged this as a binary export
      // and generated a valid ZIP, inject installers and prepare a download.
      if (data.binary && data.zip) {
        setStatus("Preparing download…");
        const binStr = atob(data.zip);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const finalBlob = await injectInstallers(bytes);
        const downloadUrl = URL.createObjectURL(finalBlob);
        blobUrlsRef.current.push(downloadUrl);
        const safeName = (data.name || "export").replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "export";
        const safeVer = (data.version || "1.0.0").replace(/[^a-zA-Z0-9._-]/g, "");
        setDownloadInfo({
          url: downloadUrl,
          filename: `${safeName}-v${safeVer}.zip`,
          name: data.name,
          version: data.version,
          fallback: data.fallback,
        });
        setLoading(false);
        setStatus("Ready to download.");
        return;
      }

      // Binary pass-through with direct file_url (no generated ZIP)
      if (data.binary && data.file_url) {
        setStatus("Redirecting to download…");
        window.location.href = data.file_url;
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

      // Binary pass-through: if the ZIP contains no web files (index.html /
      // manifest.json), treat it as a native binary package and trigger a
      // direct download of the original file_url instead of rendering a UI.
      const hasIndexHtml = fileMap.has("index.html") || fileMap.has("index.htm");
      const hasManifest = fileMap.has("manifest.json");
      if (!hasIndexHtml && !hasManifest) {
        const downloadUrl = data.file_url || data.launch_url;
        if (downloadUrl) {
          window.location.href = downloadUrl;
          setLoading(false);
          return;
        }
        throw new Error("Binary package has no downloadable file_url.");
      }

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

  if (downloadInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Download className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-lg font-bold text-white text-center">{downloadInfo.name}</h1>
        <p className="text-xs text-slate-400">Version {downloadInfo.version}</p>
        {downloadInfo.fallback && (
          <p className="text-[11px] text-amber-500/80 text-center max-w-sm">
            Original binary file was unavailable — a generated package is provided instead.
          </p>
        )}
        <a
          href={downloadInfo.url}
          download={downloadInfo.filename}
          className="mt-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download ZIP
        </a>
        <p className="text-[10px] text-slate-600 mt-2">Click the button to download your package.</p>
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