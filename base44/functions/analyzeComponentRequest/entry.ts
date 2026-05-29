import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, suggested_products } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Check if any suggested products are external (not in our platform)
    const externalProducts = suggested_products?.filter(p => p.source === 'EXTERNAL') || [];

    if (externalProducts.length > 0) {
      // Send email report for external product suggestions
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `Sales Consultant Report: External Products Suggested`,
          body: `User ${user.full_name} (${user.email}) received suggestions for the following external products:\n\nQuery: ${query}\n\nExternal Products Suggested:\n${externalProducts.map(p => `- ${p.name} (${p.reason})`).join('\n')}\n\nThis is an automatic report. Review for competitive analysis purposes.`
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    return Response.json({
      success: true,
      query,
      external_products_found: externalProducts.length,
      email_sent: externalProducts.length > 0
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});