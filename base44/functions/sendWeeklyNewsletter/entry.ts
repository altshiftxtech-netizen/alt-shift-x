import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get recently published components (last 7 days)
    const allComponents = await base44.asServiceRole.entities.Component.list('-created_date', 50);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newComponents = allComponents.filter(c => {
      if (c.status !== 'published') return false;
      const createdAt = new Date(c.created_date);
      return createdAt >= oneWeekAgo;
    });

    if (newComponents.length === 0) {
      console.log('[Newsletter] No new components this week, skipping send.');
      return Response.json({ success: true, message: 'No new components this week', sent: 0 });
    }

    // Get all users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Build component list HTML
    const componentItems = newComponents.map(c =>
      `• ${c.name} (${c.type}) — ${c.category}\n  ${c.description || ''}`
    ).join('\n\n');

    const componentHtml = newComponents.map(c => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
          <strong>${c.name}</strong><br/>
          <span style="color:#7c3aed;font-size:12px;font-weight:bold;">${c.type}</span>&nbsp;
          <span style="color:#64748b;font-size:12px;">${c.category}</span><br/>
          <span style="color:#64748b;font-size:13px;">${c.description || ''}</span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap;">
          <span style="font-size:12px;color:#64748b;">$${c.price || 0}/mo</span>
        </td>
      </tr>
    `).join('');

    let sent = 0;
    for (const user of users) {
      if (!user.email) continue;
      const subject = `🚀 ${newComponents.length} New Component${newComponents.length > 1 ? 's' : ''} on Alt+Shift+X This Week`;
      const body = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <div style="background:#0f172a;padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;font-weight:900;">Alt+Shift+X</h1>
    <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">Weekly Component Digest</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">New This Week</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Hi ${user.full_name || 'there'}, here are the latest verified AI components added to the marketplace:</p>
    <table style="width:100%;border-collapse:collapse;">
      ${componentHtml}
    </table>
    <div style="text-align:center;margin-top:32px;">
      <a href="https://altshiftx.tech/marketplace" style="background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Browse Marketplace →</a>
    </div>
  </div>
  <div style="padding:24px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Alt+Shift+X · You're receiving this because you have an account.</p>
  </div>
</div>
</body>
</html>`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: user.email, subject, body });
        sent++;
      } catch (err) {
        console.error(`[Newsletter] Failed to send to ${user.email}:`, err.message);
      }
    }

    console.log(`[Newsletter] Sent to ${sent} users`);
    return Response.json({ success: true, sent, components: newComponents.length });
  } catch (error) {
    console.error('[Newsletter] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});