import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// SOVEREIGN-INVOICE-ENGINE-1.0 — forensic invoice + QR encoding engine.
//
// Actions (payload.action):
//   "issue"  — persist a SovereignInvoice: assign the next sequential invoice
//              number, compute the BIT-HASH forensic hash, and build the exact
//              QR payload { inv, date, tcv, hub, hash } for AI-ingestion.
//
// The QR payload is intentionally compact so a scanning agent (BOB / Upkeeper)
// bypasses the "Read PDF" step and goes straight to Logic Ingestion.

// Short forensic BIT-HASH from the invoice payload.
async function bitHash(seed: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return "BIT-HASH-" + hex.slice(0, 4) + hex.slice(-4);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "issue";

    if (action !== "issue") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    const {
      policy_id, policy_name, hub, bill_to,
      line_items, invoice_date,
    } = body;

    const items = Array.isArray(line_items) ? line_items : [];
    if (items.length === 0) {
      return Response.json({ error: "At least one line item is required." }, { status: 400 });
    }

    // Recompute subtotals + total server-side (never trust the client math).
    const normalized = items.map((it) => {
      const rate = Number(it.unit_rate) || 0;
      const qty = Number(it.quantity) || 0;
      return {
        item_name: it.item_name || "",
        description: it.description || "",
        unit_rate: rate,
        quantity: qty,
        subtotal: rate * qty,
      };
    });
    const tcv = normalized.reduce((sum, it) => sum + it.subtotal, 0);

    // Next sequential invoice number for this owner (INV-001, INV-002, …).
    const existing = await base44.asServiceRole.entities.SovereignInvoice.filter(
      { owner_id: user.id }, "-created_date", 500,
    );
    const seq = existing.length + 1;
    const invoiceNumber = `INV-${String(seq).padStart(3, "0")}`;
    const date = invoice_date || new Date().toISOString().slice(0, 10);
    const hubCode = (hub || "HQ").toUpperCase();

    const hash = await bitHash(`${user.id}|${invoiceNumber}|${date}|${tcv}|${hubCode}`);

    // Exact QR payload shape for downstream AI Logic Ingestion.
    const qrObject = { inv: invoiceNumber, date, tcv, hub: hubCode, hash };
    const qrPayload = JSON.stringify(qrObject);

    const invoice = await base44.asServiceRole.entities.SovereignInvoice.create({
      owner_id: user.id,
      engine_code: "SOVEREIGN-INVOICE-ENGINE-1.0",
      invoice_number: invoiceNumber,
      invoice_date: date,
      policy_id: policy_id || "",
      policy_name: policy_name || "",
      hub: hubCode,
      bill_to: bill_to || "",
      line_items: normalized,
      total_contract_value: tcv,
      forensic_hash: hash,
      qr_payload: qrPayload,
      status: "issued",
    });

    console.log(`[INFO] Sovereign invoice issued: ${invoiceNumber}, tcv=${tcv}, hub=${hubCode}`);
    return Response.json({ ok: true, invoice, qr: qrObject, qr_payload: qrPayload });
  } catch (error) {
    console.error("[sovereignInvoiceEngine] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});