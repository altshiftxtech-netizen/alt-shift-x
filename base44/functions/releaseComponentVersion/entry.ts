import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      component_id,
      version,
      changelog,
      breaking_change,
      changes,
      snapshot,
      auto_upgrade_eligible,
    } = body;

    if (!component_id || !version || !changelog) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch component to verify ownership
    const components = await base44.entities.Component.filter({ id: component_id });
    if (!components.length || components[0].builder_id !== user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const component = components[0];

    // Check if version already exists
    const existingVersions = await base44.entities.ComponentVersion.filter({
      component_id,
      version,
    });

    if (existingVersions.length > 0) {
      return Response.json(
        { error: `Version ${version} already exists` },
        { status: 409 }
      );
    }

    // Create version record
    const versionRecord = await base44.entities.ComponentVersion.create({
      component_id,
      component_name: component.name,
      version,
      builder_id: user.id,
      changelog,
      snapshot: snapshot || component,
      breaking_change: breaking_change || false,
      changes: changes || { added: [], modified: [], removed: [] },
      status: 'published',
      auto_upgrade_eligible: auto_upgrade_eligible !== false,
      published_at: new Date().toISOString(),
      trust_score_at_publish: component.trust_score || 0,
    });

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'create',
      entity_type: 'component',
      entity_id: component_id,
      change_summary: `Released component version ${version} (${breaking_change ? 'breaking' : 'non-breaking'})`,
    });

    console.log(`[INFO] Component ${component.name} v${version} released by ${user.email}`);

    return Response.json({
      success: true,
      version_id: versionRecord.id,
      version,
      component_id,
      component_name: component.name,
      breaking_change,
      status: 'published',
      published_at: versionRecord.published_at,
    });
  } catch (error) {
    console.error('Release version error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});