import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // action: "accept" | "decline" | "revoke"
    const { pairingId, action, declineReason } = await req.json();
    if (!pairingId || !action) {
      return Response.json({ error: 'pairingId and action are required' }, { status: 400 });
    }

    const pairing = await base44.asServiceRole.entities.KitPairing.filter({ id: pairingId }).then((r) => r[0]);
    if (!pairing) return Response.json({ error: 'Pairing not found' }, { status: 404 });

    const isPartner = pairing.partner_id === user.id;
    const isRequester = pairing.requester_id === user.id;
    if (!isPartner && !isRequester) {
      return Response.json({ error: 'You are not a party to this pairing' }, { status: 403 });
    }

    if (action === 'accept') {
      if (!isPartner) return Response.json({ error: 'Only the partner can accept' }, { status: 403 });
      if (pairing.status !== 'pending') return Response.json({ error: 'Pairing is not pending' }, { status: 400 });

      // Re-verify the IP statement integrity hash before activating — tight, tamper-proof
      const recomputed = await sha256(pairing.ip_statement || '');
      if (recomputed !== pairing.ip_statement_hash) {
        return Response.json({ error: 'IP statement integrity check failed — pairing voided' }, { status: 409 });
      }

      const updated = await base44.asServiceRole.entities.KitPairing.update(pairingId, {
        status: 'accepted',
        partner_acknowledged: true,
        accepted_at: new Date().toISOString(),
      });
      return Response.json({ success: true, pairing: updated });
    }

    if (action === 'decline') {
      if (!isPartner) return Response.json({ error: 'Only the partner can decline' }, { status: 403 });
      if (pairing.status !== 'pending') return Response.json({ error: 'Pairing is not pending' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.KitPairing.update(pairingId, {
        status: 'declined',
        decline_reason: declineReason || '',
      });
      return Response.json({ success: true, pairing: updated });
    }

    if (action === 'revoke') {
      // Either party can revoke with notice — terminates the kit after the notice period
      if (!['pending', 'accepted'].includes(pairing.status)) {
        return Response.json({ error: 'Pairing cannot be revoked in its current state' }, { status: 400 });
      }
      const noticeDays = pairing.revoke_notice_days || 30;
      const effective = new Date(Date.now() + noticeDays * 24 * 60 * 60 * 1000).toISOString();
      const updated = await base44.asServiceRole.entities.KitPairing.update(pairingId, {
        status: 'revoked',
        revoked_by_id: user.id,
        termination_effective_at: effective,
      });
      return Response.json({ success: true, pairing: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('respondKitPairing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});