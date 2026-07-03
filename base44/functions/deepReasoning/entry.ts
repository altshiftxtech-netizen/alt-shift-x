import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Opt-in escalation tool for BOB. For genuinely high-stakes reasoning
// (complex legal/compliance framing, financial-instrument analysis, nuanced
// safety trade-offs) BOB calls this to route the question to a top-tier model
// instead of answering on the pinned flash model. This is analysis/framing
// only — it never replaces the flag-and-refer safety guardrails.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, context } = await req.json();
    if (!question) return Response.json({ error: 'question required' }, { status: 400 });

    const prompt = [
      'You are a senior advisor providing high-stakes, decision-grade reasoning for a marketplace builder.',
      'Reason carefully, surface assumptions, risks, and trade-offs. This is analysis and framing only —',
      'do NOT give definitive legal, medical, or financial rulings; flag where a licensed professional is required.',
      context ? `\nContext:\n${context}` : '',
      `\nQuestion:\n${question}`,
    ].join('\n');

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_opus_4_8',
    });

    return Response.json({ answer, model: 'claude_opus_4_8' });
  } catch (error) {
    console.error('deepReasoning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});