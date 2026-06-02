import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// Invite a builder to The Speakeasy. The invitee must become a paid member to enter.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const code = "SPK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const origin = req.headers.get("origin") || "https://altshiftx.tech";
    const joinUrl = `${origin}/pricing?invite=${code}`;

    await base44.asServiceRole.entities.SpeakeasyInvite.create({
      inviter_id: user.id,
      inviter_name: user.full_name || user.email,
      invitee_email: email,
      code,
      status: "sent",
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `🥂 ${user.full_name || "A builder"} invited you to The Speakeasy`,
      body: `You've been invited into The Speakeasy — the private, members-only lounge for builders & developers on altshiftx.tech.\n\nInside: an AI host that answers your questions, curated build knowledge, and a fashionable community of serious builders. ✨\n\nThe Speakeasy is a members benefit — activate a paid plan to walk through the door.\n\nClaim your seat: ${joinUrl}\n\nInvite code: ${code}\n\n— The Front Man, on behalf of altshiftx.tech`,
    });

    return Response.json({ success: true, code });
  } catch (error) {
    console.error("[speakeasyInvite] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});