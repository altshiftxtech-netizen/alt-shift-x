import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * Admin approves or rejects a component that is pending review.
 * On approval the component goes live (status=published) and the builder is
 * notified. On rejection the component is marked rejected and the builder is told.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { component_id, action, reason } = await req.json();
    if (!component_id || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "component_id and a valid action (approve|reject) are required" }, { status: 400 });
    }

    const component = await base44.asServiceRole.entities.Component.get(component_id);
    if (!component) {
      return Response.json({ error: "Component not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "published" : "rejected";
    await base44.asServiceRole.entities.Component.update(component_id, { status: newStatus });

    // Notify the builder of the decision (in-app + email).
    if (component.builder_id) {
      const title = action === "approve" ? "Your component was approved" : "Your component needs changes";
      const message = action === "approve"
        ? `"${component.name}" passed review and is now live on the marketplace.`
        : `"${component.name}" was not approved.${reason ? ` Reason: ${reason}` : ""} You can revise and resubmit it.`;
      await base44.functions.invoke("sendNotification", {
        user_id: component.builder_id,
        type: "component_published",
        severity: action === "approve" ? "info" : "warning",
        title,
        message,
        action_url: "/builder/components",
        action_label: "View Components",
        force_email: true,
        metadata: { component_id, action },
      }).catch((e) => console.error("approveComponent notify failed:", e.message));
    }

    console.log(`[INFO] Component ${action}d: id=${component_id}, builder=${component.builder_id}`);
    return Response.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("approveComponent error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});