import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Books a priority Sovereign consultation: saves an in-app SovereignConsultation
// record AND pushes a Google Calendar event (with a Meet link) on the connected
// workspace calendar. Gated to Sovereign subscribers / admins.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Gate: Sovereign (enterprise) subscriber or admin
    if (user.role !== "admin") {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
      const sub = subs[0];
      const sovereign = sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status);
      if (!sovereign) return Response.json({ error: "Sovereign tier required" }, { status: 403 });
    }

    const { topic, start, end, company_name } = await req.json();
    if (!topic || !start) return Response.json({ error: "topic and start are required" }, { status: 400 });

    const startIso = new Date(start).toISOString();
    const endIso = new Date(end || new Date(new Date(start).getTime() + 45 * 60000)).toISOString();

    // 1) Save the in-app request record
    const record = await base44.asServiceRole.entities.SovereignConsultation.create({
      requester_id: user.id,
      requester_name: user.full_name || user.email,
      company_name: company_name || "",
      email: user.email,
      topic,
      start: startIso,
      end: endIso,
      status: "scheduled",
    });

    // 2) Push a Google Calendar event with a Meet link
    let calendarEventId = "";
    let meetLink = "";
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
      const auth = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const cal = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
      const evBody = {
        summary: `Sovereign Consultation — ${company_name || user.full_name || user.email}`,
        description: `Priority Sovereign consultation.\nTopic: ${topic}\nClient: ${user.full_name || ""} <${user.email}>`,
        start: { dateTime: startIso },
        end: { dateTime: endIso },
        attendees: [{ email: user.email }],
        conferenceData: { createRequest: { requestId: `sov-${record.id}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      };
      const res = await fetch(`${cal}?conferenceDataVersion=1&sendUpdates=all`, { method: "POST", headers: auth, body: JSON.stringify(evBody) });
      const data = await res.json();
      if (res.ok) {
        calendarEventId = data.id;
        meetLink = data.hangoutLink || (data.conferenceData?.entryPoints || []).find((p: any) => p.entryPointType === "video")?.uri || "";
        await base44.asServiceRole.entities.SovereignConsultation.update(record.id, { calendar_event_id: calendarEventId, meet_link: meetLink });
      } else {
        console.error("Calendar booking failed", data);
      }
    } catch (calErr) {
      console.error("Calendar connector error", calErr.message);
    }

    return Response.json({
      consultation: { id: record.id, start: startIso, end: endIso, topic, meet_link: meetLink, calendar_event_id: calendarEventId, status: "scheduled" },
    });
  } catch (error) {
    console.error("bookSovereignConsultation error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});