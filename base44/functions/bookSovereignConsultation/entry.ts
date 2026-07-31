import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Books a Sovereign consultation request — creates the intake record in
// "pending_payment" status. The calendar event is NOT created here; it is
// created by the shared finalizeConsultation() module only after payment is
// confirmed (via createConsultationCheckout for $0 promo, or via the Stripe
// webhook for paid sessions).
export default async function(req) {
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

    const { topic, start, end, company_name, full_name, role_title, entity_type, tax_id, doc_url } = await req.json();
    if (!topic || !start) return Response.json({ error: "topic and start are required" }, { status: 400 });

    const startIso = new Date(start).toISOString();
    const endIso = new Date(end || new Date(new Date(start).getTime() + 45 * 60000)).toISOString();

    // Create the consultation record — pending payment, no calendar event yet.
    const record = await base44.asServiceRole.entities.SovereignConsultation.create({
      requester_id: user.id,
      requester_name: full_name || user.full_name || user.email,
      company_name: company_name || "",
      email: user.email,
      topic,
      start: startIso,
      end: endIso,
      status: "requested",
      payment_status: "pending_payment",
      tax_id: tax_id || "",
      entity_type: entity_type || "",
      role_title: role_title || "",
      doc_url: doc_url || "",
    });

    return Response.json({
      consultation: {
        id: record.id,
        start: startIso,
        end: endIso,
        topic,
        status: "requested",
        payment_status: "pending_payment",
      },
    });
  } catch (error) {
    console.error("bookSovereignConsultation error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}