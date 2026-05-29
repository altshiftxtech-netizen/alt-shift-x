import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const generateRandomKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
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

    const { name, description } = await req.json();

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    const plainKey = generateRandomKey();
    const keyHash = await hashKey(plainKey);

    await base44.entities.ApiKey.create({
      user_id: user.id,
      name,
      description: description || "",
      key_hash: keyHash,
      status: "active",
    });

    console.log(`API key generated: user=${user.id}, name=${name}`);

    return Response.json({
      key: plainKey,
      masked: `${plainKey.slice(0, 4)}...${plainKey.slice(-4)}`,
      message: "Store this key securely — you won't be able to see it again.",
    }, { status: 201 });
  } catch (error) {
    console.error("generateApiKey error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});