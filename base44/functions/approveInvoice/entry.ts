import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Strict admin-only enforcement
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { invoice_id, action, notes, scheduled_payment_date } = await req.json();

    if (!invoice_id || !action) {
      return Response.json({ error: 'invoice_id and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === 'reject' && !notes) {
      return Response.json({ error: 'A rejection reason (notes) is required for compliance' }, { status: 400 });
    }

    const invoices = await base44.asServiceRole.entities.InvoiceSubmission.filter({ id: invoice_id });
    if (!invoices || invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const inv = invoices[0];

    // Prevent re-processing already-finalized invoices
    if (['paid', 'rejected'].includes(inv.status)) {
      return Response.json({
        error: `Cannot ${action} an invoice that is already "${inv.status}"`,
      }, { status: 400 });
    }

    let updateData = { review_notes: notes || '' };

    if (action === 'approve') {
      const payDate = scheduled_payment_date ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      updateData.status = 'approved';
      updateData.payment_status = 'scheduled';
      updateData.scheduled_payment_date = payDate;
    } else {
      updateData.status = 'rejected';
      updateData.payment_status = 'pending';
      updateData.rejection_reason = notes;
    }

    const updated = await base44.asServiceRole.entities.InvoiceSubmission.update(invoice_id, updateData);

    // Audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: action === 'approve' ? 'approve' : 'reject',
      entity_type: 'invoice',
      entity_id: invoice_id,
      change_summary: `Invoice ${inv.invoice_number} ${action}d by ${user.email}. Amount: $${(inv.amount / 100).toFixed(2)}. Notes: ${notes || 'None'}`,
      risk_level: 'medium',
      old_values: { status: inv.status },
      new_values: { status: updateData.status, payment_status: updateData.payment_status }
    }).catch(e => console.warn('Audit log failed:', e.message));

    // Notify vendor with proper legal language
    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: inv.vendor_id });
    if (vendor && vendor.length > 0) {
      try {
        const vendorName = vendor[0].company_name;
        if (action === 'approve') {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: vendor[0].contact_email,
            subject: `Invoice ${inv.invoice_number} Approved – Payment Scheduled`,
            body: `Dear ${vendorName},\n\nYour invoice has been reviewed and approved.\n\nInvoice Number: ${inv.invoice_number}\nAmount: $${(inv.amount / 100).toFixed(2)}\nApproved By: ${user.full_name || user.email}\nScheduled Payment Date: ${updateData.scheduled_payment_date}\n\nPayment will be processed on or before the scheduled date. Please ensure your banking information on file is current.\n\nIf you have any questions, please contact finance@altshiftx.com.\n\nThank you,\nAlt+Shift+X Finance Team`
          });
        } else {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: vendor[0].contact_email,
            subject: `Invoice ${inv.invoice_number} Rejected`,
            body: `Dear ${vendorName},\n\nAfter review, your invoice has not been approved at this time.\n\nInvoice Number: ${inv.invoice_number}\nAmount: $${(inv.amount / 100).toFixed(2)}\nRejection Reason: ${notes}\n\nPlease address the noted issues and resubmit if applicable. If you believe this decision is in error, contact finance@altshiftx.com within 30 days.\n\nThank you,\nAlt+Shift+X Finance Team`
          });
        }
      } catch (emailErr) {
        console.warn('Vendor notification failed:', emailErr.message);
      }
    }

    return Response.json({ success: true, invoice: updated, action });
  } catch (error) {
    console.error('Invoice approval failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});