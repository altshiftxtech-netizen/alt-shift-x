import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      action,
      entity_type,
      entity_id,
      change_summary,
      old_values = null,
      new_values = null,
      risk_level = 'low',
      approval_required = false
    } = await req.json();

    // Assess risk level based on action and entity type
    let assessedRisk = risk_level;
    if (action === 'delete' || entity_type === 'api_key') assessedRisk = 'high';
    if (new_values?.status === 'rejected') assessedRisk = 'medium';

    // Create audit trail record
    const auditEntry = await base44.entities.AuditTrail.create({
      action,
      entity_type,
      entity_id,
      performed_by: user.id,
      user_email: user.email,
      user_role: user.role,
      change_summary,
      old_values,
      new_values,
      risk_level: assessedRisk,
      approval_required: approval_required || assessedRisk === 'critical',
      timestamp: new Date().toISOString()
    });

    // Send alert for critical/high risk actions
    if (assessedRisk === 'critical' || assessedRisk === 'high') {
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `⚠️ Audit Alert: ${action.toUpperCase()} on ${entity_type}`,
          body: `High-risk action logged:\n\nAction: ${action}\nEntity: ${entity_type}\nSummary: ${change_summary}\nPerformed by: ${user.full_name} (${user.email})\nTime: ${new Date().toISOString()}\n\nReview audit trail for details.`
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