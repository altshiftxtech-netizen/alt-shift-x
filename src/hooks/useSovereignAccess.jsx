import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Sovereign-tier access resolver for /enterprise.
 * status: "loading" | "guest" | "denied" | "sovereign"
 * isAdmin — admins always pass and get the admin-side handshake controls.
 */
export default function useSovereignAccess() {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // canPipelines — a looser gate for the Exclusive Pipelines tab: ANY paying
  // subscriber (not only Enterprise) may browse & license pipelines. Admins pass.
  const [canPipelines, setCanPipelines] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role === "admin") { setIsAdmin(true); setCanPipelines(true); setStatus("sovereign"); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: me.id });
        const sub = subs[0];
        const active = sub && ["active", "trialing", "past_due"].includes(sub.status);
        setCanPipelines(!!(active && sub.plan !== "free"));
        const sovereign = active && sub.plan === "enterprise";
        setStatus(sovereign ? "sovereign" : "denied");
      } catch {
        setStatus("guest");
      }
    })();
  }, []);

  return { status, user, isAdmin, canPipelines };
}