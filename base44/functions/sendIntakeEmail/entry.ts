import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BUSINESS_EMAIL = "intake@altshiftx.com"; // Change to your real business email

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile } = await req.json();

    const intakeDetails = `
      Name: ${profile.first_name} ${profile.last_name}
      Email: ${profile.email}
      Phone: ${profile.phone || 'Not provided'}
      Company: ${profile.company_name || 'Not provided'}
      Job Title: ${profile.job_title || 'Not provided'}
      Industry: ${profile.industry || 'Not provided'}
      Company Size: ${profile.company_size || 'Not provided'}
      Country: ${profile.country || 'Not provided'}
      State/Province: ${profile.state_province || 'Not provided'}
      Use Case: ${profile.use_case || 'Not provided'}
      How They Heard: ${profile.how_did_you_hear || 'Not provided'}
      Agreed to Terms: ${profile.agreed_to_terms ? 'Yes' : 'No'}
      Agreed to Privacy: ${profile.agreed_to_privacy ? 'Yes' : 'No'}
      Submitted At: ${new Date().toISOString()}
      User ID: ${user.id}
    `.trim();

    // Send to business email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: BUSINESS_EMAIL,
      subject: `New User Intake — ${profile.first_name} ${profile.last_name} (${profile.company_name || profile.email})`,
      body: `<h2>New User Registration Intake</h2><pre style="font-family:monospace;background:#f5f5f5;padding:16px;border-radius:8px;">${intakeDetails}</pre>`,
    });

    // Send confirmation to user
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: profile.email,
      from_name: "Alt+Shift+X",
      subject: "Welcome to Alt+Shift+X — Your Application is Confirmed",
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
          <h1 style="color:#1e293b;font-size:24px;margin-bottom:8px;">Welcome, ${profile.first_name}!</h1>
          <p style="color:#64748b;">Your account application has been received and confirmed. Here's a summary of the information you submitted:</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;">
            <h3 style="color:#1e293b;margin-top:0;">Application Summary</h3>
            <pre style="font-family:monospace;color:#334155;white-space:pre-wrap;">${intakeDetails}</pre>
          </div>
          <p style="color:#64748b;">You now have full access to the Alt+Shift+X marketplace. You can:</p>
          <ul style="color:#64748b;">
            <li>Browse and install AI components from the Marketplace</li>
            <li>Create API keys for your integrations</li>
            <li>Track usage and analytics</li>
            <li>Build and publish your own components</li>
          </ul>
          <a href="${req.headers.get('origin') || 'https://altshiftx.com'}/dashboard" style="display:inline-block;background:#4c1d95;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Go to Dashboard →</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px;">If you have any questions, contact us at support@altshiftx.com</p>
        </div>
      `,
    });

    // Mark intake as complete and welcome email sent
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    if (profiles && profiles.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
        intake_completed: true,
        intake_completed_at: new Date().toISOString(),
        welcome_email_sent: true,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[sendIntakeEmail] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});