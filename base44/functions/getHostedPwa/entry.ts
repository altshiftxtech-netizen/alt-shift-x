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

    // Always try to generate the ZIP server-side first — either via the
    // configured generate_function, or by defaulting to generatePm1aPayload
    // when the export has component_codes. This ensures a valid ZIP is
    // returned even when the file_url is broken or points to dead storage.
    const genFn = pwa.generate_function || (pwa.component_codes?.length > 0 ? 'generatePm1aPayload' : null);
    const wasBinaryPassthrough = !pwa.generate_function && pwa.file_url;
    if (genFn) {
      try {
        const genRes = await base44.asServiceRole.functions.invoke(genFn, {
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
            generate_function: genFn,
            zip: zipB64,
            binary: wasBinaryPassthrough,
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
      let signError = null;
      if (!pwa.file_url.startsWith('http')) {
        // Private storage file — generate a time-limited signed URL
        if (pwa.file_url.startsWith('mp/private/') || !pwa.file_url.startsWith('mp/')) {
          try {
            const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
              file_uri: pwa.file_url,
              expires_in: 300, // 5 minutes
            });
            if (signed?.signed_url) {
              downloadUrl = signed.signed_url;
            } else {
              signError = 'No signed_url returned';
            }
          } catch (signErr) {
            signError = signErr.message;
          }
        } else {
          // Public storage path (mp/public/...) — reconstruct the full URL
          // on-demand so the raw URL isn't stored in the entity
          const APP_ID = '6a19363c90f06323c4cfff73';
          downloadUrl = `https://base44.app/api/apps/${APP_ID}/files/${pwa.file_url}`;
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