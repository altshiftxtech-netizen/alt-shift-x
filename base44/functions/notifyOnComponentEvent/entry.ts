import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (!data?.builder_id) return Response.json({ skipped: true });

    const statusChanged = old_data?.status !== data.status;
    if (!statusChanged && event?.type !== "create") return Response.json({ skipped: "no status change" });

    let type, severity, title, message, action_url, action_label;

    if (data.status === "published") {
      type = "component_published";
      severity = "info";
      title = `Component Live: ${data.name}`;
      message = `Congratulations! Your component "${data.name}" (${data.code}) has been approved and is now live in the marketplace.`;
      action_url = `/marketplace/${data.id}`;
      action_label = "View in Marketplace";
    } else if (data.status === "rejected") {
      type = "component_rejected";
      severity = "warning";
      title = `Component Rejected: ${data.name}`;
      message = `Your component "${data.name}" (${data.code}) was not approved. Please review the feedback and resubmit after making the required changes.`;
      action_url = "/builder/components";
      action_label = "View Components";
    } else if (data.status === "pending_review" && event?.type === "create") {
      type = "component_published";
      severity = "info";
      title = `Submission Received: ${data.name}`;
      message = `Your component "${data.name}" has been submitted for review. You'll be notified once the review is complete (typically 1–3 business days).`;
      action_url = "/builder/components";
      action_label = "View Status";
    } else {
      return Response.json({ skipped: "unhandled status" });
    }

    await base44.asServiceRole.functions.invoke("sendNotification", {
      user_id: data.builder_id,
      type,
      severity,
      title,
      message,
      action_url,
      action_label,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("notifyOnComponentEvent error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});