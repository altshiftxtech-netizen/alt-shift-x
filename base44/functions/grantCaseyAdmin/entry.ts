import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time: grants casey.brown.cc@gmail.com the admin role so they retain full
// control (incl. The UpKeeper) until they hand things over to staff.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const targetEmail = 'casey.brown.cc@gmail.com';
    const users = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const target = users[0];
    await base44.asServiceRole.entities.User.update(target.id, { role: 'admin' });

    return Response.json({ success: true, email: targetEmail, role: 'admin' });
  } catch (error) {
    console.error('grantCaseyAdmin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});