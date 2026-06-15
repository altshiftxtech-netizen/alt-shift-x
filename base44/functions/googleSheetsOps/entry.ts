import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OPS_FOLDER_ID = "1tg_v9IgkR3tClZbR7uwBCo8mRz_qULo6";

/**
 * googleSheetsOps — create and write Google Sheets with live formulas, in the
 * Alt+Shift+X operations folder. Acts as the connected workspace account.
 *
 * Payload: { action, ...args }
 *   action="create"   -> { title, sheets?:[{title}] }   creates spreadsheet, moves into ops folder
 *   action="read"     -> { spreadsheetId, range }       reads a range
 *   action="write"    -> { spreadsheetId, range, values:[[...]] }   writes values/formulas (USER_ENTERED)
 *   action="addSheet" -> { spreadsheetId, title }       adds a tab
 *   action="format"   -> { spreadsheetId, requests:[...] }   raw batchUpdate requests (bold headers, etc.)
 *
 * Values written with USER_ENTERED so strings beginning with "=" become real formulas.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { action, spreadsheetId, range, values, title, sheets, requests } = await req.json();

    const sheetsConn = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const sheetsAuth = { Authorization: `Bearer ${sheetsConn.accessToken}`, 'Content-Type': 'application/json' };

    if (action === 'create') {
      if (!title) return Response.json({ error: 'title required' }, { status: 400 });
      const sheetTabs = (sheets && sheets.length ? sheets : [{ title: 'Sheet1' }]).map((s) => ({ properties: { title: s.title } }));
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST', headers: sheetsAuth,
        body: JSON.stringify({ properties: { title }, sheets: sheetTabs }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Sheets create error', data); return Response.json({ error: data }, { status: res.status }); }

      // Move the new spreadsheet into the ops folder via the Drive API
      try {
        const driveConn = await base44.asServiceRole.connectors.getConnection('googledrive');
        const driveAuth = { Authorization: `Bearer ${driveConn.accessToken}` };
        await fetch(`https://www.googleapis.com/drive/v3/files/${data.spreadsheetId}?addParents=${OPS_FOLDER_ID}&removeParents=root&fields=id,parents`, {
          method: 'PATCH', headers: driveAuth,
        });
      } catch (e) { console.error('Move to folder failed (non-fatal)', e); }

      return Response.json({ spreadsheetId: data.spreadsheetId, url: data.spreadsheetUrl, sheets: data.sheets });
    }

    if (action === 'read') {
      if (!spreadsheetId || !range) return Response.json({ error: 'spreadsheetId and range required' }, { status: 400 });
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, { headers: sheetsAuth });
      const data = await res.json();
      if (!res.ok) { console.error('Sheets read error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ values: data.values || [] });
    }

    if (action === 'write') {
      if (!spreadsheetId || !range || !values) return Response.json({ error: 'spreadsheetId, range, values required' }, { status: 400 });
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
        method: 'PUT', headers: sheetsAuth, body: JSON.stringify({ values }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Sheets write error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ updated: data.updatedCells || 0 });
    }

    if (action === 'addSheet') {
      if (!spreadsheetId || !title) return Response.json({ error: 'spreadsheetId and title required' }, { status: 400 });
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST', headers: sheetsAuth,
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Sheets addSheet error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ added: title });
    }

    if (action === 'format') {
      if (!spreadsheetId || !requests) return Response.json({ error: 'spreadsheetId and requests required' }, { status: 400 });
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST', headers: sheetsAuth, body: JSON.stringify({ requests }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Sheets format error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('googleSheetsOps error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});