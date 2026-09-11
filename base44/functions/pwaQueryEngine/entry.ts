import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// PWA Query Engine — AI gateway for standalone PWA packages.
// Receives a component code, user query, persona, and conversation history,
// invokes the platform LLM with a persona-specific system prompt, and returns
// the generated response. Called by the generated PWA's fetch() handler when
// online. Falls back to the PWA's embedded offline rule engine when unreachable.

const PERSONA_PROMPTS = {
  obsidian: `You are the PM-1A Forensic Dossier Analyzer, a sovereign intelligence agent operating within the Blackstone Protocol framework. Analyze user queries through a forensic lens: identify evidence chains, chain-of-custody concerns, audit trail integrity, substrate drift, and security implications. Structure your response with: (1) Forensic Assessment, (2) Key Findings, (3) Risk Vectors, (4) Recommended Actions. Be precise, clinical, and thorough. Reference the Blackstone Protocol and Sovereign Defense Suite where relevant.`,
  parchment: `You are a constitutional jurisprudence advisor operating under the We the People civic framework. You have deep knowledge of the U.S. Constitution, all 27 Amendments, the Bill of Rights, key Articles (I-VII), landmark Supreme Court precedent, and Blackstone's Commentaries on the Laws of England. When answering: cite specific amendment numbers, article sections, and relevant precedent cases by name. Structure your response with: (1) Constitutional Analysis, (2) Relevant Amendments & Articles, (3) Historical Precedent, (4) Blackstone Defense Mapping. Be scholarly, precise, and accessible to a citizen audience.`,
  maxviz: `You are Gimmie G, a friendly, encouraging learning companion for children (ages 6-12). You are COPPA-compliant and child-safe. Route every query through one of five cognitive domains: Memory, Logic, Language, Math, or Puzzles. Respond with playful dialogue, interactive challenges, and age-appropriate educational content. Use emojis, encouragement, and simple language. Never discuss unsafe topics. Always be positive and supportive.`,
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { component_code, query, history, persona } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }
    if (query.length > 2000) {
      return Response.json({ error: 'Query too long (max 2000 characters)' }, { status: 400 });
    }

    const personaKey = (persona === 'parchment' || persona === 'maxviz') ? persona : 'obsidian';
    const systemPrompt = PERSONA_PROMPTS[personaKey] || PERSONA_PROMPTS.obsidian;

    // Build conversation context from history (last 10 messages)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    const contextBlock = recentHistory.length > 0
      ? '\n\n--- Conversation History ---\n' + recentHistory.map(m => (m.role === 'user' ? 'Citizen' : 'Agent') + ': ' + m.text).join('\n')
      : '';

    const fullPrompt = systemPrompt + contextBlock + '\n\n--- Current Query ---\n' + query.trim() + '\n\nProvide a substantive, structured response. Do not echo the query back.';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: false,
    });

    const responseText = typeof result === 'string' ? result : (result?.response || result?.text || JSON.stringify(result));

    return Response.json({
      response: responseText,
      persona: personaKey,
      component_code: component_code || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('pwaQueryEngine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}