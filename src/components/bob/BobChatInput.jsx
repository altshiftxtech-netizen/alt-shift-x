import React, { useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";

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
function BobChatInput({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Ask BOB anything…",
  autoFocus = false,
  clearSignal = 0,
  minHeight = 52,
  maxHeight = 200,
  disabled = false,
  showToolbar = false,
}) {
  const ref = useRef(null);

  // Auto-grow the textarea to fit its content (up to maxHeight). Runs inside
  // requestAnimationFrame so a mobile keyboard open/close re-layout can't leave
  // the box stuck at a stale, broken height (the Android/iOS scramble bug).
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    });
  };

  useEffect(() => { resize(); }, [value]);
  // Re-fit on viewport changes (mobile keyboard show/hide, rotation) so the
  // composer never gets wedged at the wrong size after the keyboard closes.
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
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
    <div className="w-full">
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
      {showToolbar && !disabled && (
        <MarkdownToolbar textareaRef={ref} value={value} onChange={onChange} />
      )}
    </div>
  );
}

export default React.memo(BobChatInput);