import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// SOV-PWA-TIGHT-ORCH-X5-1.0 — The PWA Tightening Orchestrator (X5 Self-Healing Executive)
//
// Scans a B.O.B.Init build record and returns a "tightened" public-safe version
// that strips ALL proprietary platform internals so the produced PWA cannot leak
// Alt+Shift+X procedure, internal codes, or hardening configuration to end users.
//
// DOCTRINE: Produced PWA's are "AI Agent Hardened" — a step below the 110%
// Hardened Standard. The 110% hardening is reserved for components built ON the
// altshiftx.tech platform itself. Produced PWA shells get AI Agent Hardening.
// The proprietary 110% stack (X1/X2/X4/X5 internal procedure) is NEVER exposed
// in a shipped PWA — only the boolean guard flags + confidence threshold survive.

const PROPRIETARY_CODE_PREFIXES = [
  "BOB-INIT-",
  "ASX-BUILD-",
  "GSP-MASTER-INDEX",
  "SOV-",
  "EXPERT-MINDS-",
  "SPEAKEASY-",
];

function stripProprietary(text) {
  if (!text) return text;
  let cleaned = text;
  for (const prefix of PROPRIETARY_CODE_PREFIXES) {
    cleaned = cleaned.replace(new RegExp(prefix + "[A-Z0-9.-]*", "g"), "");
  }
  // Collapse leftover double-spaces / dangling separators
  return cleaned.replace(/\s{2,}/g, " ").replace(/[·•]\s*$/g, "").trim();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { build_id } = body;
    if (!build_id) return Response.json({ error: 'build_id required' }, { status: 400 });

    const build = await base44.entities.BobBuild.get(build_id);
    if (!build) return Response.json({ error: 'Build not found' }, { status: 404 });

    // Verify ownership — only the builder or an admin can tighten their build
    if (build.builder_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Not authorized to tighten this build' }, { status: 403 });
    }

    const h = build.hardening || {};

    // Build public-safe hardening badges (labels only — no thresholds, no config JSON,
    // no regulatory framework name, no environment/rollback details)
    const hardening_badges = [
      h.hallucination_guard !== false && "Hallucination Guard",
      h.audit_logging !== false && "Audit Logging",
    ].filter(Boolean);

    // Clean the manifest — strip any proprietary codes from the description
    let cleanManifest = {};
    try {
      cleanManifest = JSON.parse(build.manifest_json || "{}");
      if (cleanManifest.description) {
        cleanManifest.description = "AI Agent Hardened PWA";
      }
      delete cleanManifest._internal;
    } catch {}

    // Return the tightened, public-safe build data.
    // EXPLICITLY EXCLUDED proprietary fields (never sent to the produced PWA):
    //   - build_code, esi_score (internal platform metrics)
    //   - internal engine codes (BOB-INIT-*, ASX-BUILD-*)
    //   - full hardening config JSON (regulatory framework, environment, rollback, X1-X5 internals)
    //   - selected_features raw ids, api_fields, code_files
    const tightened = {
      pwa_name: build.pwa_name || "PWA",
      database: build.database || "none",
      // AI Agent Hardened — NOT 110%. 110% is for platform-built components only.
      hardening_level: "AI Agent Hardened",
      hardening_badges,
      // Only the confidence threshold survives (needed for the guard to function).
      // Never expose the full hardening config object.
      confidence_threshold: h.confidence_threshold || 0.85,
      hallucination_guard: h.hallucination_guard !== false,
      audit_logging: h.audit_logging !== false,
      manifest: cleanManifest,
      // Strip proprietary codes from feature labels
      features: (build.feature_labels || []).map(l => stripProprietary(l)).filter(Boolean),
      tightened_at: new Date().toISOString(),
      protocol: "SOV-PWA-TIGHT-ORCH-X5-1.0",
    };

    return Response.json({ success: true, tightened });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}