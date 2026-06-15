import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const VISIT_KEY = "asx_visit_count";
const ACCEPTED_KEY = "asx_newsletter_accepted";

// Show on the 1st visit, then every 3rd visit after (visits 1, 3, 5, 7, …),
// until the visitor subscribes. Visit count persists in localStorage.
function shouldShowThisVisit() {
  if (localStorage.getItem(ACCEPTED_KEY) === "true") return false;
  const prev = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) || 0;
  const visit = prev + 1;
  localStorage.setItem(VISIT_KEY, String(visit));
  // visit 1, then every other visit (odd visits): 1, 3, 5, 7...
  return visit === 1 || visit % 2 === 1;
}

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  useEffect(() => {
    // Decide once on mount, then reveal after a short delay so it doesn't fight page load.
    if (shouldShowThisVisit()) {
      const t = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => setOpen(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim() });
      localStorage.setItem(ACCEPTED_KEY, "true");
      setState("done");
      setTimeout(() => setOpen(false), 2200);
    } catch (err) {
      setState("error");
      setError("Something went wrong. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Get the inside track</h2>
          <p className="text-violet-100 text-sm mt-1.5 max-w-xs mx-auto">
            New components, platform updates, and subscriber-only offers — straight to your inbox.
          </p>
        </div>

        <div className="px-6 py-6">
          {state === "done" ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-900">You're on the list!</p>
              <p className="text-sm text-slate-500 mt-1">Watch your inbox for what's next.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "loading"}
                className="h-11"
                autoFocus
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                type="submit"
                disabled={state === "loading"}
                className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2"
              >
                {state === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Subscribe
              </Button>
              <button
                type="button"
                onClick={close}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-1"
              >
                Maybe later
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-snug">
                We respect your privacy. Unsubscribe anytime from any email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}