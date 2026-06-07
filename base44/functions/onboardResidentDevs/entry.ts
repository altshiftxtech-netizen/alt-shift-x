import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-off helper: invite a batch of new Dev community members, grant each a
// complimentary top-tier (sovereign_commander) subscription, mark them as
// Resident Developers, and send a warm welcome notification. Admin-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);

    const internalSecret = Deno.env.get("INTERNAL_TASK_SECRET");
    const body = await req.json().catch(() => ({}));
    const isInternal = !!internalSecret && body.task_secret === internalSecret;
    if (!isInternal && (!caller || caller.role !== "admin")) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Default roster — the two new Dev community members.
    const people = body.people || [
      { email: "daandrebrownthomas@gmail.com", name: "Da'Andre Brown Thomas" },
      { email: "kaliqbrownthomas@gmail.com", name: "Kaliq Brown Thomas" },
    ];

    const results = [];

    for (const p of people) {
      const email = (p.email || "").trim().toLowerCase();
      if (!email) continue;
      const step = { email, invited: false, subscription: false, resident: false, welcomed: false };

      // 1. Invite to the app (builders are standard users).
      try {
        await base44.auth.inviteUser(email, "user");
        step.invited = true;
      } catch (e) {
        // Already invited / existing — keep going so they still get the perks.
        step.invite_note = e.message;
      }

      // 2. Find the user record (exists once invited).
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const user = users[0];
      if (!user) { step.error = "User record not found after invite"; results.push(step); continue; }

      // 3. Complimentary top-tier subscription.
      const existingSub = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
      const subPayload = {
        user_id: user.id,
        plan: "sovereign_commander",
        status: "active",
        payment_provider: "stripe",
        current_period_start: new Date().toISOString().slice(0, 10),
        current_period_end: "2099-12-31",
        cancel_at_period_end: false,
      };
      if (existingSub.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existingSub[0].id, subPayload);
      } else {
        await base44.asServiceRole.entities.Subscription.create(subPayload);
      }
      step.subscription = true;

      // 4. Resident Developer status.
      const existingProfile = await base44.asServiceRole.entities.UserAdminProfile.filter({ user_id: user.id });
      const profilePayload = {
        user_id: user.id,
        user_email: email,
        user_name: p.name || user.full_name || email,
        resident_developer: true,
        resident_since: new Date().toISOString(),
      };
      if (existingProfile.length > 0) {
        await base44.asServiceRole.entities.UserAdminProfile.update(existingProfile[0].id, profilePayload);
      } else {
        await base44.asServiceRole.entities.UserAdminProfile.create(profilePayload);
      }
      step.resident = true;

      // 5. Warm welcome to the Dev community (in-app + email).
      const firstName = (p.name || user.full_name || "there").split(" ")[0];
      await base44.asServiceRole.functions.invoke("sendNotification", {
        user_id: user.id,
        type: "component_published",
        severity: "info",
        title: "Welcome to the Dev Community! 🎉",
        message: `Hey ${firstName} — welcome aboard! Your complimentary top-tier (Sovereign Commander) account is active and you've been recognized as a Resident Developer. We're thrilled to have you building with us. Jump into BOB to start creating.`,
        action_url: "/builder/bob",
        action_label: "Open BOB Builder",
        force_email: true,
      }).catch((e) => { step.welcome_note = e.message; });
      step.welcomed = true;

      results.push(step);
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error("onboardResidentDevs error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});