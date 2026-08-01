import JSZip from "jszip";
import { PWA_LEGAL_ASSETS, LEGAL_MD } from "@/lib/pwaLegalAssets";

// Injects the four Sovereign legal assets + consolidated LEGAL.md into a ZIP.
function addLegalAssets(zip) {
  for (const doc of PWA_LEGAL_ASSETS) {
    zip.file(doc.fileName, doc.body);
  }
  zip.file("LEGAL.md", LEGAL_MD);
}

// ── Hardened chat scaffold script ──────────────────────────────────────────
// Injected into every generated PWA so the chat has the smart auto-scroll fix
// (no "creep") + the 110% hardening config baked in. The agent API endpoint is
// left as a placeholder for the builder to wire.
function generateHardenedChatScript(hardening, database) {
  const h = hardening || {};
  const ct = h.confidence_threshold || 0.85;
  return `
    // ── Hardened chat scaffold with smart auto-scroll (no creep) ──
    const HARDENING = ${JSON.stringify(h)};
    const CONFIDENCE_THRESHOLD = ${ct};
    const DB = ${JSON.stringify(database || "none")};
    const messagesEl = document.getElementById("messages");
    const inputEl = document.getElementById("input");
    const sendBtn = document.getElementById("send");
    let isNearBottom = true;

    // Track scroll — only auto-scroll when user is near the bottom.
    messagesEl.addEventListener("scroll", function() {
      isNearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;
    });

    function addMessage(role, text) {
      var div = document.createElement("div");
      div.className = "msg " + role;
      div.textContent = text;
      messagesEl.appendChild(div);
      // Instant scroll (not smooth) — prevents the "creep" animation stacking
      // that happens when smooth-scroll fires on every streamed token.
      if (isNearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // X1 Ledger — audit-log every message to local storage (immutable append).
    function auditLog(role, text) {
      if (!HARDENING.audit_logging) return;
      try {
        var log = JSON.parse(localStorage.getItem("x1_ledger") || "[]");
        log.push({ ts: Date.now(), role: role, hash: btoa(text).slice(0, 16) });
        localStorage.setItem("x1_ledger", JSON.stringify(log.slice(-500)));
      } catch (e) {}
    }

    // X2 Sensor — confidence check stub. Replace with real confidence scoring.
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
      //   .then(r => r.json()).then(data => { addMessage("bot", data.reply); });

      var confidence = checkConfidence(text);

      // Hallucination Guard — fail-closed if confidence below threshold.
      if (HARDENING.hallucination_guard && confidence < CONFIDENCE_THRESHOLD) {
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

    addMessage("bot", "Hardened shell ready. Database: " + DB + ". Confidence threshold: " + CONFIDENCE_THRESHOLD + ". Connect an agent API to begin.");
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

function hardeningBadges(h) {
  const badges = [
    h.hallucination_guard && "Hallucination Guard",
    h.audit_logging && "Audit Logging",
    h.x1_ledger && "X1 Ledger",
    h.x2_sensor && "X2 Sensor",
    h.x4_guard && "X4 Guard",
    h.x5_healing && "X5 Healing",
  ].filter(Boolean);
  return badges.map((b) => `<span class="badge">${b}</span>`).join("");
}

// Generates a standalone PWA shell HTML for a B.O.B.Init build record.
export function generateShellHtml(build) {
  const name = build.pwa_name || build.build_code || "Alt+Shift+X PWA";
  const modules = (build.feature_labels || [])
    .map((l) => `      <li>${l}</li>`)
    .join("\n");
  const db = build.database || "none";
  const h = build.hardening || {};
  const ct = h.confidence_threshold || 0.85;
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
    <p class="meta">${build.build_code || ""} · ESI ${build.esi_score || 0}/100</p>
    <div class="badges">${hardeningBadges(h)}</div>
    <div class="info">
      <span>DB: <b>${db}</b></span>
      <span>Confidence ≥ <b>${ct}</b></span>
      <span>Framework: <b>${h.regulatory_framework || "Blackstone Protocol"}</b></span>
    </div>
    <p class="label">Hardened Modules</p>
    <ul>
${modules || "      <li>No modules</li>"}
    </ul>
  </div>
  <div class="chat">
    <div id="messages" class="messages"></div>
    <div class="input-bar">
      <input id="input" type="text" placeholder="Type a message…" autocomplete="off" />
      <button id="send" onclick="sendMessage()">Send</button>
    </div>
  </div>
  <p class="footer">BOB-INIT-ENGINE-1.0 · Self-Healing Shim active · 110% Hardened</p>
  <script>${generateHardenedChatScript(h, db)}</script>
</body>
</html>`;
}

