import { nodePaths, verifyHandoff, privateHeaders } from '../../shared/navigationHandoff.ts';

export default async function(req) {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: privateHeaders });
  try {
    const { bridgeToken, nodeId } = await req.json().catch(() => ({}));
    if (typeof nodeId !== 'string' || !Object.hasOwn(nodePaths, nodeId) || typeof bridgeToken !== 'string') return Response.json({ valid: false, error: 'Token and destination node are required' }, { status: 400, headers: privateHeaders });
    const navigation = await verifyHandoff(bridgeToken, nodeId);
    if (!navigation) return Response.json({ valid: false, error: 'Invalid, expired, or wrong-destination handoff' }, { status: 401, headers: privateHeaders });
    // Public verification of navigation provenance, never user authentication or authorization.
    return Response.json({ valid: true, purpose: 'navigation_only', navigation, grantsSession: false }, { headers: privateHeaders });
  } catch (error) {
    console.error('Navigation handoff validation failed:', error.message);
    return Response.json({ valid: false, error: 'Navigation validation is unavailable' }, { status: 500, headers: privateHeaders });
  }
}