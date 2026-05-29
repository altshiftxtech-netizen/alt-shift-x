import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { invoice_id, action, notes, scheduled_payment_date } = await req.json();

    if (!invoice_id || !action) {
      return Response.json({ error: 'Invoice ID and action required' }, { status: 400 });
    }

    const invoice = await base44.asServiceRole.entities.InvoiceSubmission.filter({ id: invoice_id });

    if (!invoice || invoice.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const inv = invoice[0];
    let updateData = { review_notes: notes };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.payment_status = 'scheduled';
      updateData.scheduled_payment_date = scheduled_payment_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.rejection_reason = notes;
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.InvoiceSubmission.update(invoice_id, updateData);

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: action === 'approve' ? 'approve' : 'reject',
      entity_type: 'invoice',
      entity_id: invoice_id,
      change_summary: `Invoice ${inv.invoice_number} ${action}d by ${user.email}. Notes: ${notes || 'None'}`,
      risk_level: 'medium',
      new_values: updated
    });

    // Notify vendor
    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: inv.vendor_id });
    if (vendor && vendor.length > 0) {
      try {
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: vendor[0].contact_email,
          subject: `Invoice ${inv.invoice_number} ${status}`,
          body: `Your invoice has been ${action}d.\n\nInvoice: ${inv.invoice_number}\nAmount: $${(inv.amount / 100).toFixed(2)}\n${action === 'approve' ? `Payment scheduled for: ${updateData.scheduled_payment_date}` : `Reason: ${notes}`}\n\nThank you.`
        });
      } catch (emailErr) {
        console.warn('Vendor notification failed:', emailErr.message);
      }
    }

    return Response.json({
      success: true,
      invoice: updated,
      action
    });
  } catch (error) {
    console.error('Invoice approval failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});