import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: revoke a Resident Developer. Removes their resident status,
// downgrades the complimentary top-tier subscription to free, and marks the
// admin profile account_status as suspended. Does NOT delete the user record.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    // 1. Strip Resident Developer status + suspend the account profile.
    const profiles = await base44.asServiceRole.entities.UserAdminProfile.filter({ user_id });
    if (profiles[0]) {
      await base44.asServiceRole.entities.UserAdminProfile.update(profiles[0].id, {
        resident_developer: false,
        account_status: "suspended",
      });
    }

    // 2. Downgrade the complimentary subscription back to free.
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id });
    if (subs[0]) {
      await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
        plan: "free",
        status: "cancelled",
        cancel_at_period_end: true,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("revokeResidentDev error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});