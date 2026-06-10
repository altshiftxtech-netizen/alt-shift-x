import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Resend Inbound (MX) webhook handler.
 *
 * Resend POSTs an `email.received` event to this endpoint whenever an email
 * arrives at an address on your verified inbound domain. We verify the shared
 * secret, then persist the message as an InboundMessage row for the Mail Room.
 *
 * SECURITY: Resend signs inbound webhooks via the Svix headers, but to keep
 * setup simple we also accept a shared secret passed as ?secret=... in the
 * webhook URL you register in the Resend dashboard. The secret must match the
 * INBOUND_EMAIL_WEBHOOK_SECRET app secret.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1) Verify the shared secret from the query string.
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get('secret');
    const expectedSecret = Deno.env.get('INBOUND_EMAIL_WEBHOOK_SECRET');
    if (!expectedSecret || providedSecret !== expectedSecret) {
      console.error('[inboundEmail] secret mismatch or missing');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2) Parse the Resend inbound payload.
    const payload = await req.json();
    // Resend wraps the email in { type, data }. The shape mirrors the email object.
    const data = payload?.data || payload || {};

    // `from` can be a string ("Name <addr>") or an object { name, email }.
    const rawFrom = data.from;
    let fromEmail = '';
    let fromName = '';
    if (typeof rawFrom === 'string') {
      const match = rawFrom.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
      if (match) { fromName = match[1]; fromEmail = match[2]; }
      else { fromEmail = rawFrom.trim(); }
    } else if (rawFrom && typeof rawFrom === 'object') {
      fromName = rawFrom.name || '';
      fromEmail = rawFrom.email || '';
    }

    // `to` can be an array or a string.
    const rawTo = Array.isArray(data.to) ? data.to[0] : data.to;
    let toEmail = '';
    if (typeof rawTo === 'string') {
      const m = rawTo.match(/<([^>]+)>/);
      toEmail = m ? m[1] : rawTo.trim();
    } else if (rawTo && typeof rawTo === 'object') {
      toEmail = rawTo.email || '';
    }

    if (!fromEmail) {
      console.error('[inboundEmail] no sender address in payload');
      return Response.json({ error: 'Missing sender' }, { status: 400 });
    }

    // 3) Try to match a known subscriber.
    let subscriberId = undefined;
    try {
      const subs = await base44.asServiceRole.entities.EmailSubscriber.filter({ email: fromEmail });
      if (subs && subs.length > 0) subscriberId = subs[0].id;
    } catch (e) {
      console.warn('[inboundEmail] subscriber lookup failed:', e.message);
    }

    // 4) Persist the inbound message.
    const record = await base44.asServiceRole.entities.InboundMessage.create({
      from_email: fromEmail,
      from_name: fromName || undefined,
      to_email: toEmail || undefined,
      subject: data.subject || '(no subject)',
      body_text: data.text || data.body_text || '',
      body_html: data.html || data.body_html || '',
      subscriber_id: subscriberId,
      status: 'unread',
      sentiment: 'unknown',
      received_at: new Date().toISOString(),
    });

    console.log('[inboundEmail] stored message', record.id, 'from', fromEmail);
    return Response.json({ success: true, id: record.id });
  } catch (error) {
    console.error('[inboundEmail] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});