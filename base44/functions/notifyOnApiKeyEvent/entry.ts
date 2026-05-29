import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (!data?.user_id) return Response.json({ skipped: true });

    const isRevoked = data.status === "revoked";
    const type = isRevoked ? "api_key_revoked" : "api_key_created";
    const severity = isRevoked ? "warning" : "info";
    const title = isRevoked
      ? `API Key Revoked: ${data.name}`
      : `API Key Created: ${data.name}`;
    const message = isRevoked
      ? `Your API key "${data.name}" has been revoked. Any applications using this key will immediately lose access. If you didn't do this, investigate immediately.`
      : `A new API key "${data.name}" was created for your account. If you didn't create this, revoke it immediately from the API Keys page.`;

    await base44.asServiceRole.functions.invoke("sendNotification", {
      user_id: data.user_id,
      type,
      severity,
      title,
      message,
      action_url: "/mobile",
      action_label: "View API Keys",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("notifyOnApiKeyEvent error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});