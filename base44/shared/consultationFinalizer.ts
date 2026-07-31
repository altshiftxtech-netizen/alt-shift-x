// base44/shared/consultationFinalizer.ts
//
// Sovereign Consultation finalization logic — shared by:
//   1. createConsultationCheckout  (for $0 Non-Profit promo path)
//   2. stripeWebhook               (for paid checkout.session.completed)
//
// Called only AFTER payment is confirmed (Stripe session.id or promo ID).
// Performs: record update → Google Calendar event → Email A (appointment) → Email B (invoice).

export async function finalizeConsultation(base44, consultationId, paymentConfirmationId, promoCode, finalPrice) {
  // Fetch the consultation record
  const consultations = await base44.asServiceRole.entities.SovereignConsultation.filter({ id: consultationId });
  const consultation = consultations[0];
  if (!consultation) throw new Error("Consultation not found: " + consultationId);

  const paymentStatus = finalPrice === 0 ? "promo_applied" : "paid";

  // 1. Update the consultation record with payment confirmation
  await base44.asServiceRole.entities.SovereignConsultation.update(consultationId, {
    payment_confirmation_id: paymentConfirmationId,
    promo_code: promoCode || "",
    final_price: finalPrice,
    payment_status: paymentStatus,
    status: "scheduled",
  });

  // 2. Create Google Calendar event with a Meet link (only if not already created)
  let calendarEventId = consultation.calendar_event_id || "";
  let meetLink = consultation.meet_link || "";

  if (!calendarEventId) {
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
      const auth = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const cal = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
      const endIso = consultation.end || new Date(new Date(consultation.start).getTime() + 45 * 60000).toISOString();
      const evBody = {
        summary: `Sovereign Consultation — ${consultation.company_name || consultation.requester_name || consultation.email}`,
        description: `Priority Sovereign consultation.\nTopic: ${consultation.topic}\nClient: ${consultation.requester_name || ""} <${consultation.email || ""}>\nPayment: ${paymentConfirmationId}`,
        start: { dateTime: consultation.start },
        end: { dateTime: endIso },
        attendees: consultation.email ? [{ email: consultation.email }] : [],
        conferenceData: { createRequest: { requestId: `sov-${consultationId}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      };
      const res = await fetch(`${cal}?conferenceDataVersion=1&sendUpdates=all`, { method: "POST", headers: auth, body: JSON.stringify(evBody) });
      const data = await res.json();
      if (res.ok) {
        calendarEventId = data.id;
        meetLink = data.hangoutLink || (data.conferenceData?.entryPoints || []).find((p) => p.entryPointType === "video")?.uri || "";
        await base44.asServiceRole.entities.SovereignConsultation.update(consultationId, { calendar_event_id: calendarEventId, meet_link: meetLink });
      } else {
        console.error("[finalizeConsultation] Calendar booking failed", data);
      }
    } catch (calErr) {
      console.error("[finalizeConsultation] Calendar connector error:", calErr.message);
    }
  }

  const apptDate = new Date(consultation.start).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  const invoiceId = `INV-SOV-${consultationId.slice(-8).toUpperCase()}`;
  const originalPrice = consultation.final_price != null ? consultation.final_price : finalPrice;

  // 3. Email A — The Sovereign Appointment Confirmation (Client + Admin Chain)
  const emailABody = `Congratulations on securing your high-stakes advisory session.

Your Sovereign Consultation has been confirmed.

When: ${apptDate}
Google Meet: ${meetLink || "Will be sent separately"}

SpeakEasy Access Credentials:
Your secure meeting room credentials have been provisioned. Use the Google Meet link above at the scheduled time.

Forensic Dossier Summary:
${consultation.topic}

We look forward to your session.

— The Alt+Shift+X Sovereign Team`;

  // Send to client
  if (consultation.email) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: consultation.email,
        subject: `[CONFIRMED] Sovereign Apex Consultation: ${apptDate}`,
        body: emailABody,
      });
    } catch (e) {
      console.error("[finalizeConsultation] Email A to client failed:", e.message);
    }
  }

  // Send to admin chain
  try {
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    for (const admin of (admins || []).slice(0, 5)) {
      if (admin.email && admin.email !== consultation.email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject: `[CONFIRMED] Sovereign Apex Consultation: ${apptDate}`,
            body: `${emailABody}\n\n--- Admin Chain Copy ---\nClient: ${consultation.requester_name || ""} <${consultation.email || ""}>\nEntity: ${consultation.company_name || ""}\nPayment ID: ${paymentConfirmationId}\nPromo: ${promoCode || "None"}`,
          });
        } catch (e) { /* continue to next admin */ }
      }
    }
  } catch (e) {
    console.error("[finalizeConsultation] Admin email send failed:", e.message);
  }

  // 4. Email B — The Sovereign Tax Invoice / Receipt (Client)
  const priceBreakdown = finalPrice === 0
    ? `Consultation Fee: $${originalPrice.toFixed(2)}\nSovereign Credit / Non-Profit Grant: -$${originalPrice.toFixed(2)}\nTotal: $0.00`
    : `Consultation Fee: $${finalPrice.toFixed(2)}\nTotal: $${finalPrice.toFixed(2)}`;

  if (consultation.email) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: consultation.email,
        subject: `[INVOICE] Sovereign Consultation Transaction: ${invoiceId}`,
        body: `Sovereign Consultation — Tax Invoice / Receipt

Invoice ID: ${invoiceId}
Transaction ID: ${paymentConfirmationId}
Date: ${new Date().toLocaleDateString("en-US")}
Client: ${consultation.requester_name || ""}
Entity: ${consultation.company_name || ""}

Fee Breakdown:
${priceBreakdown}

Promo Code: ${promoCode || "None"}

This receipt is provided for your corporate/non-profit tax records. Keep this invoice for your year-end Sovereign tax-deduction audit.

— The Alt+Shift+X Sovereign Team`,
      });
    } catch (e) {
      console.error("[finalizeConsultation] Email B failed:", e.message);
    }
  }

  console.log(`[finalizeConsultation] Consultation ${consultationId} finalized — payment: ${paymentStatus}, calendar: ${!!calendarEventId}, emails dispatched.`);

  return {
    ...consultation,
    payment_confirmation_id: paymentConfirmationId,
    payment_status: paymentStatus,
    final_price: finalPrice,
    promo_code: promoCode || "",
    calendar_event_id: calendarEventId,
    meet_link: meetLink,
    status: "scheduled",
  };
}