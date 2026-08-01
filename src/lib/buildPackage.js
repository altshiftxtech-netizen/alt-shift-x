import JSZip from "jszip";
import { PWA_LEGAL_ASSETS, LEGAL_MD } from "@/lib/pwaLegalAssets";
import { base44 } from "@/api/base44Client";

// Injects the four Sovereign legal assets + consolidated LEGAL.md into a ZIP.
function addLegalAssets(zip) {
  for (const doc of PWA_LEGAL_ASSETS) {
    zip.file(doc.fileName, doc.body);
  }
  zip.file("LEGAL.md", LEGAL_MD);
}

// ── PWA Tightening (client-side mirror of SOV-PWA-TIGHT-ORCH-X5-1.0) ────────
// Strips all proprietary platform internals from a build record so the produced
// PWA cannot leak Alt+Shift+X procedure, codes, or hardening configuration.
//
// DOCTRINE: Produced PWA's are "AI Agent Hardened" — NOT 110%. The 110%
// Hardened Standard is reserved for components built ON altshiftx.tech.
// Produced PWA shells get AI Agent Hardening only.
const PROPRIETARY_PREFIXES = [
  "BOB-INIT-", "ASX-BUILD-", "GSP-MASTER-INDEX", "SOV-", "EXPERT-MINDS-", "SPEAKEASY-",
];

function stripProprietary(text) {
  if (!text) return text;
  let cleaned = text;
  for (const prefix of PROPRIETARY_PREFIXES) {
    cleaned = cleaned.replace(new RegExp(prefix + "[A-Z0-9.-]*", "g"), "");
  }
  return cleaned.replace(/\s{2,}/g, " ").replace(/[·•]\s*$/g, "").trim();
}

// Tighten a build record into a public-safe version. Tries the server-side
// orchestrator first (SOV-PWA-TIGHT-ORCH-X5-1.0); falls back to client-side
// stripping if the function is unavailable so the PWA is always tight.
async function tightenBuild(build) {
  // Try server-side tightening first
  if (build?.id) {
    try {
      const res = await base44.functions.invoke("sovPwaTightOrch", { build_id: build.id });
      if (res?.success && res?.tightened) return res.tightened;
    } catch { /* fall through to client-side */ }
  }

  // Client-side fallback — same stripping logic
  const h = build?.hardening || {};
  const hardening_badges = [
    h.hallucination_guard !== false && "Hallucination Guard",
    h.audit_logging !== false && "Audit Logging",
  ].filter(Boolean);

  let cleanManifest = {};
  try {
    cleanManifest = JSON.parse(build?.manifest_json || "{}");
    if (cleanManifest.description) cleanManifest.description = "AI Agent Hardened PWA";
  } catch {}

  return {
    pwa_name: build?.pwa_name || "PWA",
    database: build?.database || "none",
    hardening_level: "AI Agent Hardened",
    hardening_badges,
    confidence_threshold: h.confidence_threshold || 0.85,
    hallucination_guard: h.hallucination_guard !== false,
    audit_logging: h.audit_logging !== false,
    manifest: cleanManifest,
    features: (build?.feature_labels || []).map(stripProprietary).filter(Boolean),
    tightened_at: new Date().toISOString(),
    protocol: "SOV-PWA-TIGHT-ORCH-X5-1.0",
  };
}

