import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Strict admin-only — payment processing is a high-risk operation
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return Response.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const invoices = await base44.asServiceRole.entities.InvoiceSubmission.filter({ id: invoice_id });
    if (!invoices || invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const inv = invoices[0];

    if (inv.status !== 'approved') {
      return Response.json({
        error: `Only approved invoices can be paid. Current status: ${inv.status}`,
      }, { status: 400 });
    }

    if (inv.payment_status === 'processed') {
      return Response.json({
        error: 'Invoice payment has already been processed (idempotency check)',
        invoice_id: inv.id,
      }, { status: 409 });
    }

    // Mark as paid with timestamp
    const updated = await base44.asServiceRole.entities.InvoiceSubmission.update(invoice_id, {
      status: 'paid',
      payment_status: 'processed',
    });

    // Audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'update',
      entity_type: 'invoice',
      entity_id: invoice_id,
      change_summary: `Invoice ${inv.invoice_number} marked as paid by ${user.email}. Amount: $${(inv.amount / 100).toFixed(2)}`,
      risk_level: 'high',
      old_values: { status: inv.status, payment_status: inv.payment_status },
      new_values: { status: 'paid', payment_status: 'processed' }
    }).catch(e => console.warn('Audit log failed:', e.message));

    // Notify vendor with receipt
    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: inv.vendor_id });
    if (vendor && vendor.length > 0) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: vendor[0].contact_email,
          subject: `Payment Processed – Invoice ${inv.invoice_number}`,
          body: `Dear ${vendor[0].company_name},\n\nThis is to confirm that payment has been processed for the following invoice.\n\nInvoice Number: ${inv.invoice_number}\nAmount Paid: $${(inv.amount / 100).toFixed(2)}\nPayment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\nProcessed By: ${user.full_name || user.email}\n\nPlease allow 3–5 business days for funds to appear in your account depending on your bank.\n\nFor any questions, contact finance@altshiftx.com.\n\nThank you,\nAlt+Shift+X Finance Team`
        });
      } catch (emailErr) {
        console.warn('Payment notification failed:', emailErr.message);
      }
    }

    return Response.json({
      success: true,
      invoice: updated,
      message: `Payment of $${(inv.amount / 100).toFixed(2)} processed for invoice ${inv.invoice_number}`
    });
  } catch (error) {
    console.error('Payment processing failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});