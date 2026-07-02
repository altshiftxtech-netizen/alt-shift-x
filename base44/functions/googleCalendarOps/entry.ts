import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * googleCalendarOps — create / list / update / delete calendar events for
 * operational milestones: DMCA expirations, campaigns, sales start/end, tests.
 * Acts as the connected workspace account (altshiftx.tech@gmail.com).
 *
 * Payload: { action, ...args }
 *   action="list"   -> { timeMin?, timeMax?, query? }
 *   action="create" -> { summary, description?, start, end?, allDay?, colorId? }
 *                       start/end ISO strings. allDay:true uses date-only.
 *   action="update" -> { eventId, summary?, description?, start?, end?, allDay? }
 *   action="delete" -> { eventId, confirm:true }   (requires confirm)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { action, eventId, summary, description, start, end, allDay, colorId, timeMin, timeMax, query, confirm, attendees } = await req.json();
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const auth = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    const cal = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    // Create a calendar event WITH a Google Meet video link attached.
    if (action === 'create_meet') {
      if (!summary || !start) return Response.json({ error: 'summary and start required' }, { status: 400 });
      const startIso = new Date(start).toISOString();
      const endIso = new Date(end || new Date(new Date(start).getTime() + 30 * 60000)).toISOString();
      const body = {
        summary,
        description: description || '',
        start: { dateTime: startIso },
        end: { dateTime: endIso },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };
      if (Array.isArray(attendees) && attendees.length) {
        body.attendees = attendees.filter(Boolean).map((e) => ({ email: e }));
      }
      const res = await fetch(`${cal}?conferenceDataVersion=1&sendUpdates=all`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { console.error('Calendar create_meet error', data); return Response.json({ error: data }, { status: res.status }); }
      const meetLink = data.hangoutLink || (data.conferenceData?.entryPoints || []).find((p) => p.entryPointType === 'video')?.uri || '';
      return Response.json({ event: { id: data.id, htmlLink: data.htmlLink, summary: data.summary, meetLink } });
    }

    const buildTime = (val, isAllDay) => isAllDay ? { date: String(val).slice(0, 10) } : { dateTime: new Date(val).toISOString() };

    if (action === 'list') {
      const params = new URLSearchParams({ singleEvents: 'true', orderBy: 'startTime', maxResults: '100' });
      params.set('timeMin', timeMin ? new Date(timeMin).toISOString() : new Date().toISOString());
      if (timeMax) params.set('timeMax', new Date(timeMax).toISOString());
      if (query) params.set('q', query);
      const res = await fetch(`${cal}?${params.toString()}`, { headers: auth });
      const data = await res.json();
      if (!res.ok) { console.error('Calendar list error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ events: data.items || [] });
    }

    if (action === 'create') {
      if (!summary || !start) return Response.json({ error: 'summary and start required' }, { status: 400 });
      const body = {
        summary,
        description: description || '',
        start: buildTime(start, allDay),
        end: buildTime(end || start, allDay),
      };
      if (colorId) body.colorId = String(colorId);
      const res = await fetch(cal, { method: 'POST', headers: auth, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { console.error('Calendar create error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ event: { id: data.id, htmlLink: data.htmlLink, summary: data.summary } });
    }

    if (action === 'update') {
      if (!eventId) return Response.json({ error: 'eventId required' }, { status: 400 });
      const body = {};
      if (summary !== undefined) body.summary = summary;
      if (description !== undefined) body.description = description;
      if (start !== undefined) body.start = buildTime(start, allDay);
      if (end !== undefined) body.end = buildTime(end, allDay);
      const res = await fetch(`${cal}/${eventId}`, { method: 'PATCH', headers: auth, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { console.error('Calendar update error', data); return Response.json({ error: data }, { status: res.status }); }
      return Response.json({ event: { id: data.id, summary: data.summary } });
    }

    if (action === 'delete') {
      if (!eventId) return Response.json({ error: 'eventId required' }, { status: 400 });
      if (confirm !== true) return Response.json({ error: 'Delete requires confirm:true' }, { status: 400 });
      const res = await fetch(`${cal}/${eventId}`, { method: 'DELETE', headers: auth });
      if (!res.ok && res.status !== 204) { const e = await res.text(); console.error('Calendar delete error', e); return Response.json({ error: e }, { status: res.status }); }
      return Response.json({ deleted: true, eventId });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('googleCalendarOps error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});