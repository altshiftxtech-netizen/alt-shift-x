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

    function doSend() {
      const text = input.value.trim();
      if (!text) return;

      addMessage('user', text);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;

      // Collect schema field values
      const schemaValues = {};
      if (schemaFields) {
        schemaFields.querySelectorAll('input').forEach(inp => {
          if (inp.value.trim()) schemaValues[inp.dataset.field] = inp.value.trim();
        });
      }

      // Simulate agent response based on component type
      const responses = {
        X1: 'Reading protocol engaged. I have analyzed your input: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '". Key themes identified and ready for deeper extraction.',
        X2: 'Prophecy model activated. Based on the scenario: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '". Forecasting probability vectors and trend analysis.',
        X3: 'Speed profile loaded. Optimizing for: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '". Performance metrics and acceleration vectors calculated.',
        X4: 'Council is deliberating on: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '". Multiple perspectives are being weighed and synthesized.',
        X5: 'Agent online. I received your request: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '". Processing and ready to assist further.',
      };

      const schemaNote = Object.keys(schemaValues).length > 0
        ? ' (with parameters: ' + Object.entries(schemaValues).map(([k,v]) => k + '=' + v).join(', ') + ')'
        : '';

      setTimeout(() => {
        addMessage('agent', (responses[COMP_TYPE] || responses.X5) + schemaNote);
        sendBtn.disabled = false;
        input.focus();
      }, 600);
    }
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
  </style>
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
    function doSend() {
      const text = input.value.trim(); if (!text) return;
      addMessage('user', text); input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;
      setTimeout(() => { addMessage('agent', 'Constitutional analysis engaged. Your inquiry: "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '" has been received. Examining precedent, statutory framework, and civic obligations.'); sendBtn.disabled = false; input.focus(); }, 600);
    }
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
  </style>
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
    function doSend() {
      const text = input.value.trim(); if (!text) return;
      addMessage('user', text); input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;
      setTimeout(() => { addMessage('agent', 'Awesome! Let us explore "' + text.substring(0, 80) + (text.length > 80 ? '…' : '') + '" together! 🌟 Ready to learn, play, and grow!'); sendBtn.disabled = false; input.focus(); }, 500);
    }
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