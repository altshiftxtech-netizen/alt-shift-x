import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { invoice_id } = await req.json();

    const invoice = await base44.asServiceRole.entities.InvoiceSubmission.filter({ id: invoice_id });
    if (!invoice || invoice.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const inv = invoice[0];

    if (inv.status !== 'approved') {
      return Response.json({ error: 'Only approved invoices can be paid' }, { status: 400 });
    }

    // Update invoice status
    const updated = await base44.asServiceRole.entities.InvoiceSubmission.update(invoice_id, {
      status: 'paid',
      payment_status: 'processed'
    });

    // Get vendor details
    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: inv.vendor_id });

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'update',
      entity_type: 'invoice',
      entity_id: invoice_id,
      change_summary: `Invoice ${inv.invoice_number} marked as paid - Amount: $${(inv.amount / 100).toFixed(2)}`,
      risk_level: 'medium',
      new_values: updated
    });

    // Send payment notification
    if (vendor && vendor.length > 0) {
      try {
        await base44.asServiceRole.functions.invoke('sendTemplatedEmail', {
          template_name: 'payment_processed',
          to_email: vendor[0].contact_email,
          variables: {
            vendor_name: vendor[0].company_name,
            invoice_number: inv.invoice_number,
            amount: (inv.amount / 100).toFixed(2)
          }
        });
      } catch (emailErr) {
        console.warn('Payment notification failed:', emailErr.message);
      }
    }

    return Response.json({
      success: true,
      invoice: updated
    });
  } catch (error) {
    console.error('Payment processing failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});