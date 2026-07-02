import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Commercial Studio — document intake.
// Reads an uploaded brand document (and optional script) and extracts structured
// brand kit fields + a production brief so the studio can auto-populate them.
// The operator edits everything before anything is saved.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const brandFileUrl = (body.brand_file_url || '').toString();
    const scriptFileUrl = (body.script_file_url || '').toString();
    const brandText = (body.brand_text || '').toString();
    const scriptText = (body.script_text || '').toString();

    if (!brandFileUrl && !scriptFileUrl && !brandText && !scriptText) {
      return Response.json({ error: 'Provide a brand document or script' }, { status: 400 });
    }

    const fileUrls = [brandFileUrl, scriptFileUrl].filter(Boolean);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Commercial Studio intake analyst. Read the attached/enclosed materials and extract a brand kit and a production brief.

${brandText ? `BRAND DOCUMENT TEXT:\n${brandText}\n\n` : ''}${scriptText ? `SCRIPT TEXT:\n${scriptText}\n\n` : ''}${fileUrls.length ? 'Additional details are in the attached file(s).\n\n' : ''}
Extract as much as is present. Leave a field as an empty string / empty array if the materials do not state it — do NOT invent brand facts. For the brief, synthesize a clear production brief from the script and brand context (this one you may compose).

Return:
- brand_name
- colors: array of hex color codes explicitly given or clearly implied (e.g. "navy" -> "#1B2A4A"); empty if none
- fonts: typography / font families mentioned
- tone: brand voice & tone
- style_notes: visual style direction
- title: a short production title
- platform_target: intended platform if stated (else empty)
- format: "video" if the material is a script or video brief, else "image"
- brief: a clear, production-ready brief synthesized from the script + brand context`,
      file_urls: fileUrls.length ? fileUrls : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          brand_name: { type: 'string' },
          colors: { type: 'array', items: { type: 'string' } },
          fonts: { type: 'string' },
          tone: { type: 'string' },
          style_notes: { type: 'string' },
          title: { type: 'string' },
          platform_target: { type: 'string' },
          format: { type: 'string' },
          brief: { type: 'string' },
        },
      },
    });

    return Response.json({
      ok: true,
      brand: {
        brand_name: result.brand_name || '',
        colors: Array.isArray(result.colors) ? result.colors.filter(Boolean) : [],
        fonts: result.fonts || '',
        tone: result.tone || '',
        style_notes: result.style_notes || '',
      },
      production: {
        title: result.title || '',
        platform_target: result.platform_target || '',
        format: result.format === 'image' ? 'image' : 'video',
        brief: result.brief || '',
      },
    });
  } catch (error) {
    console.error('commercialStudioIntake error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});