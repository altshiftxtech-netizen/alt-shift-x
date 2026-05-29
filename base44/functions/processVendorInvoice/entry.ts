import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendor_id, invoice_number, amount, invoice_date, document_url, description } = await req.json();

    if (!vendor_id || !invoice_number || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await base44.entities.Vendor.filter({ id: vendor_id });
    if (!vendor || vendor.length === 0) {
      return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Create invoice submission
    const submission = await base44.entities.InvoiceSubmission.create({
      vendor_id,
      invoice_number,
      amount,
      invoice_date,
      document_url,
      description: description || '',
      status: 'submitted',
      payment_status: 'pending',
      submitted_at: new Date().toISOString()
    });

    // Log audit trail for invoice submission
    await base44.functions.invoke('logAuditTrail', {
      action: 'create',
      entity_type: 'invoice',
      entity_id: submission.id,
      change_summary: `Invoice ${invoice_number} submitted by vendor ${vendor_id} for $${(amount / 100).toFixed(2)}`,
      new_values: submission
    });

    // Notify admin of new submission
    try {
      await base44.integrations.Core.SendEmail({
        to: 'admin@example.com',
        subject: `New Invoice Submission: ${invoice_number}`,
        body: `A new invoice has been submitted.\n\nVendor: ${vendor[0].company_name}\nInvoice: ${invoice_number}\nAmount: $${(amount / 100).toFixed(2)}\nDate: ${invoice_date}\n\nPlease review in the admin panel.`
      });
    } catch (emailErr) {
      console.warn('Admin notification email failed:', emailErr.message);
    }

    return Response.json({
      success: true,
      submission_id: submission.id,
      status: 'Invoice submitted successfully'
    });
  } catch (error) {
    console.error('Invoice processing failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});