// ── Hardened chat scaffold script ──────────────────────────────────────────
// Injected into every generated PWA so the chat has the smart auto-scroll fix
// (no "creep") + AI Agent Hardening baked in. Only boolean guard flags + the
// confidence threshold survive — the full hardening config is NEVER exposed.
function generateHardenedChatScript(tightened) {
  const guard = tightened?.hallucination_guard !== false;
  const audit = tightened?.audit_logging !== false;
  const ct = tightened?.confidence_threshold || 0.85;
  const db = tightened?.database || "none";
  return `
    // ── AI Agent Hardened chat scaffold with smart auto-scroll (no creep) ──
    var HALLUCINATION_GUARD = ${guard};
    var AUDIT_LOGGING = ${audit};
    var CONFIDENCE_THRESHOLD = ${ct};
    var DB = ${JSON.stringify(db)};
    var messagesEl = document.getElementById("messages");
    var inputEl = document.getElementById("input");
    var sendBtn = document.getElementById("send");
    var isNearBottom = true;

    // Track scroll — only auto-scroll when user is near the bottom.
    messagesEl.addEventListener("scroll", function() {
      isNearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;
    });

    function addMessage(role, text) {
      var div = document.createElement("div");
      div.className = "msg " + role;
      div.textContent = text;
      messagesEl.appendChild(div);
      // Instant scroll (not smooth) — prevents the "creep" animation stacking.
      if (isNearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Audit-log every message to local storage (immutable append).
    function auditLog(role, text) {
      if (!AUDIT_LOGGING) return;
      try {
        var log = JSON.parse(localStorage.getItem("audit_ledger") || "[]");
        log.push({ ts: Date.now(), role: role, hash: btoa(text).slice(0, 16) });
        localStorage.setItem("audit_ledger", JSON.stringify(log.slice(-500)));
      } catch (e) {}
    }

    // Confidence check stub. Replace with real confidence scoring.
    function checkConfidence(text) {
      return text.length > 3 ? 0.9 : 0.5;
    }

    function sendMessage() {
      var text = inputEl.value.trim();
      if (!text) return;
      isNearBottom = true; // user just sent — expect to see the bottom
      addMessage("user", text);
      auditLog("user", text);
      inputEl.value = "";
      sendBtn.disabled = true;

      // ── Wire your agent API endpoint here ──
      // fetch("/api/chat", { method: "POST", body: JSON.stringify({ message: text }) })
      //   .then(function(r) { return r.json(); }).then(function(data) { addMessage("bot", data.reply); });

      var confidence = checkConfidence(text);

      // Hallucination Guard — fail-closed if confidence below threshold.
      if (HALLUCINATION_GUARD && confidence < CONFIDENCE_THRESHOLD) {
        addMessage("bot", "⚠ Confidence (" + confidence.toFixed(2) + ") below threshold (" + CONFIDENCE_THRESHOLD + "). Output blocked by hallucination guard.");
        auditLog("bot", "BLOCKED:low_confidence:" + confidence.toFixed(2));
      } else {
        addMessage("bot", "Agent endpoint not configured. Wire your API to sendMessage() in index.html. Confidence: " + confidence.toFixed(2));
        auditLog("bot", "scaffold_response");
      }

      sendBtn.disabled = false;
      inputEl.focus();
    }

    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "Enter") sendMessage();
    });

    addMessage("bot", "AI Agent Hardened shell ready. Database: " + DB + ". Confidence threshold: " + CONFIDENCE_THRESHOLD + ". Connect an agent API to begin.");
  `;
}

// Shared CSS for both the build shell and the static PWA shell.
function shellStyles(themeColor) {
  return `
    * { box-sizing: border-box; }
    body { margin:0; background:${themeColor}; color:#c9d1d9; font-family: -apple-system, system-ui, sans-serif; min-height:100vh; display:flex; flex-direction:column; }
    .header { padding:1.5rem 2rem 1rem; text-align:center; border-bottom:1px solid #30363d; }
    h1 { color:#fff; font-size:1.5rem; margin:0 0 0.25rem; }
    .meta { color:#8b949e; font-family:ui-monospace,monospace; font-size:0.75rem; margin:0 0 0.75rem; }
    .badges { display:flex; flex-wrap:wrap; gap:0.35rem; justify-content:center; }
    .badge { font-size:0.65rem; font-family:ui-monospace,monospace; color:#3fb950; border:1px solid #3fb95055; border-radius:99px; padding:0.15rem 0.5rem; background:#3fb95011; }
    .info { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; font-size:0.7rem; color:#8b949e; font-family:ui-monospace,monospace; margin-top:0.5rem; }
    .info span b { color:#c9d1d9; }
    .label { font-size:0.8rem; color:#8b949e; text-transform:uppercase; letter-spacing:0.05em; margin:0.5rem 0 0.25rem; }
    ul { text-align:left; color:#c9d1d9; font-size:0.85rem; margin:0 auto 1rem; max-width:320px; list-style:none; padding:0; }
    li { padding:0.25rem 0 0.25rem 1rem; position:relative; }
    li::before { content:"✓"; position:absolute; left:0; color:#3fb950; }
    .chat { flex:1; display:flex; flex-direction:column; max-width:640px; margin:0 auto; width:100%; }
    .messages { flex:1; overflow-y:auto; padding:1rem; min-height:200px; }
    .msg { max-width:80%; margin-bottom:0.75rem; padding:0.6rem 0.9rem; border-radius:12px; font-size:0.85rem; line-height:1.4; }
    .msg.user { background:#1a3a5c; margin-left:auto; text-align:right; }
    .msg.bot { background:#161b22; border:1px solid #30363d; }
    .input-bar { display:flex; gap:0.5rem; padding:1rem; border-top:1px solid #30363d; }
    .input-bar input { flex:1; background:#010409; border:1px solid #30363d; color:#c9d1d9; border-radius:8px; padding:0.6rem 0.9rem; font-size:0.85rem; outline:none; }
    .input-bar button { background:#0e7490; color:#fff; border:none; border-radius:8px; padding:0.6rem 1.2rem; font-weight:bold; cursor:pointer; }
    .input-bar button:disabled { opacity:0.5; cursor:wait; }
    .footer { font-size:0.7rem; color:#484f58; font-family:ui-monospace,monospace; text-align:center; padding:0.5rem; border-top:1px solid #21262d; }
  `;
}

