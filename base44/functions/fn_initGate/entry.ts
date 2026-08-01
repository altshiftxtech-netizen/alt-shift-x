import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// SOV-BOBBY-CORE-1.0 — the document yield registry. Server-side source of truth
// for what each sealed module returns. UI never holds this; fn_initGate yields it.
const DOC_REGISTRY = {
  "SOV-BOBBY-CONCEPT-1.0": {
    title: "Concept Paper",
    subtitle: "BOBby Build Yielder — Concept Document",
    sealLevel: "sealed",
    sections: [
      { heading: "Executive Summary", body: "BOBby (Builder Operated Bot Build Yielder) is a developer's canvas that converts a single prompt or brainstorming session into a full build substrate: concept paper, valuation, white paper, generated code, and testing plan. This document is the first yield — the Concept Paper — authored under the Sovereign Substrate." },
      { heading: "Problem Statement", body: "Builders today shuttle between disconnected tools: ideation in one place, valuation in another, code generation in a third. Context drifts, logic breaks, and the resulting software fails under real traffic. BOBby collapses the entire yield pipeline into one sealed, invariant substrate so that the first day of traffic fixes the site forever." },
      { heading: "Proposed Solution", body: "A single canvas with a live chat prompt that mutates a structured document set in real time. Each document (Concept, Valuation, White Paper, Code Specs, Test Plan) is indexed, titled, and rendered like a well-written PDF. The substrate is gated by the SOV-AUTH-SEAL-CERT-1.0 engine — no yield without a sealed session." },
      { heading: "Target Users", body: "Operators who build hardened agent systems: enterprise architects, resident developers, and Sovereign engineers running the 110% Hardened Standard. BOBby runs on the core and best of the Sovereign Substrate, making it the ultimate bot for developing and creating yield." },
      { heading: "Core Capabilities", body: "Prompt-to-concept yield, forensic document indexing with table of contents, server-authoritative module gating, ESI-sealed PDF export with cryptographic watermarking, and live document mutation through the chat composer." },
      { heading: "Sovereign Substrate Integration", body: "BOBby is wired through the substrate component map: the bob init dropdown calls fn_initGate, which verifies the X1 seal, then triggers the X5 core agent, which fetches X2 financial data, rendered by the X3 document engine. Every yield is bit-stamped to the immutable audit trail." },
      { heading: "Success Metrics", body: "10 million sessions, 0 logic breaches. Every yielded document carries an ESI Seal hash traceable to GSP-MASTER-INDEX-1.0. Substrate invariance is measured by zero logic drift across giga-scale traffic." }
    ]
  },
  "SOV-FIN-VALUATION-APEX-1.0": {
    title: "Enterprise Valuation",
    subtitle: "10-Year Valuation & IP Enterprise Analysis",
    sealLevel: "sealed",
    sections: [
      { heading: "Valuation Methodology", body: "This valuation blends income, market, and IP-asset approaches under the Sovereign multiplier. The 10-year projection discounts risk-adjusted cash flows and applies a substrate-invariance premium reflecting the 110% Hardened Standard." },
      { heading: "IP Asset Analysis", body: "The core intellectual property is the Sovereign Substrate itself: the X1-X5 component framework, the seal certification engine, and the BOBby yield pipeline. IP is valued as a defendable moat — the only place on earth where software is as reliable as the biological immune system." },
      { heading: "Market Sizing", body: "Total addressable market covers enterprise agent development, hardened PWA deployment, and operational engineering subscriptions. The Sovereign tier captures the apex: organizations that require substrate invariance, not tips." },
      { heading: "10-Year Revenue Projection", body: "Year 1-3: substrate seat and pipeline key revenue. Year 4-7: marketplace take-rate compounding as the Synthetic Swarm neutralizes bug classes. Year 8-10: enterprise core licenses and the Sovereign multiplier dominates, with the Immune Genome licensed as infrastructure." },
      { heading: "Risk-Adjusted NPV", body: "Risk adjustments account for regulatory framework shifts, exposure hard-stops, and context saturation events. The risk-adjusted NPV remains strongly positive because the substrate's fail-closed architecture caps downside at the session boundary." },
      { heading: "Sovereign Multiplier", body: "A premium applied when the operator is sealed under SOV-AUTH-SEAL-CERT-1.0 and running the full Triad. The multiplier reflects operational immunity — the substrate never breaks, so terminal value carries zero logic-breach discount." },
      { heading: "Final Valuation Range", body: "The converged enterprise valuation range is presented as a sealed yield. The exact figure is bound to the ESI Seal of this document; any tampering invalidates the seal and nullifies the valuation under GSP-MASTER-INDEX-1.0." }
    ]
  }
};

