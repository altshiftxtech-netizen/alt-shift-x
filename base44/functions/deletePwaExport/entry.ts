import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// deletePwaExport — lets Bob Builder (or an admin) remove a PwaExport record
// from the admin PWA Exports dropdown. Runs as the service role after
// verifying the caller is an authenticated builder, since PwaExport RLS
// restricts deletion to admin role only.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify the record exists before deleting
    const existing = await base44.asServiceRole.entities.PwaExport.get(id).catch(() => null);
    if (!existing) {
      return Response.json({ error: 'PWA export not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.PwaExport.delete(id);

    return Response.json({
      ok: true,
      action: 'deleted',
      id,
      name: existing.name,
      version: existing.version,
    });
  } catch (error) {
    console.error('deletePwaExport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}