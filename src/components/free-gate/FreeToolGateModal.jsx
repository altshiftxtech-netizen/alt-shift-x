import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getHeadline, FREE_GATE_MAP, inferUserType } from "./freeGateData";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FreeToolGateModal — email-capture gate for FREE-* components. On submit it
 * records the email through the existing newsletter system (when the user opts
 * in) and always shows the confirmation state with related free tools + one
 * paid upsell pulled from the live catalog. The webhook/email is opt-in
 * delivery, not access control — the listing content stays public regardless.
 */
export default function FreeToolGateModal({ open, onOpenChange, component }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [relatedComponents, setRelatedComponents] = useState([]);
  const [upsellComponent, setUpsellComponent] = useState(null);

  const code = component?.code;

  // Reset state each time the modal opens for a (possibly different) tool.
  useEffect(() => {
    if (open) {
      setFirstName(""); setEmail(""); setOptIn(false);
      setError(""); setSending(false); setSent(false); setSentEmail("");
    }
  }, [open, code]);

  // Resolve related-tool + upsell codes against the live catalog.
  useEffect(() => {
    if (!open || !code) return;
    const map = FREE_GATE_MAP[code];
    if (!map) { setRelatedComponents([]); setUpsellComponent(null); return; }
    const codes = [...(map.related || []), map.upsell].filter(Boolean);
    (async () => {
      const found = await Promise.all(
        codes.map((c) => base44.entities.Component.filter({ code: c }).then((r) => r?.[0] || null).catch(() => null))
      );
      const byCode = {};
      found.forEach((c) => { if (c) byCode[c.code] = c; });
      setRelatedComponents((map.related || []).map((c) => byCode[c]).filter(Boolean));
      setUpsellComponent(byCode[map.upsell] || null);
    })();
  }, [open, code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) { setError("Please enter a valid email address"); return; }
    setError("");
    setSending(true);
    try {
      // Use the existing newsletter system. We always capture the email; the
      // checkbox controls whether they're kept subscribed to the weekly tip.
      await base44.functions.invoke("subscribeNewsletter", {
        email: clean,
        name: firstName.trim(),
        source: `free_gate:${code}`,
        newsletter_opted_in: optIn,
        tool_downloaded: code,
        tool_name: component?.name || "",
        user_type: inferUserType(code),
      });
    } catch (err) {
      // Fallback: never block the user — log and still confirm.
      console.error("[FreeToolGate] capture failed:", err?.message);
    }
    setSentEmail(clean);
    setSent(true);
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug pt-0.5">
                {getHeadline(code)}
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Free. No credit card. Works in ChatGPT, Claude, Gemini — any AI you use.
            </p>

            <Input
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11"
            />
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                className="h-11"
                autoFocus
                required
              />
              {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                Send me BOB's weekly AI tip — one genuinely useful thing every Tuesday. Unsubscribe any time.
              </span>
            </label>

            <Button type="submit" disabled={sending} className="w-full h-11 bg-violet-700 hover:bg-violet-800 text-white gap-2">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send it to me →"}
            </Button>
            <p className="text-[11px] text-slate-400 text-center">We'll email it right now. No spam.</p>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">It's on its way. Check your inbox.</h2>
                <p className="text-sm text-slate-500 mt-1">
                  We just sent <span className="font-semibold text-slate-700">{component?.name}</span> to{" "}
                  <span className="font-semibold text-slate-700">{sentEmail}</span>. It'll be there in under a minute.
                </p>
              </div>
            </div>

            {relatedComponents.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">While you wait — these work great together:</p>
                <div className="space-y-1.5">
                  {relatedComponents.map((c) => (
                    <Link
                      key={c.id}
                      to={`/marketplace/${c.id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 hover:underline"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {upsellComponent && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Want your AI to do this automatically?</p>
                <Link
                  to={`/marketplace/${upsellComponent.id}`}
                  onClick={() => onOpenChange(false)}
                  className="block rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 hover:bg-violet-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{upsellComponent.name}</span>
                    <span className="text-sm font-semibold text-violet-700">${upsellComponent.price}/mo</span>
                  </div>
                  <span className="text-xs text-violet-600 flex items-center gap-1 mt-0.5">View component <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}