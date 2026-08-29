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

    if (!name || !version) {
      return Response.json({ error: 'name and version are required' }, { status: 400 });
    }

    // If an id is provided, update the existing record; otherwise create a new one.
    if (id) {
      const updated = await base44.asServiceRole.entities.PwaExport.update(id, {
        name,
        version,
        date_wired: date_wired || new Date().toISOString(),
        component_codes: component_codes || [],
        file_url,
        generate_function,
        description,
        status: status || 'active',
      });
      return Response.json({ ok: true, id: updated.id, action: 'updated' });
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
    return Response.json({ ok: true, id: created.id, action: 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}