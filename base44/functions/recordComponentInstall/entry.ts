import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Record a component installation when a developer subscribes to a component.
 * Called after successful Stripe checkout for a component.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { component_id, component_name, component_code, component_type } = await req.json();

    if (!component_id || !component_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already installed
    const existing = await base44.entities.InstalledComponent.filter({
      user_id: user.id,
      component_id: component_id
    });

    if (existing.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Component already installed for this user',
        install: existing[0]
      }, { status: 200 });
    }

    // Create installation record
    const install = await base44.entities.InstalledComponent.create({
      user_id: user.id,
      component_id: component_id,
      component_name: component_name,
      component_code: component_code || '',
      component_type: component_type || 'X1',
      installed_at: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    console.log(`[INFO] Component installed: user=${user.id}, component=${component_name}`);
    return Response.json({ success: true, install });
  } catch (error) {
    console.error('Install record error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});