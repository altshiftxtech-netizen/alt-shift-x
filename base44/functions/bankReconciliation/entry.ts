import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { statement_date, statement_balance, transactions = [] } = await req.json();
    
    // Get user if available, fallback to system
    let user = { role: 'admin', id: 'system', email: 'system@admin' };
    try {
      const authUser = await base44.auth.me();
      if (authUser) user = authUser;
    } catch {
      // Continue with system user
    }

    // Fetch all paid invoices up to statement date
    const allInvoices = await base44.asServiceRole.entities.InvoiceSubmission.list('-created_date', 500);
    const paidInvoices = allInvoices.filter(inv => 
      inv.status === 'paid' && 
      new Date(inv.submitted_at) <= new Date(statement_date)
    );

    // Calculate expected balance
    const expectedBalance = paidInvoices.reduce((sum, inv) => sum + inv.amount / 100, 0);
    
    // Match transactions to invoices
    const discrepancies = [];
    const matched = [];

    transactions.forEach(txn => {
      const matchedInv = paidInvoices.find(inv => 
        Math.abs((inv.amount / 100) - txn.amount) < 0.01
      );

      if (matchedInv) {
        matched.push({
          transaction: txn,
          invoice: matchedInv.id,
          status: 'matched'
        });
      } else {
        discrepancies.push({
          type: 'unmatched_transaction',
          amount: txn.amount,
          date: txn.date,
          description: txn.description,
          severity: 'medium'
        });
      }
    });

    // Check for missing transactions
    paidInvoices.forEach(inv => {
      if (!matched.find(m => m.invoice === inv.id)) {
        discrepancies.push({
          type: 'missing_transaction',
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          amount: inv.amount / 100,
          severity: 'high'
        });
      }
    });

    // Create reconciliation record
    const reconciliation = await base44.asServiceRole.entities.Reconciliation.create({
      reconciliation_type: 'invoice_vs_po',
      invoice_data: {
        invoice_number: 'Batch',
        vendor: 'Multiple',
        amount: expectedBalance,
        date: statement_date,
        items: [`${paidInvoices.length} invoices processed`]
      },
      budget_data: {
        budget_id: 'AP-2026',
        allocated_amount: expectedBalance + 10000,
        spent_amount: expectedBalance,
        remaining_budget: 10000
      },
      po_data: {
        po_number: 'N/A',
        po_amount: expectedBalance,
        line_items: paidInvoices.map(inv => inv.invoice_number)
      },
      discrepancies,
      match_status: discrepancies.length === 0 ? 'matched' : 'partial_match',
      confidence_score: Math.max(0, 100 - (discrepancies.length * 10)),
      requires_review: discrepancies.length > 0,
      reconciled_by: user.id,
      reconciled_at: new Date().toISOString()
    });

    // Log audit trail (skip if fails)
    try {
      await base44.asServiceRole.functions.invoke('logAuditTrail', {
        action: 'reconcile',
        entity_type: 'reconciliation',
        entity_id: reconciliation.id,
        change_summary: `Bank reconciliation completed for ${statement_date}. Discrepancies: ${discrepancies.length}`,
        risk_level: discrepancies.length > 0 ? 'medium' : 'low',
        new_values: { reconciliation_id: reconciliation.id }
      });
    } catch (_auditErr) {
      // Audit logging is best-effort and non-blocking — ignore failures quietly.
    }

    return Response.json({
      success: true,
      reconciliation: {
        id: reconciliation.id,
        match_status: reconciliation.match_status,
        confidence_score: reconciliation.confidence_score,
        expected_balance: expectedBalance,
        statement_balance,
        variance: Math.abs(expectedBalance - statement_balance),
        matched_count: matched.length,
        discrepancies_count: discrepancies.length,
        discrepancies
      }
    });
  } catch (error) {
    console.error('Bank reconciliation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});