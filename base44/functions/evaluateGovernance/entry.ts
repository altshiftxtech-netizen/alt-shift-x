/**
 * evaluateGovernance — AI-powered governance scoring for a component.
 * Scores across: AI safety, data compliance, audit trail, version stability, PII handling.
 * Payload: { component_id }
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { component_id } = await req.json();
    if (!component_id) return Response.json({ error: "component_id required" }, { status: 400 });

    const components = await base44.entities.Component.filter({ id: component_id });
    if (!components.length) return Response.json({ error: "Component not found" }, { status: 404 });
    const component = components[0];

    // Load version history for stability scoring
    const versions = await base44.asServiceRole.entities.ComponentVersion.filter({ component_id }, "-created_date", 20);
    const breakingChanges = versions.filter(v => v.breaking_change).length;
    const versionCount = versions.length;
    const versionStabilityScore = Math.max(0, 100 - breakingChanges * 15 - Math.max(0, 5 - versionCount) * 5);

    // Use LLM to score the component
    const prompt = `You are an AI governance auditor for the Alt+Shift+X AI component marketplace.

Evaluate this component for governance and compliance quality. Return ONLY a JSON object — no explanation, no markdown.

Component:
- Name: ${component.name}
- Type: ${component.type}
- Category: ${component.category}
- Description: ${component.description}
- Features: ${(component.features || []).join(", ")}
- Schema fields: ${(component.schema || []).join(", ")}
- Status: ${component.status}
- Trust score: ${component.trust_score || 0}
- Version count: ${versionCount}
- Breaking changes: ${breakingChanges}

Score each dimension 0-100 and list risk flags (if any). Be realistic and slightly conservative.

Return JSON:
{
  "ai_safety_score": number,
  "data_compliance_score": number,
  "audit_trail_score": number,
  "pii_handling_score": number,
  "frameworks_certified": ["SOC2"|"GDPR"|"ISO27001"|"HIPAA"|"OWASP"],
  "certification_status": "uncertified"|"pending"|"certified",
  "risk_flags": [
    { "flag": string, "severity": "info"|"low"|"medium"|"high"|"critical", "description": string, "remediation": string }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          ai_safety_score: { type: "number" },
          data_compliance_score: { type: "number" },
          audit_trail_score: { type: "number" },
          pii_handling_score: { type: "number" },
          frameworks_certified: { type: "array", items: { type: "string" } },
          certification_status: { type: "string" },
          risk_flags: { type: "array", items: { type: "object" } },
        },
      },
    });

    const overall = Math.round(
      (result.ai_safety_score + result.data_compliance_score + result.audit_trail_score +
       versionStabilityScore + result.pii_handling_score) / 5
    );

    // Upsert GovernanceScore
    const existing = await base44.asServiceRole.entities.GovernanceScore.filter({ component_id });
    const data = {
      component_id,
      component_name: component.name,
      overall_score: overall,
      ai_safety_score: result.ai_safety_score,
      data_compliance_score: result.data_compliance_score,
      audit_trail_score: result.audit_trail_score,
      version_stability_score: versionStabilityScore,
      pii_handling_score: result.pii_handling_score,
      frameworks_certified: result.frameworks_certified || [],
      risk_flags: result.risk_flags || [],
      certification_status: result.certification_status || "uncertified",
      last_audited_at: new Date().toISOString(),
      next_audit_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      auditor: "BOB AI Governance Engine v2",
    };

    let scoreRecord;
    if (existing.length > 0) {
      scoreRecord = await base44.asServiceRole.entities.GovernanceScore.update(existing[0].id, data);
    } else {
      scoreRecord = await base44.asServiceRole.entities.GovernanceScore.create(data);
    }

    console.log(`Governance scored: ${component.name} = ${overall}/100 (${result.certification_status})`);

    return Response.json({ ...data, id: scoreRecord.id });
  } catch (error) {
    console.error("evaluateGovernance error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});