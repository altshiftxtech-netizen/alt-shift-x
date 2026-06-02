import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Patterns that should NEVER appear in a public frontend bundle.
const SECRET_PATTERNS = [
  { name: "Stripe secret key", re: /sk_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: "Stripe restricted key", re: /rk_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "Google API key", re: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: "OpenAI key", re: /sk-[A-Za-z0-9]{20,}/ },
  { name: "Generic bearer secret", re: /(secret|password|passwd|api[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: "Private key block", re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
];

// Admin-only: fetches the app's live frontend and scans it for leaked secrets.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { url } = await req.json().catch(() => ({}));
    const target = url || req.headers.get("origin") || req.headers.get("referer");
    if (!target) {
      return Response.json({ error: "Provide the published app URL to scan." }, { status: 400 });
    }

    // Fetch the main HTML, then pull the JS bundle URLs it references and scan them.
    const html = await (await fetch(target)).text();
    const scriptUrls = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => {
      try { return new URL(m[1], target).href; } catch { return null; }
    }).filter(Boolean);

    const findings = [];
    for (const src of scriptUrls.slice(0, 25)) {
      const code = await (await fetch(src)).text().catch(() => "");
      for (const p of SECRET_PATTERNS) {
        const match = code.match(p.re);
        if (match) {
          findings.push({
            type: p.name,
            file: src.split("/").pop(),
            sample: match[0].slice(0, 6) + "…(redacted)",
          });
        }
      }
    }

    return Response.json({
      scanned_files: scriptUrls.length,
      clean: findings.length === 0,
      findings,
      message: findings.length === 0
        ? "No secrets detected in the frontend bundle. ✅"
        : `⚠️ ${findings.length} potential secret leak(s) found — move these to backend environment variables immediately.`,
    });
  } catch (error) {
    console.error("scanFrontendSecrets error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});