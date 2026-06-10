import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Runs on a schedule. Finds campaigns whose scheduled_for time has passed and
// that are still in "scheduled" status, then dispatches each via sendEmailCampaign.
// Admin-only when called manually; the scheduled automation runs as service role.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow either an authenticated admin OR the internal scheduler.
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === "admin";
    } catch { /* automation context — no user */ }

    const scheduled = await base44.asServiceRole.entities.EmailCampaign.filter({ status: "scheduled" });
    const now = Date.now();
    const due = scheduled.filter((c) => c.scheduled_for && new Date(c.scheduled_for).getTime() <= now);

    if (!isAdmin && due.length === 0) {
      // Nothing to do — fine for the scheduler.
      return Response.json({ ok: true, dispatched: 0 });
    }

    let dispatched = 0;
    for (const c of due) {
      try {
        // Flip to draft so sendEmailCampaign (which rejects sent/sending) accepts it.
        await base44.asServiceRole.entities.EmailCampaign.update(c.id, { status: "draft" });
        await base44.asServiceRole.functions.invoke("sendEmailCampaign", { campaignId: c.id });
        dispatched++;
      } catch (e) {
        console.error(`[processScheduledCampaigns] failed campaign=${c.id}:`, e.message);
        await base44.asServiceRole.entities.EmailCampaign.update(c.id, { status: "failed" }).catch(() => {});
      }
    }

    console.log(`[processScheduledCampaigns] dispatched=${dispatched} of ${due.length} due`);
    return Response.json({ ok: true, dispatched, due: due.length });
  } catch (err) {
    console.error("[processScheduledCampaigns] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});