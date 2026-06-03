import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return Response.json({ error: 'Missing API key' }, { status: 401 });
    }

    // Validate tenant
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ api_key: apiKey }, '', 1);
    if (tenants.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    const tenant = tenants[0];

    // Route requests
    if (path === '/api/v1/vendors') {
      const vendors = await base44.asServiceRole.entities.Vendor.filter({ created_by_id: tenant.created_by_id });
      return Response.json({ success: true, data: vendors });
    }
    
    if (path === '/api/v1/spend-analytics') {
      const analytics = await base44.asServiceRole.entities.SpendAnalytics.filter({ tenant_id: tenant.id }, '-generated_at', 1);
      return Response.json({ success: true, data: analytics[0] || null });
    }
    
    if (path === '/api/v1/vendor-scores') {
      const scores = await base44.asServiceRole.entities.VendorPerformance.filter({ tenant_id: tenant.id });
      return Response.json({ success: true, data: scores });
    }

    if (path === '/api/v1/invoices') {
      const invoices = await base44.asServiceRole.entities.InvoiceSubmission.filter({ created_by_id: tenant.created_by_id });
      return Response.json({ success: true, data: invoices });
    }

    return Response.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    console.error('API Gateway error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});