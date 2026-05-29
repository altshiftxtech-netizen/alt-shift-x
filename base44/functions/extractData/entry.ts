import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const hashKey = async (key) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { component_id, api_key, document_text } = await req.json();

    if (!component_id || !api_key || !document_text) {
      return Response.json({ error: "component_id, api_key, and document_text are required" }, { status: 400 });
    }

    // 1. Validate API key
    const keyHash = await hashKey(api_key);
    const apiKeys = await base44.asServiceRole.entities.ApiKey.filter({
      user_id: user.id,
      status: "active",
    });

    const validKey = apiKeys.find(k => k.key_hash === keyHash);
    if (!validKey) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 2. Get component
    const components = await base44.asServiceRole.entities.Component.filter({ id: component_id });
    if (components.length === 0) {
      return Response.json({ error: "Component not found" }, { status: 404 });
    }

    const component = components[0];

    // 3. Track extraction + check quota
    const trackRes = await base44.functions.invoke("trackExtraction", { component_id });

    if (trackRes.data.quota_exceeded) {
      return Response.json({
        error: "API quota exceeded",
        quota_exceeded: true,
        used: trackRes.data.used,
        limit: trackRes.data.limit,
      }, { status: 429 });
    }

    // 4. Simulate extraction (in real app, call the component's endpoint)
    const mockExtraction = {
      component_id,
      component_name: component.name,
      extracted_at: new Date().toISOString(),
      fields: component.schema.reduce((acc, field) => {
        acc[field] = `[extracted: ${field}]`;
        return acc;
      }, {}),
    };

    console.log(`Extraction completed: user=${user.id}, component=${component_id}, quota_used=${trackRes.data.used}`);

    return Response.json({ success: true, data: mockExtraction, quota_remaining: trackRes.data.remaining });
  } catch (error) {
    console.error("extractData error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});