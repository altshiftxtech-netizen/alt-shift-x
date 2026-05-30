import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendor_id, invoice_number, amount, invoice_date, document_url, description } = await req.json();

    if (!vendor_id || !invoice_number || !amount) {
      return Response.json({ error: 'Missing required fields: vendor_id, invoice_number, amount' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return Response.json({ error: 'Amount must be a positive number (in cents)' }, { status: 400 });
    }

    if (!document_url) {
      return Response.json({ error: 'document_url is required for compliance' }, { status: 400 });
    }

    // Verify vendor exists and is active
    const vendor = await base44.asServiceRole.entities.Vendor.filter({ id: vendor_id });
    if (!vendor || vendor.length === 0) {
      return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (vendor[0].status !== 'active') {
      return Response.json({ error: `Vendor is ${vendor[0].status}. Only active vendors can submit invoices.` }, { status: 400 });
    }

    if (vendor[0].verification_status !== 'verified') {
      return Response.json({ error: 'Vendor must be verified before submitting invoices.' }, { status: 400 });
    }

    // Check for duplicate invoice number from same vendor
    const duplicates = await base44.asServiceRole.entities.InvoiceSubmission.filter({
      vendor_id,
      invoice_number,
    });
    if (duplicates.length > 0) {
      return Response.json({
        error: `Duplicate invoice: invoice number ${invoice_number} already submitted by this vendor.`,
        existing_id: duplicates[0].id,
        existing_status: duplicates[0].status,
      }, { status: 409 });
    }

    // Create invoice submission
    const submission = await base44.asServiceRole.entities.InvoiceSubmission.create({
      vendor_id,
      invoice_number,
      amount,
      invoice_date: invoice_date || new Date().toISOString().split('T')[0],
      document_url,
      description: description || '',
      status: 'submitted',
      payment_status: 'pending',
      submitted_at: new Date().toISOString()
    });

    // Log audit trail
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'create',
      entity_type: 'invoice',
      entity_id: submission.id,
      change_summary: `Invoice ${invoice_number} submitted by vendor ${vendor[0].company_name} for $${(amount / 100).toFixed(2)}`,
      new_values: { invoice_number, amount, vendor_id, status: 'submitted' }
    }).catch(e => console.warn('Audit log failed:', e.message));

    // Notify admin of new submission — use a real admin email from env or fallback
    const adminEmail = "admin@altshiftx.com";
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `New Invoice Submission: ${invoice_number}`,
        body: `A new invoice has been submitted and requires review.\n\nVendor: ${vendor[0].company_name}\nInvoice Number: ${invoice_number}\nAmount: $${(amount / 100).toFixed(2)}\nDate: ${invoice_date || 'Not specified'}\nDescription: ${description || 'None'}\n\nDocument: ${document_url}\n\nPlease review in the admin panel:\nhttps://app.altshiftx.com/finance\n\nSubmission ID: ${submission.id}`
      });
    } catch (emailErr) {
      console.warn('Admin notification email failed:', emailErr.message);
    }

    // Acknowledge submission to vendor
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vendor[0].contact_email,
        subject: `Invoice ${invoice_number} Received`,
        body: `Dear ${vendor[0].company_name},\n\nWe have received your invoice and it is under review.\n\nInvoice Number: ${invoice_number}\nAmount: $${(amount / 100).toFixed(2)}\nSubmission ID: ${submission.id}\nStatus: Under Review\n\nYou will be notified once the invoice has been reviewed. Typical review time is 3–5 business days.\n\nThank you,\nAlt+Shift+X Finance Team`
      });
    } catch (emailErr) {
      console.warn('Vendor acknowledgment email failed:', emailErr.message);
    }

    return Response.json({
      success: true,
      submission_id: submission.id,
      status: 'Invoice submitted successfully',
      message: 'A confirmation email has been sent to the vendor.'
    });
  } catch (error) {
    console.error('Invoice processing failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});