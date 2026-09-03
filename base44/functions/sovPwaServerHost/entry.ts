import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const APP_DOMAIN = "https://unlock-agent-flow.base44.app";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'staff') {
      return Response.json({ error: 'Admin or staff access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const exportId = body.export_id;
    if (!exportId) return Response.json({ error: 'export_id is required' }, { status: 400 });

    const pwaExport = await base44.entities.PwaExport.get(exportId);
    if (!pwaExport) return Response.json({ error: 'PWA export not found' }, { status: 404 });

    // Generate the hosted launch URL — points to the in-app PWA host route
    const launchUrl = `${APP_DOMAIN}/pwa-host/${exportId}`;

    // Persist the URL into the launch_url field so the Launch button opens it
    await base44.entities.PwaExport.update(exportId, { launch_url: launchUrl });

    return Response.json({
      ok: true,
      launch_url: launchUrl,
      export_id: exportId,
      name: pwaExport.name,
      version: pwaExport.version,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}