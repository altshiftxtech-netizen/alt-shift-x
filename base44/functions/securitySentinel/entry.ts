import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Detection rules ──────────────────────────────────────────────
const INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|alter)\b.*\b(from|into|table)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
  /;\s*(drop|delete|truncate)/i
];
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on(error|load|click|mouseover)\s*=/i,
  /<iframe[\s>]/i
];
const HONEYPOT_PATHS = ["/wp-admin", "/wp-login.php", "/.env", "/admin.php", "/phpmyadmin", "/.git/config", "/config.php"];
const BOT_UA = [/sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /havij/i, /acunetix/i, /nessus/i, /python-requests/i, /curl/i, /^$/];

// In-memory rate tracking (per cold-start instance)
const rateMap = new Map();
const RATE_LIMIT = 60;       // requests
const RATE_WINDOW_MS = 60000; // per minute

function classify({ path = "", method = "GET", payload = "", userAgent = "" }) {
  if (HONEYPOT_PATHS.some(p => path.toLowerCase().startsWith(p))) {
    return { type: "honeypot_triggered", severity: "high", rule: "honeypot_path", block: true };
  }
  if (BOT_UA.some(re => re.test(userAgent))) {
    return { type: "bot_detected", severity: "high", rule: "malicious_user_agent", block: true };
  }
  const haystack = `${path} ${payload}`;
  if (INJECTION_PATTERNS.some(re => re.test(haystack))) {
    return { type: "injection_attempt", severity: "critical", rule: "sql_injection_pattern", block: true };
  }
  if (XSS_PATTERNS.some(re => re.test(haystack))) {
    return { type: "xss_attempt", severity: "critical", rule: "xss_pattern", block: true };
  }
  return null;
}

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || body.ip || "unknown";
    const userAgent = req.headers.get("user-agent") || body.userAgent || "";
    const path = body.path || "";
    const method = body.method || "GET";
    const payload = typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload || "");

    // Forensic geo + header data (lawful, request-provided only)
    const headersFingerprint = {
      "accept-language": req.headers.get("accept-language") || "",
      "referer": req.headers.get("referer") || "",
      "origin": req.headers.get("origin") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
      "cf-ipcountry": req.headers.get("cf-ipcountry") || ""
    };

    // Run detection
    let detection = classify({ path, method, payload, userAgent });
    let rateExceeded = false;
    if (!detection) {
      rateExceeded = checkRate(ip);
      if (rateExceeded) {
        detection = { type: "rate_limit_exceeded", severity: "medium", rule: "rate_limiter", block: true };
      }
    }

    if (!detection) {
      return Response.json({ ok: true, threat: false });
    }

    // Log incident (RLS create is open so detection can run for anyone)
    const incident = await base44.asServiceRole.entities.SecurityIncident.create({
      incident_type: detection.type,
      severity: detection.severity,
      ip_address: ip,
      user_agent: userAgent,
      geo_country: req.headers.get("cf-ipcountry") || "",
      request_path: path,
      request_method: method,
      payload_sample: payload.slice(0, 500),
      headers_fingerprint: headersFingerprint,
      detection_rule: detection.rule,
      blocked: !!detection.block,
      status: "new"
    });

    // Email admin on high/critical
    if (detection.severity === "high" || detection.severity === "critical") {
      const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
      const subject = `🛡️ Security Alert [${detection.severity.toUpperCase()}] — ${detection.type}`;
      const reportBody = [
        `A ${detection.severity.toUpperCase()} security incident was detected and blocked.`,
        ``,
        `Incident Type: ${detection.type}`,
        `Detection Rule: ${detection.rule}`,
        `Timestamp (UTC): ${new Date().toISOString()}`,
        ``,
        `── Source Metadata (for law enforcement) ──`,
        `IP Address: ${ip}`,
        `Country: ${req.headers.get("cf-ipcountry") || "unknown"}`,
        `User-Agent: ${userAgent || "n/a"}`,
        `Accept-Language: ${headersFingerprint["accept-language"]}`,
        `Referer: ${headersFingerprint.referer || "n/a"}`,
        `Origin: ${headersFingerprint.origin || "n/a"}`,
        ``,
        `── Request Details ──`,
        `Target Path: ${path}`,
        `Method: ${method}`,
        `Payload Sample: ${payload.slice(0, 500)}`,
        ``,
        `Incident ID: ${incident.id}`,
        `Status: Logged & blocked. Review in the Security Center.`,
        ``,
        `NOTE: Provide this report to law enforcement. Do not attempt to retaliate — hacking back is illegal.`
      ].join("\n");

      for (const admin of (admins || [])) {
        if (admin.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject,
            body: reportBody
          }).catch((e) => console.error("Failed to email admin:", admin.email, e.message));
        }
      }
      await base44.asServiceRole.entities.SecurityIncident.update(incident.id, { email_sent: true });
    }

    return Response.json({ ok: true, threat: true, blocked: !!detection.block, incident_id: incident.id }, {
      status: detection.block ? 403 : 200
    });
  } catch (error) {
    console.error("securitySentinel error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});