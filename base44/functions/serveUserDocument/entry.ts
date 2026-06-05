import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * serveUserDocument — admin/staff tool to deliver a document/policy to a user.
 *  - channel "email": sends immediately via the platform email integration.
 *  - channel "mail" / "fax": queues a UserServiceRecord for admin fulfillment.
 * Logs a UserServiceRecord either way for the audit trail.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const actor = await base44.auth.me();

    if (!actor || !["admin", "staff"].includes(actor.role)) {
      return Response.json({ error: "Forbidden: admin or staff only" }, { status: 403 });
    }

    const {
      user_id,
      user_email,
      user_name,
      document_title,
      document_body,
      channel,       // "email" | "mail" | "fax"
      target,        // email address / mailing address / fax number
    } = await req.json();

    if (!user_id || !document_title || !channel) {
      return Response.json({ error: "Missing user_id, document_title or channel" }, { status: 400 });
    }

    let delivered = false;
    let status = "open";

    if (channel === "email") {
      const to = target || user_email;
      if (!to) {
        return Response.json({ error: "No email target provided" }, { status: 400 });
      }
      await base44.integrations.Core.SendEmail({
        to,
        subject: document_title,
        body: document_body || `Please find your requested document: ${document_title}.`,
      });
      delivered = true;
      status = "resolved";
    } else {
      // mail / fax — queue for admin fulfillment
      status = "in_progress";
    }

    const record = await base44.asServiceRole.entities.UserServiceRecord.create({
      user_id,
      user_email: user_email || "",
      user_name: user_name || "",
      record_type: "document_request",
      title: document_title,
      detail: document_body ? document_body.slice(0, 2000) : "",
      status,
      delivery_channel: channel,
      delivery_target: target || user_email || "",
      delivered,
      handled_by: actor.full_name || actor.email,
      handled_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, delivered, channel, record_id: record.id });
  } catch (error) {
    console.error("serveUserDocument error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});