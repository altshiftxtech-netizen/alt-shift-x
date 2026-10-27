import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { nodePaths, issuer, signHandoff, privateHeaders } from '../../shared/navigationHandoff.ts';

export default async function(req) {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: privateHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(e => (e.status === 401 || e.status === 403) ? null : Promise.reject(e));
    if (!user) return Response.json({ error: 'Sign in to create a navigation handoff' }, { status: 401, headers: privateHeaders });
    const { nodeId } = await req.json().catch(() => ({}));
    if (typeof nodeId !== 'string' || !Object.hasOwn(nodePaths, nodeId)) return Response.json({ error: 'Unknown suite node' }, { status: 400, headers: privateHeaders });
    const { token, expiresAt } = await signHandoff(nodeId);
    const target = new URL(nodePaths[nodeId], issuer);
    target.searchParams.set('session_bridge', token);
    return Response.json({ url: target.href, expiresAt, purpose: 'navigation_only' }, { headers: privateHeaders });
  } catch (error) {
    console.error('Navigation handoff creation failed:', error.message);
    return Response.json({ error: 'Navigation handoff is unavailable' }, { status: 500, headers: privateHeaders });
  }
}