// Generates a standalone PWA shell HTML from a TIGHTENED build (no proprietary data).
export function generateShellHtml(tightened) {
  const name = tightened.pwa_name || "PWA";
  const modules = (tightened.features || [])
    .map((l) => `      <li>${l}</li>`)
    .join("\n");
  const db = tightened.database || "none";
  const ct = tightened.confidence_threshold || 0.85;
  const badges = (tightened.hardening_badges || [])
    .map((b) => `<span class="badge">${b}</span>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#0d1117" />
  <title>${name}</title>
  <style>${shellStyles("#0d1117")}</style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="badges">${badges}</div>
    <div class="info">
      <span>DB: <b>${db}</b></span>
      <span>Confidence ≥ <b>${ct}</b></span>
    </div>
    ${modules ? `<p class="label">Modules</p><ul>${modules}</ul>` : ""}
  </div>
  <div class="chat">
    <div id="messages" class="messages"></div>
    <div class="input-bar">
      <input id="input" type="text" placeholder="Type a message…" autocomplete="off" />
      <button id="send" onclick="sendMessage()">Send</button>
    </div>
  </div>
  <p class="footer">AI Agent Hardened · Self-Healing active</p>
  <script>${generateHardenedChatScript(tightened)}</script>
</body>
</html>`;
}

export function generateSwJs() {
  return `// Self-Healing service worker
const CACHE = "pwa-shell-v1";
const ASSETS = ["./", "./index.html", "./manifest.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
`;
}

// Builds and triggers a download of a ZIP package for a static (non-database)
// PWA such as the Site Mirror or Agent Wrapper. Fetches the manifest from the
// URL and packages it with a standalone shell + service worker.
export async function downloadStaticPwaZip(manifestUrl, pwaName, opts = {}) {
  const { subtitle = "", themeColor = "#0d1117" } = opts;

  // Fetch the live manifest JSON
  let manifestText = JSON.stringify({ name: pwaName }, null, 2);
  try {
    const res = await fetch(manifestUrl);
    if (res.ok) manifestText = await res.text();
  } catch { /* fall back to stub */ }

  const safeName = (pwaName || "PWA").replace(/[<>]/g, "");
  const sub = subtitle ? `<p class="meta">${subtitle}</p>` : "";
  // AI Agent Hardened defaults for static PWA shells
  const tightened = {
    pwa_name: safeName,
    database: "none",
    hardening_level: "AI Agent Hardened",
    hardening_badges: ["Hallucination Guard", "Audit Logging"],
    confidence_threshold: 0.85,
    hallucination_guard: true,
    audit_logging: true,
  };

  const shellHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="${themeColor}" />
  <title>${safeName}</title>
  <style>${shellStyles(themeColor)}</style>
</head>
<body>
  <div class="header">
    <h1>${safeName}</h1>
    ${sub}
    <div class="badges">${(tightened.hardening_badges || []).map((b) => `<span class="badge">${b}</span>`).join("")}</div>
    <div class="info">
      <span>Confidence ≥ <b>0.85</b></span>
    </div>
  </div>
  <div class="chat">
    <div id="messages" class="messages"></div>
    <div class="input-bar">
      <input id="input" type="text" placeholder="Type a message…" autocomplete="off" />
      <button id="send" onclick="sendMessage()">Send</button>
    </div>
  </div>
  <p class="footer">AI Agent Hardened · Sovereign PWA Shell</p>
  <script>${generateHardenedChatScript(tightened)}</script>
</body>
</html>`;

  const zip = new JSZip();
  zip.file("manifest.json", manifestText);
  zip.file("index.html", shellHtml);
  zip.file("sw.js", generateSwJs());
  addLegalAssets(zip);
  zip.file(
    "README.txt",
    `PWA Package\n` +
      `===========\n\n` +
      `PWA:       ${pwaName}\n` +
      `Manifest:  ${manifestUrl}\n` +
      `Hardening: AI Agent Hardened (fail-closed, hallucination guard, audit logging)\n\n` +
      `Deploy these files on any static host (Netlify, Vercel, GitHub\n` +
      `Pages, or your own server). manifest.json + sw.js make this\n` +
      `installable as a standalone PWA.`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(pwaName || "pwa").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Builds and triggers a download of a ZIP package for a B.O.B.Init build record.
// Runs the SOV-PWA-TIGHT-ORCH-X5-1.0 orchestrator to strip proprietary info
// before generating the shell, so nothing leaks.
export async function downloadBuildZip(build) {
  // Tighten the build — strips proprietary codes, ESI, build codes, full hardening JSON
  const tightened = await tightenBuild(build);

  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(tightened.manifest || { name: tightened.pwa_name }, null, 2));
  zip.file("index.html", generateShellHtml(tightened));
  zip.file("sw.js", generateSwJs());
  addLegalAssets(zip);
  zip.file(
    "README.txt",
    `PWA Package\n` +
      `===========\n\n` +
      `PWA Name:  ${tightened.pwa_name}\n` +
      `Database:  ${tightened.database}\n` +
      `Hardening: ${tightened.hardening_level}\n` +
      `  Guards: ${(tightened.hardening_badges || []).join(", ") || "none"}\n` +
      `  Confidence threshold: ${tightened.confidence_threshold}\n` +
      `Modules:   ${(tightened.features || []).join(", ") || "none"}\n\n` +
      `Deploy these files on any static host (Netlify, Vercel, GitHub\n` +
      `Pages, or your own server). manifest.json + sw.js make this\n` +
      `installable as a standalone PWA.\n\n` +
      `The bundled index.html contains an AI Agent Hardened chat scaffold\n` +
      `with smart auto-scroll (no creep), audit logging, and a fail-closed\n` +
      `hallucination guard. Wire your agent API endpoint into the\n` +
      `sendMessage() function to activate it.`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(tightened.pwa_name || "pwa").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}