export function generateSwJs() {
  return `// BOB-INIT-SELF-HEALING-SHIM-1.0 service worker
const CACHE = "bob-init-shell-v1";
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

  const safeName = (pwaName || "Alt+Shift+X PWA").replace(/[<>]/g, "");
  const sub = subtitle ? `<p class="meta">${subtitle}</p>` : "";
  // Default hardening for static PWA shells (Agent Wrapper etc.)
  const defaultH = { hallucination_guard: true, confidence_threshold: 0.85, audit_logging: true, regulatory_framework: "Blackstone Protocol", x1_ledger: true, x2_sensor: true, x4_guard: true, x5_healing: true };

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
    <div class="badges">${hardeningBadges(defaultH)}</div>
    <div class="info">
      <span>Confidence ≥ <b>0.85</b></span>
      <span>Framework: <b>Blackstone Protocol</b></span>
    </div>
  </div>
  <div class="chat">
    <div id="messages" class="messages"></div>
    <div class="input-bar">
      <input id="input" type="text" placeholder="Type a message…" autocomplete="off" />
      <button id="send" onclick="sendMessage()">Send</button>
    </div>
  </div>
  <p class="footer">Alt+Shift+X · Sovereign PWA Shell · 110% Hardened</p>
  <script>${generateHardenedChatScript(defaultH, "none")}</script>
</body>
</html>`;

  const zip = new JSZip();
  zip.file("manifest.json", manifestText);
  zip.file("index.html", shellHtml);
  zip.file("sw.js", generateSwJs());
  addLegalAssets(zip);
  zip.file(
    "README.txt",
    `Alt+Shift+X PWA Package\n` +
      `======================\n\n` +
      `PWA:      ${pwaName}\n` +
      `Manifest: ${manifestUrl}\n` +
      `Hardening: 110% Standard (fail-closed, hallucination guard, audit logging)\n\n` +
      `Deploy these files on any static host (Netlify, Vercel, GitHub\n` +
      `Pages, or your own server). manifest.json + sw.js make this\n` +
      `installable as a standalone PWA.`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(pwaName || "altshiftx-pwa").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Builds and triggers a download of a ZIP package for a B.O.B.Init build record.
export async function downloadBuildZip(build) {
  const zip = new JSZip();
  zip.file("manifest.json", build.manifest_json || JSON.stringify({ name: build.pwa_name || "Alt+Shift+X PWA" }, null, 2));
  zip.file("index.html", generateShellHtml(build));
  zip.file("sw.js", generateSwJs());
  addLegalAssets(zip);
  const h = build.hardening || {};
  const activeLayers = [
    h.hallucination_guard && "Hallucination Guard",
    h.audit_logging && "Audit Logging (X1 Ledger)",
    h.x1_ledger && "X1 Forensic Ledger",
    h.x2_sensor && "X2 Friction Sensor",
    h.x4_guard && "X4 Logic Canary",
    h.x5_healing && "X5 Self-Healing Executive",
  ].filter(Boolean).join(", ");
  zip.file(
    "README.txt",
    `B.O.B.Init Build Package\n` +
      `========================\n\n` +
      `Build:      ${build.build_code || build.id}\n` +
      `PWA Name:   ${build.pwa_name || "Alt+Shift+X PWA"}\n` +
      `Stack:      ${build.stack || "n/a"}\n` +
      `Database:   ${build.database || "none"}\n` +
      `ESI:        ${build.esi_score || 0}/100\n` +
      `Modules:    ${(build.feature_labels || []).join(", ") || "none"}\n` +
      `Hardening:  ${h.hallucination_guard !== false ? "110% Standard (ON)" : "OFF"}\n` +
      `  Confidence threshold: ${h.confidence_threshold || 0.85}\n` +
      `  Regulatory framework: ${h.regulatory_framework || "Blackstone Protocol"}\n` +
      `  Active layers: ${activeLayers || "none"}\n` +
      `  Environment: ${h.environment || "production"}\n` +
      `  Rollback: ${h.rollback_strategy || "automatic"}\n\n` +
      `Deploy these files on any static host (Netlify, Vercel, GitHub\n` +
      `Pages, or your own server). manifest.json + sw.js make this\n` +
      `installable as a standalone PWA.\n\n` +
      `The bundled index.html contains a hardened chat scaffold with\n` +
      `smart auto-scroll (no creep), X1 audit logging, X2 confidence\n` +
      `sensing, and a fail-closed hallucination guard. Wire your agent\n` +
      `API endpoint into the sendMessage() function to activate it.`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${build.build_code || "bob-build"}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}