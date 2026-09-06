import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// securePwaExportUrl — downloads the public file_url, re-uploads to private
// storage, and updates the PwaExport record so downloads require a signed URL.
// Bob can call this with export_id (single) or export_ids (bulk) to secure
// existing binary pass-through exports.
//
// After securing, launch_url is set back to /pwa-host/:id so getHostedPwa
// generates a fresh time-limited signed URL on every visit.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { export_id, export_ids, secure_all_binary } = body;

    let ids: string[] = [];
    if (secure_all_binary) {
      // Fetch all binary pass-through exports with public URLs
      const all = await base44.asServiceRole.entities.PwaExport.filter({
        status: 'active',
      }, '-created_date', 500);
      ids = all
        .filter((e: any) => e.file_url && !e.generate_function && e.file_url.startsWith('http'))
        .map((e: any) => e.id);
    } else {
      ids = export_ids || (export_id ? [export_id] : []);
    }

    if (ids.length === 0) {
      return Response.json({ error: 'No exports to secure. Provide export_id, export_ids, or secure_all_binary: true.' }, { status: 400 });
    }

    const results = [];

    for (const id of ids) {
      const pwa = await base44.asServiceRole.entities.PwaExport.get(id);
      if (!pwa) {
        results.push({ id, status: 'error', error: 'Not found' });
        continue;
      }

      if (!pwa.file_url) {
        results.push({ id, status: 'error', error: 'No file_url to secure' });
        continue;
      }

      // Skip if already private (private URIs don't start with http)
      if (!pwa.file_url.startsWith('http')) {
        results.push({ id, status: 'skipped', reason: 'Already private' });
        continue;
      }

      try {
        let privateUri: string | null = null;

        // Platform-hosted files (base44.app/api/.../files/...): extract the
        // file path from the URL and use it directly as a private file_uri
        // with CreateFileSignedUrl — no re-download needed.
        const platformMatch = pwa.file_url.match(/\/api\/apps\/[^/]+\/files\/(.+)$/);
        if (platformMatch) {
          privateUri = platformMatch[1]; // e.g. mp/public/{APP_ID}/{FILENAME}
        } else {
          // External URL: download and re-upload to private storage
          const fetchRes = await fetch(pwa.file_url);
          if (!fetchRes.ok) {
            results.push({ id, status: 'error', error: `Download failed: ${fetchRes.status}` });
            continue;
          }

          const fileBlob = await fetchRes.blob();
          const uploadRes = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
            file: fileBlob,
          });
          privateUri = uploadRes.file_uri;
        }

        if (!privateUri) {
          results.push({ id, status: 'error', error: 'Private upload failed' });
          continue;
        }

        // Update the record — launch_url routes through /pwa-host/ so signed
        // URLs are generated on-demand by getHostedPwa
        const APP_DOMAIN = 'https://unlock-agent-flow.base44.app';
        const launch_url = `${APP_DOMAIN}/pwa-host/${id}`;

        await base44.asServiceRole.entities.PwaExport.update(id, {
          file_url: privateUri,
          launch_url,
        });

        results.push({
          id,
          status: 'secured',
          name: pwa.name,
          old_url: pwa.file_url,
          private_uri: privateUri,
        });
      } catch (e) {
        results.push({ id, status: 'error', error: e.message });
      }
    }

    const securedCount = results.filter(r => r.status === 'secured').length;
    return Response.json({
      ok: true,
      total: ids.length,
      secured: securedCount,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'error').length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}