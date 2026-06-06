import React, { useRef, useEffect } from "react";

/**
 * BobChatInput — a clean, standard chat composer for BOB.
 *
 * Deliberately simple and familiar (like any modern chat box): a single
 * auto-growing textarea. Enter = send, Shift+Enter = new line. No heavy
 * toolbar/footer chrome — that's what made the old box "not like others".
 *
 * Controlled: value + onChange(text). onSubmit fires on Enter (no shift).
 * clearSignal: bump to refocus after a send.
 */
export default function BobChatInput({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Ask BOB anything…",
  autoFocus = false,
  clearSignal = 0,
  minHeight = 52,
  maxHeight = 200,
  disabled = false,
}) {
  const ref = useRef(null);

  // Auto-grow the textarea to fit its content (up to maxHeight).
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  useEffect(() => { resize(); }, [value]);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  useEffect(() => {
    if (clearSignal === 0) return;
    requestAnimationFrame(() => ref.current?.focus());
  }, [clearSignal]);

  const handleKeyDown = (e) => {
    // Enter = send, Shift+Enter = newline (the universal chat convention).
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <textarea
      ref={ref}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-slate-800/90 border border-slate-600 focus:border-violet-500 rounded-2xl outline-none text-slate-100 placeholder:text-slate-500 text-sm leading-relaxed px-4 py-3 resize-none transition-colors disabled:opacity-60"
      style={{ minHeight, maxHeight, caretColor: "#a78bfa" }}
    />
  );
}