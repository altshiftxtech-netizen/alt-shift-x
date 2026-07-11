import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const generateRandomKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint32Array(32);
  crypto.getRandomValues(bytes);
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(bytes[i] % chars.length);
  }
  return key;
};

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

    const { name, description, agent_name } = await req.json();

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    // RULE: Each API key can be paired with at most 1 agent.
    // RULE: All keys on an account count toward ONE monthly subscription.
    // There is no limit on how many keys a user can create.

    // Check if agent_name is already paired to another active key for this user
    if (agent_name) {
      const existingKeysWithAgent = await base44.entities.ApiKey.filter({
        user_id: user.id,
        status: "active",
        agent_name: agent_name,
      });
      if (existingKeysWithAgent.length > 0) {
        return Response.json({
          error: `Agent "${agent_name}" is already paired with an existing API key. Each agent can only be paired with one key at a time. Revoke the existing key first or create a new key with a different agent.`
        }, { status: 409 });
      }
    }

    const plainKey = generateRandomKey();
    const keyHash = await hashKey(plainKey);

    await base44.entities.ApiKey.create({
      user_id: user.id,
      name,
      description: description || "",
      key_hash: keyHash,
      agent_name: agent_name || null,
      status: "active",
      governance_policy: "do_no_harm_v1",
      governance_attestation: "AI Agent Do-No-Harm Oath v1.0 — cryptographically bound at key generation. This key and any agent operating under it is constrained from generating, facilitating, or amplifying harmful content; must preserve human oversight; must respect user privacy; and must comply with the Magna Dev Trust Framework and all applicable platform governance standards.",
      governance_bound_at: new Date().toISOString(),
    });

    console.log(`API key generated: user=${user.id}, name=${name}, agent=${agent_name || "none"}`);

    return Response.json({
      key: plainKey,
      masked: `${plainKey.slice(0, 4)}...${plainKey.slice(-4)}`,
      agent_name: agent_name || null,
      message: "Store this key securely — you won't be able to see it again. This key is paired with your account's single monthly subscription.",
    }, { status: 201 });
  } catch (error) {
    console.error("generateApiKey error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});