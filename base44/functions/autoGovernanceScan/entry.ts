/**
 * autoGovernanceScan — runs daily to evaluate governance on all published components.
 * Skips components audited within the last 30 days unless scores have changed.
 * Admin-only scheduled function.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const components = await base44.asServiceRole.entities.Component.filter({ status: "published" });
    const existingScores = await base44.asServiceRole.entities.GovernanceScore.list("-last_audited_at", 200);

    const scoreMap = {};
    for (const s of existingScores) scoreMap[s.component_id] = s;

    const toAudit = components.filter(c => {
      const score = scoreMap[c.id];
      if (!score) return true; // never audited
      const ageDays = (Date.now() - new Date(score.last_audited_at).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays > 30 || score.certification_status === "uncertified";
    });

    console.log(`Auto governance scan: ${toAudit.length}/${components.length} components need audit`);

    const results = [];
    for (const component of toAudit) {
      const res = await base44.asServiceRole.functions.invoke("evaluateGovernance", { component_id: component.id });
      results.push({ component_id: component.id, name: component.name, score: res?.overall_score, status: res?.certification_status });
      console.log(`Audited ${component.name}: ${res?.overall_score}/100 (${res?.certification_status})`);
    }

    return Response.json({ audited: toAudit.length, skipped: components.length - toAudit.length, results });
  } catch (error) {
    console.error("autoGovernanceScan error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});