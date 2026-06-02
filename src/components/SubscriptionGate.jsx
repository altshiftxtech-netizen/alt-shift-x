import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * SubscriptionGate — wraps any action that requires a paid subscription.
 * Free / trial users see an upgrade prompt instead.
 * Pass `builder={true}` to check for builder-tier subscription.
 */
export default function SubscriptionGate({ children, builder = false, action = "download" }) {
  const [status, setStatus] = useState("loading"); // loading | free | paid

  useEffect(() => {
    // Include trialing so builders in their grace period get full paid access.
    base44.entities.Subscription.filter({})
      .then(subs => {
        const activeSubs = (subs || []).filter(s => s.status === "active" || s.status === "trialing");
        if (activeSubs.length === 0) {
          setStatus("free");
        } else {
          const plan = activeSubs[0].plan || "";
          if (builder) {
            const builderPlans = ["base_operator", "strategic_architect", "sovereign_commander"];
            setStatus(builderPlans.includes(plan) ? "paid" : "free");
          } else {
            // Developer: free/trial = no paid sub
            const freePlans = ["free", "trial"];
            setStatus(freePlans.includes(plan) ? "free" : "paid");
          }
        }
      })
      .catch(() => setStatus("free"));
  }, []);

  if (status === "loading") return null;

  if (status === "free") {
    return (
      <div className="inline-flex items-center gap-2">
        <Link to="/pricing">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50">
            <Lock className="w-3 h-3" />
            {action === "download" ? "Subscribe to Download" : "Upgrade to Access"}
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}