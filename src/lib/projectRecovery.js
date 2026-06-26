import { base44 } from "@/api/base44Client";

// ── Project recovery (JSON) ─────────────────────────────────────────────────
// A BOB project lives as an agents-SDK conversation. The ESI export produces a
// PDF legal record; this module produces a machine-readable JSON *recovery file*
// the builder can save locally and later re-import to resume the project as a
// fresh conversation. This is the "download-or-lose" safety net for the history
// lifecycle (10 active, archive past 10, hard cap at 20).

const AGENT = "bob_builder";
const RECOVERY_VERSION = 1;

const safeName = (s) => (s || "project").replace(/[^a-z0-9]+/gi, "_").slice(0, 60);

// Build a portable JSON snapshot of one conversation (its full message history).
export async function buildRecoveryJson(conversation) {
  let messages = conversation?.messages;
  if (!messages) {
    try {
      const full = await base44.agents.getConversation(conversation.id);
      messages = full?.messages || [];
    } catch {
      messages = [];
    }
  }
  return {
    bob_recovery_version: RECOVERY_VERSION,
    agent_name: AGENT,
    title: conversation?.metadata?.name || "Recovered Project",
    exported_at: new Date().toISOString(),
    source_conversation_id: conversation?.id || null,
    messages: (messages || []).map((m) => ({
      role: m.role,
      content: m.content || "",
      file_urls: m.file_urls || [],
    })),
  };
}

// Trigger a browser download of the recovery JSON for one conversation.
export async function downloadRecoveryFile(conversation) {
  const data = await buildRecoveryJson(conversation);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BOB_Recovery_${safeName(data.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse + validate an uploaded recovery file.
export function parseRecoveryFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.messages)) {
          reject(new Error("Not a valid BOB recovery file."));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error("Could not read this recovery file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsText(file);
  });
}

// Recreate a project from a parsed recovery file as a brand-new conversation,
// replaying its message history. Returns the new conversation.
export async function recoverProject(data) {
  const title = data.title ? `${data.title} (Recovered)` : "Recovered Project";
  const conv = await base44.agents.createConversation({
    agent_name: AGENT,
    metadata: { name: title },
  });
  // Replay only the user-authored turns so BOB re-engages naturally on resume,
  // while preserving prior context as a single primer message.
  const transcript = (data.messages || [])
    .map((m) => `${m.role === "user" ? "You" : "BOB"}: ${m.content}`)
    .join("\n\n");
  if (transcript.trim()) {
    await base44.agents.addMessage(conv, {
      role: "user",
      content:
        "I'm resuming a previous project from a recovery file. Here is the prior conversation for context — pick up where we left off:\n\n" +
        transcript,
    });
  }
  return conv;
}