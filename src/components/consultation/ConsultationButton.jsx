import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Calendar } from "lucide-react";

const PRE_ALPHA_BUILDER_ID = "6a19363c90f06323c4cfff74";

/**
 * Schedule Consultation button — pre-alpha visibility.
 * Visible only to the pre-alpha builder, Sovereign-tier members, and admins.
 * Renders null when the user doesn't qualify, so it's safe to drop into any header.
 */
export default function ConsultationButton({ className = "", skipBilling = false }) {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setVisible(true); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const isSovereign = sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status);
        setVisible(isSovereign || user.id === PRE_ALPHA_BUILDER_ID);
      } catch {
        setVisible(false);
      }
    })();
  }, []);

  if (!visible) return null;

  const target = skipBilling
    ? `/consultation?no_billing=true&return_to=${returnTo}`
    : `/consultation?return_to=${returnTo}`;

  return (
    <Link
      to={target}
      className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5 transition-all shrink-0 text-[#E6C878] bg-[#C8A95B]/15 border border-[#C8A95B]/40 hover:bg-[#C8A95B]/25 hover:border-[#C8A95B]/60 backdrop-blur-md shadow-[0_0_10px_rgba(200,169,91,0.35),inset_0_0_6px_rgba(200,169,91,0.15)]"
    >
      <Calendar className="w-3.5 h-3.5" /> Schedule Consultation
    </Link>
  );
}