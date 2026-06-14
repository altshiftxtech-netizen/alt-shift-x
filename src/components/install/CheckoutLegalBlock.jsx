import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * CheckoutLegalBlock — the legal content rendered around the checkout buttons:
 *   - checkout_terms_summary      (summary of key terms, above the button)
 *   - checkout_refund_notice      (short refund notice, near the button)
 *   - sanctions_checkout_checkbox (MANDATORY acknowledgment — blocks checkout)
 *
 * The sanctions checkbox is unchecked by default; the parent disables the
 * payment buttons until `sanctionsAck` is true.
 */
export default function CheckoutLegalBlock({ sanctionsAck, onSanctionsAckChange }) {
  const termsSummary = useSiteContent("checkout_terms_summary");
  const refundNotice = useSiteContent("checkout_refund_notice");
  const sanctionsCheckbox = useSiteContent("sanctions_checkout_checkbox");

  const sanctionsText =
    (sanctionsCheckbox && (sanctionsCheckbox.body_short || sanctionsCheckbox.body)) ||
    "I confirm I am not subject to trade sanctions under OFAC, EU, UK OFSI, UN, or NATO-aligned programs, and I am not located in a sanctioned country.";

  return (
    <div className="space-y-3">
      {termsSummary && (
        <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3 [&_p]:m-0">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {termsSummary.body_short || termsSummary.body}
          </ReactMarkdown>
        </div>
      )}

      {refundNotice && (
        <div className="text-[11px] text-slate-500 leading-relaxed [&_p]:m-0">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {refundNotice.body_short || refundNotice.body}
          </ReactMarkdown>
        </div>
      )}

      {/* Mandatory sanctions acknowledgment — checkout blocked until checked */}
      <label className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!sanctionsAck}
          onChange={(e) => onSanctionsAckChange(e.target.checked)}
          className="mt-0.5 shrink-0"
          required
        />
        <span className="text-[11px] text-amber-900 leading-relaxed [&_p]:m-0">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sanctionsText}</ReactMarkdown>
        </span>
      </label>
    </div>
  );
}

/**
 * CheckoutLegalBlock.Links — the checkout_legal_links content (ToS, Refund
 * Policy, Export Controls links + Stripe notice), rendered below the payment
 * buttons.
 */
function CheckoutLegalLinks() {
  const links = useSiteContent("checkout_legal_links");
  if (!links) return null;
  return (
    <div className="text-[11px] text-slate-400 leading-relaxed [&_a]:text-violet-600 [&_a]:underline [&_p]:m-0">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{links.body_short || links.body}</ReactMarkdown>
    </div>
  );
}

CheckoutLegalBlock.Links = CheckoutLegalLinks;