import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Support both authenticated user calls and internal service-role calls
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // Called internally (no user session) — allowed for service operations
    }

    const {
      action,
      entity_type,
      entity_id,
      change_summary,
      old_values = null,
      new_values = null,
      risk_level = 'low',
      approval_required = false,
      // Allow caller to pass performer identity for internal calls
      performed_by_id,
      performed_by_email,
    } = await req.json();

    if (!action || !entity_type) {
      return Response.json({ error: 'action and entity_type are required' }, { status: 400 });
    }

    // Resolve who performed the action
    const performerId = user?.id || performed_by_id || 'system';
    const performerEmail = user?.email || performed_by_email || 'system@altshiftx.com';
    const performerRole = user?.role || 'system';

    // Assess risk level based on action and entity type
    let assessedRisk = risk_level;
    if (action === 'delete' || entity_type === 'api_key') assessedRisk = 'high';
    if (action === 'approve' && entity_type === 'invoice') assessedRisk = 'medium';
    if (new_values?.status === 'rejected') assessedRisk = 'medium';
    if (new_values?.status === 'paid' || action === 'update' && entity_type === 'invoice') assessedRisk = 'high';

    const auditEntry = await base44.asServiceRole.entities.AuditTrail.create({
      action,
      entity_type,
      entity_id: entity_id || null,
      performed_by: performerId,
      user_email: performerEmail,
      user_role: performerRole,
      change_summary: change_summary || `${action} on ${entity_type}`,
      old_values: old_values || null,
      new_values: new_values || null,
      risk_level: assessedRisk,
      approval_required: approval_required || assessedRisk === 'critical',
      timestamp: new Date().toISOString()
    });

    // Send alert for critical/high risk actions involving real money
    if ((assessedRisk === 'critical' || assessedRisk === 'high') && user?.email) {
      const adminEmail = "admin@altshiftx.com";
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `⚠️ Audit Alert: ${action.toUpperCase()} on ${entity_type}`,
          body: `High-risk action logged on the Alt+Shift+X platform.\n\nAction: ${action}\nEntity Type: ${entity_type}\nEntity ID: ${entity_id || 'N/A'}\nSummary: ${change_summary}\nPerformed by: ${user.full_name || performerEmail} (${performerEmail})\nRole: ${performerRole}\nTime: ${new Date().toISOString()}\nAudit ID: ${auditEntry.id}\n\nReview the full audit trail at: https://app.altshiftx.com/finance`
        });
      } catch (emailErr) {
        console.warn('Audit alert email failed:', emailErr.message);
      }
    }

    return Response.json({ success: true, audit_id: auditEntry.id });
  } catch (error) {
    console.error('Audit logging failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});