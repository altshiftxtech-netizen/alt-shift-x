import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { jsPDF } from "npm:jspdf@4.0.0";

// Generates the same ESI legal record PDF as exportEsiRecord, but instead of streaming
// it as a download, it uploads the PDF to storage and returns a public file_url.
// That URL can then be shared to Google Drive, Dropbox, OneDrive, email, etc. from the
// frontend (via "Save to Drive"-style links or the native share sheet).
//
// ESI exports are free for everyone (paywall removed), so no access gating here.

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

    const { conversationId } = await req.json();
    if (!conversationId) return Response.json({ error: "Missing conversationId" }, { status: 400 });

    // ── Fetch conversation ──────────────────────────────────────────────────────
    const conversation = await base44.agents.getConversation(conversationId);
    const messages = conversation?.messages || [];
    const projectName = conversation?.metadata?.name || "BOB Project";

    const nowIso = new Date().toISOString();
    const nowUtc = new Date().toUTCString();
    const createdIso = conversation?.created_date || messages[0]?.created_date || nowIso;

    const fileUrls = [...new Set(messages.flatMap((m) => m.file_urls || []))];
    const toolCalls = messages.flatMap((m) => (m.tool_calls || []).map((t) => t.name)).filter(Boolean);

    const canonical = JSON.stringify(messages.map((m) => ({ r: m.role, c: m.content, t: m.created_date, f: m.file_urls || [] })));
    const integrityHash = await sha256Hex(canonical);

    // ── Build PDF ────────────────────────────────────────────────────────────────
    const doc = new jsPDF();
    const M = 15;
    const W = 180;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 46, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ESI LEGAL RECORD", M, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Electronically Stored Information — Business Operations Record", M, 28);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Alt+Shift+X Platform · BOB (BotOperatedBuilder) · Yotta Protocol", M, 36);
    doc.text(`Document generated: ${nowUtc}`, M, 41);

    let y = 56;
    doc.setTextColor(30, 41, 59);

    const section = (heading) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFillColor(241, 245, 249);
      doc.rect(M - 3, y - 5, W + 6, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
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

    section("1. Record Metadata");
    line("Record Type", "ESI Business Operations Record (BOB Project History)");
    line("Project / Matter Name", projectName);
    line("Project / Conversation ID", conversationId);
    line("Custodian / Operator", `${user.full_name || "—"} (${user.email})`);
    line("Custodian User ID", user.id);
    line("Project Created (system)", new Date(createdIso).toUTCString());
    line("Record Generated (UTC)", nowUtc);
    line("Record Generated (ISO 8601)", nowIso);
    line("Total Entries (messages)", String(messages.length));
    line("Attached Source Files", String(fileUrls.length));
    line("Automated Operations Invoked", toolCalls.length ? `${toolCalls.length} (${[...new Set(toolCalls)].join(", ")})` : "0");
    y += 2;

    section("2. Custodian Attestation");
    y = wrap(doc,
      "I, the undersigned custodian identified above, attest that this record is a true and accurate " +
      "reproduction of electronically stored information generated in the ordinary course of business on the " +
      "Alt+Shift+X platform. The entries below were created contemporaneously by or at the direction of the " +
      "custodian and reflect work performed in the operation of a business. This document is produced as a " +
      "business record and may be used to substantiate that a business is being actively operated.",
      M, y, W, 5);
    y += 4;

    section("3. Chain of Custody & Integrity");
    line("Integrity Algorithm", "SHA-256");
    line("Content Integrity Hash", integrityHash);
    y = wrap(doc,
      "The integrity hash above is computed over the canonical serialization of all record entries " +
      "(role, content, timestamp, attachments). Any alteration to the entries will produce a different hash, " +
      "allowing this record's authenticity to be independently verified.",
      M, y, W, 5);
    y += 4;

    if (fileUrls.length) {
      section("4. Attached Source Files");
      fileUrls.forEach((u, i) => { line(`File ${i + 1}`, u); });
      y += 2;
    }

    section(`${fileUrls.length ? "5" : "4"}. Full Entry Log`);
    messages.forEach((m, i) => {
      if (y > 268) { doc.addPage(); y = 20; }
      const ts = m.created_date ? new Date(m.created_date).toUTCString() : "timestamp unavailable";
      const who = m.role === "user" ? "OPERATOR" : m.role === "assistant" ? "BOB (System)" : (m.role || "system").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
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
      doc.text(`ESI Legal Record · ${projectName} · Hash ${integrityHash.slice(0, 16)}… · Page ${p}/${pageCount}`, M, 290);
    }

    // ── Upload PDF and return a shareable public URL ─────────────────────────────
    const pdfBytes = doc.output("arraybuffer");
    const fname = `ESI_Record_${projectName.replace(/[^a-z0-9]+/gi, "_")}.pdf`;
    const file = new File([pdfBytes], fname, { type: "application/pdf" });

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ file_url, file_name: fname });
  } catch (error) {
    console.error("[shareEsiRecord]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});