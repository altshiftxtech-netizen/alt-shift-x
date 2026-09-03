import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const exportId = body.export_id;
    if (!exportId) return Response.json({ error: 'export_id is required' }, { status: 400 });

    // Use service role to bypass RLS — hosted PWA pages are public
    const pwa = await base44.asServiceRole.entities.PwaExport.get(exportId);
    if (!pwa) return Response.json({ error: 'PWA export not found' }, { status: 404 });

    return Response.json({
      ok: true,
      id: pwa.id,
      name: pwa.name,
      version: pwa.version,
      description: pwa.description,
      component_codes: pwa.component_codes || [],
      status: pwa.status,
      date_wired: pwa.date_wired,
      launch_url: pwa.launch_url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}