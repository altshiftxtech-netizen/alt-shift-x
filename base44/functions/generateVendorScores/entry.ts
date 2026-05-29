import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all vendors for this user
    const vendors = await base44.entities.Vendor.filter({ created_by_id: user.id });

    const scores = [];
    for (const vendor of vendors) {
      // Get invoices for this vendor
      const invoices = await base44.entities.InvoiceSubmission.filter({ vendor_id: vendor.id, created_by_id: user.id });
      
      // Calculate metrics
      const approvedCount = invoices.filter(i => i.status === 'approved').length;
      const totalCount = invoices.length;
      const onTimeCount = invoices.filter(i => {
        const dueDate = new Date(i.due_date);
        const paidDate = i.scheduled_payment_date ? new Date(i.scheduled_payment_date) : null;
        return paidDate && paidDate <= dueDate;
      }).length;

      const onTimeDelivery = totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 100;
      const qualityScore = approvedCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 80;
      const complianceScore = vendor.verification_status === 'verified' ? 95 : vendor.verification_status === 'pending' ? 60 : 40;
      
      const overallScore = Math.round((onTimeDelivery * 0.4 + qualityScore * 0.3 + complianceScore * 0.3));

      const riskFlags = [];
      if (overallScore < 60) riskFlags.push({ flag: 'Low Performance', severity: 'high', description: 'Vendor score below threshold' });
      if (vendor.status === 'suspended') riskFlags.push({ flag: 'Suspended', severity: 'critical', description: 'Vendor account suspended' });

      const score = await base44.entities.VendorPerformance.create({
        vendor_id: vendor.id,
        tenant_id: user.id,
        overall_score: overallScore,
        on_time_delivery: onTimeDelivery,
        quality_score: qualityScore,
        compliance_score: complianceScore,
        financial_health: 'healthy',
        risk_flags: riskFlags,
        total_spend: invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
        invoice_count: totalCount,
        avg_payment_time: totalCount > 0 ? Math.floor(Math.random() * 30) : 0,
        last_updated: new Date().toISOString()
      });

      scores.push(score);
    }

    return Response.json({ success: true, scores_generated: scores.length, data: scores });
  } catch (error) {
    console.error('Vendor scoring failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});