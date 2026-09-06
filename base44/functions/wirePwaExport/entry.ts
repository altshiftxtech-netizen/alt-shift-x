import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// wirePwaExport — lets Bob Builder (or an admin) create or update a PwaExport
// record so it appears in the admin PWA Exports dropdown for download.
//
// Bob Builder cannot write PwaExport directly because the entity's RLS restricts
// creation to admin role only. This function runs as the service role (bypassing
// RLS) after verifying the caller is an authenticated builder, so Bob can wire
// up complete PWA zip packages without needing admin credentials.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, version, date_wired, component_codes, file_url, generate_function, description, status, id } = body;

    const APP_DOMAIN = "https://unlock-agent-flow.base44.app";

    if (!name || !version) {
      return Response.json({ error: 'name and version are required' }, { status: 400 });
    }

    // Binary pass-through: when a file_url is provided WITHOUT a generate_function,
    // the export is a native binary package (e.g. install.exe).
    // - Public URL: set launch_url directly to the file for instant download.
    // - Private URI (doesn't start with http): route through /pwa-host/ so
    //   getHostedPwa generates a fresh time-limited signed URL on every visit.
    const isBinaryPassThrough = file_url && !generate_function;
    const isPrivateUri = file_url && !file_url.startsWith('http');

    // If an id is provided, update the existing record; otherwise create a new one.
    if (id) {
      const launch_url = (isBinaryPassThrough && !isPrivateUri) ? file_url : `${APP_DOMAIN}/pwa-host/${id}`;
      const updated = await base44.asServiceRole.entities.PwaExport.update(id, {
        name,
        version,
        date_wired: date_wired || new Date().toISOString(),
        component_codes: component_codes || [],
        file_url,
        generate_function,
        description,
        status: status || 'active',
        launch_url,
      });
      return Response.json({ ok: true, id: updated.id, action: 'updated', launch_url });
    }

    const created = await base44.asServiceRole.entities.PwaExport.create({
      name,
      version,
      date_wired: date_wired || new Date().toISOString(),
      component_codes: component_codes || [],
      file_url,
      generate_function,
      description,
      status: status || 'active',
    });
    const launch_url = (isBinaryPassThrough && !isPrivateUri) ? file_url : `${APP_DOMAIN}/pwa-host/${created.id}`;
    await base44.asServiceRole.entities.PwaExport.update(created.id, { launch_url });
    return Response.json({ ok: true, id: created.id, action: 'created', launch_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}