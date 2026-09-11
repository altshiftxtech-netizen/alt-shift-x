import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import JSZip from 'npm:jszip@3.10.1';

// PM-1A / Sovereign PWA Deployment Payload Generator
//
// When an `export_id` is provided, fetches the specific PwaExport record and
// builds a complete, branded zip package containing:
//   - manifest.json (PWA web-app manifest with favicons/icons)
//   - sw.js (Sovereign service worker)
//   - self-healing.js (auto repair shim)
//   - offline-bootloader.js (offline-first identity provisioning)
//   - boot-sequence.json
//   - apex-verification.json
//   - payload.json (full deployment payload with component metadata)
//   - favicon.png (referenced icon)
//   - README.txt
//
// Falls back to the legacy PM-1A-BOOTSTRAP-1.0 lookup when no export_id is given.

const PM1A_MASTER_ENDPOINT = 'https://pm-1a-master-x5.sovereign.local/api/v1';

const SELF_HEALING_SCRIPT = `#!/usr/bin/env node
// PM-1A Self-Healing Shim (auto)
// Monitors substrate health and auto-repairs on drift detection.
const PM1A = {
  check: async () => {
    const res = await fetch('${PM1A_MASTER_ENDPOINT}/health');
    return res.ok ? 'healthy' : 'degraded';
  },
  repair: async () => {
    console.log('[PM-1A] Drift detected — initiating auto-repair sequence...');
    const res = await fetch('${PM1A_MASTER_ENDPOINT}/repair', { method: 'POST' });
    return res.ok ? 'repaired' : 'failed';
  },
};
module.exports = PM1A;
`;

const OFFLINE_BOOTLOADER = `// PM-1A Offline-First Bootloader
// On first run, checks for local 6a21... identity before provisioning.
const BOOTLOADER = {
  identityPrefix: '6a21',
  boot: async () => {
    const stored = localStorage.getItem('pm1a_identity');
    if (!stored || !stored.startsWith('6a21')) {
      console.log('[PM-1A] No local 6a21 identity found — provisioning new substrate...');
      const id = '6a21' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('pm1a_identity', id);
      return { status: 'provisioned', identity: id };
    }
    return { status: 'active', identity: stored };
  },
};
export default BOOTLOADER;
`;

// Sovereign PWA Service Worker — included in every export package
const SERVICE_WORKER = `// Sovereign PWA Service Worker — PWA-AGENT-WRAPPER-1.0
// Neutral caching shell. Explicitly ignores /state/* routes (the Sovereign
// runtime state pages) so the PWA never caches or interferes with live state.
const CACHE_NAME = "sov-pwa-shell-v1";
const SHELL_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/state/")) return;
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
      )
    );
  }
});
`;

const INSTALL_BAT = '@echo off\r\nSET DIR=%~dp0\r\nSET HTML_PATH=%DIR%index.html\r\n:: Check for Edge or Chrome and launch in dedicated chromeless app window\r\nif exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (\r\n    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="file:///%HTML_PATH%" --start-maximized\r\n) else if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (\r\n    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="file:///%HTML_PATH%" --start-maximized\r\n) else (\r\n    start "" "%HTML_PATH%"\r\n)\r\n';
const INSTALL_SH = '#!/bin/bash\nDIR="$(cd "$(dirname "$0")" && pwd)"\nHTML_PATH="$DIR/index.html"\n# Try Chrome or Chromium in app mode\nfor CMD in "google-chrome" "chromium" "chromium-browser" "microsoft-edge"; do\n  if command -v "$CMD" >/dev/null 2>&1; then\n    "$CMD" --app="file:///$HTML_PATH" --start-maximized &\n    exit 0\n  fi\ndone\n# Fallback: open with default handler\nopen "$HTML_PATH" 2>/dev/null || xdg-open "$HTML_PATH"\n';

// ── Shared interactive engine infrastructure ──────────────────────────────
// Injected into every persona's <script> block — provides session persistence,
// live thinking indicators, and online AI gateway fetch with offline fallback.
const APP_BASE_URL = 'https://unlock-agent-flow.base44.app';
const PWA_API_ENDPOINT = APP_BASE_URL + '/functions/pwaQueryEngine';

const SHARED_ENGINE_CSS = `
    .thinking-dots::after { content: '...'; animation: think-pulse 1.2s infinite; }
    @keyframes think-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
    .msg-agent.thinking .bubble { opacity: 0.75; font-style: italic; }
    .msg-agent .bubble pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: inherit; }
`;

function buildSharedEngineJs(persona: string, compCode: string): string {
  return `
    const PERSONA = ${JSON.stringify(persona)};
    const COMP_CODE = ${JSON.stringify(compCode)};
    const API_ENDPOINT = ${JSON.stringify(PWA_API_ENDPOINT)};
    const SESSION_KEY = 'SOVEREIGN_SESSION_HISTORY';
    const MAX_HISTORY = 50;

    // ── Session persistence ──
    function loadHistory() {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; }
    }
    function saveHistory(history) {
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(history.slice(-MAX_HISTORY))); } catch {}
    }
    function addToHistory(role, text) {
      const history = loadHistory();
      history.push({ role: role, text: text, ts: Date.now() });
      saveHistory(history);
    }
    function renderHistory() {
      const history = loadHistory();
      if (history.length === 0) return;
      const empty = output.querySelector('.empty'); if (empty) empty.remove();
      history.forEach(function(msg) {
        var wrap = document.createElement('div'); wrap.className = 'msg-' + msg.role;
        if (msg.role === 'agent') { var label = document.createElement('div'); label.className = 'label'; label.textContent = COMP_NAME; wrap.appendChild(label); }
        var bubble = document.createElement('div'); bubble.className = 'bubble';
        bubble.textContent = msg.text; wrap.appendChild(bubble);
        output.appendChild(wrap);
      });
      output.scrollTop = output.scrollHeight;
    }

    // ── Thinking indicator ──
    function showThinking(msg) {
      var empty = output.querySelector('.empty'); if (empty) empty.remove();
      var wrap = document.createElement('div'); wrap.className = 'msg-agent thinking'; wrap.id = 'thinking-indicator';
      var label = document.createElement('div'); label.className = 'label'; label.textContent = COMP_NAME; wrap.appendChild(label);
      var bubble = document.createElement('div'); bubble.className = 'bubble';
      var span = document.createElement('span'); span.className = 'thinking-dots'; span.textContent = msg;
      bubble.appendChild(span); wrap.appendChild(bubble); output.appendChild(wrap);
      output.scrollTop = output.scrollHeight;
    }
    function hideThinking() {
      var t = document.getElementById('thinking-indicator'); if (t) t.remove();
    }
    function rotateThinking(phrases) {
      var i = 0;
      var dot = document.querySelector('#thinking-indicator .thinking-dots');
      if (!dot) return null;
      return setInterval(function() { i = (i + 1) % phrases.length; dot.textContent = phrases[i]; }, 1800);
    }

    // ── Online AI gateway fetch ──
    async function fetchAIResponse(query, history) {
      try {
        var res = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ component_code: COMP_CODE, query: query, history: history, persona: PERSONA })
        });
        if (!res.ok) return null;
        var data = await res.json();
        return data.response || null;
      } catch (e) { return null; }
    }

    // ── Async execution pipeline ──
    async function executeQuery(text, thinkingPhrases, offlineEngine) {
      addToHistory('user', text);
      showThinking(thinkingPhrases[0]);
      var rotator = rotateThinking(thinkingPhrases);

      var history = loadHistory();
      var response = await fetchAIResponse(text, history);

      if (rotator) clearInterval(rotator);
      hideThinking();

      if (!response) {
        response = offlineEngine(text);
      }

      addToHistory('agent', response);
      addMessage('agent', response);
      sendBtn.disabled = false;
      input.focus();
    }
  `;
}

