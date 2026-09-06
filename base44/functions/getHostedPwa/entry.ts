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

    // Fallback: binary pass-through (file_url without generate_function)
    if (pwa.file_url) {
      // If the file_url is a private URI (doesn't start with http), generate
      // a time-limited signed URL so the download is secure and not shareable.
      let downloadUrl = pwa.file_url;
      if (!pwa.file_url.startsWith('http')) {
        try {
          const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
            file_uri: pwa.file_url,
            expires_in: 300, // 5 minutes
          });
          if (signed?.signed_url) {
            downloadUrl = signed.signed_url;
          }
        } catch {
          // Fall back to the raw URI if signing fails
        }
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
        launch_url: downloadUrl,
        file_url: downloadUrl,
        generate_function: pwa.generate_function,
        binary: true,
        signed: !pwa.file_url.startsWith('http'),
      });
    }

    return Response.json({ error: 'This PWA has no file_url or generate_function' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}