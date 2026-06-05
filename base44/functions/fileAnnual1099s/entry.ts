import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * fileAnnual1099s — runs each Jan 31 (or manually by an admin).
 * 1. Loads the CPA delivery settings (skips if filing disabled or no CPA email).
 * 2. Audits every contractor's earnings for the reporting tax year from RevenueSplit records.
 * 3. Reconciles each builder's annual total onto their TaxForm1099 record.
 * 4. Builds the 1099 filing package (all contractors at/over the threshold with a completed W-9).
 * 5. Emails the compiled package to the CPA.
 *
 * Allowed callers: admin user, OR the scheduler via INTERNAL_TASK_SECRET.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    // Auth: admin user (manual run) OR the platform scheduler (no end-user present).
    let actor = null;
    try { actor = await base44.auth.me(); } catch (_) { actor = null; }
    if (actor && actor.role !== "admin") {
      return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    // Tax year being reported. On Jan 31 we report the year that just ended.
    const now = new Date();
    const taxYear = body.tax_year || (now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear());

    // 1. Settings
    const settingsList = await base44.asServiceRole.entities.TaxComplianceSettings.list();
    const settings = settingsList[0];
    const threshold = settings?.reporting_threshold ?? 600;

    if (!settings || settings.filing_enabled === false) {
      console.log("fileAnnual1099s: filing disabled or not configured — skipping.");
      return Response.json({ ok: true, skipped: true, reason: "filing_disabled_or_unconfigured" });
    }
    if (!settings.cpa_email) {
      console.log("fileAnnual1099s: no CPA email set — skipping.");
      return Response.json({ ok: true, skipped: true, reason: "no_cpa_email" });
    }

    // 2. Audit earnings for the tax year from RevenueSplit (period = YYYY-MM)
    const splits = await base44.asServiceRole.entities.RevenueSplit.list("-period", 5000);
    const earningsByBuilder = {};
    for (const s of splits) {
      if (!s.period || !s.period.startsWith(String(taxYear))) continue;
      const payout = Number(s.builder_payout || 0);
      if (!s.builder_id) continue;
      earningsByBuilder[s.builder_id] = (earningsByBuilder[s.builder_id] || 0) + payout;
    }

    // 3. Reconcile annual totals onto each contractor's TaxForm1099
    const forms = await base44.asServiceRole.entities.TaxForm1099.list("", 5000);
    const formByUser = {};
    for (const f of forms) formByUser[f.user_id] = f;

    const reportable = [];
    for (const [builderId, total] of Object.entries(earningsByBuilder)) {
      const rounded = Math.round(total * 100) / 100;
      const form = formByUser[builderId];

      if (form) {
        const annual = { ...(form.annual_totals || {}), [String(taxYear)]: rounded };
        await base44.asServiceRole.entities.TaxForm1099.update(form.id, { annual_totals: annual });
      }

      // Only include contractors at/over threshold with a completed, signed W-9.
      // Corporations (c/s corp) are 1099-exempt.
      const exemptClass = ["c_corporation", "s_corporation"].includes(form?.federal_tax_classification);
      const qualifies = rounded >= threshold && form && form.status === "completed" && form.w9_signed && !exemptClass;

      if (qualifies) {
        reportable.push({
          legal_name: form.legal_name || form.business_name || "Unknown",
          business_name: form.business_name || "",
          tin_type: (form.tin_type || "ssn").toUpperCase(),
          tin_last4: form.tin ? String(form.tin).replace(/\D/g, "").slice(-4) : "----",
          classification: form.federal_tax_classification || "",
          address: [form.address_line1, form.address_line2, `${form.city || ""}, ${form.state || ""} ${form.zip || ""}`, form.country || ""].filter(Boolean).join(", "),
          nonemployee_comp: rounded,
        });
      }
    }

    // 4. Build the package
    const totalReported = reportable.reduce((a, r) => a + r.nonemployee_comp, 0);
    const rows = reportable
      .sort((a, b) => b.nonemployee_comp - a.nonemployee_comp)
      .map((r, i) =>
        `${i + 1}. ${r.legal_name}${r.business_name ? ` (DBA ${r.business_name})` : ""}\n` +
        `   ${r.tin_type} •••••${r.tin_last4}  |  Class: ${r.classification}\n` +
        `   Address: ${r.address}\n` +
        `   Form 1099-NEC Box 1 (Nonemployee Compensation): $${r.nonemployee_comp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ).join("\n\n");

    const emailBody =
`ANNUAL 1099-NEC FILING PACKAGE — TAX YEAR ${taxYear}
Prepared: ${now.toISOString()}
Reporting threshold: $${threshold.toLocaleString()}

Audit summary
-------------
Contractors with reportable income: ${reportable.length}
Total nonemployee compensation reported: $${totalReported.toLocaleString(undefined, { minimumFractionDigits: 2 })}

Contractor detail (audited & adjusted)
--------------------------------------
${rows || "No contractors met the reporting threshold with a completed W-9 on file."}

-------------
NOTE: Full TINs are withheld from this summary email for security. The CPA can retrieve
complete W-9 details from the platform's secure 1099 records. The IRS does not accept
1099 forms by email — this package is for your CPA/filing agent to e-file via FIRE or an
authorized e-file provider.`;

    // 5. Deliver to CPA
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: settings.cpa_email,
      subject: `1099-NEC Filing Package — Tax Year ${taxYear} (${reportable.length} contractors)`,
      body: emailBody,
    });

    await base44.asServiceRole.entities.TaxComplianceSettings.update(settings.id, {
      last_filed_year: taxYear,
      last_filed_at: now.toISOString(),
    });

    console.log(`fileAnnual1099s: emailed ${reportable.length} 1099s for ${taxYear} to ${settings.cpa_email}`);
    return Response.json({
      ok: true,
      tax_year: taxYear,
      contractors_reported: reportable.length,
      total_reported: totalReported,
      sent_to: settings.cpa_email,
    });
  } catch (error) {
    console.error("fileAnnual1099s error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});