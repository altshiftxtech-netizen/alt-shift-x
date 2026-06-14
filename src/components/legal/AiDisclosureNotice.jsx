import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/**
 * AiDisclosureNotice — short AI disclosure shown on the marketplace and each
 * component page. variant "light" for dark surfaces, "dark" for light pages.
 */
export default function AiDisclosureNotice({ variant = "dark", className = "" }) {
  const styles =
    variant === "light"
      ? "bg-white/10 border-white/20 text-white/70"
      : "bg-amber-50 border-amber-200 text-amber-800";
  const linkCls = variant === "light" ? "text-white underline" : "text-amber-900 underline";

  return (
    <div className={`flex items-start gap-2 rounded-xl border px-4 py-2.5 text-[11px] leading-relaxed ${styles} ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>
        All Components are AI-powered tools. Outputs are probabilistic and not a substitute for professional advice.{" "}
        <Link to="/legal/ai-disclosure" className={linkCls}>AI Disclosure Policy →</Link>
      </span>
    </div>
  );
}