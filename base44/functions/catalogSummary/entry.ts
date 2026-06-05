import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * catalogSummary — returns a LIGHTWEIGHT projection of published components for
 * the sales_consultant agent. Reading the full Component entity pulls in massive
 * long_description / features fields (hundreds of KB), which overflows the
 * agent's context and causes it to end a turn with no reply ("not responding").
 *
 * This returns only the fields the consultant needs to make a recommendation,
 * with descriptions truncated, keeping the payload small and the agent reliable.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const all = await base44.asServiceRole.entities.Component.filter({ status: "published" });

    const components = all.map((c) => ({
      name: c.name,
      code: c.code,
      type: c.type,
      category: c.category,
      builder_name: c.builder_name || "",
      price: c.price,
      rating: c.rating || 0,
      installs_count: c.installs_count || 0,
      trust_score: c.trust_score || 0,
      certified: !!c.certified,
      // Truncate the bloated descriptive fields so the agent gets the gist
      // without the multi-KB long_description payload.
      description: (c.description || "").slice(0, 220),
      features: (c.features || []).slice(0, 3).map((f) => f.slice(0, 120)),
    }));

    console.log(`[catalogSummary] returned ${components.length} published components to user ${user.id}`);
    return Response.json({ count: components.length, components });
  } catch (error) {
    console.error("[catalogSummary] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});