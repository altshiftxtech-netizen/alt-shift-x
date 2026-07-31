import JSZip from "jszip";

// Generates a standalone PWA shell HTML for a B.O.B.Init build record.
export function generateShellHtml(build) {
  const name = build.pwa_name || build.build_code || "Alt+Shift+X PWA";
  const modules = (build.feature_labels || [])
    .map((l) => `      <li>${l}</li>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#0d1117" />
  <title>${name}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin:0; background:#0d1117; color:#c9d1d9; font-family: -apple-system, system-ui, sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center; }
    .shell { max-width:480px; padding:2rem; text-align:center; }
    h1 { color:#fff; font-size:1.5rem; margin:0 0 0.25rem; }
    .meta { color:#8b949e; font-family:ui-monospace,monospace; font-size:0.75rem; margin:0 0 1.25rem; }
    .label { font-size:0.8rem; color:#8b949e; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem; }
    ul { text-align:left; color:#c9d1d9; font-size:0.85rem; margin:0 auto 1.5rem; max-width:320px; list-style:none; padding:0; }
    li { padding:0.25rem 0 0.25rem 1rem; position:relative; }
    li::before { content:"✓"; position:absolute; left:0; color:#3fb950; }
    .footer { font-size:0.7rem; color:#484f58; font-family:ui-monospace,monospace; }
  </style>
</head>
<body>
  <div class="shell">
    <h1>${name}</h1>
    <p class="meta">${build.build_code || ""} · ESI ${build.esi_score || 0}/100</p>
    <p class="label">Hardened Modules</p>
    <ul>
${modules || "      <li>No modules</li>"}
    </ul>
    <p class="footer">BOB-INIT-ENGINE-1.0 · Self-Healing Shim active</p>
  </div>
  <script>
    if ("serviceWorker" in navigator) { navigator.serviceWorker.register("./sw.js"); }
  </script>
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

// Builds and triggers a download of a ZIP package for a B.O.B.Init build record.
export async function downloadBuildZip(build) {
  const zip = new JSZip();
  zip.file("manifest.json", build.manifest_json || JSON.stringify({ name: build.pwa_name || "Alt+Shift+X PWA" }, null, 2));
  zip.file("index.html", generateShellHtml(build));
  zip.file("sw.js", generateSwJs());
  zip.file(
    "README.txt",
    `B.O.B.Init Build Package\n` +
      `========================\n\n` +
      `Build:    ${build.build_code || build.id}\n` +
      `PWA Name: ${build.pwa_name || "Alt+Shift+X PWA"}\n` +
      `Stack:    ${build.stack || "n/a"}\n` +
      `ESI:      ${build.esi_score || 0}/100\n` +
      `Modules:  ${(build.feature_labels || []).join(", ") || "none"}\n\n` +
      `Deploy these files on any static host (Netlify, Vercel, GitHub\n` +
      `Pages, or your own server). manifest.json + sw.js make this\n` +
      `installable as a standalone PWA.`
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