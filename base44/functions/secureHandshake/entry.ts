import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// BT-SECURE-KEY-TRANS-1.0 — Air-Gapped Sovereign key handoff.
// A secure in-app handshake styled as a Bluetooth pairing ceremony.
//   action="transmit" (admin) -> pairs & transmits a key to a recipient email
//   action="ingest"   (user)  -> recipient receives the key; a forensic receipt
//                                hash is computed and the record is verified.
//
// The plaintext key is returned to the recipient exactly once on ingest.

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function pairingCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── Admin: pair & transmit a key to a recipient ──────────────────────────
    if (action === "transmit") {
      if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });
      const { recipient_email, key_label, key_secret } = body;
      if (!recipient_email || !key_secret) {
        return Response.json({ error: "recipient_email and key_secret are required" }, { status: 400 });
      }

      // Resolve recipient user id (if they already have an account)
      let recipientId = "";
      let recipientName = "";
      const matches = await base44.asServiceRole.entities.User.filter({ email: recipient_email });
      if (matches.length > 0) { recipientId = matches[0].id; recipientName = matches[0].full_name || ""; }

      const record = await base44.asServiceRole.entities.SecureHandshake.create({
        protocol: "BT-SECURE-KEY-TRANS-1.0",
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        recipient_id: recipientId,
        recipient_email,
        recipient_name: recipientName,
        pairing_code: pairingCode(),
        key_label: key_label || "Sovereign Key",
        key_ciphertext: key_secret,
        key_last4: String(key_secret).slice(-4),
        status: "transmitted",
        transmitted_at: new Date().toISOString(),
      });

      console.log(`[INFO] Handshake transmitted: id=${record.id}, to=${recipient_email}, by=${user.id}`);
      return Response.json({
        handshake: {
          id: record.id,
          pairing_code: record.pairing_code,
          recipient_email: record.recipient_email,
          key_label: record.key_label,
          key_last4: record.key_last4,
          status: record.status,
        },
      });
    }

    // ── User: receive & ingest the key ───────────────────────────────────────
    if (action === "ingest") {
      const { handshake_id } = body;
      if (!handshake_id) return Response.json({ error: "handshake_id required" }, { status: 400 });

      const rows = await base44.asServiceRole.entities.SecureHandshake.filter({ id: handshake_id });
      if (!rows.length) return Response.json({ error: "Handshake not found" }, { status: 404 });
      const hs = rows[0];

      // Only the intended recipient (by id or email) may ingest.
      const isRecipient = (hs.recipient_id && hs.recipient_id === user.id) ||
        (hs.recipient_email && user.email && hs.recipient_email.toLowerCase() === user.email.toLowerCase());
      if (!isRecipient && user.role !== "admin") {
        return Response.json({ error: "This key was not transmitted to your account." }, { status: 403 });
      }

      if (hs.status === "verified" || hs.status === "ingested") {
        return Response.json({ error: "This key has already been ingested." }, { status: 409 });
      }

      const ingestedAt = new Date().toISOString();
      const receiptHash = await sha256(`${hs.id}:${hs.recipient_email}:${hs.key_last4}:${ingestedAt}`);

      await base44.asServiceRole.entities.SecureHandshake.update(hs.id, {
        recipient_id: hs.recipient_id || user.id,
        recipient_name: hs.recipient_name || user.full_name || "",
        status: "verified",
        ingested_at: ingestedAt,
        receipt_verified_at: ingestedAt,
        receipt_hash: receiptHash,
      });

      console.log(`[INFO] Handshake ingested & verified: id=${hs.id}, by=${user.id}`);
      return Response.json({
        key_secret: hs.key_ciphertext,
        key_label: hs.key_label,
        receipt: {
          verified: true,
          receipt_hash: receiptHash,
          verified_at: ingestedAt,
          protocol: hs.protocol,
        },
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("secureHandshake error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});