// Shared crypto + rate-limit helpers for API-key gateway functions.
// Plain module — no Deno.serve; imported by functions that mint/validate keys.

export const generateRandomKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint32Array(32);
  crypto.getRandomValues(bytes);
  let key = "";
  for (let i = 0; i < 32; i++) key += chars.charAt(bytes[i] % chars.length);
  return key;
};

export const hashKey = async (key) => {
  const data = new TextEncoder().encode(key);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Simple in-memory IP rate limiter. Returns an rlCheck(req) function.
export function makeRateLimiter(max, windowMs) {
  const attempts = new Map();
  return function rlCheck(req) {
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = (req.headers.get("cf-connecting-ip") || fwd.split(",")[0] || "unknown").trim();
    const now = Date.now();
    const recent = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return false;
    recent.push(now);
    attempts.set(ip, recent);
    return true;
  };
}