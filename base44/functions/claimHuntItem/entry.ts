import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Claims a Speakeasy scavenger-hunt prize.
// - Verifies the user is authenticated.
// - Verifies the fixture maps to an active hunt item.
// - Prevents double-claims (one find per user per fixture).
// - Records the find, bumps found_count, and emails the user their prize.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fixture_id } = await req.json();
    if (!fixture_id) return Response.json({ error: 'Missing fixture_id' }, { status: 400 });

    // Find the active hunt item for this fixture.
    const items = await base44.asServiceRole.entities.SpeakeasyHuntItem.filter({ fixture_id, is_active: true });
    const item = items[0];
    if (!item) {
      return Response.json({ error: 'No active hunt item for this fixture' }, { status: 404 });
    }

    // Already claimed by this user?
    const existing = await base44.asServiceRole.entities.SpeakeasyHuntFind.filter({ user_id: user.id, fixture_id });
    if (existing.length > 0) {
      return Response.json({
        already_claimed: true,
        item_name: item.item_name,
        prize_value: item.prize_value,
        message: `You already found the ${item.item_name}.`,
      });
    }

    // Record the find.
    const find = await base44.asServiceRole.entities.SpeakeasyHuntFind.create({
      user_id: user.id,
      user_name: user.full_name || user.email,
      fixture_id,
      item_name: item.item_name,
      prize_type: item.prize_type,
      prize_value: item.prize_value,
      found_at: new Date().toISOString(),
      email_sent: false,
    });

    // Bump the global found counter.
    await base44.asServiceRole.entities.SpeakeasyHuntItem.update(item.id, {
      found_count: (item.found_count || 0) + 1,
    });

    // Email the prize to the user (best-effort — never fail the claim on email error).
    let emailSent = false;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'The Speakeasy',
        to: user.email,
        subject: `🎉 You found the ${item.item_name}!`,
        body:
          `Congratulations${user.full_name ? ', ' + user.full_name : ''}!\n\n` +
          `You discovered a hidden prize in the Speakeasy:\n\n` +
          `${item.item_name}\n${item.description || ''}\n\n` +
          `Your Prize: ${item.prize_value || item.prize_type}\n\n` +
          `Keep exploring — there's more hidden in the room. 🥂\n\n— The Speakeasy`,
      });
      emailSent = true;
      await base44.asServiceRole.entities.SpeakeasyHuntFind.update(find.id, { email_sent: true });
    } catch (e) {
      console.error('Hunt prize email failed:', e?.message || e);
    }

    return Response.json({
      success: true,
      item_name: item.item_name,
      description: item.description,
      prize_type: item.prize_type,
      prize_value: item.prize_value,
      email_sent: emailSent,
      message: `You found the ${item.item_name}!`,
    });
  } catch (error) {
    console.error('claimHuntItem error:', error?.message || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});