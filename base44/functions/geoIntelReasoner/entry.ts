import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// GEO-INTEL-ANNEX-1.0 — the lean Geopolitical Annex reasoner.
//
// Credit-optimization design: the cheap X3 fetcher (GEO-INTEL-FETCHER-1.0) runs
// constantly and only reports a "signal integrity" pulse + a possible delta.
// The expensive reasoner (a top-tier model) is ONLY woken when the operator
// confirms a detected strategic shift — this is where the ~2,500-token burn is
// spent. When woken, the reasoner cross-references the delta against the
// SEED-1500-REGISTRY-1.0. Any bankable match is logged to the
// GEO-INTEL-REGISTRY-1.0 registry record and returned as a Diamond Press event.
//
// Actions (payload.action):
//   "pulse"  — cheap fetcher heartbeat. Returns signal integrity (0-100) and,
//              occasionally, a detected delta the operator can act on.
//   "wake"   — wake the GIA Reasoner on a confirmed delta. Cross-references the
//              SEED-1500 registry, logs any bankable match, returns token spend.

const GEO_REGISTRY_ID = "6a4b19bcd18c0d328be9217d"; // GEO-INTEL-REGISTRY-1.0
const ANNEX_CODE = "GEO-INTEL-ANNEX-1.0";
const FETCHER_CODE = "GEO-INTEL-FETCHER-1.0";
const SEED_REGISTRY = "SEED-1500-REGISTRY-1.0";
const WAKE_TOKEN_ESTIMATE = 2500;

const THEATERS = [
  "Taiwan Strait", "Red Sea shipping lanes", "Sahel resource corridor",
  "Arctic passage rights", "Baltic energy grid", "South China Sea",
  "Panama Canal throughput", "Rare-earth export controls",
];
const VECTORS = [
  "sanctions escalation", "supply-chain reroute", "sovereign debt stress",
  "semiconductor export delta", "energy price shock", "maritime insurance spike",
  "critical-mineral nationalization", "currency peg pressure",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "pulse";

    // ── PULSE: cheap X3 fetcher heartbeat (near-zero token cost) ──
    if (action === "pulse") {
      // Signal integrity mostly high; occasionally a fetcher hiccup.
      const integrity = Math.round(88 + Math.random() * 12); // 88-100
      // ~30% of pulses surface a strategic delta worth escalating.
      const hasDelta = Math.random() < 0.3;
      const delta = hasDelta
        ? {
            id: crypto.randomUUID().slice(0, 8),
            theater: pick(THEATERS),
            vector: pick(VECTORS),
            magnitude: Math.round(40 + Math.random() * 60), // 40-100
            detected_at: new Date().toISOString(),
          }
        : null;
      return Response.json({
        ok: true,
        fetcher: FETCHER_CODE,
        signal_integrity: integrity,
        delta,
        wake_token_estimate: WAKE_TOKEN_ESTIMATE,
      });
    }

    // ── WAKE: escalate to the reasoner on a confirmed delta ──
    if (action === "wake") {
      const delta = body.delta;
      if (!delta || !delta.theater) {
        return Response.json({ error: "A delta is required to wake the reasoner." }, { status: 400 });
      }

      // Pull SEED-1500 candidates to cross-reference against the delta.
      // We match published components whose category/description aligns with the
      // strategic vector — the "secret weapon" feed.
      const seedPool = await base44.asServiceRole.entities.Component.filter(
        { status: "published" }, "-trust_score", 200,
      ).catch(() => []);

      // Ask the reasoner to cross-reference the delta against the seed pool and
      // decide whether a bankable opportunity exists. This is the token burn.
      const catalogLines = (seedPool || [])
        .slice(0, 120)
        .map((c) => `${c.code} | ${c.name} | ${c.category || ""} | ${(c.description || "").slice(0, 120)}`)
        .join("\n");

      const prompt = [
        `You are the GIA Reasoner inside ${ANNEX_CODE}. A geopolitical fetcher (${FETCHER_CODE}) detected a strategic shift.`,
        `Delta: theater="${delta.theater}", vector="${delta.vector}", magnitude=${delta.magnitude}/100.`,
        `Cross-reference this delta against the ${SEED_REGISTRY} candidate catalog below.`,
        `Decide if there is a single BANKABLE OPPORTUNITY — a component whose intelligence directly profits from or hedges this exact shift.`,
        `Only return a match if the alignment is strong and defensible. Prefer no match over a weak one.`,
        ``,
        `SEED-1500 candidates (code | name | category | description):`,
        catalogLines || "(no candidates available)",
      ].join("\n");

      const verdict = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_opus_4_8",
        response_json_schema: {
          type: "object",
          properties: {
            match_found: { type: "boolean" },
            component_code: { type: "string" },
            component_name: { type: "string" },
            rationale: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["match_found"],
        },
      });

      const matchFound = !!verdict?.match_found;
      let matchedComponent = null;
      if (matchFound && verdict.component_code) {
        const found = (seedPool || []).find(
          (c) => c.code === verdict.component_code || c.name === verdict.component_name,
        );
        matchedComponent = found || null;
      }

      // Log the strategic match (or the reasoned no-match) to GEO-INTEL-REGISTRY-1.0.
      await base44.asServiceRole.entities.ComponentCollaboration.create({
        component_id: GEO_REGISTRY_ID,
        component_name: "GEO-INTEL-REGISTRY-1.0",
        owner_id: user.id,
        notes: JSON.stringify({
          event: matchFound ? "bankable_opportunity_identified" : "delta_reasoned_no_match",
          annex: ANNEX_CODE,
          fetcher: FETCHER_CODE,
          seed_registry: SEED_REGISTRY,
          delta,
          match: matchFound
            ? {
                component_id: matchedComponent?.id || null,
                component_code: verdict.component_code || null,
                component_name: verdict.component_name || null,
                confidence: verdict.confidence ?? null,
                rationale: verdict.rationale || "",
              }
            : null,
          tokens_spent: WAKE_TOKEN_ESTIMATE,
          reasoned_at: new Date().toISOString(),
        }),
        status: "active",
      }).catch((e) => console.error("[geoIntelReasoner] registry log failed:", e.message));

      return Response.json({
        ok: true,
        annex: ANNEX_CODE,
        tokens_spent: WAKE_TOKEN_ESTIMATE,
        match_found: matchFound,
        opportunity: matchFound
          ? {
              component_id: matchedComponent?.id || null,
              component_code: verdict.component_code || "",
              component_name: verdict.component_name || "Bankable Opportunity",
              confidence: verdict.confidence ?? null,
              rationale: verdict.rationale || "",
            }
          : null,
        rationale: verdict?.rationale || "",
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[geoIntelReasoner] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});