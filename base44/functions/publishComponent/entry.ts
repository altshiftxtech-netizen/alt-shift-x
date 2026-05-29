import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, code, type, category, description, long_description, features, schema, price } = data;

    if (!name || !code || !type || !category || !description || price === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const component = await base44.entities.Component.create({
      builder_id: user.id,
      name,
      code,
      type,
      category,
      description,
      long_description: long_description || "",
      features: features || [],
      schema: schema || [],
      price,
      status: "pending_review",
      rating: 0,
      reviews_count: 0,
      installs_count: 0,
      trust_score: 75,
      trust_breakdown: { performance: 75, safety: 75, satisfaction: 75, retention: 75 },
      certified: false,
    });

    console.log(`Component published: id=${component.id}, builder=${user.id}, status=pending_review`);

    return Response.json({ component, message: "Component submitted for review" }, { status: 201 });
  } catch (error) {
    console.error("publishComponent error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});