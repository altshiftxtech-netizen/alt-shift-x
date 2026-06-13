import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * SiteContentBanner — a dismissible announcement banner driven by a
 * SiteContent key. Renders nothing if the record is missing/inactive or the
 * user has dismissed it this session. Uses body_short, falling back to body.
 *
 * variant: "light" (default) | "dark" (for dark hero/marketplace surfaces)
 */
export default function SiteContentBanner({ contentKey, variant = "light", className = "" }) {
  const content = useSiteContent(contentKey);
  const [dismissed, setDismissed] = useState(false);

  if (!content || dismissed) return null;
  const text = content.body_short || content.body;
  if (!text) return null;

  const styles =
    variant === "dark"
      ? "bg-white/10 border-white/20 text-white"
      : "bg-violet-50 border-violet-200 text-violet-900";

  return (
    <div className={`relative flex items-start gap-3 rounded-xl border px-4 py-3 ${styles} ${className}`}>
      <div className="flex-1 text-sm [&_p]:m-0">
        <ReactMarkdown className="prose prose-sm max-w-none">{text}</ReactMarkdown>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}