function detectPersona(name: string, componentCodes: string[]): 'obsidian' | 'parchment' | 'maxviz' {
  const n = (name || '').toLowerCase();
  const codes = (componentCodes || []).join(' ').toLowerCase();
  const combined = n + ' ' + codes;
  if (combined.includes('gimmie g') || combined.includes('gmg') || combined.includes('gimmie-g')) return 'maxviz';
  if (combined.includes('we the people') || combined.includes('wtp') || combined.includes('civic')) return 'parchment';
  return 'obsidian';
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildIndexHtml(name, version, description, artifactCode, components, bootSequence) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const compJson = JSON.stringify(components || []);
  const primary = (components || [])[0] || {};
  const compType = primary.type || 'X5';
  const compName = primary.name || name;
  const compDesc = primary.description || description || '';
  const compFeatures = primary.features || [];
  const compSchema = primary.schema || [];
  const compCode = primary.code || artifactCode || '';

  // Type-specific UI labels
  const typeMeta = {
    X1: { label: 'Reading Protocol', icon: '📖', action: 'Read', placeholder: 'Enter text or upload a document to analyze…' },
    X2: { label: 'Prophecy Model', icon: '🔮', action: 'Predict', placeholder: 'Enter a scenario to forecast…' },
    X3: { label: 'Speed Profile', icon: '⚡', action: 'Run', placeholder: 'Enter a task to optimize…' },
    X4: { label: 'Reason Council', icon: '🧠', action: 'Deliberate', placeholder: 'Enter a question for the council…' },
    X5: { label: 'Agent', icon: '🤖', action: 'Send', placeholder: 'Ask the agent anything…' },
  };
  const tm = typeMeta[compType] || typeMeta.X5;

  // Build feature chips
  const featureChips = compFeatures.length > 0
    ? compFeatures.slice(0, 6).map(f => '<span class="chip">' + esc(f) + '</span>').join('')
    : '';

  // Build schema fields as form inputs
  const schemaFields = compSchema.length > 0
    ? compSchema.slice(0, 5).map(field => {
        const fld = (field || '').toString();
        return '<div class="schema-field"><label>' + esc(fld) + '</label>' +
               '<input type="text" data-field="' + esc(fld) + '" placeholder="Enter ' + esc(fld) + '…"></div>';
      }).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0a0e1a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>${esc(compName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e1a; color: #e2e8f0; min-height: 100vh; display: flex; flex-direction: column;
    }
    .header {
      background: linear-gradient(135deg, #0a0e1a, #1a2332);
      padding: 12px 16px; display: flex; align-items: center; gap: 10px;
      position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #1e293b;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .header .logo { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
    .header .title-wrap { flex: 1; min-width: 0; }
    .header h1 { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header .subtitle { font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px; }
    .header .type-badge {
      font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 5px;
    }
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
    .output {
      flex: 1; min-height: 180px; max-height: 340px; overflow-y: auto;
      background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px;
      font-size: 13px; line-height: 1.6; color: #cbd5e1;
    }
    .output .msg-user { text-align: right; margin-bottom: 10px; }
    .output .msg-user .bubble { display: inline-block; background: #1e3a5f; color: #dbeafe; padding: 8px 12px; border-radius: 12px 12px 2px 12px; max-width: 80%; }
    .output .msg-agent { margin-bottom: 10px; }
    .output .msg-agent .bubble { display: inline-block; background: #1a2332; color: #e2e8f0; padding: 8px 12px; border-radius: 12px 12px 12px 2px; max-width: 85%; }
    .output .msg-agent .label { font-size: 9px; color: #64748b; margin-bottom: 3px; }
    .output .empty { color: #475569; text-align: center; padding: 40px 0; font-size: 13px; }
    .input-row { display: flex; gap: 8px; align-items: flex-end; }
    .input-row textarea {
      flex: 1; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 12px;
      color: #e2e8f0; font-size: 13px; font-family: inherit; resize: none; min-height: 42px; max-height: 120px;
      outline: none; transition: border-color 0.15s;
    }
    .input-row textarea:focus { border-color: #fbbf24; }
    .input-row button {
      background: #fbbf24; color: #0a0e1a; border: none; border-radius: 10px; padding: 10px 16px;
      font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform 0.1s;
    }
    .input-row button:active { transform: scale(0.95); }
    .input-row button:disabled { opacity: 0.5; cursor: default; }
    .schema-fields { display: none; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .schema-fields.visible { display: flex; }
    .schema-field label { font-size: 10px; color: #64748b; display: block; margin-bottom: 3px; }
    .schema-field input {
      width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 8px 10px;
      color: #e2e8f0; font-size: 12px; outline: none;
    }
    .schema-field input:focus { border-color: #fbbf24; }
    .toolbar { display: flex; gap: 6px; margin-bottom: 10px; }
    .toolbar button {
      background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 6px 10px;
      font-size: 11px; cursor: pointer;
    }
    .toolbar button.active { background: #334155; color: #fbbf24; }
    .footer { padding: 10px 16px; text-align: center; border-top: 1px solid #1e293b; }
    .footer .ver { font-size: 9px; color: #334155; }
    ${SHARED_ENGINE_CSS}
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg" alt="${esc(compName)}">
    <div class="title-wrap">
      <h1>${esc(compName)}</h1>
      <div class="subtitle">
        <span class="type-badge type-${esc(compType)}">${esc(compType)} · ${esc(tm.label)}</span>
        <span>v${esc(version)}</span>
      </div>
    </div>
  </div>

  <div class="main">
    <div class="hero">
      <div class="icon">${tm.icon}</div>
      <h2>${esc(compName)}</h2>
      <p>${esc(compDesc)}</p>
      ${featureChips ? '<div class="chips">' + featureChips + '</div>' : ''}
    </div>

    <div class="interaction">
      <div class="toolbar">
        <button id="btn-chat" class="active">${esc(tm.action)}</button>
        ${schemaFields ? '<button id="btn-schema">Configure</button>' : ''}
      </div>

      ${schemaFields ? '<div class="schema-fields" id="schema-fields">' + schemaFields + '</div>' : ''}

      <div class="output" id="output">
        <div class="empty">${esc(tm.label)} ready. ${esc(tm.placeholder)}</div>
      </div>

      <div class="input-row">
        <textarea id="input" placeholder="${esc(tm.placeholder)}" rows="1"></textarea>
        <button id="send-btn">${esc(tm.action)}</button>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="ver">${esc(compCode)} · v${esc(version)}</div>
  </div>

  <script>
    const COMP_TYPE = ${JSON.stringify(compType)};
    const COMP_NAME = ${JSON.stringify(compName)};
    const TM = ${JSON.stringify(tm)};
    const SCHEMA_FIELDS = ${JSON.stringify(compSchema || [])};
    ${buildSharedEngineJs('obsidian', compCode)}

    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const btnChat = document.getElementById('btn-chat');
    const btnSchema = document.getElementById('btn-schema');
    const schemaFields = document.getElementById('schema-fields');

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Enter to send, Shift+Enter for newline
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    });

    sendBtn.addEventListener('click', doSend);

    // Toggle schema fields
    if (btnSchema) {
      btnSchema.addEventListener('click', () => {
        schemaFields.classList.toggle('visible');
        btnSchema.classList.toggle('active');
        btnChat.classList.toggle('active');
      });
      btnChat.addEventListener('click', () => {
        schemaFields.classList.remove('visible');
        btnSchema.classList.remove('active');
        btnChat.classList.add('active');
      });
    }

    function addMessage(role, text) {
      // Remove empty placeholder
      const empty = output.querySelector('.empty');
      if (empty) empty.remove();

      const wrap = document.createElement('div');
      wrap.className = 'msg-' + role;
      if (role === 'agent') {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = COMP_NAME;
        wrap.appendChild(label);
      }
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      output.appendChild(wrap);
      output.scrollTop = output.scrollHeight;
    }

    // ── PM-1A Forensic Dossier Analyzer (offline rule engine) ──
    function pm1aOfflineEngine(query) {
      var q = query.toLowerCase();
      var findings = [];
      var riskVectors = [];
      var actions = [];

      // Forensic keyword routing
      if (q.match(/evidence|chain.of.custody|artifact|exhibit/)) {
        findings.push('Evidence chain integrity analysis initiated. Artifact provenance and custody trail will be verified against the Sovereign Ledger.');
        riskVectors.push('Chain-of-custody gap risk — unverified transfer points may compromise evidentiary standing.');
        actions.push('Generate SHA-256 bit-stamp hash for each artifact and register under GSP-MASTER-INDEX-1.0.');
      }
      if (q.match(/breach|intrusion|exfiltrat|leak|compromis/)) {
        findings.push('Security breach forensics engaged. Intrusion vector analysis and forensic beacon deployment initiated.');
        riskVectors.push('Lateral movement risk — adversary may have established persistence across substrate boundaries.');
        actions.push('Deploy Forensic_Beacon canary tokens across all access policy boundaries. Initiate JA4 fingerprint enforcement.');
      }
      if (q.match(/audit|trail|log|compliance|governance/)) {
        findings.push('Audit trail integrity assessment. Sovereign Audit Watchdog golden hash verification initiated.');
        riskVectors.push('Audit log immutability risk — verify golden_hash against canonical invariant payload.');
        actions.push('Run Sovereign Audit Watchdog verification cycle. Confirm mtls_strict and apex_orchestrator_authorized flags.');
      }
      if (q.match(/subpoena|warrant|discovery|legal.hold/)) {
        findings.push('Legal discovery protocol activated. Evidence preservation and chain-of-custody documentation prepared for judicial submission.');
        riskVectors.push('Spoliation risk — ensure all forensic artifacts are bit-stamped before any substrate modification.');
        actions.push('Engage Exposure Hard-Stop protocol. Bit-stamp all session logic-state into the Truth Anchor before purge.');
      }
      if (q.match(/drift|anomal|tamper|unauthorized|access/)) {
        findings.push('Substrate drift detection engaged. Comparing current state against golden_hash invariant baseline.');
        riskVectors.push('State drift risk — unauthorized modification detected or suspected in the sovereign state record.');
        actions.push('Activate Self-Healing Shim. Initiate auto-repair sequence via PM-1A-MASTER-X5 endpoint.');
      }
      if (q.match(/key|encrypt|decrypt|crypto|cipher/)) {
        findings.push('Cryptographic key analysis. Enterprise key rotation and Sovereign Ledger verification initiated.');
        riskVectors.push('Key compromise risk — verify key_hash against active EnterpriseKey records in the ledger.');
        actions.push('Initiate Secure Handshake protocol for key re-transmission with forensic receipt verification.');
      }

      if (findings.length === 0) {
        findings.push('General forensic intake processing. Query routed through Blackstone Protocol analysis framework.');
        riskVectors.push('Unidentified query vector — apply standard sovereign defense posture and fail-closed logic.');
        actions.push('Log query to Forensic Audit Trail. Apply IP-based rate limiting and timing-safe comparison protocols.');
      }

      var response = 'FORENSIC DOSSIER ANALYSIS\\n';
      response += '═══════════════════════════════════\\n\\n';
      response += '1. FORENSIC ASSESSMENT\\n';
      findings.forEach(function(f, i) { response += '   ' + (i+1) + '. ' + f + '\\n'; });
      response += '\\n2. KEY FINDINGS\\n';
      response += '   • Blackstone Protocol: ' + (q.match(/breach|drift|tamper/) ? 'ACTIVE THREAT DETECTED' : 'Nominal posture maintained') + '\\n';
      response += '   • Substrate Integrity: ' + (q.match(/drift|anomal/) ? 'DRIFT SUSPECTED' : 'Verified against golden hash') + '\\n';
      response += '   • Audit Watchdog: ' + (q.match(/audit|compliance/) ? 'Verification cycle initiated' : 'Standing by') + '\\n';
      response += '\\n3. RISK VECTORS\\n';
      riskVectors.forEach(function(r) { response += '   ⚠ ' + r + '\\n'; });
      response += '\\n4. RECOMMENDED ACTIONS\\n';
      actions.forEach(function(a) { response += '   ▸ ' + a + '\\n'; });
      response += '\\n═══════════════════════════════════\\n';
      response += 'Protocol: Blackstone | Ledger: SOVEREIGN-KEY-MANAGER-1.0';

      return response;
    }

    function doSend() {
      var text = input.value.trim();
      if (!text) return;
      addMessage('user', text);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;

      var thinkingPhrases = [
        'Synthesizing forensic dossier...',
        'Evaluating evidence chain...',
        'Cross-referencing Sovereign Ledger...',
        'Running Blackstone Protocol analysis...',
        'Verifying substrate integrity...'
      ];

      executeQuery(text, thinkingPhrases, pm1aOfflineEngine);
    }

    // Restore conversation history on load
    renderHistory();
  </script>
</body>
</html>`;
}

function buildParchmentHtml(name, version, description, artifactCode, components, bootSequence) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const primary = (components || [])[0] || {};
  const compName = primary.name || name;
  const compDesc = primary.description || description || '';
  const compFeatures = primary.features || [];
  const compCode = primary.code || artifactCode || '';

  const featureChips = compFeatures.length > 0
    ? compFeatures.slice(0, 6).map(f => '<span class="chip">' + esc(f) + '</span>').join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#fbf7ee">
  <title>${esc(compName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100vw; height: 100vh; margin: 0; padding: 0; overflow: hidden; }
    body { font-family: Georgia, 'Cinzel', 'Times New Roman', serif; background: #fbf7ee; color: #2b1d0c; display: flex; flex-direction: column; }
    body::before { content: ""; position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 60%, rgba(139,94,52,0.1) 100%); pointer-events: none; z-index: 1; }
    /* Fixed Top Header (56px) */
    .header { height: 56px; background: linear-gradient(135deg, #f4ede0, #e8dcc8); padding: 0 16px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #8b5e34; box-shadow: 0 2px 12px rgba(74,53,37,0.15); position: relative; z-index: 2; flex-wrap: nowrap; flex-shrink: 0; overflow: hidden; }
    .header .seal { font-size: 22px; flex-shrink: 0; }
    .header .title-wrap { flex: 1; min-width: 0; overflow: hidden; }
    .header h1 { font-size: 15px; font-weight: 700; color: #2b1d0c; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header .subtitle { font-size: 10px; color: #6b5239; font-style: italic; }
    .header .badge { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 3px; background: #8b5e34; color: #fbf7ee; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0; }
    .header .btn { font-size: 10px; padding: 5px 10px; border-radius: 4px; background: #4a3525; color: #fbf7ee; border: 1px solid #8b5e34; cursor: pointer; font-family: Georgia, serif; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
    .header .btn:hover { background: #8b5e34; }
    .header .btn-fs { background: #2b1d0c; border-color: #2b1d0c; font-weight: 700; }
    .header .btn-fs:hover { background: #4a3525; }
    /* Central Viewport — two-column split, no outer page scroll */
    .viewport { flex: 1; height: calc(100vh - 110px); display: flex; gap: 16px; padding: 12px; overflow: hidden; position: relative; z-index: 2; }
    .pane { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .pane-left { max-width: 40%; }
    .pane-right { max-width: 60%; }
    .pane h3 { font-size: 13px; font-weight: 700; color: #2b1d0c; margin-bottom: 8px; border-bottom: 1px solid #d4c4a8; padding-bottom: 4px; font-family: 'Cinzel', Georgia, serif; flex-shrink: 0; }
    .dossier { background: #f9f6ee; border: 1px solid #8b5e34; border-radius: 6px; padding: 14px; flex: 1; overflow-y: auto; box-shadow: 0 2px 8px rgba(74,53,37,0.08); }
    .feed { font-size: 12px; line-height: 1.8; color: #4a3525; }
    .feed .entry { padding: 4px 0; border-bottom: 1px dotted #d4c4a8; }
    .feed .entry:last-child { border-bottom: none; }
    .feed .entry .label { font-weight: 700; color: #8b5e34; }
    .output { flex: 1; overflow-y: auto; background: #f4ede0; border: 1px solid #8b5e34; border-radius: 6px; padding: 12px; font-size: 12px; line-height: 1.7; color: #2b1d0c; }
    .output .msg-user { text-align: right; margin-bottom: 8px; }
    .output .msg-user .bubble { display: inline-block; background: #e8dcc8; color: #2b1d0c; padding: 8px 12px; border-radius: 6px 6px 0 6px; max-width: 80%; border: 1px solid #8b5e34; }
    .output .msg-agent { margin-bottom: 8px; }
    .output .msg-agent .bubble { display: inline-block; background: #f9f6ee; color: #2b1d0c; padding: 8px 12px; border-radius: 6px 6px 6px 0; max-width: 85%; border: 1px solid #d4c4a8; }
    .output .msg-agent .label { font-size: 9px; color: #8b5e34;!margin-bottom: 3px; font-weight: 700; }
    .output .empty { color: #8b5e34; text-align: center; padding: 30px 0; font-style: italic; }
    /* Fixed Bottom Composer Bar (54px) */
    .composer { height: 54px; display: flex; gap: 8px; align-items: center; padding: 0 16px; border-top: 2px solid #8b5e34; background: #f4ede0; position: relative; z-index: 2; flex-shrink: 0; }
    .composer textarea { flex: 1; background: #f9f6ee; border: 1px solid #8b5e34; border-radius: 6px; padding: 8px 12px; color: #2b1d0c; font-size: 12px; font-family: Georgia, serif; resize: none; height: 38px; outline: none; }
    .composer textarea:focus { border-color: #b8860b; }
    .composer button { background: #8b5e34; color: #fbf7ee; border: 1px solid #4a3525; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: Georgia, serif; white-space: nowrap; flex-shrink: 0; }
    .composer button:hover { background: #b8860b; }
    .composer button:disabled { opacity: 0.5; }
    .state-hook { font-size: 9px; color: #6b5239; font-family: monospace; }
    ${SHARED_ENGINE_CSS}
</head>
<body>
  <div class="header">
    <span class="seal">⚖️</span>
    <div class="title-wrap">
      <h1>${esc(compName)}</h1>
      <div class="subtitle">Civic Sovereign Standard · v${esc(version)}</div>
    </div>
    <span class="badge">Blackstone Legal Shield</span>
    <button class="btn" onclick="alert('New Civic Dossier initiated.')">➕ New</button>
    <button class="btn btn-fs" id="btn-fullscreen" title="Toggle Max Viz Fullscreen (F11 / Ctrl+F)">⛶ Max Viz Fullscreen</button>
    <button class="btn" onclick="window.close()">🚪 Exit</button>
  </div>
  <div class="viewport">
    <div class="pane pane-left">
      <h3>📜 Constitutional Citations</h3>
      <div class="dossier">
        <div class="feed" id="feed">
          <div class="entry"><span class="label">Art. I:</span> Legislative powers vested in Congress.</div>
          <div class="entry"><span class="label">Art. II:</span> Executive power vested in the President.</div>
          <div class="entry"><span class="label">Art. III:</span> Judicial power extends to all cases in law and equity.</div>
          <div class="entry"><span class="label">Amend. I:</span> No law respecting establishment of religion, or prohibiting free exercise.</div>
          <div class="entry"><span class="label">Amend. IV:</span> Right to be secure in persons, houses, papers, and effects.</div>
          <div class="entry"><span class="label">Amend. XIV:</span> No State shall deprive any person of life, liberty, or property without due process.</div>
        </div>
      </div>
    </div>
    <div class="pane pane-right">
      <h3>⚖️ Deliberation Chat</h3>
      <div class="output" id="output">
        <div class="empty">Civic dossier ready. Present your constitutional query…</div>
      </div>
    </div>
  </div>
  <div class="composer">
    <textarea id="input" placeholder="Enter your constitutional inquiry…" rows="1"></textarea>
    <button id="send-btn">Deliberate</button>
  </div>
  <script>
    const COMP_NAME = ${JSON.stringify(compName)};
    ${buildSharedEngineJs('parchment', compCode)}

    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const fsBtn = document.getElementById('btn-fullscreen');
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 38) + 'px'; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
    sendBtn.addEventListener('click', doSend);
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'q') { window.close(); } });
    // Max Viz Fullscreen toggle
    function toggleFullscreen() {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); }
      else { document.exitFullscreen().catch(() => {}); }
    }
    fsBtn.addEventListener('click', toggleFullscreen);
    // Hotkey: F11 or Ctrl+F
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11' || (e.ctrlKey && e.key === 'f')) { e.preventDefault(); toggleFullscreen(); }
    });
    // Auto-fullscreen on first user interaction
    let firstInteract = true;
    function autoFullscreen() {
      if (firstInteract && !document.fullscreenElement) {
        firstInteract = false;
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    document.addEventListener('click', autoFullscreen, { once: true });
    document.addEventListener('keydown', autoFullscreen, { once: true });
    function addMessage(role, text) {
      const empty = output.querySelector('.empty'); if (empty) empty.remove();
      const wrap = document.createElement('div'); wrap.className = 'msg-' + role;
      if (role === 'agent') { const label = document.createElement('div'); label.className = 'label'; label.textContent = COMP_NAME; wrap.appendChild(label); }
      const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text; wrap.appendChild(bubble);
      output.appendChild(wrap); output.scrollTop = output.scrollHeight;
    }

    // ── Constitutional Jurisprudence Engine (offline) ──
    // Indexes all 27 Amendments and Key Articles. Parses user query for
    // keywords and returns structured constitutional analysis citing
    // specific amendments, historical precedent, and Blackstone mappings.
    var AMENDMENTS = {
      1: 'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.',
      2: 'A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.',
      3: 'No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.',
      4: 'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause.',
      5: 'No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury... nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law.',
      6: 'In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury... and to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence.',
      7: 'In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved.',
      8: 'Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted.',
      9: 'The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people.',
      10: 'The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.',
      11: 'The Judicial power of the United States shall not be construed to extend to any suit in law or equity, commenced or prosecuted against one of the United States by Citizens of another State.',
      12: 'The Electors shall meet in their respective states, and vote by ballot for President and Vice-President.',
      13: 'Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States.',
      14: 'All persons born or naturalized in the United States... are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens... nor deny to any person within its jurisdiction the equal protection of the laws.',
      15: 'The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude.',
      16: 'The Congress shall have power to lay and collect taxes on incomes, from whatever source derived, without apportionment among the several States.',
      17: 'The Senate of the United States shall be composed of two Senators from each State, elected by the people thereof.',
      18: 'The manufacture, sale, or transportation of intoxicating liquors... is hereby prohibited. (Repealed by Amendment 21)',
      19: 'The right of citizens of the United States to vote shall not be denied or abridged... on account of sex.',
      20: 'The terms of the President and Vice President shall end at noon on the 20th day of January.',
      21: 'The eighteenth article of amendment to the Constitution of the United States is hereby repealed.',
      22: 'No person shall be elected to the office of the President more than twice.',
      23: 'The District constituting the seat of Government of the United States shall appoint Electors for President and Vice President.',
      24: 'The right of citizens... to vote in any primary or other election for President or Vice President... shall not be denied or abridged by reason of failure to pay any poll tax or other tax.',
      25: 'In case of the removal of the President from office or of his death or resignation, the Vice President shall become President.',
      26: 'The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged on account of age.',
      27: 'No law, varying the compensation for the services of the Senators and Representatives, shall take effect, until an election of Representatives shall have intervened.'
    };

    var KEYWORD_MAP = {
      'speech': { amend: 1, topic: 'Freedom of Speech', precedent: "Schenck v. United States (1919) — 'clear and present danger' test; Brandenburg v. Ohio (1969) — 'imminent lawless action' standard.", blackstone: 'Blackstone Commentaries I.9: liberty of the press as essential to a free state.' },
      'press': { amend: 1, topic: 'Freedom of the Press', precedent: 'Near v. Minnesota (1931) — prior restraint generally unconstitutional; New York Times v. Sullivan (1964) — actual malice standard for libel of public officials.', blackstone: 'Blackstone I.12: liberty of the press as a bulwark against tyranny.' },
      'religion': { amend: 1, topic: 'Free Exercise & Establishment', precedent: "Reynolds v. United States (1878) — belief vs. action distinction; Lemon v. Kurtzman (1971) — three-prong Establishment test; Employment Division v. Smith (1990).", blackstone: 'Blackstone I.10: offenses against God and religion.' },
      'assemble|assembly|protest': { amend: 1, topic: 'Right to Assemble', precedent: 'De Jonge v. Oregon (1937) — incorporation against states; NAACP v. Alabama (1958) — freedom of association.', blackstone: 'Blackstone I.1: absolute rights of individuals.' },
      'arms|gun|firearm|second amendment': { amend: 2, topic: 'Right to Bear Arms', precedent: 'District of Columbia v. Heller (2008) — individual right to possess firearms; McDonald v. Chicago (2010) — incorporated against states.', blackstone: 'Blackstone I.1: right of having and using arms for self-preservation and defence.' },
      'search|seizure|warrant|fourth amendment': { amend: 4, topic: 'Search and Seizure', precedent: 'Katz v. United States (1967) — reasonable expectation of privacy; Terry v. Ohio (1968) — stop-and-frisk; Mapp v. Ohio (1961) — exclusionary rule.', blackstone: 'Blackstone III.23: general warrants as grievous oppression.' },
      'jury|trial': { amend: 6, topic: 'Right to Jury Trial', precedent: 'Duncan v. Louisiana (1968) — jury trial for serious offenses; Gideon v. Wainwright (1963) — right to counsel.', blackstone: 'Blackstone III.35: trial by jury as the glory of English law.' },
      'due process': { amend: 5, topic: 'Due Process', precedent: 'Procedural: Mathews v. Eldridge (1976) — balancing test. Substantive: Roe v. Wade (1973); Planned Parenthood v. Casey (1992).', blackstone: 'Blackstone III.9: law of the land as protection against arbitrary deprivation.' },
      'self.incriminat|silence|fifth amendment|plead the fifth': { amend: 5, topic: 'Self-Incrimination', precedent: 'Miranda v. Arizona (1966) — custodial interrogation warnings; Griffin v. California (1965) — no adverse inference from silence.', blackstone: 'Blackstone III.8: nemo tenetur seipsum prodere — no man bound to accuse himself.' },
      'double jeopardy': { amend: 5, topic: 'Double Jeopardy', precedent: 'Benton v. Maryland (1969) — incorporated against states; Blockburger v. United States (1932) — same elements test.', blackstone: 'Blackstone IV.30: former jeopardy as bar to second prosecution.' },
      'bail|fine|cruel|punishment|eighth amendment': { amend: 8, topic: 'Cruel and Unusual Punishment', precedent: 'Furman v. Georgia (1972) — death penalty standards; Gregg v. Georgia (1976) — guided discretion; Solem v. Helm (1983) — proportionality.', blackstone: 'Blackstone IV.12: proportionality of punishment.' },
      'equal|discriminat|fourteenth amendment|civil rights': { amend: 14, topic: 'Equal Protection', precedent: 'Brown v. Board of Education (1954) — segregation unconstitutional; Reed v. Reed (1971) — gender classification; Obergefell v. Hodges (2015) — marriage equality.', blackstone: 'Blackstone I.1: absolute rights common to all.' },
      'citizen|naturaliz|immigration': { amend: 14, topic: 'Citizenship', precedent: 'United States v. Wong Kim Ark (1898) — birthright citizenship; Plyler v. Doe (1982) — equal protection for undocumented children.', blackstone: 'Blackstone I.10: perpetual allegiance and naturalization.' },
      'vote|voting|suffrage|ballot': { amend: 15, topic: 'Voting Rights', precedent: 'Shelby County v. Holder (2013) — VRA preclearance struck; Harper v. Virginia Board (1966) — poll tax unconstitutional.', blackstone: 'Blackstone I.2: right of election as fundamental.' },
      'tax|income|revenue|commerce': { amend: 16, topic: 'Taxation & Commerce', precedent: 'Brushaber v. Union Pacific (1916) — income tax constitutional; Wickard v. Filburn (1942) — broad commerce power; McCulloch v. Maryland (1819) — federal taxing power.', blackstone: 'Blackstone I.7: revenue as the sinews of the state.' },
      'commerce|interstate|trade': { amend: 1, topic: 'Commerce Clause (Art. I §8)', precedent: 'Gibbons v. Ogden (1824) — federal commerce supremacy; Lopez v. United States (1995) — limits on commerce power; NFIB v. Sebelius (2012).', blackstone: 'Blackstone I.7: regulation of trade as sovereign prerogative.' },
      'president|executive|impeach': { amend: 25, topic: 'Executive Power (Art. II)', precedent: 'Youngstown Sheet v. Sawyer (1952) — presidential power limits; Clinton v. Jones (1997) — civil suit during office; Nixon v. United States (1993) — impeachment justiciability.', blackstone: 'Blackstone I.3: prerogative of the sovereign.' },
      'slavery|involuntary|thirteenth': { amend: 13, topic: 'Abolition of Slavery', precedent: 'Bailey v. Alabama (1911) — peonage unconstitutional; Jones v. Alfred H. Mayer (1968) — 13th Amendment private action.', blackstone: 'Blackstone I.14: master and servant — but rejected by amendment.' },
      'privacy': { amend: 4, topic: 'Right to Privacy', precedent: 'Griswold v. Connecticut (1965) — penumbral privacy right; Roe v. Wade (1973); Lawrence v. Texas (2003) — intimate conduct.', blackstone: 'Blackstone III.1: right to personal security.' },
      'quartering|soldier|third amendment': { amend: 3, topic: 'Quartering of Troops', precedent: 'Engblom v. Carey (2d Cir. 1982) — only modern Third Amendment case.', blackstone: 'Blackstone III.13: quartering acts as grievance in Declaration.' },
      'states.rights|federalism|tenth': { amend: 10, topic: 'States\' Rights / Federalism', precedent: 'Printz v. United States (1997) — anti-commandeering; New York v. United States (1992) — Tenth Amendment limits.', blackstone: 'Blackstone I.1: reserved rights of the people.' },
      'enumerated|retained|ninth': { amend: 9, topic: 'Unenumerated Rights', precedent: 'Griswold v. Connecticut (1965) — penumbras; Roe v. Wade (1973) — privacy under 9th and 14th.', blackstone: 'Blackstone I.1: absolute rights not all enumerated.' },
    };

    function parchmentOfflineEngine(query) {
      var q = query.toLowerCase();
      var matched = [];
      var citedAmendments = [];
      var precedents = [];
      var blackstoneMaps = [];

      for (var kw in KEYWORD_MAP) {
        var kwRe = new RegExp(kw, 'i');
        if (kwRe.test(q)) {
          var info = KEYWORD_MAP[kw];
          matched.push(info.topic);
          citedAmendments.push(info.amend);
          precedents.push(info.precedent);
          blackstoneMaps.push(info.blackstone);
        }
      }

      if (matched.length === 0) {
        return 'CONSTITUTIONAL ANALYSIS\\n═══════════════════════════════════\\n\\n1. CONSTITUTIONAL ASSESSMENT\\n   Your inquiry does not match a specific constitutional provision in the offline index. For a full analysis of this query, an online connection is recommended to access the complete jurisprudence database.\\n\\n2. RELEVANT PROVISIONS\\n   No specific amendment or article matched your query keywords. Consider rephrasing with terms like: speech, press, religion, arms, search, seizure, due process, jury, equal protection, commerce, or voting rights.\\n\\n3. GENERAL GUIDANCE\\n   All governmental action must comply with the Constitution. If your inquiry concerns a government action, identify which branch (legislative, executive, or judicial) is involved, and which right or power may be affected.\\n\\n4. BLACKSTONE MAPPING\\n   William Blackstone\\'s Commentaries on the Laws of England (1765-69) remain the foundational common-law reference. The U.S. Constitution\\'s structure draws heavily from Blackstone\\'s analysis of natural rights, separation of powers, and the rule of law.\\n\\n═══════════════════════════════════\\nFramework: We the People · Blackstone Legal Shield';
      }

      // Deduplicate amendments
      var uniqueAmendments = citedAmendments.filter(function(v, i, a) { return a.indexOf(v) === i; });
      uniqueAmendments.sort(function(a, b) { return a - b; });

      var response = 'CONSTITUTIONAL ANALYSIS\\n';
      response += '═══════════════════════════════════\\n\\n';
      response += '1. CONSTITUTIONAL ASSESSMENT\\n';
      response += '   Your inquiry touches on: ' + matched.join(', ') + '.\\n\\n';
      response += '2. RELEVANT AMENDMENTS & ARTICLES\\n';
      uniqueAmendments.forEach(function(a) {
        response += '   Amendment ' + a + ': ' + AMENDMENTS[a].substring(0, 120) + (AMENDMENTS[a].length > 120 ? '...' : '') + '\\n';
      });
      response += '\\n3. HISTORICAL PRECEDENT\\n';
      precedents.forEach(function(p) { response += '   • ' + p + '\\n'; });
      response += '\\n4. BLACKSTONE DEFENSE MAPPING\\n';
      blackstoneMaps.forEach(function(b) { response += '   ▸ ' + b + '\\n'; });
      response += '\\n═══════════════════════════════════\\n';
      response += 'Framework: We the People · Blackstone Legal Shield';

      return response;
    }

    function doSend() {
      var text = input.value.trim(); if (!text) return;
      addMessage('user', text); input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;

      var thinkingPhrases = [
        'Evaluating constitutional nexus...',
        'Citing amendments and precedent...',
        'Cross-referencing Blackstone Commentaries...',
        'Synthesizing jurisprudential analysis...',
        'Mapping defense provisions...'
      ];

      executeQuery(text, thinkingPhrases, parchmentOfflineEngine);
    }

    // Restore conversation history on load
    renderHistory();
  </script>
</body>
</html>`;
}

function buildMaxVizHtml(name, version, description, artifactCode, components, bootSequence) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const primary = (components || [])[0] || {};
  const compName = primary.name || name;
  const compDesc = primary.description || description || '';
  const compFeatures = primary.features || [];
  const compCode = primary.code || artifactCode || '';

  const featureChips = compFeatures.length > 0
    ? compFeatures.slice(0, 6).map(f => '<span class="chip">' + esc(f) + '</span>').join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0a0f1d">
  <title>${esc(compName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100vw; height: 100vh; margin: 0; padding: 0; overflow: hidden; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f1d; color: #fff; display: flex; flex-direction: column; }
    /* Fixed Top Header (56px) */
    .header { height: 56px; background: linear-gradient(135deg, #0a0f1d, #1a1f3d); padding: 0 16px; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #00CCFF; box-shadow: 0 0 20px rgba(0,204,255,0.2); flex-wrap: nowrap; flex-shrink: 0; overflow: hidden; }
    .header .mascot { font-size: 24px; flex-shrink: 0; }
    .header .title-wrap { flex: 1; min-width: 0; overflow: hidden; }
    .header h1 { font-size: 15px; font-weight: 800; color: #00CCFF; text-shadow: 0 0 8px rgba(0,204,255,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header .subtitle { font-size: 10px; color: #9900FF; font-weight: 600; }
    .header .pill { font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: linear-gradient(90deg, #00CCFF, #0066FF, #9900FF); color: #fff; white-space: nowrap; flex-shrink: 0; }
    .header .safe { font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: #00FF66; color: #003300; white-space: nowrap; flex-shrink: 0; }
    .header .btn { font-size: 11px; padding: 7px 12px; border-radius: 14px; background: linear-gradient(135deg, #0066FF, #00CCFF); color: #fff; border: none; cursor: pointer; font-weight: 700; white-space: nowrap; transition: transform 0.15s; box-shadow: 0 4px 12px rgba(0,102,255,0.3); flex-shrink: 0; }
    .header .btn:hover { transform: scale(1.05); }
    .header .btn:active { transform: scale(0.95); }
    .header .btn-fs { background: linear-gradient(135deg, #9900FF, #00CCFF); }
    /* Central Viewport — two-column split, no outer page scroll */
    .viewport { flex: 1; height: calc(100vh - 110px); display: flex; gap: 16px; padding: 12px; overflow: hidden; }
    .pane { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .pane-left { max-width: 40%; }
    .pane-right { max-width: 60%; }
    .pane h3 { font-size: 13px; font-weight: 700; color: #00CCFF; margin-bottom: 8px; flex-shrink: 0; }
    .hub-panel { flex: 1; overflow-y: auto; background: #11172e; border: 2px solid rgba(0,204,255,0.3); border-radius: 16px; padding: 14px; }
    .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .hub-card { background: linear-gradient(135deg, #11172e, #1a2040); border-radius: 16px; padding: 14px; text-align: center; cursor: pointer; transition: transform 0.15s; border: 2px solid rgba(0,204,255,0.2); }
    .hub-card:hover { transform: translateY(-3px); border-color: #00CCFF; box-shadow: 0 6px 16px rgba(0,204,255,0.2); }
    .hub-card .icon { font-size: 28px; margin-bottom: 4px; }
    .hub-card .label { font-size: 11px; font-weight: 700; color: #00CCFF; }
    .hub-card .desc { font-size: 9px; color: #6677aa; }
    .output { flex: 1; overflow-y: auto; background: #11172e; border: 2px solid rgba(0,204,255,0.3); border-radius: 16px; padding: 14px; font-size: 13px; line-height: 1.6; color: #ddeeff; }
    .output .msg-user { text-align: right; margin-bottom: 8px; }
    .output .msg-user .bubble { display: inline-block; background: linear-gradient(135deg, #0066FF, #00CCFF); color: #fff; padding: 8px 12px; border-radius: 16px 16px 0 16px; max-width: 80%; }
    .output .msg-agent { margin-bottom: 8px; }
    .output .msg-agent .bubble { display: inline-block; background: linear-gradient(135deg, #9900FF, #0066FF); color: #fff; padding: 8px 12px; border-radius: 16px 16px 16px 0; max-width: 85%; }
    .output .msg-agent .label { font-size: 9px; color: #9900FF; margin-bottom: 3px; font-weight: 700; }
    .output .empty { color: #445577; text-align: center; padding: 30px 0; }
    /* Fixed Bottom Composer Bar (54px) */
    .composer { height: 54px; display: flex; gap: 8px; align-items: center; padding: 0 16px; border-top: 2px solid rgba(0,204,255,0.3); background: #0a0f1d; flex-shrink: 0; }
    .composer textarea { flex: 1; background: #11172e; border: 2px solid rgba(0,204,255,0.3); border-radius: 14px; padding: 8px 12px; color: #fff; font-size: 13px; font-family: inherit; resize: none; height: 38px; outline: none; }
    .composer textarea:focus { border-color: #00CCFF; }
    .composer button { background: linear-gradient(135deg, #00CCFF, #0066FF); color: #fff; border: none; border-radius: 14px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform 0.15s; box-shadow: 0 4px 12px rgba(0,204,255,0.3); flex-shrink: 0; }
    .composer button:hover { transform: scale(1.05); }
    .composer button:active { transform: scale(0.95); }
    .composer button:disabled { opacity: 0.5; }
    ${SHARED_ENGINE_CSS}
</head>
<body>
  <div class="header">
    <span class="mascot">🤖</span>
    <div class="title-wrap">
      <h1>🎓 ${esc(compName)}</h1>
      <div class="subtitle">Genesis · v${esc(version)}</div>
    </div>
    <span class="pill">Learn • Play • Grow</span>
    <span class="safe">🟢 COPPA Child-Safe</span>
    <button class="btn" onclick="alert('Progress Vault!')">🏆 Vault</button>
    <button class="btn btn-fs" id="btn-fullscreen" title="Toggle Max Viz Fullscreen (F11 / Ctrl+F)">⛶ Max Viz Fullscreen</button>
    <button class="btn" onclick="window.close()">🚪 Exit</button>
  </div>
  <div class="viewport">
    <div class="pane pane-left">
      <h3>🎯 Game Hub</h3>
      <div class="hub-panel">
        <div class="hub-grid">
          <div class="hub-card" onclick="document.getElementById('input').value='Memory Match'; doSend();"><div class="icon">🧠</div><div class="label">Memory</div><div class="desc">Brain training</div></div>
          <div class="hub-card" onclick="document.getElementById('input').value='Logic Puzzle'; doSend();"><div class="icon">🔢</div><div class="label">Logic</div><div class="desc">Problem solving</div></div>
          <div class="hub-card" onclick="document.getElementById('input').value='Language Quest'; doSend();"><div class="icon">📚</div><div class="label">Language</div><div class="desc">Word power</div></div>
          <div class="hub-card" onclick="document.getElementById('input').value='Visual Quest'; doSend();"><div class="icon">🎨</div><div class="label">Visual</div><div class="desc">Perception</div></div>
        </div>
      </div>
    </div>
    <div class="pane pane-right">
      <h3>💬 Deliberation Chat</h3>
      <div class="output" id="output">
        <div class="empty">Hi friend! I am Gimmie G! Pick a game or ask me anything! 🎮</div>
      </div>
    </div>
  </div>
  <div class="composer">
    <textarea id="input" placeholder="Type your question or pick a game! 🎈" rows="1"></textarea>
    <button id="send-btn">Let's Play!</button>
  </div>
  <script>
    const COMP_NAME = ${JSON.stringify(compName)};
    ${buildSharedEngineJs('maxviz', compCode)}

    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const fsBtn = document.getElementById('btn-fullscreen');
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 38) + 'px'; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
    sendBtn.addEventListener('click', doSend);
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'q') { window.close(); } });
    // Max Viz Fullscreen toggle
    function toggleFullscreen() {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); }
      else { document.exitFullscreen().catch(() => {}); }
    }
    fsBtn.addEventListener('click', toggleFullscreen);
    // Hotkey: F11 or Ctrl+F
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11' || (e.ctrlKey && e.key === 'f')) { e.preventDefault(); toggleFullscreen(); }
    });
    // Auto-fullscreen on first user interaction
    let firstInteract = true;
    function autoFullscreen() {
      if (firstInteract && !document.fullscreenElement) {
        firstInteract = false;
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    document.addEventListener('click', autoFullscreen, { once: true });
    document.addEventListener('keydown', autoFullscreen, { once: true });
    function addMessage(role, text) {
      const empty = output.querySelector('.empty'); if (empty) empty.remove();
      const wrap = document.createElement('div'); wrap.className = 'msg-' + role;
      if (role === 'agent') { const label = document.createElement('div'); label.className = 'label'; label.textContent = COMP_NAME; wrap.appendChild(label); }
      const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text; wrap.appendChild(bubble);
      output.appendChild(wrap); output.scrollTop = output.scrollHeight;
    }

    // ── Cognitive Fun Hub (offline rule engine) ──
    // Routes queries through 5 domains: Memory, Logic, Language, Math, Puzzles
    // with interactive challenges and playful, child-safe dialogue.
    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function maxvizOfflineEngine(query) {
      var q = query.toLowerCase();

      // Memory domain
      if (q.match(/memory|remember|recall|match/)) {
        return '🧠 MEMORY CHALLENGE!\\n\\nI am thinking of 3 things: a 🐶 puppy, a 🌟 star, and a 🍎 apple!\\n\\nCan you remember all 3? Take 5 seconds to memorize them, then tell me what they were!\\n\\nMemory is like a muscle — the more you use it, the stronger it gets! 💪';
      }

      // Logic domain
      if (q.match(/logic|puzzle|riddle|think|brain/)) {
        return '🔢 LOGIC PUZZLE!\\n\\nHere is a fun one:\\nI am an odd number. Take away one letter and I become even. What number am I?\\n\\nHint: Think about how the word is spelled! 🤔\\n\\n(Answer: SEVEN — take away the S and it becomes EVEN!) 🎉';
      }

      // Language domain
      if (q.match(/word|language|spell|letter|read|write|story/)) {
        return '📚 LANGUAGE QUEST!\\n\\nLet us play a word game! Can you think of a word that starts with the same letter as your name?\\n\\nFor example, if your name starts with B, you could say: Butterfly, Banana, or Brilliant! 🦋\\n\\nWords are like magic keys — they unlock new ideas and adventures! ✨';
      }

      // Math domain
      if (q.match(/math|number|count|add|subtract|multiply|divide|plus|minus|times/)) {
        return '🔢 MATH ADVENTURE!\\n\\nHere is a fun challenge:\\nIf you have 5 cookies 🍪 and share 2 with a friend, how many do you have left?\\n\\nMath is everywhere — in cookies, in stars, in music beats! Can you find 3 things you can count in your room? 🌟';
      }

      // Visual / art domain
      if (q.match(/draw|color|paint|art|picture|visual/)) {
        return '🎨 VISUAL QUEST!\\n\\nLet us play an imagination game! Close your eyes and picture a magical tree. What color are its leaves? Are they green, purple, or rainbow? 🌈\\n\\nNow open your eyes and describe what you saw! Your imagination is a superpower! 🦸';
      }

      // Greeting detection
      if (q.match(/hi|hello|hey|gimmie|what.*your name/)) {
        return 'Hi friend! I am Gimmie G! 🤖 I love to learn and play!\\n\\nPick a game from the Game Hub, or ask me about:\\n🧠 Memory · 🔢 Logic · 📚 Language · 🔢 Math · 🎨 Visual\\n\\nWhat would you like to explore today? 🎈';
      }

      // Default playful response with challenge
      var challenges = [
        '🌟 Great question! Let us explore it together! Can you think of 3 things related to "' + query.substring(0, 40) + '"? Name them out loud!',
        '🤔 Ooh, interesting! I have a challenge for you: Can you draw what "' + query.substring(0, 30) + '" looks like? Use your imagination!',
        '🎉 I love your curiosity! Quick game: Can you spell your favorite word backward? Try it — it is like a brain workout!',
        '✨ Awesome question! Let us play a guessing game: I am thinking of something that starts with the letter A. Can you guess what it is?'
      ];
      return pickRandom(challenges) + '\\n\\nRemember: Every question makes your brain stronger! 💪🧠';
    }

    function doSend() {
      var text = input.value.trim(); if (!text) return;
      addMessage('user', text); input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;

      var thinkingPhrases = [
        'Gathering ideas... 🌟',
        'Picking a fun challenge... 🎮',
        'Spinning up the Fun Hub... 🎉',
        'Getting ready to play... 🎈',
        'Thinking of something awesome... ✨'
      ];

      executeQuery(text, thinkingPhrases, maxvizOfflineEngine);
    }

    // Restore conversation history on load
    renderHistory();
  </script>
</body>
</html>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const apexKey = body?.apex_key;
    const exportId = body?.export_id;

    // ── Auth: allow direct admin calls OR service-role invocations (from getHostedPwa) ──
    let user = null;
    let isServiceRole = false;
    try { user = await base44.auth.me(); } catch { isServiceRole = true; }
    if (!user && !isServiceRole) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    // ── Apex Key verification (Sovereign Ledger handshake) — optional ─────────
    let verifiedKey = null;
    if (apexKey && typeof apexKey === 'string' && apexKey.trim().length >= 8) {
      const keyHash = await sha256(apexKey.trim());
      const keys = await base44.asServiceRole.entities.EnterpriseKey.filter({
        key_hash: keyHash, status: 'active',
      }, '-created_date', 10);
      verifiedKey = keys.find(k => k.status === 'active');
      if (!verifiedKey) {
        return Response.json({
          error: 'Apex Key verification failed — key not found or revoked in the Sovereign Ledger.',
        }, { status: 403 });
      }
    }

    // ── Resolve the PwaExport record ─────────────────────────────────────────
    let exportRecord = null;
    let componentCodes: string[] = [];
    let pwaName = 'Patriot Machine 1A';
    let pwaVersion = '1.0';
    let pwaDescription = 'Sovereign PWA deployment package.';
    let endpointUrl: string | null = null;

    if (exportId) {
      exportRecord = await base44.asServiceRole.entities.PwaExport.get(exportId).catch(() => null);
      if (!exportRecord) {
        return Response.json({ error: 'PWA export record not found.' }, { status: 404 });
      }
      componentCodes = exportRecord.component_codes || [];
      pwaName = exportRecord.name || pwaName;
      pwaVersion = exportRecord.version || pwaVersion;
      pwaDescription = exportRecord.description || pwaDescription;
    }

    // ── Fetch the actual components referenced by this export ────────────────
    let bundledComponents: any[] = [];
    if (componentCodes.length > 0) {
      const allComponents = await base44.asServiceRole.entities.Component.filter({}, '-created_date', 200);
      bundledComponents = allComponents.filter(c => componentCodes.includes(c.code));
    }

    // Fallback to legacy PM-1A-BOOTSTRAP-1.0 lookup if no components resolved
    if (bundledComponents.length === 0) {
      const legacy = await base44.asServiceRole.entities.Component.filter({
        code: 'PM-1A-BOOTSTRAP-1.0',
      }, '-created_date', 5);
      bundledComponents = legacy;
    }

    // Pick the primary component (first match) for manifest branding
    const primary = bundledComponents[0] || null;
    if (primary) {
      if (!exportRecord) {
        pwaName = primary.name || pwaName;
      }
      endpointUrl = primary.endpoint_url || endpointUrl;
      if (primary.description && pwaDescription === 'Sovereign PWA deployment package.') {
        pwaDescription = primary.description;
      }
    }

    // ── Detect export persona for theme-aware rendering ───────────────────────
    const persona = detectPersona(pwaName, componentCodes);
    const personaColors = persona === 'parchment'
      ? { theme: '#fbf7ee', bg: '#f4ede0' }
      : persona === 'maxviz'
      ? { theme: '#0a0f1d', bg: '#0a0f1d' }
      : { theme: '#0a0e1a', bg: '#1a2332' };

    // ── Build the PWA manifest with favicons ─────────────────────────────────
    // Use the Alt+Shift+X platform favicon as the default icon for all packets
    const FAVICON_URL = 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg';
    const pwaManifest = {
      name: pwaName,
      short_name: pwaName.length > 12 ? pwaName.substring(0, 12) : pwaName,
      description: pwaDescription,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      theme_color: personaColors.theme,
      background_color: personaColors.bg,
      icons: [
        { src: FAVICON_URL, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
        { src: FAVICON_URL, sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' },
      ],
      categories: ['productivity', 'business', 'developer'],
    };

    // ── Build the deployment payload ─────────────────────────────────────────
    const payload = {
      artifact_code: primary?.code || 'PM-1A-BOOTSTRAP-1.0',
      persona: persona,
      type: primary?.type || 'X5',
      version: pwaVersion,
      generated_at: new Date().toISOString(),
      generated_by: user?.id || 'service-role',
      export_name: exportRecord?.name || null,
      apex_verification: verifiedKey ? {
        verified: true,
        enterprise_key_label: verifiedKey.label,
        sovereign_ledger: 'SOVEREIGN-KEY-MANAGER-1.0',
        verified_at: new Date().toISOString(),
      } : {
        verified: false,
        note: 'Apex Key not provided — payload generated without Sovereign Ledger verification.',
      },
      builder_id: user?.id || 'service-role',
      master_endpoint: PM1A_MASTER_ENDPOINT,
      component_endpoint: endpointUrl,
      bundled_components: bundledComponents.map(c => ({
        code: c.code,
        name: c.name,
        type: c.type,
        category: c.category,
        endpoint_url: c.endpoint_url,
        description: c.description,
        features: c.features || [],
        schema: c.schema || [],
        price: c.price,
      })),
      pwa_manifest: pwaManifest,
      self_healing_script: SELF_HEALING_SCRIPT,
      offline_bootloader: OFFLINE_BOOTLOADER,
      service_worker: SERVICE_WORKER,
      boot_sequence: {
        step_1: 'Check for local 6a21... identity',
        step_2: 'Provision substrate if missing',
        step_3: 'Establish mTLS tunnel to PM-1A-MASTER-X5',
        step_4: 'Activate self-healing shim',
        step_5: 'Register service worker for offline caching',
      },
      success_indicator: `${pwaName}: Setup Complete. Substrate Active.`,
    };

    // ── Build the complete .zip archive ──────────────────────────────────────
    const zip = new JSZip();
    const slug = pwaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pwa';

    zip.file('manifest.json', JSON.stringify(pwaManifest, null, 2));
    zip.file('sw.js', SERVICE_WORKER);
    zip.file('self-healing.js', SELF_HEALING_SCRIPT);
    zip.file('offline-bootloader.js', OFFLINE_BOOTLOADER);
    zip.file('boot-sequence.json', JSON.stringify(payload.boot_sequence, null, 2));
    zip.file('apex-verification.json', JSON.stringify(payload.apex_verification, null, 2));
    zip.file('components.json', JSON.stringify(payload.bundled_components, null, 2));
    zip.file('payload.json', JSON.stringify(payload, null, 2));
    const indexHtml = persona === 'parchment'
      ? buildParchmentHtml(pwaName, pwaVersion, pwaDescription, payload.artifact_code, payload.bundled_components, payload.boot_sequence)
      : persona === 'maxviz'
      ? buildMaxVizHtml(pwaName, pwaVersion, pwaDescription, payload.artifact_code, payload.bundled_components, payload.boot_sequence)
      : buildIndexHtml(pwaName, pwaVersion, pwaDescription, payload.artifact_code, payload.bundled_components, payload.boot_sequence);
    zip.file('index.html', indexHtml);

    // Favicon reference file — points to the hosted icon
    zip.file('favicon-ref.txt', [
      'PWA Favicon / Icon Reference',
      '============================',
      `Icon URL: ${FAVICON_URL}`,
      '',
      'This file references the hosted favicon used in the PWA manifest.',
      'Download the icon from the URL above and place it in your PWA root',
      'as favicon.png, then update manifest.json icons.src to "/favicon.png"',
      'for a fully self-contained offline package.',
    ].join('\n'));

    zip.file('install.bat', INSTALL_BAT);
    zip.file('install.sh', INSTALL_SH);
    zip.file('README.txt', [
      `${pwaName} — PWA Deployment Package`,
      '====================================',
      `Version: ${pwaVersion}`,
      `Artifact: ${payload.artifact_code}`,
      `Generated: ${payload.generated_at}`,
      `Builder: ${payload.builder_id}`,
      `Master Endpoint: ${payload.master_endpoint}`,
      endpointUrl ? `Component Endpoint: ${endpointUrl}` : '',
      '',
      `Bundled Components (${bundledComponents.length}):`,
      ...bundledComponents.map((c, i) => `  ${i + 1}. ${c.code} — ${c.name} (${c.type})`),
      '',
      'Contents:',
      '  manifest.json          — PWA web-app manifest with favicon icons',
      '  sw.js                  — Sovereign service worker (offline caching)',
      '  self-healing.js        — Self-healing shim script',
      '  offline-bootloader.js  — Offline-first bootloader',
      '  boot-sequence.json     — Boot sequence steps',
      '  apex-verification.json — Sovereign Ledger verification status',
      '  components.json         — Bundled component metadata',
      '  payload.json            — Full deployment payload',
      '  favicon-ref.txt         — Favicon icon reference URL',
      '',
      'Setup:',
      '  1. Double-click install.bat (Windows) or run install.sh (Mac/Linux) to open the PWA',
      '  2. Or host all files in your PWA web root',
      '  2. Link manifest.json in your index.html',
      '  3. Register sw.js as your service worker',
      '  4. Download the favicon from favicon-ref.txt and save locally',
      `  5. ${payload.success_indicator}`,
    ].filter(l => l !== '').join('\n'));

    const zipBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Base64-encode the zip so it survives the SDK's JSON response pipeline
    const b64 = btoa(String.fromCharCode(...zipBytes));

    return Response.json({
      filename: `${slug}-v${pwaVersion}-${Date.now()}.zip`,
      zip: b64,
      files: ['manifest.json', 'sw.js', 'self-healing.js', 'offline-bootloader.js', 'boot-sequence.json', 'apex-verification.json', 'components.json', 'payload.json', 'favicon-ref.txt', 'README.txt', 'install.bat', 'install.sh'],
      component_count: bundledComponents.length,
    });
  } catch (error) {
    console.error('generatePm1aPayload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}