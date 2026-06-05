import React from "react";
import { Award } from "lucide-react";

/**
 * ResidentDeveloperBadge — shown on a builder's public webpage (profile),
 * NOT on their individual products. Renders only when the builder is flagged
 * as a Resident Developer in their UserAdminProfile.
 */
export default function ResidentDeveloperBadge({ size = "default", className = "" }) {
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };
  const icon = { sm: "w-3 h-3", default: "w-3.5 h-3.5", lg: "w-4 h-4" }[size] || "w-3.5 h-3.5";

  return (
    <span
      title="Resident Developer — officially recognized member of the developer corps"
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ${sizes[size] || sizes.default} ${className}`}
    >
      <Award className={icon} />
      Resident Developer
    </span>
  );
}