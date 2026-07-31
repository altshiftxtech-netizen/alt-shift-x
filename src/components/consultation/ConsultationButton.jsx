import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Calendar } from "lucide-react";

const PRE_ALPHA_BUILDER_ID = "6a19363c90f06323c4cfff74";

/**
 * Schedule Consultation button — pre-alpha visibility.
 * Visible only to the pre-alpha builder, Sovereign-tier members, and admins.
 * Renders null when the user doesn't qualify, so it's safe to drop into any header.
 */
export default function ConsultationButton({ className = "" }) {
  const [visible, setVisible] = useState(false);

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

  return (
    <Link
      to="/consultation"
      className={`flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5 transition-all bg-gradient-to-r from-[#C8A95B] to-[#E6C878] text-[#0A0A0C] hover:opacity-90 shadow-sm shrink-0 ${className}`}
    >
      <Calendar className="w-3.5 h-3.5" /> Schedule Consultation
    </Link>
  );
}