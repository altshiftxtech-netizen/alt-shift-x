import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * contentHygieneEngine — daily content & quality autopilot.
 *
 *  1. AUTO-PUBLISH: pending_review components whose builder passed TMT-3 AND have
 *     trust_score ≥ 80 → status "published" + notify builder.
 *  2. STALE FLAG: published components with 0 installs created ≥90 days ago →
 *     notify builder (once) suggesting an update. (We do NOT auto-unlist.)
 *  3. INSURANCE EXPIRY: BuilderBadge.insurance_expiry within 30 days → alert builder (once).
 *  4. LOW-RATING ALERT: components with rating < 3 and ≥3 reviews → alert builder (once).
 *
 * Authorization: admin user OR internal scheduled task carrying INTERNAL_TASK_SECRET.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const secret = Deno.env.get("INTERNAL_TASK_SECRET");
    const internal = !!secret && body.task_secret === secret;
    if (!internal) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const sr = base44.asServiceRole;
    const now = new Date();
    const daysFromNow = (d) => new Date(now.getTime() + d * 86400000).toISOString();
    const daysAgoIso = (d) => new Date(now.getTime() - d * 86400000).toISOString();
    const out = { published: 0, stale_flagged: 0, insurance_alerts: 0, low_rating_alerts: 0 };

    const notify = (args) => sr.functions.invoke("sendNotification", args).catch(e => console.warn("notify:", e.message));

    const [components, badges, installs] = await Promise.all([
      sr.entities.Component.list("-created_date", 2000).catch(() => []),
      sr.entities.BuilderBadge.list("-created_date", 1000).catch(() => []),
      sr.entities.InstalledComponent.list("-created_date", 5000).catch(() => []),
    ]);

    const badgeByBuilder = {}; badges.forEach(b => { badgeByBuilder[b.builder_id] = b; });
    const installCount = {};
    installs.forEach(i => { installCount[i.component_id] = (installCount[i.component_id] || 0) + 1; });

    // 1. AUTO-PUBLISH
    for (const c of components.filter(c => c.status === "pending_review")) {
      const badge = badgeByBuilder[c.builder_id];
      if (badge?.tmt3_passed && (c.trust_score || 0) >= 80) {
        await sr.entities.Component.update(c.id, { status: "published" });
        await notify({
          user_id: c.builder_id, type: "component_published", severity: "info",
          title: "Component auto-published ✅",
          message: `"${c.name}" passed governance (trust ${c.trust_score}) and your TMT-3 audit, so it's now live on the marketplace.`,
          action_url: "/builder/components", action_label: "View Component",
        });
        out.published++;
      }
    }

    // 2. STALE FLAG
    for (const c of components.filter(c => c.status === "published")) {
      const count = installCount[c.id] || 0;
      if (count > 0) continue;
      if (c.created_date > daysAgoIso(90)) continue;
      if (c.stale_flagged_at) continue;
      await notify({
        user_id: c.builder_id, type: "trust_flag", severity: "warning",
        title: "Component has no installs",
        message: `"${c.name}" has had no installs in 90+ days. Consider refreshing its description, pricing, or features to boost discoverability.`,
        action_url: "/builder/components", action_label: "Improve Listing",
      });
      await sr.entities.Component.update(c.id, { stale_flagged_at: now.toISOString() }).catch(() => {});
      out.stale_flagged++;
    }

    // 3. INSURANCE EXPIRY (within 30 days)
    for (const b of badges) {
      if (!b.insurance_expiry) continue;
      if (b.insurance_expiry > daysFromNow(30)) continue;
      if (b.insurance_expiry < daysAgoIso(0)) { /* already expired — still alert */ }
      if (b.insurance_alert_sent_at && b.insurance_alert_sent_at > daysAgoIso(25)) continue;
      await notify({
        user_id: b.builder_id, type: "trust_flag", severity: "warning",
        title: "E&O insurance expiring soon",
        message: `Your insurance certificate expires on ${b.insurance_expiry}. Upload a renewed ACORD certificate to keep your Safe Harbor status active.`,
        action_url: "/builder/profile", action_label: "Update Insurance",
      });
      await sr.entities.BuilderBadge.update(b.id, { insurance_alert_sent_at: now.toISOString() }).catch(() => {});
      out.insurance_alerts++;
    }

    // 4. LOW-RATING ALERT
    for (const c of components.filter(c => c.status === "published")) {
      if ((c.reviews_count || 0) < 3 || (c.rating || 5) >= 3) continue;
      if (c.low_rating_alert_at && c.low_rating_alert_at > daysAgoIso(14)) continue;
      await notify({
        user_id: c.builder_id, type: "new_review", severity: "warning",
        title: "Low rating needs attention",
        message: `"${c.name}" is averaging ${(c.rating || 0).toFixed(1)}★ across ${c.reviews_count} reviews. Review the feedback and consider improvements.`,
        action_url: "/builder/reviews", action_label: "View Reviews",
      });
      await sr.entities.Component.update(c.id, { low_rating_alert_at: now.toISOString() }).catch(() => {});
      out.low_rating_alerts++;
    }

    console.log("[contentHygieneEngine]", JSON.stringify(out));
    return Response.json({ success: true, ...out });
  } catch (error) {
    console.error("contentHygieneEngine error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});