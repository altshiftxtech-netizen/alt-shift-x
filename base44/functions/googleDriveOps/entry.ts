import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Operations folder for Alt+Shift+X on Google Drive (altshiftx.tech@gmail.com)
const OPS_FOLDER_ID = "1tg_v9IgkR3tClZbR7uwBCo8mRz_qULo6";

/**
 * googleDriveOps — list / read / create / update / delete files in the
 * Alt+Shift+X operations Drive folder. Acts as the connected workspace account.
 *
 * Payload: { action, ...args }
 *   action="list"     -> { folderId? }                       lists files in the folder
 *   action="read"     -> { fileId }                          returns file text content
 *   action="create"   -> { name, mimeType?, content?, folderId? }
 *   action="update"   -> { fileId, name?, content? }
 *   action="delete"   -> { fileId, confirm:true }            permanent delete (requires confirm)
 *   action="trash"    -> { fileId }                          move to trash (recoverable)
 *
 * Deletes require confirm:true — the "with permission" guardrail.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { action, folderId, fileId, name, mimeType, content, confirm } = await req.json();
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const auth = { Authorization: `Bearer ${accessToken}` };
    const targetFolder = folderId || OPS_FOLDER_ID;

    if (action === 'list') {
      const q = encodeURIComponent(`'${targetFolder}' in parents and trashed=false`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&pageSize=200`;
      const res = await fetch(url, { headers: auth });
      const data = await res.json();
      if (!res.ok) { console.error('Drive list error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ files: data.files || [] });
    }

    if (action === 'read') {
      if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });
      // Get metadata to decide export vs download
      const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`, { headers: auth });
      const meta = await metaRes.json();
      if (!metaRes.ok) { console.error('Drive meta error', meta); return Response.json({ error: meta }, { status: metaRes.status }); }
      let text;
      if ((meta.mimeType || '').startsWith('application/vnd.google-apps')) {
        const exp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, { headers: auth });
        text = await exp.text();
      } else {
        const dl = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: auth });
        text = await dl.text();
      }
      return Response.json({ file: meta, content: text });
    }

    if (action === 'create') {
      if (!name) return Response.json({ error: 'name required' }, { status: 400 });
      const metadata = { name, parents: [targetFolder] };
      if (mimeType) metadata.mimeType = mimeType;
      const boundary = 'asx_boundary_' + Date.now();
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType || 'text/plain'}\r\n\r\n${content || ''}\r\n` +
        `--${boundary}--`;
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) { console.error('Drive create error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ file: data });
    }

    if (action === 'update') {
      if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });
      if (name) {
        const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
          method: 'PATCH', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
        });
        if (!r.ok) { const e = await r.json(); console.error('Drive rename error', e); return Response.json({ error: e }, { status: r.status }); }
      }
      if (content !== undefined) {
        const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH', headers: { ...auth, 'Content-Type': 'text/plain' }, body: content,
        });
        if (!r.ok) { const e = await r.json(); console.error('Drive content update error', e); return Response.json({ error: e }, { status: r.status }); }
      }
      return Response.json({ updated: true, fileId });
    }

    if (action === 'trash') {
      if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'PATCH', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ trashed: true }),
      });
      if (!res.ok) { const e = await res.json(); console.error('Drive trash error', e); return Response.json({ error: e }, { status: res.status }); }
      return Response.json({ trashed: true, fileId });
    }

    if (action === 'delete') {
      if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });
      if (confirm !== true) return Response.json({ error: 'Delete requires confirm:true' }, { status: 400 });
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'DELETE', headers: auth });
      if (!res.ok && res.status !== 204) { const e = await res.text(); console.error('Drive delete error', e); return Response.json({ error: e }, { status: res.status }); }
      return Response.json({ deleted: true, fileId });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('googleDriveOps error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});