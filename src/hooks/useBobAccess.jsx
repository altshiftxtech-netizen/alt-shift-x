import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Determines whether the current builder is on a paying plan.
// Paying builders unlock document downloads (PDF / Word / CSV exports).
// Free-tier builders keep full build + direct-upload access, but downloads are gated.
export default function useBobAccess() {
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isSovereign, setIsSovereign] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setIsPaying(true); setIsSovereign(true); setLoading(false); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const paying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        setIsPaying(!!paying);
        setIsSovereign(!!(paying && sub.plan === "enterprise"));
      } catch {
        setIsPaying(false);
        setIsSovereign(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, isPaying, isSovereign };
}