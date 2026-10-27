import { secrets } from 'base44:runtime';

export const nodePaths = { turimc: '/turimc', codevault: '/codevault', dblive: '/dblive', omnibridge: '/omnibridge', bitfolio: '/bitfolio', sourcebridge: '/sourcebridge', magna: '/magna' };
export const issuer = 'https://altshiftx.tech';
export function encode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
}
async function signingKey() {
  const secret = secrets.get('SESSION_BRIDGE_SIGNING_KEY');
  if (!secret || new TextEncoder().encode(secret).length < 32) throw new Error('Handoff signing key must contain at least 32 bytes');
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function signHandoff(nodeId) {
  const now = Math.floor(Date.now() / 1000);
  // Navigation provenance only. No identity, email, login token, or paid entitlement is transported.
  const claims = { v: 1, purpose: 'navigation_handoff', iss: issuer, aud: nodeId, path: nodePaths[nodeId], iat: now, exp: now + 60, jti: crypto.randomUUID() };
  const payload = encode(new TextEncoder().encode(JSON.stringify(claims)));
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), new TextEncoder().encode(payload));
  return { token: `${payload}.${encode(new Uint8Array(signature))}`, expiresAt: new Date(claims.exp * 1000).toISOString() };
}
export async function verifyHandoff(token, nodeId) {
  if (typeof token !== 'string' || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const key = await signingKey();
  try {
    const signature = decode(parts[1]);
    if (signature.length !== 32 || !await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(parts[0]))) return null;
    const claims = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const now = Math.floor(Date.now() / 1000);
    if (claims.v !== 1 || claims.purpose !== 'navigation_handoff' || claims.iss !== issuer || claims.aud !== nodeId || claims.path !== nodePaths[nodeId]) return null;
    if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp - claims.iat !== 60 || claims.iat > now || claims.exp <= now || typeof claims.jti !== 'string') return null;
    return { source: claims.iss, nodeId: claims.aud, path: claims.path, issuedAt: claims.iat, expiresAt: claims.exp };
  } catch { return null; }
}
export const privateHeaders = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };