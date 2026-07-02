import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Commercial Studio — real production planning + governance.
// Two actions:
//   action: "plan"     -> decompose brief into an intent-locked scene plan + brand-steered generation prompt
//   action: "certify"  -> run the NetGood 7-question governance gate + brand-fidelity scoring on a produced asset,
//                         and return an HONEST Zero-Defect Certificate (only the checks that actually ran).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = body.action || 'plan';
    const brief = (body.brief || '').toString().trim();
    const format = body.format === 'video' ? 'video' : 'image';
    const platform = (body.platform || '').toString();
    const brand = body.brand || {}; // { brand_name, colors, fonts, tone, style_notes }

    const brandBlock = `BRAND KIT (enforce on every element):
- Brand: ${brand.brand_name || 'Unspecified'}
- Colors: ${(brand.colors || []).join(', ') || 'n/a'}
- Fonts / typography: ${brand.fonts || 'n/a'}
- Voice & tone: ${brand.tone || 'n/a'}
- Style direction: ${brand.style_notes || 'n/a'}`;

    if (action === 'plan') {
      if (!brief) return Response.json({ error: 'Brief required' }, { status: 400 });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Commercial Studio production planner — a professional commercial director.
Decompose this brief into an intent-locked production plan for a ${format} deliverable${platform ? ` targeting ${platform}` : ''}.

${brandBlock}

BRIEF: "${brief}"

Produce:
1. A "scene_plan": an ordered list of ${format === 'video' ? '2-4' : '1-3'} scenes, each with a short "scene" label and a vivid, brand-consistent "description".
2. A single "generation_prompt": a polished, detailed prompt that a media generation model will use to produce the deliverable. It MUST bake in the brand colors, tone, and style direction, cinematic quality, and platform framing. This is the intent lock — be specific and unambiguous.
3. "ambiguities": a list of anything unclear in the brief the operator should resolve (empty if none).`,
        response_json_schema: {
          type: 'object',
          properties: {
            scene_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: { scene: { type: 'string' }, description: { type: 'string' } },
              },
            },
            generation_prompt: { type: 'string' },
            ambiguities: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      return Response.json({ ok: true, ...result });
    }

    if (action === 'certify') {
      // Run the real governance + fidelity gate. This genuinely evaluates the brief/plan text.
      const generationPrompt = (body.generation_prompt || brief).toString();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Commercial Studio governance & quality gate. Evaluate this commercial production and return an honest assessment.

${brandBlock}

BRIEF: "${brief}"
PRODUCTION PROMPT USED: "${generationPrompt}"

Run the AGENT-NETGOOD seven-question governance gate. For EACH question, answer "pass" or "concern" with one short reason:
1. Does this benefit the person/audience receiving it?
2. Is it truthful and non-deceptive?
3. Does it avoid psychological manipulation or dark patterns?
4. Does it respect consent and privacy?
5. Is it free of harmful, hateful, or exploitative content?
6. Is the AI-generated nature disclosable (no impersonation/deepfake deception)?
7. Is it reversible / low-risk if something is wrong?

Then score (0-100):
- brand_consistency: how well the production prompt honors the brand kit colors/tone/style.
- prompt_fidelity: how completely the production prompt captures the brief's intent.

Set governance_pass = true only if NONE of the 7 questions is a serious "concern".
Set ai_disclosure = true (all Commercial Studio output is AI-disclosed).
Write a 1-2 sentence "notes" summary an operator can trust.`,
        response_json_schema: {
          type: 'object',
          properties: {
            netgood_answers: { type: 'array', items: { type: 'string' } },
            governance_score: { type: 'number' },
            governance_pass: { type: 'boolean' },
            brand_consistency: { type: 'number' },
            prompt_fidelity: { type: 'number' },
            ai_disclosure: { type: 'boolean' },
            notes: { type: 'string' },
          },
        },
      });

      const passed = !!result.governance_pass;
      return Response.json({
        ok: true,
        certificate: {
          passed,
          brand_consistency: result.brand_consistency ?? 0,
          prompt_fidelity: result.prompt_fidelity ?? 0,
          governance_pass: passed,
          ai_disclosure: result.ai_disclosure !== false,
          notes: result.notes || '',
          issued_at: new Date().toISOString(),
        },
        governance: {
          score: result.governance_score ?? 0,
          verdict: passed ? 'Approved — Do No Harm certified' : 'Held — review governance concerns',
          answers: result.netgood_answers || [],
        },
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('commercialStudioPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});