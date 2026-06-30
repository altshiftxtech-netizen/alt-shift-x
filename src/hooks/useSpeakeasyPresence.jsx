import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

const STALE_MS = 60 * 1000;       // presence older than this is treated as offline
const HEARTBEAT_MS = 20 * 1000;   // refresh own presence on this cadence

// Deterministic-ish scatter so avatars don't stack on the same spot.
function randomPos() {
  return { pos_x: 12 + Math.random() * 76, pos_y: 30 + Math.random() * 55 };
}

/**
 * Tracks live member presence in a Speakeasy room.
 * Upserts the current user's presence row, heartbeats it, polls the room for
 * others, and cleans up on leave. Returns the list of currently-present members.
 */
export default function useSpeakeasyPresence(room = "proxy_room") {
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

      // Upsert presence for this user+room.
      const existing = await base44.entities.SpeakeasyPresence.filter({ user_id: user.id, room });
      const payload = {
        user_id: user.id,
        user_name: user.full_name || user.email,
        room,
        ...posRef.current,
        last_seen: new Date().toISOString(),
      };
      if (existing[0]) {
        rowIdRef.current = existing[0].id;
        await base44.entities.SpeakeasyPresence.update(existing[0].id, { last_seen: payload.last_seen, room });
      } else {
        const created = await base44.entities.SpeakeasyPresence.create(payload);
        rowIdRef.current = created.id;
      }

      const beat = async () => {
        if (rowIdRef.current) {
          try { await base44.entities.SpeakeasyPresence.update(rowIdRef.current, { last_seen: new Date().toISOString() }); } catch { /* noop */ }
        }
      };
      const refresh = async () => {
        try {
          const all = await base44.entities.SpeakeasyPresence.filter({ room });
          const cutoff = Date.now() - STALE_MS;
          const live = all.filter((p) => p.last_seen && new Date(p.last_seen).getTime() > cutoff);
          if (active) setMembers(live);
        } catch { /* noop */ }
      };

      await refresh();
      heartbeat = setInterval(beat, HEARTBEAT_MS);
      poll = setInterval(refresh, HEARTBEAT_MS);
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
  }, [room]);

  return { members, me };
}