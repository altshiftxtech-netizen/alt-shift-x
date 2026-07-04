import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Two-tier BOB² resolver.
 *  - "apex"  → full catalog (Speakeasy Business Center or any Speakeasy member)
 *  - "light" → NDA + SaaS-MSA only (builder dashboard route, non-member)
 *
 * Rule: the /biz-center (Speakeasy) route is always Apex. On other routes we
 * default to Light, but upgrade to Apex if the user is a Speakeasy member
 * (a paying, non-free active subscription — the Speakeasy membership gate).
 */
export default function useBobTier() {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isSpeakeasyRoute = path.startsWith("/biz-center") || path.startsWith("/speakeasy");
  const [tier, setTier] = useState(isSpeakeasyRoute ? "apex" : "light");
  const [resolving, setResolving] = useState(!isSpeakeasyRoute);

  useEffect(() => {
    if (isSpeakeasyRoute) return; // already Apex — no need to check
    let alive = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { if (alive) setTier("apex"); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const member = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        if (alive && member) setTier("apex");
      } catch { /* guest → stays light */ }
      finally { if (alive) setResolving(false); }
    })();
    return () => { alive = false; };
  }, [isSpeakeasyRoute]);

  return { tier, isApex: tier === "apex", resolving };
}

// Templates a Light BOB² is allowed to draft.
export const LIGHT_TEMPLATE_KEYS = ["nda", "software_license"];