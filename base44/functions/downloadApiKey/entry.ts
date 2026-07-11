import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key_id, format = 'json' } = await req.json();

    if (!key_id) {
      return Response.json({ error: 'Missing key_id' }, { status: 400 });
    }

    // Fetch the key
    const keys = await base44.entities.ApiKey.filter({ id: key_id, created_by_id: user.id });
    if (!keys || keys.length === 0) {
      return Response.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    const apiKey = keys[0];

    // SECURITY: The plaintext key is shown ONLY once at generation time.
    // Only key_hash is persisted — the plaintext cannot be re-downloaded.
    if (!apiKey.key_hash) {
      return Response.json({ error: 'Key hash not found on this record.' }, { status: 409 });
    }

    // Mark as active (last-key-active logic)
    await base44.entities.ApiKey.update(key_id, { 
      is_active: true,
      last_used: new Date().toISOString()
    });

    // Deactivate other keys for same component bundle
    const otherKeys = await base44.entities.ApiKey.filter({ 
      created_by_id: user.id,
      status: 'active'
    });

    for (const key of otherKeys) {
      if (key.id !== key_id) {
        await base44.entities.ApiKey.update(key.id, { is_active: false });
      }
    }

    // The plaintext key is not stored — only key_hash exists for verification.
    // Return metadata only; the key itself was shown once at creation and cannot be retrieved.
    const safeRecord = {
      name: apiKey.name,
      description: apiKey.description,
      agent_name: apiKey.agent_name,
      created_date: apiKey.created_date,
      last_used: apiKey.last_used,
      is_active: true,
      key_hash_prefix: (apiKey.key_hash || '').slice(0, 8) + '…',
      note: 'The plaintext API key was shown only once at generation time and cannot be re-downloaded. Only the hash is stored.',
    };

    let content = '';
    let filename = '';
    let contentType = 'application/json';

    if (format === 'env') {
      content = `# The plaintext API key is not stored and cannot be re-downloaded.\nAPI_KEY_NAME=${apiKey.name}\nCREATED_DATE=${apiKey.created_date}\nKEY_HASH_PREFIX=${safeRecord.key_hash_prefix}`;
      filename = `${apiKey.name}.env`;
      contentType = 'text/plain';
    } else if (format === 'csv') {
      content = `Name,Description,Agent,CreatedDate,LastUsed,KeyHashPrefix\n"${apiKey.name}","${apiKey.description || ''}","${apiKey.agent_name || ''}","${apiKey.created_date}","${apiKey.last_used || 'Never'}","${safeRecord.key_hash_prefix}"`;
      filename = `api-keys.csv`;
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(safeRecord, null, 2);
      filename = `${apiKey.name}-key.json`;
    }

    // Log audit trail
    await base44.asServiceRole.entities.AuditTrail.create({
      action: 'download',
      entity_type: 'api_key',
      entity_id: key_id,
      performed_by: user.id,
      user_email: user.email,
      user_role: user.role,
      change_summary: `API key downloaded in ${format} format`,
      timestamp: new Date().toISOString(),
    });

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download API key error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});