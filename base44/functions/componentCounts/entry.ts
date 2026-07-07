import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * componentCounts — returns ACCURATE catalog counts by status.
 *
 * A single .filter()/.list() call is hard-capped at 5,000 records per page, so
 * once the catalog grows past that any front-end count is truncated (this is the
 * "components count is incorrect" bug). This function paginates through the full
 * set server-side using a lean projection and returns the true totals.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const PAGE = 5000;
    const MAX_PAGES = 40; // safety ceiling (200k records)

    // Count published (public) — no auth required so the homepage can show it.
    const countByStatus = async (status) => {
      let total = 0;
      let skip = 0;
      for (let i = 0; i < MAX_PAGES; i++) {
        const rows = await base44.asServiceRole.entities.Component.filter(
          { status },
          "created_date",
          PAGE,
          skip
        );
        total += rows.length;
        if (rows.length < PAGE) break;
        skip += PAGE;
      }
      return total;
    };

    const published = await countByStatus("published");

    // Admin-only: include the moderation breakdown when an admin asks for it.
    let breakdown = null;
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin") {
        const [pendingReview, pending, shelved] = await Promise.all([
          countByStatus("pending_review"),
          countByStatus("pending"),
          countByStatus("shelved"),
        ]);
        breakdown = { pending: pendingReview + pending, shelved };
      }
    } catch {
      // not logged in — just return the public published count
    }

    return Response.json({ published, breakdown });
  } catch (error) {
    console.error("[componentCounts] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});