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

    // Optional free-text search to narrow the catalog to what the user asked
    // for. Keeping the payload small is critical — returning all ~85 components
    // overflows the agent's context and it never writes a reply.
    let body = {};
    try { body = await req.json(); } catch { body = {}; }
    const search = (body.search || "").toString().toLowerCase().trim();

    const all = await base44.asServiceRole.entities.Component.filter({ status: "published" });

    const matchesSearch = (c) => {
      if (!search) return true;
      const haystack = [c.name, c.code, c.category, c.description, ...(c.features || [])]
        .join(" ")
        .toLowerCase();
      return search.split(/\s+/).some((term) => term.length > 2 && haystack.includes(term));
    };

    let filtered = all.filter(matchesSearch);

    // Rank by relevance signals (certified, installs, rating) and hard-cap the
    // result count so the payload stays tiny.
    filtered.sort((a, b) =>
      (b.certified ? 1 : 0) - (a.certified ? 1 : 0) ||
      (b.installs_count || 0) - (a.installs_count || 0) ||
      (b.rating || 0) - (a.rating || 0)
    );

    const LIMIT = 20;
    const components = filtered.slice(0, LIMIT).map((c) => ({
      name: c.name,
      code: c.code,
      type: c.type,
      category: c.category,
      builder_name: c.builder_name || "",
      price: c.price,
      rating: c.rating || 0,
      trust_score: c.trust_score || 0,
      certified: !!c.certified,
      // Keep descriptions short — the agent only needs the gist.
      description: (c.description || "").slice(0, 140),
    }));

    console.log(`[catalogSummary] search="${search}" matched=${filtered.length} returned=${components.length} to user ${user.id}`);
    return Response.json({
      count: components.length,
      total_matched: filtered.length,
      components,
    });
  } catch (error) {
    console.error("[catalogSummary] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});