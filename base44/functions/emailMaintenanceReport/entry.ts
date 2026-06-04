import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { jsPDF } from "npm:jspdf@4.0.0";

// Builds a MAINTENANCE EVENT LOG (ESI) from an UpKeeper conversation — the chat,
// the outcome, and everything needed to formally log a site-maintenance event —
// then emails the PDF link to the platform maintenance inbox.
//
// Always cc'd to the platform maintenance address; optionally also to the operator.

const MAINTENANCE_INBOX = "altshiftx.tech@gmail.com";

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function wrap(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const ln of lines) {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(ln, x, y);
    y += lineHeight;
  }
  return y;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin" && user.role !== "staff") {
      return Response.json({ error: "Forbidden: admin or staff only" }, { status: 403 });
    }

    const { conversationId, alsoEmailMe } = await req.json();
    if (!conversationId) return Response.json({ error: "Missing conversationId" }, { status: 400 });

    // ── Fetch conversation ──────────────────────────────────────────────────────
    const conversation = await base44.agents.getConversation(conversationId);
    const messages = conversation?.messages || [];
    const sessionName = conversation?.metadata?.name || "UpKeeper Maintenance Session";

    const nowIso = new Date().toISOString();
    const nowUtc = new Date().toUTCString();
    const createdIso = conversation?.created_date || messages[0]?.created_date || nowIso;

    const fileUrls = [...new Set(messages.flatMap((m) => m.file_urls || []))];
    const toolCalls = messages.flatMap((m) => (m.tool_calls || []).map((t) => t.name)).filter(Boolean);

    // Outcome = the UpKeeper's final assistant message in the session.
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const outcome = (lastAssistant?.content || "No outcome recorded.").replace(/\s+/g, " ").trim();
    const firstRequest = (messages.find((m) => m.role === "user")?.content || "—").replace(/\s+/g, " ").trim();

    const canonical = JSON.stringify(messages.map((m) => ({ r: m.role, c: m.content, t: m.created_date, f: m.file_urls || [] })));
    const integrityHash = await sha256Hex(canonical);
    const eventId = `MNT-${integrityHash.slice(0, 10).toUpperCase()}`;

    // ── Build PDF ────────────────────────────────────────────────────────────────
    const doc = new jsPDF();
    const M = 15;
    const W = 180;

    doc.setFillColor(124, 45, 18); // peach/brown header
    doc.rect(0, 0, 210, 46, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MAINTENANCE EVENT LOG", M, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Electronically Stored Information (ESI) — Site Maintenance Record", M, 28);
    doc.setFontSize(8);
    doc.setTextColor(254, 215, 170);
    doc.text("Alt+Shift+X Platform · The UpKeeper · Site Superintendent", M, 36);
    doc.text(`Document generated: ${nowUtc}`, M, 41);

    let y = 56;
    doc.setTextColor(30, 41, 59);

    const section = (heading) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFillColor(255, 237, 213);
      doc.rect(M - 3, y - 5, W + 6, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(124, 45, 18);
      doc.text(heading, M, y + 1);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
    };

    const line = (label, value) => {
      if (y > 272) { doc.addPage(); y = 20; }
      y = wrap(doc, `${label}: ${value}`, M, y, W, 6);
    };

    section("1. Maintenance Event Details");
    line("Event ID", eventId);
    line("Event Type", "Site Maintenance / Operations (UpKeeper Session)");
    line("Session / Matter Name", sessionName);
    line("Conversation ID", conversationId);
    line("Performed By", `${user.full_name || "—"} (${user.email})`);
    line("Operator Role", user.role);
    line("Operator User ID", user.id);
    line("Session Started (system)", new Date(createdIso).toUTCString());
    line("Report Generated (UTC)", nowUtc);
    line("Report Generated (ISO 8601)", nowIso);
    line("Total Entries (messages)", String(messages.length));
    line("Attached Files", String(fileUrls.length));
    line("Automated Operations Invoked", toolCalls.length ? `${toolCalls.length} (${[...new Set(toolCalls)].join(", ")})` : "0");
    y += 2;

    section("2. Reported Issue / Request");
    y = wrap(doc, firstRequest, M, y, W, 5);
    y += 4;

    section("3. Outcome / Resolution");
    y = wrap(doc, outcome, M, y, W, 5);
    y += 4;

    section("4. Chain of Custody & Integrity");
    line("Integrity Algorithm", "SHA-256");
    line("Content Integrity Hash", integrityHash);
    y = wrap(doc,
      "This maintenance log is a true and accurate reproduction of electronically stored information " +
      "generated in the ordinary course of operating the Alt+Shift+X platform. The integrity hash is computed " +
      "over the canonical serialization of all entries; any alteration produces a different hash.",
      M, y, W, 5);
    y += 4;

    if (fileUrls.length) {
      section("5. Attached Files");
      fileUrls.forEach((u, i) => { line(`File ${i + 1}`, u); });
      y += 2;
    }

    section(`${fileUrls.length ? "6" : "5"}. Full Session Log`);
    messages.forEach((m, i) => {
      if (y > 268) { doc.addPage(); y = 20; }
      const ts = m.created_date ? new Date(m.created_date).toUTCString() : "timestamp unavailable";
      const who = m.role === "user" ? "OPERATOR" : m.role === "assistant" ? "THE UPKEEPER" : (m.role || "system").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setTextColor(124, 45, 18);
      y = wrap(doc, `Entry ${i + 1} — ${who} — ${ts}`, M, y, W, 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const content = (m.content || "(no text content)").replace(/\s+/g, " ").trim();
      y = wrap(doc, content, M + 2, y, W - 2, 5);
      if (m.file_urls?.length) y = wrap(doc, `↳ Attachments: ${m.file_urls.length}`, M + 2, y, W - 2, 5);
      y += 3;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Maintenance Event Log · ${eventId} · ${sessionName} · Page ${p}/${pageCount}`, M, 290);
    }

    // ── Upload PDF, then email the link ──────────────────────────────────────────
    const pdfBytes = doc.output("arraybuffer");
    const fname = `Maintenance_Log_${eventId}.pdf`;
    const file = new File([pdfBytes], fname, { type: "application/pdf" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const emailBody = `A new site maintenance event has been logged on the Alt+Shift+X platform.

Event ID: ${eventId}
Session: ${sessionName}
Performed by: ${user.full_name || "—"} (${user.email}) — ${user.role}
Generated: ${nowUtc}

Reported issue / request:
${firstRequest}

Outcome / resolution:
${outcome}

Full maintenance log (PDF):
${file_url}

Integrity hash (SHA-256): ${integrityHash}

— The UpKeeper · Alt+Shift+X Site Superintendent`;

    const recipients = [MAINTENANCE_INBOX];
    if (alsoEmailMe && user.email && user.email !== MAINTENANCE_INBOX) recipients.push(user.email);

    for (const to of recipients) {
      await base44.integrations.Core.SendEmail({
        to,
        subject: `Maintenance Event Log — ${eventId} · ${sessionName}`,
        body: emailBody,
        from_name: "The UpKeeper · Alt+Shift+X",
      });
    }

    console.log(`[emailMaintenanceReport] Logged ${eventId} for ${conversationId}, sent to ${recipients.join(", ")}`);
    return Response.json({ success: true, event_id: eventId, sent_to: recipients, file_url });
  } catch (error) {
    console.error("[emailMaintenanceReport]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});