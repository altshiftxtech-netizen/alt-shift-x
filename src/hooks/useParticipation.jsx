import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads the current member's participation standing and exposes an `award`
 * helper that calls the wholesome points backend. Used across the Social feed
 * so posting, thoughtful replies, and giving appreciation grant recognition.
 */
export default function useParticipation() {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leveledUpTo, setLeveledUpTo] = useState(null); // set when an award crosses a tier

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const rows = await base44.entities.ParticipationScore.filter({ user_id: user.id });
      setScore(rows[0] || { points: 0, level: "Newcomer", user_name: user.full_name || user.email });
    } catch {
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // action: "post" | "reply" | "appreciate". Returns the backend result.
  const award = useCallback(async (action, text) => {
    try {
      const res = await base44.functions.invoke("awardParticipation", { action, text });
      if (res.data?.leveled_up && res.data?.level) setLeveledUpTo(res.data.level);
      await load();
      return res.data;
    } catch {
      return null;
    }
  }, [load]);

  return { score, loading, award, reload: load, leveledUpTo, clearLevelUp: () => setLeveledUpTo(null) };
}