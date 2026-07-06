import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { FOUNDER_LORE_CODE, CINEMA_CODE } from "@/components/speakeasy/lore/founderLore";

/**
 * Resolves the current user's FounderLore entitlements:
 *   loreUnlocked   — owns SPEAKEASY-FOUNDER-LORE-1.0 (the $499 unlock).
 *   cinemaUnlocked — owns FOUNDER-CINEMA-BLUEPRINT-1.0 (the $999 Director's Cut).
 * Admins always pass. Exposes refresh() to re-check after a purchase returns.
 */
export default function useFounderLore() {
  const [loading, setLoading] = useState(true);
  const [loreUnlocked, setLoreUnlocked] = useState(false);
  const [cinemaUnlocked, setCinemaUnlocked] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin") {
        setLoreUnlocked(true);
        setCinemaUnlocked(true);
        return;
      }
      const owned = await base44.entities.InstalledComponent.filter({ user_id: user.id });
      const codes = new Set((owned || []).map((c) => c.component_code));
      setLoreUnlocked(codes.has(FOUNDER_LORE_CODE));
      setCinemaUnlocked(codes.has(CINEMA_CODE));
    } catch {
      setLoreUnlocked(false);
      setCinemaUnlocked(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return { loading, loreUnlocked, cinemaUnlocked, refresh: check };
}