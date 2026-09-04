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

    // Always generate the ZIP server-side when generate_function is available.
    // This ensures the ZIP data is returned directly (base64) so viewers don't
    // depend on potentially dead external file_url hosts.
    if (pwa.generate_function) {
      try {
        const genRes = await base44.asServiceRole.functions.invoke(pwa.generate_function, {
          export_id: pwa.id,
        });
        const genData = genRes.data ?? genRes;
        const zipB64 = genData?.zip;
        if (zipB64) {
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
            zip: zipB64,
          });
        }
      } catch (genError) {
        // Fall through to file_url fallback if generation fails
      }
    }

    // Fallback: return file_url for direct download
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

    return Response.json({ error: 'This PWA has no file_url or generate_function' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}