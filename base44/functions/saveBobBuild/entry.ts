import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Generates a valid PWA web-app manifest from a B.O.B.Init build payload.
function generatePwaManifest(input) {
  const stack = (input.stack || "altshiftx").toUpperCase();
  const name = input.pwa_name || `${stack}-AGENT-1.0`;
  const moduleCount = (input.feature_labels || []).length;
  const h = input.hardening || {};
  const hardeningActive = h.hallucination_guard !== false;
  return {
    name,
    short_name: name.substring(0, 12),
    description: `B.O.B.Init hardened PWA — ${moduleCount} modules, ESI ${input.esi_score || 0}/100, DB: ${input.database || "none"}, 110% hardened: ${hardeningActive ? "on" : "off"}`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/404bd4b4e_Copilot_20260601_015315.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/404bd4b4e_Copilot_20260601_015315.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      stack, shim, budget, tier,
      database, hardening,
      selected_features, feature_labels, rules,
      code_files, api_fields, esi_score,
      pwa_name, build_code
    } = body;

    const manifest = generatePwaManifest({
      stack, pwa_name, feature_labels, esi_score, database, hardening
    });

    const record = await base44.entities.BobBuild.create({
      builder_id: user.id,
      stack: stack || null,
      database: database || null,
      shim: shim || null,
      budget: budget || null,
      tier: tier || null,
      hardening: hardening || {},
      selected_features: selected_features || [],
      feature_labels: feature_labels || [],
      rules: rules || "",
      code_files: code_files || [],
      api_fields: api_fields || [],
      esi_score: esi_score || 0,
      pwa_name: pwa_name || manifest.name,
      build_code: build_code || `ASX-BUILD-${Date.now().toString(36).toUpperCase().slice(-5)}`,
      manifest_json: JSON.stringify(manifest, null, 2),
      status: "rendered"
    });

    return Response.json({ success: true, build: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}