async function sha256hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { moduleKey, seal } = body || {};

    // Seed ModuleRegistry from DOC_REGISTRY if missing (keeps registry in sync).
    const existing = await base44.asServiceRole.entities.ModuleRegistry.filter({});
    const existingKeys = new Set(existing.map((m) => m.moduleKey));
    for (const key of Object.keys(DOC_REGISTRY)) {
      if (!existingKeys.has(key)) {
        await base44.asServiceRole.entities.ModuleRegistry.create({
          moduleKey: key,
          requiredSealLevel: DOC_REGISTRY[key].sealLevel || "sealed",
          enabled: true,
        });
      }
    }

    // Find or create the operator's SubstrateSession (source of truth for the gate).
    let sessions = await base44.asServiceRole.entities.SubstrateSession.filter({ userId: user.id });
    let session = sessions[0];
    if (!session) {
      session = await base44.asServiceRole.entities.SubstrateSession.create({
        userId: user.id,
        sealStatus: "unverified",
        authorizedModules: [],
        issuedAt: new Date().toISOString(),
      });
    }

    // Seal action — authorizes all enabled modules for this operator.
    if (seal) {
      const allKeys = Object.keys(DOC_REGISTRY);
      session = await base44.asServiceRole.entities.SubstrateSession.update(session.id, {
        sealStatus: "sealed",
        authorizedModules: allKeys,
        issuedAt: new Date().toISOString(),
      });
    }

    // Status-only response (no moduleKey) — returns session + module index for the sidebar.
    if (!moduleKey) {
      return Response.json({
        status: session.sealStatus === "sealed" ? "sealed" : "unverified",
        session: {
          sealStatus: session.sealStatus,
          authorizedModules: session.authorizedModules || [],
          issuedAt: session.issuedAt,
        },
        modules: Object.entries(DOC_REGISTRY).map(([key, doc]) => ({
          key,
          title: doc.title,
          subtitle: doc.subtitle,
        })),
      });
    }

    // ── THE GATE ── validate seal + authorization (SOV-AUTH-SEAL-CERT-1.0 / X1)
    const isSealed = session.sealStatus === "sealed";
    const isAuthorized = (session.authorizedModules || []).includes(moduleKey);
    const doc = DOC_REGISTRY[moduleKey];

    if (!isSealed || !isAuthorized || !doc) {
      // Fail closed: nullify all data streams.
      return Response.json({ status: "denied", moduleKey, document: null, esiSeal: null });
    }

    // Auth pass → SOV-BOBBY-CORE-1.0 (X5) yields the module payload.
    const sealedAt = session.issuedAt || new Date().toISOString();
    const canonical = moduleKey + "|" + user.id + "|" + sealedAt + "|" + JSON.stringify(doc.sections);
    const esiSeal = await sha256hex(canonical);

    return Response.json({
      status: "authorized",
      moduleKey,
      document: { title: doc.title, subtitle: doc.subtitle, sections: doc.sections },
      esiSeal,
      sealedAt,
    });
  } catch (error) {
    console.error("[fn_initGate] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}