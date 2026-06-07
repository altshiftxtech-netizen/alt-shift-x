import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: list all Resident Developers with their signup status.
// "signed_up" = a real User record exists & has logged in (full_name present);
// "pending"   = invited but the user hasn't accepted/registered yet.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.UserAdminProfile.filter({ resident_developer: true });

    const devs = [];
    for (const prof of profiles) {
      let status = "pending";
      let user = null;
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: prof.user_id });
        user = users[0];
      } catch { /* ignore */ }

      if (user) {
        // A registered user has a full_name once they complete signup.
        status = user.full_name ? "signed_up" : "invited";
      }

      devs.push({
        profile_id: prof.id,
        user_id: prof.user_id,
        name: prof.user_name || user?.full_name || prof.user_email,
        email: prof.user_email || user?.email,
        status,
        resident_since: prof.resident_since,
        account_status: prof.account_status || "active",
      });
    }

    devs.sort((a, b) => new Date(b.resident_since || 0) - new Date(a.resident_since || 0));
    return Response.json({ success: true, devs });
  } catch (error) {
    console.error("listResidentDevs error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});