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

    const isBinaryPassthrough = !pwa.generate_function && pwa.file_url;

    // For binary pass-through exports (file_url without generate_function),
    // always try the original file first — the user expects the actual binary,
    // not a generated PWA package.
    if (isBinaryPassthrough) {
      let downloadUrl = pwa.file_url;
      let signed = false;

      if (pwa.file_url.startsWith('http')) {
        // Already a full URL — use as-is
        downloadUrl = pwa.file_url;
      } else if (pwa.file_url.startsWith('mp/public/') || pwa.file_url.startsWith('mp/public\\')) {
        // Public storage path — reconstruct the full URL
        const APP_ID = '6a19363c90f06323c4cfff73';
        downloadUrl = `https://base44.app/api/apps/${APP_ID}/files/${pwa.file_url}`;
      } else {
        // Private storage file — generate a time-limited signed URL
        try {
          const signedRes = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
            file_uri: pwa.file_url,
            expires_in: 300,
          });
          if (signedRes?.signed_url) {
            downloadUrl = signedRes.signed_url;
            signed = true;
          }
        } catch {
          // Fall through to generation below
        }
      }

      // Check if the file is actually accessible
      if (downloadUrl) {
        try {
          const checkRes = await fetch(downloadUrl, { method: 'HEAD' });
          if (checkRes.ok && checkRes.status !== 404) {
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
              signed,
            });
          }
        } catch {
          // File not accessible — fall through to generation
        }
      }

      // Original binary file is gone — try generatePm1aPayload as a fallback
      // so the user at least gets a valid package, but mark it clearly.
      if (pwa.component_codes?.length > 0) {
        try {
          const genRes = await base44.asServiceRole.functions.invoke('generatePm1aPayload', {
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
              generate_function: 'generatePm1aPayload',
              zip: zipB64,
              binary: true,
              fallback: true,
            });
          }
        } catch {
          // Generation also failed
        }
      }

      return Response.json({
        error: 'The original binary file is no longer available and could not be regenerated.',
      }, { status: 404 });
    }

    // For non-binary exports with a generate_function, generate the ZIP
    const genFn = pwa.generate_function || (pwa.component_codes?.length > 0 ? 'generatePm1aPayload' : null);
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
          });
        }
      } catch {
        // Fall through to file_url fallback
      }
    }

    // Fallback: try file_url directly
    if (pwa.file_url) {
      let downloadUrl = pwa.file_url;
      if (!pwa.file_url.startsWith('http')) {
        const APP_ID = '6a19363c90f06323c4cfff73';
        downloadUrl = `https://base44.app/api/apps/${APP_ID}/files/${pwa.file_url}`;
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
      });
    }

    return Response.json({ error: 'This PWA has no file_url or generate_function' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}