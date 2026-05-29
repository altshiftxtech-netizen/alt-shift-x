import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const { email, tax_id } = await req.json();

    if (!email || !tax_id) {
      return Response.json({ error: 'Email and Tax ID required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Find vendor by email and tax_id
    const vendors = await base44.asServiceRole.entities.Vendor.filter({ contact_email: email, tax_id });

    if (!vendors || vendors.length === 0) {
      return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const vendor = vendors[0];

    if (vendor.status !== 'active') {
      return Response.json({ error: 'Vendor account is not active' }, { status: 403 });
    }

    if (vendor.verification_status !== 'verified') {
      return Response.json({ error: 'Vendor account not verified' }, { status: 403 });
    }

    // Generate secure token
    const token = crypto.randomUUID();
    
    // Update vendor with token and last login
    await base44.asServiceRole.entities.Vendor.update(vendor.id, {
      access_token: token,
      last_login: new Date().toISOString()
    });

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'access',
      entity_type: 'vendor',
      entity_id: vendor.id,
      change_summary: `Vendor ${vendor.company_name} logged in`,
      risk_level: 'low'
    });

    return Response.json({
      success: true,
      vendor_id: vendor.id,
      token,
      company_name: vendor.company_name
    });
  } catch (error) {
    console.error('Vendor login failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});