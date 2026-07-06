import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// EXPERT-MINDS-ENTERPRISE-CORE-1.0 (Org Master, $10k/mo) +
// EXPERT-MINDS-MEMBER-LICENSE-1.0 (Member Seat, $999/mo).
//
// Actions (payload.action):
//   "setup_org"       — create/ensure the org record for the Org Admin, require
//                       the Blackstone Enterprise Agreement hash, then open a
//                       $10k/mo core subscription checkout. Registers the org
//                       under expertminds_org_id in GSP-MASTER-INDEX-1.0.
//   "invite_member"   — Org Admin invites a member. Creates a pending seat with
//                       a pending $999/mo charge + a Vana-Voice handshake code,
//                       and registers the member under expertminds_org_id.
//   "verify_seat"     — complete the invited member's Vana-Voice handshake and
//                       activate the seat (forensic_status → verified).
//   "list"            — Org Admin loads their org + staff registry.

const MASTER_INDEX_ID = "6a4a1f9f62e77d271c297e6a"; // GSP-MASTER-INDEX-1.0
const CORE_CODE = "EXPERT-MINDS-ENTERPRISE-CORE-1.0";
const LICENSE_CODE = "EXPERT-MINDS-MEMBER-LICENSE-1.0";

function shortCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function registryLog(base44, orgId, event, payload) {
  await base44.asServiceRole.entities.ComponentCollaboration.create({
    component_id: MASTER_INDEX_ID,
    component_name: "GSP-MASTER-INDEX-1.0",
    owner_id: orgId,
    notes: JSON.stringify({ event, expertminds_org_id: orgId, ...payload, logged_at: new Date().toISOString() }),
    status: "active",
  }).catch((e) => console.error("[expertMindsOrgOps] registry log failed:", e.message));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    // ── ADMIN OVERVIEW: platform-admin financial + record-keeping rollup of
    //    ALL ExpertMinds Enterprise orgs & seats (no gamification). ──
    if (action === "admin_overview") {
      if (user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

      const [orgs, seats] = await Promise.all([
        base44.asServiceRole.entities.ExpertMindsOrg.list("-created_date", 1000),
        base44.asServiceRole.entities.ExpertMindsSeat.list("-created_date", 5000),
      ]);

      const CORE_MO = 10000;    // $10k/mo per active core
      const SEAT_MO = 999;      // $999/mo per charged seat

      const activeOrgs = orgs.filter((o) => o.core_status === "active");
      const chargedSeats = seats.filter((s) => s.billing_status === "charged");
      const verifiedSeats = seats.filter((s) => s.forensic_status === "verified");

      const coreMrr = activeOrgs.length * CORE_MO;
      const seatMrr = chargedSeats.length * SEAT_MO;
      const totalMrr = coreMrr + seatMrr;

      // Per-org financial + record rollup for the ledger table.
      const orgRows = orgs.map((o) => {
        const oseats = seats.filter((s) => s.expertminds_org_id === o.expertminds_org_id);
        const charged = oseats.filter((s) => s.billing_status === "charged").length;
        const verified = oseats.filter((s) => s.forensic_status === "verified").length;
        const active = o.core_status === "active";
        const mrr = (active ? CORE_MO : 0) + charged * SEAT_MO;
        return {
          id: o.id,
          org_name: o.org_name,
          org_admin_email: o.org_admin_email,
          core_status: o.core_status,
          expertminds_org_id: o.expertminds_org_id,
          blackstone_signed: !!o.blackstone_acceptance_hash,
          created_date: o.created_date,
          seats: oseats.length,
          charged_seats: charged,
          verified_seats: verified,
          mrr,
        };
      });

      // Status distribution for the pie/graph.
      const statusCounts = {};
      for (const o of orgs) statusCounts[o.core_status || "unknown"] = (statusCounts[o.core_status || "unknown"] || 0) + 1;

      return Response.json({
        ok: true,
        kpis: {
          totalOrgs: orgs.length,
          activeOrgs: activeOrgs.length,
          totalSeats: seats.length,
          chargedSeats: chargedSeats.length,
          verifiedSeats: verifiedSeats.length,
          coreMrr,
          seatMrr,
          totalMrr,
          arr: totalMrr * 12,
        },
        orgRows,
        statusCounts,
      });
    }

    // ── LIST: org + staff registry for the current Org Admin ──
    if (action === "list") {
      const orgs = await base44.asServiceRole.entities.ExpertMindsOrg.filter({ org_admin_id: user.id });
      const org = orgs[0] || null;
      let seats = [];
      if (org) {
        seats = await base44.asServiceRole.entities.ExpertMindsSeat.filter(
          { expertminds_org_id: org.expertminds_org_id }, "-created_date", 200,
        );
      }
      return Response.json({ ok: true, org, seats });
    }

    // ── SETUP ORG: require Blackstone signature, then $10k/mo checkout ──
    if (action === "setup_org") {
      const { org_name, blackstone_acceptance_hash, successUrl, cancelUrl } = body;
      if (!blackstone_acceptance_hash) {
        return Response.json({ error: "The Blackstone Enterprise Agreement must be signed first." }, { status: 400 });
      }

      // Ensure a single org per admin. expertminds_org_id is the org record id.
      let orgs = await base44.asServiceRole.entities.ExpertMindsOrg.filter({ org_admin_id: user.id });
      let org = orgs[0] || null;
      if (!org) {
        org = await base44.asServiceRole.entities.ExpertMindsOrg.create({
          org_admin_id: user.id,
          org_admin_email: user.email,
          org_name: org_name || `${user.full_name || user.email}'s Organization`,
          core_component_code: CORE_CODE,
          blackstone_acceptance_hash,
          core_status: "pending_payment",
        });
        // Stamp the canonical org id onto itself.
        await base44.asServiceRole.entities.ExpertMindsOrg.update(org.id, { expertminds_org_id: org.id });
        org.expertminds_org_id = org.id;
        await registryLog(base44, org.id, "org_registered", {
          core_component_code: CORE_CODE, org_admin_id: user.id, blackstone_acceptance_hash,
        });
      } else {
        await base44.asServiceRole.entities.ExpertMindsOrg.update(org.id, {
          org_name: org_name || org.org_name,
          blackstone_acceptance_hash,
          core_status: "pending_payment",
        });
      }

      // $10k/mo core subscription checkout.
      const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
      const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
      const stripeKey = testMode ? Deno.env.get("STRIPE_TEST_SECRET_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
      const stripe = new Stripe(stripeKey);
      const coreProd = await stripe.products.create({ name: `${CORE_CODE}${testMode ? " (TEST)" : ""}` });
      const corePrice = (await stripe.prices.create({
        product: coreProd.id, unit_amount: 1000000, currency: "usd", recurring: { interval: "month" },
      })).id;

      const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: corePrice, quantity: 1 }],
        success_url: successUrl || `${origin}/enterprise?org_setup=success`,
        cancel_url: cancelUrl || `${origin}/enterprise`,
        customer_email: user.email,
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          user_id: user.id,
          plan: "expertminds_enterprise_core",
          expertminds_org_id: org.expertminds_org_id,
        },
      });

      console.log(`[INFO] ExpertMinds org core checkout: org=${org.expertminds_org_id}, test=${testMode}`);
      return Response.json({ ok: true, org, url: session.url });
    }

    // ── INVITE MEMBER: pending seat + $999 charge intent + handshake code ──
    if (action === "invite_member") {
      const { member_email, member_name, seat_type } = body;
      if (!member_email) return Response.json({ error: "member_email is required" }, { status: 400 });

      const orgs = await base44.asServiceRole.entities.ExpertMindsOrg.filter({ org_admin_id: user.id });
      const org = orgs[0];
      if (!org) return Response.json({ error: "Set up your ExpertMinds Enterprise org first." }, { status: 400 });

      // Resolve member id if they already have an account.
      let memberId = "";
      const matches = await base44.asServiceRole.entities.User.filter({ email: member_email });
      if (matches.length > 0) memberId = matches[0].id;

      const code = shortCode();
      const seat = await base44.asServiceRole.entities.ExpertMindsSeat.create({
        expertminds_org_id: org.expertminds_org_id,
        org_admin_id: user.id,
        license_component_code: LICENSE_CODE,
        member_name: member_name || "",
        member_email,
        member_id: memberId,
        seat_type: seat_type === "dev" ? "dev" : "standard",
        billing_status: "pending_charge",
        forensic_status: "pending",
        handshake_code: code,
      });

      await registryLog(base44, org.expertminds_org_id, "member_seat_invited", {
        license_component_code: LICENSE_CODE, member_email, seat_type: seat.seat_type, seat_id: seat.id,
        billing_status: "pending_charge", monthly_charge_usd: 999,
      });

      // Email the invite with the handshake code (best-effort).
      await base44.integrations.Core.SendEmail({
        to: member_email,
        from_name: "ExpertMinds Enterprise",
        subject: `You've been invited to ${org.org_name} on ExpertMinds`,
        body: `You've been granted an ExpertMinds Member Seat (${LICENSE_CODE}).\n\nTo activate your seat, complete your Vana-Voice biological handshake using this code:\n\n${code}\n\nYour seat activates once the handshake is verified.`,
      }).catch(() => {});

      console.log(`[INFO] ExpertMinds seat invited: org=${org.expertminds_org_id}, to=${member_email}`);
      return Response.json({ ok: true, seat });
    }

    // ── VERIFY SEAT: complete Vana-Voice handshake → activate seat ──
    if (action === "verify_seat") {
      const { seat_id, handshake_code } = body;
      if (!seat_id) return Response.json({ error: "seat_id required" }, { status: 400 });
      const rows = await base44.asServiceRole.entities.ExpertMindsSeat.filter({ id: seat_id });
      const seat = rows[0];
      if (!seat) return Response.json({ error: "Seat not found" }, { status: 404 });

      // The invited member, the org admin, or an admin may verify.
      const isMember = (seat.member_id && seat.member_id === user.id) ||
        (seat.member_email && user.email && seat.member_email.toLowerCase() === user.email.toLowerCase());
      const isOrgAdmin = seat.org_admin_id === user.id || user.role === "admin";
      if (!isMember && !isOrgAdmin) return Response.json({ error: "Not authorized to verify this seat." }, { status: 403 });

      if (handshake_code && seat.handshake_code && handshake_code.toUpperCase() !== seat.handshake_code) {
        return Response.json({ error: "Handshake code does not match." }, { status: 400 });
      }

      const verifiedAt = new Date().toISOString();
      await base44.asServiceRole.entities.ExpertMindsSeat.update(seat.id, {
        member_id: seat.member_id || user.id,
        member_name: seat.member_name || user.full_name || "",
        forensic_status: "verified",
        billing_status: "charged",
        verified_at: verifiedAt,
      });

      await registryLog(base44, seat.expertminds_org_id, "member_seat_verified", {
        seat_id: seat.id, member_email: seat.member_email, seat_type: seat.seat_type, verified_at: verifiedAt,
      });

      console.log(`[INFO] ExpertMinds seat verified: seat=${seat.id}`);
      return Response.json({ ok: true, seat_id: seat.id, forensic_status: "verified" });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[expertMindsOrgOps] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});