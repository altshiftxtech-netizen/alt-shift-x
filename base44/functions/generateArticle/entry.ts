import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Admin/staff: generate a full article (title, excerpt, body, tags) + an AI
// illustration about the products, the site, a promotion, or an event.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !["admin", "staff"].includes(user.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { topic, category = "general", withIllustration = true } = await req.json();
    if (!topic || !topic.trim()) {
      return Response.json({ error: "Missing topic" }, { status: 400 });
    }

    // Pull a little catalog context so product articles are grounded.
    let catalog = "";
    try {
      const comps = await base44.asServiceRole.entities.Component.filter({ status: "published" }, "-installs_count", 12);
      catalog = comps.map((c) => `- ${c.name} (${c.code}): ${c.description || ""} — $${c.price || 0}/mo`).join("\n");
    } catch { /* best effort */ }

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the content writer for the Alt+Shift+X AI-component marketplace. Write a polished, engaging ${category} article about: "${topic}".
${catalog ? `\nRelevant catalog for grounding (use only if relevant):\n${catalog}\n` : ""}
Write in clean Markdown with headings, short paragraphs, and a compelling intro. Aim for 400-700 words. Be specific and on-brand, not generic.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          excerpt: { type: "string", description: "1-2 sentence summary" },
          body: { type: "string", description: "Full article in Markdown" },
          tags: { type: "array", items: { type: "string" } },
          image_prompt: { type: "string", description: "A vivid prompt for a hero illustration matching the article" },
        },
        required: ["title", "excerpt", "body"],
      },
    });

    let hero_image_url = "";
    if (withIllustration && res?.image_prompt) {
      try {
        const img = await base44.integrations.Core.GenerateImage({
          prompt: `Editorial blog hero illustration, modern clean aesthetic: ${res.image_prompt}`,
        });
        hero_image_url = img?.url || "";
      } catch (e) {
        console.error("[generateArticle] image error:", e.message);
      }
    }

    return Response.json({
      ok: true,
      title: res.title,
      excerpt: res.excerpt,
      body: res.body,
      tags: res.tags || [],
      hero_image_url,
    });
  } catch (err) {
    console.error("[generateArticle] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});