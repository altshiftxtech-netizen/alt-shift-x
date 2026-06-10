import { base44 } from "@/api/base44Client";

// ── Conversation metadata helper ────────────────────────────────────────────
// The agents SDK in this app exposes NO updateConversation method, so rename /
// trash / clear cannot be stored on the conversation itself. We persist that
// state in our own ConversationMeta entity, keyed by conversation_id, and merge
// it onto the SDK conversation list when rendering history.
//
// Each helper is resilient: a failure never throws into the UI handler.

const cache = new Map(); // conversation_id -> meta record (per page session)

// Load all meta rows for an agent and index them by conversation_id.
export async function loadMetaMap(agentName) {
  try {
    const rows = await base44.entities.ConversationMeta.filter({ agent_name: agentName }, "-updated_date", 500);
    const map = {};
    for (const r of rows) {
      // Keep the most recent row per conversation if duplicates ever appear.
      if (!map[r.conversation_id]) map[r.conversation_id] = r;
      cache.set(r.conversation_id, map[r.conversation_id]);
    }
    return map;
  } catch {
    return {};
  }
}

// Find (or lazily create) the meta row for one conversation.
async function getOrCreate(conversationId, agentName, seed = {}) {
  if (cache.has(conversationId)) return cache.get(conversationId);
  try {
    const existing = await base44.entities.ConversationMeta.filter({ conversation_id: conversationId }, "-updated_date", 1);
    if (existing?.[0]) { cache.set(conversationId, existing[0]); return existing[0]; }
  } catch { /* fall through to create */ }
  const created = await base44.entities.ConversationMeta.create({
    conversation_id: conversationId,
    agent_name: agentName,
    ...seed,
  });
  cache.set(conversationId, created);
  return created;
}

// Apply a patch to the meta row, creating it if needed. Returns the updated row.
export async function patchMeta(conversationId, agentName, patch) {
  const row = await getOrCreate(conversationId, agentName);
  const updated = await base44.entities.ConversationMeta.update(row.id, patch);
  cache.set(conversationId, updated);
  return updated;
}

export const renameConversation = (conversationId, agentName, title) =>
  patchMeta(conversationId, agentName, { title });

export const trashConversation = (conversationId, agentName) =>
  patchMeta(conversationId, agentName, { trashed: true, trashed_at: new Date().toISOString() });

export const restoreConversation = (conversationId, agentName) =>
  patchMeta(conversationId, agentName, { trashed: false, trashed_at: null });

export const clearConversation = (conversationId, agentName) =>
  patchMeta(conversationId, agentName, { cleared: true, cleared_at: new Date().toISOString() });