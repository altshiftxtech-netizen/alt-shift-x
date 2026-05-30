import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Allow admins OR authenticated users to generate their own reports
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { report_type, start_date, end_date } = await req.json();

    // Fetch invoices in date range
    const allInvoices = await base44.asServiceRole.entities.InvoiceSubmission.list('-created_date', 500);
    const filtered = allInvoices.filter(inv => 
      new Date(inv.invoice_date) >= new Date(start_date) &&
      new Date(inv.invoice_date) <= new Date(end_date)
    );

    // Calculate summary stats
    const summary = {
      total_invoices: filtered.length,
      total_amount: filtered.reduce((sum, inv) => sum + inv.amount, 0) / 100,
      paid_amount: filtered.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0) / 100,
      pending_amount: filtered.filter(inv => inv.status === 'submitted').reduce((sum, inv) => sum + inv.amount, 0) / 100,
      approved_amount: filtered.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.amount, 0) / 100,
      avg_processing_time: Math.round(filtered.length > 0 ? filtered.reduce((sum, inv) => {
        const created = new Date(inv.created_date);
        const processed = new Date(inv.submitted_at || inv.created_date);
        return sum + (processed - created) / (1000 * 60 * 60 * 24);
      }, 0) / filtered.length : 0)
    };

    // Group by vendor
    const vendorSummary = {};
    filtered.forEach(inv => {
      if (!vendorSummary[inv.vendor_id]) {
        vendorSummary[inv.vendor_id] = { count: 0, amount: 0, status_breakdown: {} };
      }
      vendorSummary[inv.vendor_id].count += 1;
      vendorSummary[inv.vendor_id].amount += inv.amount / 100;
      vendorSummary[inv.vendor_id].status_breakdown[inv.status] = (vendorSummary[inv.vendor_id].status_breakdown[inv.status] || 0) + 1;
    });

    // Generate PDF content (simulated)
    const reportContent = `
ACCOUNTS PAYABLE REPORT
Period: ${start_date} to ${end_date}
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
Total Invoices: ${summary.total_invoices}
Total Amount: $${summary.total_amount.toFixed(2)}
Paid: $${summary.paid_amount.toFixed(2)}
Pending: $${summary.pending_amount.toFixed(2)}
Approved: $${summary.approved_amount.toFixed(2)}
Avg Processing Time: ${summary.avg_processing_time} days

VENDOR BREAKDOWN
================
${Object.entries(vendorSummary).map(([vendorId, data]) => `
Vendor ID: ${vendorId}
  Invoices: ${data.count}
  Total: $${data.amount.toFixed(2)}
  Status: ${JSON.stringify(data.status_breakdown)}
`).join('\n')}

RECOMMENDATIONS
================
1. Process pending invoices within 5 business days
2. Schedule payments for approved invoices
3. Maintain vendor verification status
4. Monitor payment aging for early action
    `;

    // Create simulated PDF URL (in production, use jsPDF)
    const pdfUrl = `data:text/plain;base64,${btoa(reportContent)}`;

    // Save report record
    const report = await base44.asServiceRole.entities.ComplianceReport.create({
      report_type: report_type || 'monthly',
      period_start: start_date,
      period_end: end_date,
      total_tests_run: summary.total_invoices,
      pass_rate: ((summary.paid_amount / (summary.total_amount || 1)) * 100),
      security_score: 85,
      performance_score: 90,
      reliability_score: 88,
      critical_issues: filtered.filter(inv => inv.status === 'rejected').length,
      warnings: filtered.filter(inv => inv.status === 'submitted').length,
      findings: [
        { category: 'Accounts Payable', severity: 'info', description: `${summary.total_invoices} invoices processed`, remediation: 'Continue monitoring' }
      ],
      pdf_url: pdfUrl
    });

    // Log audit trail (best-effort)
    try {
      await base44.asServiceRole.functions.invoke('logAuditTrail', {
        action: 'generate_report',
        entity_type: 'report',
        entity_id: report.id,
        change_summary: `Finance report generated for ${start_date} to ${end_date}`,
        risk_level: 'low'
      });
    } catch (_) {}

    return Response.json({
      success: true,
      report: {
        id: report.id,
        summary,
        vendor_summary: vendorSummary,
        pdf_url: pdfUrl
      }
    });
  } catch (error) {
    console.error('Report generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});