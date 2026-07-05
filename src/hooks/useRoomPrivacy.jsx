import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Reads the current user's saved Speakeasy privacy preferences:
 * - `alias`: an optional alias name shown instead of their real name (identity protection).
 * - `ghostMode`: when true, hides their bubble in rooms (and hides everyone else from them).
 *
 * These are persisted on the user via base44.auth.updateMe (speakeasy_alias / speakeasy_ghost_mode).
 */
export default function useRoomPrivacy() {
  const [privacy, setPrivacy] = useState({ alias: "", ghostMode: false, loaded: false });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!active) return;
        setPrivacy({
          alias: user?.speakeasy_alias || "",
          ghostMode: !!user?.speakeasy_ghost_mode,
          loaded: true,
        });
      } catch {
        if (active) setPrivacy((p) => ({ ...p, loaded: true }));
      }
    })();
    return () => { active = false; };
  }, []);

  return privacy;
}