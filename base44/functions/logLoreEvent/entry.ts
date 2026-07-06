import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * logLoreEvent — records a delivered FounderLore snippet (a Barkeep whisper,
 * noir monologue, or riddle) as a lore_event in the forensic audit trail. This
 * is the Source-of-Truth registry the Daily Forensic Report reads so founder
 * stories don't repeat. Called by the_bartender agent after delivering lore.
 *
 * Payload: { founder: string, snippet_type: 'whisper'|'monologue'|'riddle', snippet?: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const founder = (body.founder || '').toString().trim();
    const snippetType = (body.snippet_type || 'whisper').toString().trim();
    if (!founder) return Response.json({ error: 'founder is required' }, { status: 400 });

    const record = await base44.asServiceRole.entities.ForensicAuditLog.create({
      protocol: 'AGENT-TAMPER-EVIDENCE-1.0',
      downloader_id: user.id,
      downloader_email: user.email || '',
      downloader_role: user.role || 'user',
      export_kind: 'lore_event',
      target_ref: founder,
      metadata_snapshot: {
        founder,
        snippet_type: snippetType,
        snippet: (body.snippet || '').toString().slice(0, 500),
        source_component: 'SPEAKEASY-FOUNDER-LORE-1.0',
      },
      verification_status: 'verified',
      exported_at: new Date().toISOString(),
    });

    console.log(`[INFO] lore_event logged: user=${user.id} founder=${founder} type=${snippetType}`);
    return Response.json({ success: true, id: record.id });
  } catch (error) {
    console.error('logLoreEvent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});