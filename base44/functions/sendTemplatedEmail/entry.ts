import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { template_name, to_email, variables = {} } = await req.json();

    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ template_name });
    if (!templates || templates.length === 0) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = templates[0];
    
    // Replace variables in subject and body
    let subject = template.subject;
    let body = template.body;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, value);
      body = body.replace(placeholder, value);
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: to_email,
      subject,
      body
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});