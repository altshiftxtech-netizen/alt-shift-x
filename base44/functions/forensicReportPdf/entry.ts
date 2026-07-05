import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@2.5.1';

// Renders a court-ready daily Forensic Audit report as a PDF using the
// EXPERTMINDS-REPORT-TEMPLATE-1.0 layout. Admin-only.
// Payload: { report_date: "YYYY-MM-DD" } — the day to render.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { report_date } = await req.json().catch(() => ({}));
    if (!report_date) return Response.json({ error: 'report_date required' }, { status: 400 });

    const reports = await base44.asServiceRole.entities.ForensicAuditReport.filter({ report_date });
    const report = reports[0];
    if (!report) return Response.json({ error: 'No report for that date' }, { status: 404 });

    // Chronological audit trail of that day's real exports.
    const recent = await base44.asServiceRole.entities.ForensicAuditLog.list('exported_at', 1000);
    const dayStart = new Date(report_date + 'T00:00:00Z');
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const logs = (recent || []).filter((l) => {
      const t = l.exported_at ? new Date(l.exported_at) : null;
      return t && t >= dayStart && t < dayEnd && !l.simulated;
    });

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    let y = 54;

    // ── Header (EXPERTMINDS-REPORT-TEMPLATE-1.0) ──
    doc.setFillColor(10, 12, 18); doc.rect(0, 0, W, 84, 'F');
    doc.setTextColor(230, 200, 120); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('EXPERTMINDS-REPORT-TEMPLATE-1.0  ·  COURT-READY FORENSIC AUDIT', 40, 34);
    doc.setTextColor(255, 255, 255); doc.setFontSize(18);
    doc.text('Forensic Distribution Audit Trail', 40, 58);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(180, 180, 190);
    doc.text(`Report Date (UTC): ${report_date}   ·   Generated: ${new Date().toISOString()}`, 40, 74);
    y = 108;

    // ── Summary ──
    doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('Summary', 40, y); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    const ft = report.flag_totals || {};
    const lines = [
      `Total exports: ${report.total_exports || 0}    Verified: ${report.verified_count || 0}    Anomalies: ${report.anomaly_count || 0}`,
      `DATA_COLLECTION_RISK: ${ft.DATA_COLLECTION_RISK || 0}    UNAUTHORIZED_ENVIRONMENT: ${ft.UNAUTHORIZED_ENVIRONMENT || 0}    INTEGRITY_COMPROMISED: ${ft.INTEGRITY_COMPROMISED || 0}`,
    ];
    for (const l of lines) { doc.text(l, 40, y); y += 15; }
    y += 8;

    // ── Anomalies ──
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(190, 30, 30);
    doc.text(`Highlighted Anomalies (${(report.anomalies || []).length})`, 40, y); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
    if ((report.anomalies || []).length === 0) { doc.text('None detected.', 40, y); y += 16; }
    for (const a of (report.anomalies || [])) {
      if (y > 720) { doc.addPage(); y = 54; }
      doc.text(`• ${a.issue} — ${a.downloader_email || 'unknown'} [${(a.flags || []).join(', ')}]`, 44, y, { maxWidth: W - 88 });
      y += 14;
    }
    y += 10;

    // ── Chronological trail ──
    if (y > 700) { doc.addPage(); y = 54; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(20, 20, 20);
    doc.text(`Chronological Audit Trail (${logs.length})`, 40, y); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(50, 50, 50);
    for (const l of logs) {
      if (y > 730) { doc.addPage(); y = 54; }
      const t = l.exported_at ? new Date(l.exported_at).toISOString() : '';
      doc.setFont('helvetica', 'bold');
      doc.text(`${t}  ·  ${l.export_kind}  ·  ${l.verification_status.toUpperCase()}`, 40, y); y += 11;
      doc.setFont('helvetica', 'normal');
      doc.text(`  downloader: ${l.downloader_email || l.downloader_id}  ·  ${l.file_size || 0} bytes  ·  ${l.file_name || ''}`, 40, y, { maxWidth: W - 80 }); y += 11;
      doc.text(`  seal: ${l.integrity_seal_id || '—'}`, 40, y); y += 11;
      doc.text(`  sha256: ${l.sha256 || '—'}`, 40, y, { maxWidth: W - 80 }); y += 11;
      if ((l.flags || []).length) { doc.setTextColor(190, 30, 30); doc.text(`  flags: ${l.flags.join(', ')}`, 40, y); y += 11; doc.setTextColor(50, 50, 50); }
      y += 4;
    }

    const bytes = doc.output('arraybuffer');
    const file = new File([bytes], `forensic-audit-${report_date}.pdf`, { type: 'application/pdf' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ success: true, url: file_url });
  } catch (error) {
    console.error('forensicReportPdf error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});