import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key_id } = await req.json();

    if (!key_id) {
      return Response.json({ error: "key_id is required" }, { status: 400 });
    }

    let key;
    try {
      const keys = await base44.asServiceRole.entities.ApiKey.filter({ id: key_id });
      key = keys[0];
    } catch (_) {
      return Response.json({ error: "Key not found" }, { status: 404 });
    }

    if (!key || key.user_id !== user.id) {
      return Response.json({ error: "Key not found or not owned by user" }, { status: 404 });
    }

    await base44.asServiceRole.entities.ApiKey.update(key_id, { status: "revoked" });

    console.log(`API key revoked: user=${user.id}, key=${key_id}`);

    return Response.json({ message: "API key revoked" });
  } catch (error) {
    console.error("revokeApiKey error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});