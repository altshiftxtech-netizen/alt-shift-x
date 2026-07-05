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

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role === "admin") { setIsAdmin(true); setStatus("sovereign"); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: me.id });
        const sub = subs[0];
        const sovereign = sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status);
        setStatus(sovereign ? "sovereign" : "denied");
      } catch {
        setStatus("guest");
      }
    })();
  }, []);

  return { status, user, isAdmin };
}