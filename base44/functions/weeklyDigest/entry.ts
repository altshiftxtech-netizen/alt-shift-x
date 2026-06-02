import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * weeklyDigest — emails admins a weekly growth & revenue summary every Monday.
 * Covers: new users, new installs, active subscriptions, revenue this week,
 * top components by installs, and outstanding issues.
 *
 * Authorization: admin OR internal task secret.
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
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const [users, installs, subs, components, splits, errors] = await Promise.all([
      sr.entities.User.list("-created_date", 2000).catch(() => []),
      sr.entities.InstalledComponent.list("-created_date", 5000).catch(() => []),
      sr.entities.Subscription.list("-created_date", 2000).catch(() => []),
      sr.entities.Component.filter({ status: "published" }).catch(() => []),
      sr.entities.RevenueSplit.list("-created_date", 2000).catch(() => []),
      sr.entities.ErrorReport.filter({ resolved: false }).catch(() => []),
    ]);

    const newUsers = users.filter(u => u.created_date >= weekAgo).length;
    const newInstalls = installs.filter(i => i.created_date >= weekAgo).length;
    const activeSubs = subs.filter(s => s.status === "active" || s.status === "trialing").length;
    const revenueWeek = splits.filter(s => (s.created_date || "") >= weekAgo)
      .reduce((sum, s) => sum + (s.gross_revenue || 0), 0);

    // Top components by total installs
    const installCount = {};
    installs.forEach(i => { installCount[i.component_id] = (installCount[i.component_id] || 0) + 1; });
    const top = [...components]
      .map(c => ({ name: c.name, code: c.code, installs: installCount[c.id] || c.installs_count || 0 }))
      .sort((a, b) => b.installs - a.installs).slice(0, 5);

    const openIssues = errors.filter(e => (e.occurrence_count || 0) > 2).length;

    const dateStr = now.toLocaleDateString("en-US", { dateStyle: "medium" });
    const emailBody = [
      `📊 WEEKLY PLATFORM DIGEST — week ending ${dateStr}`,
      ``,
      `── Growth (last 7 days) ──`,
      `  • New users: ${newUsers}`,
      `  • New installs: ${newInstalls}`,
      `  • Active/trialing subscriptions: ${activeSubs}`,
      `  • Gross revenue booked: $${revenueWeek.toFixed(2)}`,
      ``,
      `── Top Components (by installs) ──`,
      ...(top.length ? top.map((t, i) => `  ${i + 1}. ${t.name} (${t.code}) — ${t.installs} installs`) : ["  (no data)"]),
      ``,
      `── Health ──`,
      `  • Open error patterns over threshold: ${openIssues}`,
      `  • Published components: ${components.length}`,
      ``,
      `Full details in the Admin Panel & /admin/health.`,
      ``,
      `— Alt+Shift+X Weekly Digest`,
    ].join("\n");

    const admins = await sr.entities.User.filter({ role: "admin" }).catch(() => []);
    let emailed = 0;
    for (const admin of admins) {
      if (!admin.email) continue;
      try {
        await sr.integrations.Core.SendEmail({
          to: admin.email, from_name: "Alt+Shift+X Digest",
          subject: `📊 Weekly Digest — ${newInstalls} installs, ${newUsers} new users — ${dateStr}`,
          body: emailBody,
        });
        emailed++;
      } catch (e) { console.error("digest email:", e.message); }
    }

    console.log(`[weeklyDigest] emailed=${emailed} users+${newUsers} installs+${newInstalls}`);
    return Response.json({ success: true, admins_emailed: emailed, new_users: newUsers, new_installs: newInstalls });
  } catch (error) {
    console.error("weeklyDigest error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});