// PWA Test Template — the rendered HTML shell used by PwaSandbox.
// Edit this to change how PWAs render in the test sandbox.
// Placeholders: __PWA_NAME__, __PWA_VERSION__, __PWA_DESCRIPTION__,
// __THEME_COLOR__, __BG_COLOR__, __ICON_URL__, __MODULE_COUNT__,
// __MODULES_HTML__, __ARTIFACT_CODE__

export const PWA_TEST_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="__THEME_COLOR__">
  <title>__PWA_NAME__</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: __BG_COLOR__; color: #e2e8f0; min-height: 100vh;
    }
    .app-shell { max-width: 600px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
    .app-header {
      background: linear-gradient(135deg, __THEME_COLOR__, __BG_COLOR__);
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
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin: 16px 0 10px; }
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
    .boot-step.done .check::after { content: '\\u2713'; font-size: 9px; color: #0a0e1a; font-weight: bold; }
    .boot-step .label { flex: 1; }
    .app-footer { padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
    .app-footer .status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #4ade80; }
    .app-footer .status .dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .app-footer .version { font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  </style>
</head>
<body>
  <div class="app-shell">
    <div class="app-header">
      <img src="__ICON_URL__" alt="__PWA_NAME__">
      <div>
        <h1>__PWA_NAME__</h1>
        <p>v__PWA_VERSION__</p>
      </div>
    </div>
    <div class="app-body">
      <div class="hero">
        <h2>__PWA_NAME__</h2>
        <p>__PWA_DESCRIPTION__</p>
      </div>
      <div class="section-title">Bundled Modules (__MODULE_COUNT__)</div>
      <div id="module-list">__MODULES_HTML__</div>
      <div class="section-title">Boot Sequence</div>
      <div class="boot-sequence" id="boot-sequence">
        <div class="boot-step"><div class="check"></div><div class="label">Check for local 6a21... identity</div></div>
        <div class="boot-step"><div class="check"></div><div class="label">Provision substrate if missing</div></div>
        <div class="boot-step"><div class="check"></div><div class="label">Establish mTLS tunnel to PM-1A-MASTER-X5</div></div>
        <div class="boot-step"><div class="check"></div><div class="label">Activate self-healing shim</div></div>
        <div class="boot-step"><div class="check"></div><div class="label">Register service worker for offline caching</div></div>
      </div>
    </div>
    <div class="app-footer">
      <div class="status"><div class="dot"></div> Substrate Active</div>
      <div class="version">__ARTIFACT_CODE__ \u00b7 v__PWA_VERSION__</div>
    </div>
  </div>
  <script>
    (function() {
      var steps = document.querySelectorAll('.boot-step');
      var i = 0;
      function next() {
        if (i < steps.length) {
          steps[i].classList.add('done');
          i++;
          setTimeout(next, 400);
        }
      }
      setTimeout(next, 500);
    })();
  </script>
</body>
</html>`;