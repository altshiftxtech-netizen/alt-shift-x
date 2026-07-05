import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

const STALE_MS = 90 * 1000;       // presence older than this is treated as offline
const HEARTBEAT_MS = 35 * 1000;   // refresh own presence on this cadence
const POLL_MS = 45 * 1000;        // poll the room for others slightly less often

// Deterministic-ish scatter so avatars don't stack on the same spot.
function randomPos() {
  return { pos_x: 12 + Math.random() * 76, pos_y: 30 + Math.random() * 55 };
}

/**
 * Tracks live member presence in a Speakeasy room.
 * Upserts the current user's presence row, heartbeats it, polls the room for
 * others, and cleans up on leave. Returns the list of currently-present members.
 *
 * Enterprise privacy:
 * - `alias` overrides the displayed name (protects the real identity).
 * - `ghostMode` hides the member entirely: their bubble is never written to the
 *   room and, in exchange, they receive no other members' bubbles either.
 */
export default function useSpeakeasyPresence(room = "proxy_room", options = {}) {
  const { alias = "", ghostMode = false } = options;
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState(null);
  const rowIdRef = useRef(null);
  const posRef = useRef(randomPos());

  useEffect(() => {
    let active = true;
    let heartbeat;
    let poll;

    const enter = async () => {
      let user;
      try { user = await base44.auth.me(); } catch { return; }
      if (!active || !user) return;
      setMe(user);

      // Ghost mode — do not publish presence, and never load others. The member
      // is invisible in the room and cannot see or interact with any bubbles.
      if (ghostMode) {
        // Remove any lingering bubble from a previous non-ghost visit.
        try {
          const existing = await base44.entities.SpeakeasyPresence.filter({ user_id: user.id, room });
          if (existing[0]) await base44.entities.SpeakeasyPresence.delete(existing[0].id);
        } catch { /* noop */ }
        if (active) setMembers([]);
        return;
      }

      // Upsert presence for this user+room. Wrapped so a transient rate-limit
      // (429) never crashes the room — presence is best-effort chrome.
      try {
        const existing = await base44.entities.SpeakeasyPresence.filter({ user_id: user.id, room });
        const payload = {
          user_id: user.id,
          user_name: alias || user.full_name || user.email,
          room,
          ghost_mode: false,
          ...posRef.current,
          last_seen: new Date().toISOString(),
        };
        if (existing[0]) {
          rowIdRef.current = existing[0].id;
          await base44.entities.SpeakeasyPresence.update(existing[0].id, { last_seen: payload.last_seen, room, user_name: payload.user_name, ghost_mode: false });
        } else {
          const created = await base44.entities.SpeakeasyPresence.create(payload);
          rowIdRef.current = created.id;
        }
      } catch { /* rate-limited or offline — keep the room usable, retry on next poll */ }

      const beat = async () => {
        if (rowIdRef.current) {
          try { await base44.entities.SpeakeasyPresence.update(rowIdRef.current, { last_seen: new Date().toISOString() }); } catch { /* noop */ }
        }
      };
      const refresh = async () => {
        try {
          const all = await base44.entities.SpeakeasyPresence.filter({ room });
          const cutoff = Date.now() - STALE_MS;
          // Never show members who are in ghost mode.
          const live = all.filter((p) => !p.ghost_mode && p.last_seen && new Date(p.last_seen).getTime() > cutoff);
          if (active) setMembers(live);
        } catch { /* noop */ }
      };

      await refresh();
      heartbeat = setInterval(beat, HEARTBEAT_MS);
      poll = setInterval(refresh, POLL_MS);
    };

    enter();

    const leave = () => {
      if (rowIdRef.current) {
        base44.entities.SpeakeasyPresence.delete(rowIdRef.current).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", leave);

    return () => {
      active = false;
      clearInterval(heartbeat);
      clearInterval(poll);
      window.removeEventListener("beforeunload", leave);
      leave();
    };
  }, [room, alias, ghostMode]);

  return { members, me };
}