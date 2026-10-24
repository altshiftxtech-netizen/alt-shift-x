import { secrets } from 'base44:runtime';
import { sovereignPassTiers, passNodeIds } from './sovereignPassCatalog.ts';

function isPass(metadata) { return metadata?.purchase_type === 'sovereign_pass' && metadata.base44_app_id === secrets.get('BASE44_APP_ID'); }
function periodEnd(sub) { const seconds = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end; return seconds ? new Date(seconds * 1000).toISOString() : null; }

export async function syncPassCheckout(base44, stripe, session) {
  if (!isPass(session.metadata) || session.metadata.base44_test_checkout === 'true' || session.payment_status !== 'paid') return null;
  const tier = sovereignPassTiers[session.metadata.tier];
  const nodeIds = JSON.parse(session.metadata.node_ids || '[]');
  if (!tier || !session.metadata.user_id || session.currency !== 'usd' || session.amount_subtotal !== tier.amount || session.mode !== (tier.recurring ? 'subscription' : 'payment') || nodeIds.length !== tier.nodes || new Set(nodeIds).size !== nodeIds.length || nodeIds.some(id => !passNodeIds.includes(id))) throw new Error('Pass payment details do not match the server catalog');
  const { items } = await base44.asServiceRole.entities.SovereignPass.filter({ stripe_session_id: session.id }, { limit: 1 });
  const existing = items[0];
  const sub = session.subscription ? await stripe.subscriptions.retrieve(typeof session.subscription === 'string' ? session.subscription : session.subscription.id) : null;
  const paidAt = existing?.paid_at || new Date().toISOString();
  const expiresAt = sub ? periodEnd(sub) : existing?.expires_at || new Date(new Date(paidAt).getTime() + 7 * 86400000).toISOString();
  const data = { user_id: session.metadata.user_id, tier: session.metadata.tier, node_ids: nodeIds, seat_limit: tier.seats, stripe_session_id: session.id, stripe_subscription_id: sub?.id || '', stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || '', status: sub?.status || 'active', paid_at: paidAt, expires_at: expiresAt, cancel_at_period_end: sub?.cancel_at_period_end || false, test_mode: !session.livemode };
  return existing ? await base44.asServiceRole.entities.SovereignPass.update(existing.id, data) : await base44.asServiceRole.entities.SovereignPass.create(data);
}

export async function handleSovereignPassEvent(base44, stripe, event) {
  const object = event.data.object;
  if (event.type.startsWith('checkout.session.') && isPass(object.metadata)) {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') await syncPassCheckout(base44, stripe, object);
    return true;
  }
  let sub = event.type.startsWith('customer.subscription.') ? object : null;
  const subscriptionId = object.subscription || object.parent?.subscription_details?.subscription;
  if (!sub && event.type.startsWith('invoice.') && typeof subscriptionId === 'string') sub = await stripe.subscriptions.retrieve(subscriptionId);
  if (!sub || !isPass(sub.metadata)) return false;
  const { items } = await base44.asServiceRole.entities.SovereignPass.filter({ stripe_subscription_id: sub.id }, { limit: 1 });
  if (items[0]) await base44.asServiceRole.entities.SovereignPass.update(items[0].id, { status: sub.status, expires_at: periodEnd(sub), cancel_at_period_end: sub.cancel_at_period_end || false });
  return true;
}