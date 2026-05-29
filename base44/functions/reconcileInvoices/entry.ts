import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoice_data, budget_data, po_data } = await req.json();

    if (!invoice_data) {
      return Response.json({ error: 'Invoice data required' }, { status: 400 });
    }

    // Analyze invoice against budget and PO
    const analysisPrompt = `Analyze this invoice against budget and PO data for discrepancies:

Invoice: ${JSON.stringify(invoice_data)}
Budget: ${JSON.stringify(budget_data)}
Purchase Order: ${JSON.stringify(po_data)}

Identify discrepancies including:
- Amount mismatches
- Missing PO references
- Budget overages
- Duplicate charges
- Unauthorized items

Provide JSON response with:
- discrepancies (array of {type, severity, description, variance_amount})
- match_status (matched/partial_match/unmatched/flagged)
- confidence_score (0-100)
- requires_review (boolean)`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          discrepancies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
                variance_amount: { type: 'number' }
              }
            }
          },
          match_status: { type: 'string' },
          confidence_score: { type: 'number' },
          requires_review: { type: 'boolean' }
        }
      }
    });

    // Create reconciliation record
    const reconciliation = await base44.entities.Reconciliation.create({
      reconciliation_type: po_data ? 'invoice_vs_po' : 'invoice_vs_budget',
      invoice_data,
      budget_data: budget_data || {},
      po_data: po_data || {},
      discrepancies: analysis.discrepancies,
      match_status: analysis.match_status,
      confidence_score: analysis.confidence_score,
      requires_review: analysis.requires_review,
      reconciled_by: user.id,
      reconciled_at: new Date().toISOString()
    });

    // Log audit trail
    await base44.functions.invoke('logAuditTrail', {
      action: 'reconcile',
      entity_type: 'reconciliation',
      entity_id: reconciliation.id,
      change_summary: `Invoice ${invoice_data.invoice_number} reconciled - Status: ${analysis.match_status}`,
      risk_level: analysis.discrepancies.some(d => d.severity === 'critical') ? 'critical' : 'low',
      new_values: reconciliation
    });

    return Response.json({
      success: true,
      reconciliation,
      discrepancy_count: analysis.discrepancies.length,
      flagged: analysis.match_status === 'flagged'
    });
  } catch (error) {
    console.error('Reconciliation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});