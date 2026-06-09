import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Admin-only: build/refresh the EmailSubscriber audience lists from platform data.
// - all users -> "all_users" segment
// - users with an active paid subscription -> "paying"
// - users with the builder/admin role or a builder badge -> "builders"
// New subscribers get a unique unsubscribe_token. Existing ones are left intact
// (so opt-outs are preserved).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [users, subs, existing] = await Promise.all([
      base44.asServiceRole.entities.User.list("-created_date", 1000),
      base44.asServiceRole.entities.Subscription.list("-created_date", 1000),
      base44.asServiceRole.entities.EmailSubscriber.list("-created_date", 5000),
    ]);

    const existingByEmail = new Map(
      existing.map((s) => [(s.email || "").toLowerCase().trim(), s])
    );

    const payingUserIds = new Set(
      subs
        .filter((s) => s.plan && s.plan !== "free" && ["active", "trialing", "past_due"].includes(s.status))
        .map((s) => s.user_id)
    );

    const token = () => crypto.randomUUID().replace(/-/g, "");
    let created = 0;
    let updated = 0;

    for (const u of users) {
      const email = (u.email || "").toLowerCase().trim();
      if (!email) continue;

      let audience = "all_users";
      if (u.role === "admin" || u.role === "builder" || u.role === "staff") audience = "builders";
      else if (payingUserIds.has(u.id)) audience = "paying";

      const found = existingByEmail.get(email);
      if (found) {
        // keep opt-out status; just refresh segment + name
        if (found.audience !== audience || found.name !== u.full_name) {
          await base44.asServiceRole.entities.EmailSubscriber.update(found.id, {
            audience,
            name: u.full_name || found.name || "",
          });
          updated++;
        }
      } else {
        await base44.asServiceRole.entities.EmailSubscriber.create({
          email,
          name: u.full_name || "",
          audience,
          source: "sync",
          subscribed: true,
          unsubscribe_token: token(),
        });
        created++;
      }
    }

    console.log(`[syncEmailSubscribers] created=${created} updated=${updated}`);
    return Response.json({ ok: true, created, updated, total: users.length });
  } catch (err) {
    console.error("[syncEmailSubscribers] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});