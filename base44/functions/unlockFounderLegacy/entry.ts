import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Unlocks the free "Founder's Legacy: Genetic Seed Kit" (FOUNDER-LEGACY-KIT-1.0)
 * for the current user — triggered by the secret "eb" keystroke behind the
 * Elias Bytewell portrait. The kit is price 0, so this is a legitimate free
 * self-provision (unlike paid components, which route through payment webhooks).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Resolve the legacy kit by its fixed code.
    const matches = await base44.asServiceRole.entities.Component.filter({ code: 'FOUNDER-LEGACY-KIT-1.0' });
    const kit = matches[0];
    if (!kit) return Response.json({ error: 'Legacy kit not found' }, { status: 404 });

    // Guard: only ever unlock a genuinely free kit through this endpoint.
    if ((kit.price || 0) > 0) {
      return Response.json({ error: 'This kit is not free' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.InstalledComponent.filter({
      user_id: user.id,
      component_id: kit.id,
    });
    if (existing.length > 0) {
      return Response.json({ success: true, already_unlocked: true, kit_name: kit.name });
    }

    await base44.asServiceRole.entities.InstalledComponent.create({
      user_id: user.id,
      component_id: kit.id,
      component_name: kit.name,
      component_code: kit.code,
      component_type: kit.type || 'X1',
      installed_at: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    console.log(`[INFO] Founder Legacy Kit unlocked: user=${user.id}`);
    return Response.json({ success: true, unlocked: true, kit_name: kit.name });
  } catch (error) {
    console.error('unlockFounderLegacy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});