import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * SiteContentBlock — renders an active SiteContent record by key, or nothing
 * if the record is missing/inactive. Body is rendered as Markdown. Pass
 * `short` to prefer the body_short field (for banners/footers).
 *
 * The wrapper (className) is only rendered when there's active content, so
 * empty keys leave zero layout footprint.
 */
export default function SiteContentBlock({ contentKey, short = false, className = "", as: Wrapper = "div" }) {
  const content = useSiteContent(contentKey);
  if (!content) return null;

  const text = short ? (content.body_short || content.body) : (content.body || content.body_short);
  if (!text) return null;

  return (
    <Wrapper className={className}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose prose-sm max-w-none">{text}</ReactMarkdown>
    </Wrapper>
  );
}