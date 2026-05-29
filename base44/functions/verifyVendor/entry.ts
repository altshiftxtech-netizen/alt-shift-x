import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { vendor_id, verified } = await req.json();

    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: vendor_id });

    if (!vendor || vendor.length === 0) {
      return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const newStatus = verified ? 'verified' : 'rejected';

    const updated = await base44.asServiceRole.entities.Vendor.update(vendor_id, {
      verification_status: newStatus
    });

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'approve',
      entity_type: 'vendor',
      entity_id: vendor_id,
      change_summary: `Vendor ${vendor[0].company_name} verification status set to ${newStatus}`,
      risk_level: 'medium',
      new_values: updated
    });

    // Notify vendor
    try {
      const message = verified 
        ? 'Your vendor account has been verified and is now active.' 
        : 'Your vendor account verification was rejected. Please contact support.';
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vendor[0].contact_email,
        subject: `Vendor Account ${verified ? 'Verified' : 'Rejected'}`,
        body: message
      });
    } catch (emailErr) {
      console.warn('Vendor notification failed:', emailErr.message);
    }

    return Response.json({ success: true, vendor: updated });
  } catch (error) {
    console.error('Vendor verification failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});