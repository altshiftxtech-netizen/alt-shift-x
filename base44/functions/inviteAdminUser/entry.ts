import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-off helper: invites a user as admin. Admin-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    // Allow either an existing admin or an internal task carrying the secret.
    const internalSecret = Deno.env.get("INTERNAL_TASK_SECRET");
    const body = await req.json().catch(() => ({}));
    const isInternal = !!internalSecret && body.task_secret === internalSecret;
    if (!isInternal && (!user || user.role !== "admin")) {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const email = body.email;
    if (!email) return Response.json({ error: "email is required" }, { status: 400 });

    await base44.auth.inviteUser(email, "admin");
    return Response.json({ success: true, email, role: "admin" });
  } catch (error) {
    console.error("inviteAdminUser error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});