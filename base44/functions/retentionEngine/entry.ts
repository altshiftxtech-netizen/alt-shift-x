import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * retentionEngine — daily money & retention autopilot.
 *
 *  1. DUNNING: subscriptions in past_due/unpaid → reminder email + in-app notification.
 *  2. QUOTA NUDGE: any active subscriber at ≥85% of tier limit → upgrade nudge.
 *  3. WIN-BACK: cancelled subscriptions → win-back email (once).
 *  4. ONBOARDING NUDGE: users with no installed components, signed up ≥3 days ago → nudge (once).
 *
 * Idempotency is handled with lightweight metadata flags on the records we touch.
 * Authorization: admin user OR internal scheduled task carrying INTERNAL_TASK_SECRET.
 */

const TIER_LIMITS = {
  starter: 1000, growth: 5000, pro: 10000, scale: 50000, enterprise: -1,
  free: 100, base_operator: 1000, strategic_architect: 10000, sovereign_commander: -1,
};
const UPGRADE_PATH = { starter: "growth", growth: "pro", pro: "scale", scale: "enterprise", free: "starter" };

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
    const daysAgoIso = (d) => new Date(now.getTime() - d * 86400000).toISOString();
    const out = { dunning: 0, quota_nudges: 0, winback: 0, onboarding: 0 };

    const notify = (args) => sr.functions.invoke("sendNotification", args).catch(e => console.warn("notify:", e.message));
    const email = (args) => sr.integrations.Core.SendEmail(args).catch(e => console.warn("email:", e.message));

    const subs = await sr.entities.Subscription.list("-created_date", 1000).catch(() => []);

    // 1. DUNNING
    for (const s of subs.filter(s => s.status === "past_due" || s.status === "unpaid")) {
      if (s.dunning_notified_at && s.dunning_notified_at > daysAgoIso(3)) continue;
      await notify({
        user_id: s.user_id, type: "payout", severity: "critical",
        title: "Payment failed — action needed",
        message: `Your ${s.plan} subscription payment didn't go through. Please update your payment method to avoid losing access.`,
        action_url: "/dashboard/subscription", action_label: "Update Payment",
      });
      await sr.entities.Subscription.update(s.id, { dunning_notified_at: now.toISOString() }).catch(() => {});
      out.dunning++;
    }

    // 2. QUOTA NUDGE
    for (const s of subs.filter(s => s.status === "active" || s.status === "trialing")) {
      const limit = TIER_LIMITS[s.plan];
      if (!limit || limit === -1) continue;
      const pct = ((s.api_calls_used || 0) / limit) * 100;
      if (pct < 85) continue;
      if (s.quota_nudged_at && s.quota_nudged_at > daysAgoIso(5)) continue;
      await notify({
        user_id: s.user_id, type: "quota_warning", severity: pct >= 100 ? "critical" : "warning",
        title: `API quota at ${Math.round(pct)}%`,
        message: `You've used ${Math.round(pct)}% of your ${s.plan} plan. Upgrade to ${UPGRADE_PATH[s.plan] || "a higher tier"} to avoid interruption.`,
        action_url: "/pricing", action_label: "Upgrade",
      });
      await sr.entities.Subscription.update(s.id, { quota_nudged_at: now.toISOString() }).catch(() => {});
      out.quota_nudges++;
    }

    // 3. WIN-BACK
    const users = await sr.entities.User.list("-created_date", 1000).catch(() => []);
    const userById = {}; users.forEach(u => { userById[u.id] = u; });
    for (const s of subs.filter(s => s.status === "cancelled")) {
      if (s.winback_sent_at) continue;
      const u = userById[s.user_id];
      if (!u?.email) continue;
      await email({
        to: u.email, from_name: "Alt+Shift+X",
        subject: "We'd love to have you back 💜",
        body: `Hi ${u.full_name || "there"},\n\nWe noticed you cancelled your subscription. We've shipped a lot of new components and improvements since then.\n\nCome see what's new — your data is exactly where you left it.\n\nhttps://altshiftx.tech/pricing\n\n— The Alt+Shift+X Team`,
      });
      await sr.entities.Subscription.update(s.id, { winback_sent_at: now.toISOString() }).catch(() => {});
      out.winback++;
    }

    // 4. ONBOARDING NUDGE (signed up ≥3 days ago, no installs, not nudged)
    const installs = await sr.entities.InstalledComponent.list("-created_date", 2000).catch(() => []);
    const hasInstall = new Set(installs.map(i => i.user_id));
    const profiles = await sr.entities.UserProfile.list("-created_date", 2000).catch(() => []);
    const profByUser = {}; profiles.forEach(p => { profByUser[p.user_id] = p; });
    for (const u of users) {
      if (hasInstall.has(u.id)) continue;
      if (u.created_date > daysAgoIso(3)) continue;
      const prof = profByUser[u.id];
      if (prof?.onboarding_nudged_at) continue;
      if (!u.email) continue;
      await email({
        to: u.email, from_name: "Alt+Shift+X",
        subject: "Get started — install your first AI component",
        body: `Hi ${u.full_name || "there"},\n\nWelcome to Alt+Shift+X! You haven't installed a component yet. Browse the marketplace and add your first verified AI agent in seconds.\n\nhttps://altshiftx.tech/marketplace\n\n— The Alt+Shift+X Team`,
      });
      if (prof) await sr.entities.UserProfile.update(prof.id, { onboarding_nudged_at: now.toISOString() }).catch(() => {});
      out.onboarding++;
    }

    console.log("[retentionEngine]", JSON.stringify(out));
    return Response.json({ success: true, ...out });
  } catch (error) {
    console.error("retentionEngine error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});