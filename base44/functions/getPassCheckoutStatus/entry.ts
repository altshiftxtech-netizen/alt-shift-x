import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { syncPassCheckout } from '../../shared/sovereignPassPayments.ts';
import { sovereignPassTiers } from '../../shared/sovereignPassCatalog.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Sign in to view this payment.' }, { status: 401 });
    const { sessionId } = await req.json();
    if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return Response.json({ error: 'Invalid checkout reference.' }, { status: 400 });
    const stripe = new Stripe(sessionId.startsWith('cs_test_') ? secrets.get('STRIPE_TEST_SECRET_KEY') : secrets.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.user_id !== user.id || session.metadata?.purchase_type !== 'sovereign_pass' || session.metadata?.base44_app_id !== secrets.get('BASE44_APP_ID')) return Response.json({ error: 'This checkout does not belong to your account.' }, { status: 403 });
    // New checkouts are fulfilled only by the signature-verified payment webhook.
    const pass = session.metadata.checkout_version === 'robot-waves-v1'
      ? (await base44.asServiceRole.entities.SovereignPass.filter({ stripe_session_id: session.id, user_id: user.id }, { limit: 1 })).items[0] || null
      : await syncPassCheckout(base44, stripe, session);
    return Response.json({ paymentStatus: session.payment_status, checkoutStatus: session.status, pass: pass ? { id: pass.id, name: sovereignPassTiers[pass.tier].name, tier: pass.tier, nodeIds: pass.node_ids, expiresAt: pass.expires_at, status: pass.expires_at && new Date(pass.expires_at) < new Date() ? 'expired' : pass.status, testMode: pass.test_mode } : null });
  } catch (error) {
    console.error('[getPassCheckoutStatus]', error.message);
    return Response.json({ error: 'Unable to verify this checkout. Please retry.' }, { status: 500 });
  }
}