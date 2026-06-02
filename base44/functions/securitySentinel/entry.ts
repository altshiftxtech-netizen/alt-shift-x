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

// Anti-abuse caps (protect the security system itself)
const MAX_FIELD_LEN = 2000;       // hard cap on any single ingested string
const PAYLOAD_SAMPLE_LEN = 500;   // stored sample size
const INCIDENT_DEDUP_WINDOW_MS = 60000;  // collapse repeat incidents from same IP+type within 1 min
const EMAIL_THROTTLE_MS = 3600000;       // max 1 alert email per IP per hour
const emailThrottle = new Map();         // ip -> last email timestamp

// Strip control chars + truncate, neutralizing log/display injection
function sanitize(value, max = MAX_FIELD_LEN) {
  if (typeof value !== "string") value = String(value ?? "");
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ") // control chars
    .slice(0, max)
    .trim();
}

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

    // NEVER trust client-supplied IP — only use real proxy headers (prevents spoofing/framing)
    const ip = sanitize(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown",
      64
    );
    // All ingested strings sanitized + length-capped to neutralize log/display injection and DoS
    const userAgent = sanitize(req.headers.get("user-agent") || body.userAgent || "");
    const path = sanitize(body.path || "");
    const method = sanitize(body.method || "GET", 16);
    const payload = sanitize(typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload || ""));

    // Forensic geo + header data (lawful, request-provided only, sanitized)
    const headersFingerprint = {
      "accept-language": sanitize(req.headers.get("accept-language") || "", 256),
      "referer": sanitize(req.headers.get("referer") || "", 512),
      "origin": sanitize(req.headers.get("origin") || "", 256),
      "x-forwarded-for": sanitize(req.headers.get("x-forwarded-for") || "", 256),
      "cf-ipcountry": sanitize(req.headers.get("cf-ipcountry") || "", 8)
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

    // ── Anti-flood: collapse repeat incidents from same IP+type within the dedup window ──
    // Prevents an attacker from ballooning the DB with millions of records.
    const since = new Date(Date.now() - INCIDENT_DEDUP_WINDOW_MS).toISOString();
    const recent = await base44.asServiceRole.entities.SecurityIncident.filter({
      ip_address: ip,
      incident_type: detection.type
    }, "-created_date", 1).catch((e) => {
      console.error("dedup filter failed:", e.message);
      return [];
    });
    if (recent && recent.length && recent[0].created_date > since) {
      // Already logged this exact threat from this IP recently — block silently, no new record/email
      return Response.json({ ok: true, threat: true, blocked: !!detection.block, deduped: true }, {
        status: detection.block ? 403 : 200
      });
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

    // Email admin on high/critical — throttled per IP to prevent alert bombing.
    // Wrapped so a notification failure NEVER breaks the core detect/log/block path.
    const lastEmail = emailThrottle.get(ip) || 0;
    const emailAllowed = Date.now() - lastEmail > EMAIL_THROTTLE_MS;
    if ((detection.severity === "high" || detection.severity === "critical") && emailAllowed) {
      try {
      emailThrottle.set(ip, Date.now());
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
      } catch (emailErr) {
        console.error("Admin alert step failed (non-fatal):", emailErr.message);
      }
    }

    return Response.json({ ok: true, threat: true, blocked: !!detection.block, incident_id: incident.id }, {
      status: detection.block ? 403 : 200
    });
  } catch (error) {
    console.error("securitySentinel error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});