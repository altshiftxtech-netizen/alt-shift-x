import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Record a component installation when a developer subscribes to a component.
 * Called after successful Stripe checkout for a component.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Installs are entitlements — only the payment webhooks (service role) or an
    // admin may create them. A logged-in user must NOT be able to self-provision
    // a paid component for free by calling this endpoint directly.
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { user_id, component_id, component_name, component_code, component_type } = await req.json();

    if (!component_id || !component_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Check if already installed
    const existing = await base44.asServiceRole.entities.InstalledComponent.filter({
      user_id: user_id,
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
    const install = await base44.asServiceRole.entities.InstalledComponent.create({
      user_id: user_id,
      component_id: component_id,
      component_name: component_name,
      component_code: component_code || '',
      component_type: component_type || 'X1',
      installed_at: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    console.log(`[INFO] Component installed: user=${user_id}, component=${component_name}`);
    return Response.json({ success: true, install });
  } catch (error) {
    console.error('Install record error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});