import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// BOB² BuilderOperatedBiz — structured document generator.
// Produces a drafting-aid document body, an "assumptions" list (what was
// inferred because fields were blank), and a next-review checklist.
// Every output is a DRAFTING AID ONLY — not legal advice. That framing is
// baked into the prompt and echoed in the returned document header/footer.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { template_key, template_label, deal_stage, jurisdiction, fields } = await req.json();
    if (!template_key || !template_label) {
      return Response.json({ error: 'template_key and template_label are required' }, { status: 400 });
    }

    const fieldLines = Object.entries(fields || {})
      .map(([k, v]) => `- ${k}: ${v === "" || v == null ? "(not provided)" : v}`)
      .join("\n");

    const prompt = `You are BOB² "BuilderOperatedBiz", a solutionist business counselor that produces DRAFTING-AID business documents for software builders. You are NOT a lawyer and this is NOT legal advice.

Produce a clean, professional draft of a "${template_label}" for the "${jurisdiction || "United States (general)"}" jurisdiction context.

Use the following filled inputs. Where a value says "(not provided)", make a reasonable, clearly-standard assumption and RECORD it in the assumptions list — never leave a legally-critical field silently blank.

Inputs:
${fieldLines || "(no fields provided)"}

Return well-structured markdown for the document body with numbered sections appropriate to a ${template_label}. Do not include the disclaimer in the body (the app adds it to the header/footer).

Also produce:
- assumptions: an array of short strings, each describing something you assumed because a field was blank or ambiguous (especially governing law, license scope, acceptance criteria, liability caps, data roles, IP ownership, term/termination).
- review_checklist: an array of short "before you rely on this" review items a qualified attorney should check.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          draft_body: { type: "string" },
          assumptions: { type: "array", items: { type: "string" } },
          review_checklist: { type: "array", items: { type: "string" } },
        },
        required: ["draft_body", "assumptions", "review_checklist"],
      },
    });

    return Response.json({
      draft_body: result.draft_body || "",
      assumptions: result.assumptions || [],
      review_checklist: result.review_checklist || [],
    });
  } catch (error) {
    console.error("generateBizDocument error:", error?.message || error);
    return Response.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
});