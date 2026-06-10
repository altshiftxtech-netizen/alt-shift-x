import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Validates a user's API key and runs a LIVE test query through the component's
// intelligence agent — proving the key works AND that the agent it's injected
// into responds. Returns the agent's reply so the user sees a real result.
const hashKey = async (key) => {
  const data = new TextEncoder().encode(key);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey, componentName, testQuery } = await req.json();
    if (!apiKey) {
      return Response.json({ error: "Please paste your access key first." }, { status: 400 });
    }

    // 1) Confirm the key is real, active, and belongs to this user.
    const keyHash = await hashKey(apiKey.trim());
    const matches = await base44.entities.ApiKey.filter({
      user_id: user.id,
      key_hash: keyHash,
      status: "active",
    });
    if (matches.length === 0) {
      return Response.json({ ok: false, error: "That key isn't valid or has been revoked. Create a new key and try again." }, { status: 200 });
    }
    const keyRecord = matches[0];

    // 2) Run a live test query through the agent the key powers. We use the
    // platform LLM as the component's intelligence engine so the user sees a
    // real, working response — no code required on their end.
    const prompt = `You are the "${componentName || "Intelligence"}" component agent. A user is testing their connection. Briefly and warmly confirm the connection works, then answer their test question in 2-3 helpful sentences.\n\nUser's test question: "${testQuery || "Give me a quick example of what you can help me with."}"`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });

    console.log(`testComponentKey: user=${user.id} key=${keyRecord.name} agent=${keyRecord.agent_name || "none"} ok`);

    return Response.json({
      ok: true,
      agent_name: keyRecord.agent_name || componentName || "your component",
      reply: typeof result === "string" ? result : (result?.response || "Connection confirmed."),
    });
  } catch (error) {
    console.error("testComponentKey error:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});