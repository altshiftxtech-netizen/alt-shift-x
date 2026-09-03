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

    // If there's a file_url, return it — the client can download directly
    if (pwa.file_url) {
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
        file_url: pwa.file_url,
        generate_function: pwa.generate_function,
      });
    }

    // If there's a generate_function but no file_url, generate the ZIP
    // server-side using service role so public visitors don't need admin auth
    if (pwa.generate_function) {
      try {
        const genRes = await base44.asServiceRole.functions.invoke(pwa.generate_function, {
          export_id: pwa.id,
        });
        const genData = genRes.data ?? genRes;
        const zipB64 = genData?.zip;
        if (!zipB64) {
          return Response.json({ error: 'Generator returned no zip payload' }, { status: 500 });
        }
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
          generate_function: pwa.generate_function,
          zip: zipB64,
        });
      } catch (genError) {
        return Response.json({ error: 'Failed to generate PWA: ' + (genError.message || 'unknown') }, { status: 500 });
      }
    }

    return Response.json({ error: 'This PWA has no file_url or generate_function' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}