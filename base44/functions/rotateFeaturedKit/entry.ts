import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// AI-driven monthly rotation of the marketplace's featured kit.
// Rotation begins July 1, 2026. Before that, the legacy "Super Dev Kit" stays featured.
const ROTATION_START = new Date(Date.UTC(2026, 6, 1)); // 2026-07-01 UTC

const LEGACY_SUPER_DEV_KIT = {
  kit_name: "Super Dev Kit",
  tagline: "3 elite AI agents bundled at 25% off",
  description:
    "The Super Dev Kit is a precision-engineered trio of AI agents designed to work in concert — from ideation to deployment to mastery. Together they eliminate the three biggest bottlenecks every serious builder faces: slow iteration, chaotic output, and shallow expertise.",
  component_codes: ["APP-PRINTER-1.0", "1TAKEJAY-1.0", "MIYAGI-SAN-1.0"],
  discount_percent: 25,
};

function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admins to trigger manually; scheduled runs pass the internal task secret.
    const url = new URL(req.url);
    let body = {};
    try { body = await req.json(); } catch { /* no body on some triggers */ }
    const internalSecret = req.headers.get("x-internal-secret") || body.internal_secret || url.searchParams.get("internal_secret");
    const isInternal = internalSecret && internalSecret === Deno.env.get("INTERNAL_TASK_SECRET");

    if (!isInternal) {
      const user = await base44.auth.me().catch(() => null);
      if (user?.role !== "admin") {
        return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
    }

    const now = new Date();
    const key = monthKey(now);

    // If we already have an active featured kit for this month, do nothing.
    const existing = await base44.asServiceRole.entities.FeaturedKit.filter({ month_key: key });
    if (existing && existing.length > 0) {
      return Response.json({ status: "exists", featured: existing[0] });
    }

    // Before rotation starts, lock the legacy Super Dev Kit as the featured kit.
    if (now < ROTATION_START) {
      // Deactivate any previously active records
      const allPrev = await base44.asServiceRole.entities.FeaturedKit.filter({ active: true });
      for (const r of allPrev) await base44.asServiceRole.entities.FeaturedKit.update(r.id, { active: false });
      const created = await base44.asServiceRole.entities.FeaturedKit.create({
        month_key: key,
        ...LEGACY_SUPER_DEV_KIT,
        ai_reasoning: "Rotation has not yet started (begins July 1, 2026). Featuring the flagship Super Dev Kit bundle.",
        selected_by: "manual",
        active: true,
      });
      return Response.json({ status: "pre_rotation", featured: created });
    }

    // Rotation active — ask AI to pick a sales-spurring kit for the month.
    const components = await base44.asServiceRole.entities.Component.filter({ status: "published" });
    if (!components || components.length < 2) {
      return Response.json({ error: "Not enough published components to build a kit" }, { status: 400 });
    }

    const catalog = components.map(c => ({
      code: c.code,
      name: c.name,
      type: c.type,
      category: c.category,
      price: c.price,
      installs: c.installs_count || 0,
      rating: c.rating || 0,
      trust: c.trust_score || 0,
      description: (c.description || "").slice(0, 200),
    }));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the AI merchandiser for an AI-component marketplace. Choose a "Featured Kit of the Month" bundle for ${key} that is most likely to spur sales.

Pick 2 to 4 complementary published components that work well together as a kit. Favor combinations that:
- Solve a clear end-to-end workflow for builders.
- Mix proven sellers (high installs/rating/trust) with a rising or underexposed component to boost its visibility.
- Make a compelling, giftable bundle.

Also propose a bundle discount percentage (between 10 and 30) that makes the deal attractive while protecting margin.

Here is the catalog of available components (use the exact "code" values):
${JSON.stringify(catalog, null, 2)}`,
      response_json_schema: {
        type: "object",
        properties: {
          kit_name: { type: "string" },
          tagline: { type: "string" },
          description: { type: "string" },
          component_codes: { type: "array", items: { type: "string" } },
          discount_percent: { type: "number" },
          ai_reasoning: { type: "string" },
        },
        required: ["kit_name", "component_codes", "discount_percent"],
      },
    });

    // Validate codes exist in catalog
    const validCodes = new Set(catalog.map(c => c.code));
    const chosen = (result.component_codes || []).filter(code => validCodes.has(code));
    if (chosen.length < 2) {
      return Response.json({ error: "AI did not return enough valid component codes", ai: result }, { status: 422 });
    }

    let discount = Number(result.discount_percent) || 20;
    discount = Math.max(10, Math.min(30, Math.round(discount)));

    // Deactivate previous active featured kits
    const prevActive = await base44.asServiceRole.entities.FeaturedKit.filter({ active: true });
    for (const r of prevActive) await base44.asServiceRole.entities.FeaturedKit.update(r.id, { active: false });

    const created = await base44.asServiceRole.entities.FeaturedKit.create({
      month_key: key,
      kit_name: result.kit_name || "Featured Kit of the Month",
      tagline: result.tagline || `Save ${discount}% on this month's hand-picked bundle`,
      description: result.description || "",
      component_codes: chosen,
      discount_percent: discount,
      ai_reasoning: result.ai_reasoning || "",
      selected_by: "ai",
      active: true,
    });

    return Response.json({ status: "rotated", featured: created });
  } catch (error) {
    console.error("rotateFeaturedKit error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});