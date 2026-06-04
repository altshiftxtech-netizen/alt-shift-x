import React, { useRef, useEffect } from "react";

/**
 * Prompt editor for BOB.
 *
 * Implemented as a plain controlled <textarea> for rock-solid reliability:
 * typed text is always visible, clears cleanly after send, and never gets wiped
 * by React re-renders (the previous contentEditable approach did). BOB receives
 * plain text, so rich formatting was never actually used downstream.
 *
 * Public API is unchanged so callers don't need edits:
 *   value, onChange(text, html), onSubmit, placeholder, minHeight, maxHeight,
 *   autoFocus, disabled, clearSignal
 */
export default function RichPromptEditor({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Start typing your prompt... (Ctrl+Enter to send)",
  minHeight = 160,
  maxHeight = 400,
  autoFocus = false,
  disabled = false,
  clearSignal = 0,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Parent bumps clearSignal after a successful send → restore focus so the
  // cursor stays in the box for the next prompt.
  useEffect(() => {
    if (clearSignal === 0) return;
    requestAnimationFrame(() => ref.current?.focus());
  }, [clearSignal]);

  const handleKeyDown = (e) => {
    // Ctrl+Enter / Cmd+Enter → send. Enter alone = new line.
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const text = value || "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isEmpty = charCount === 0;

  return (
    <div className="flex flex-col bg-slate-800/90 border border-slate-600 hover:border-violet-500 focus-within:border-violet-500 rounded-2xl shadow-2xl transition-all overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900/60">
        <span className="text-[11px] text-slate-500 font-medium">Prompt</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">{wordCount}w · {charCount}c</span>
          {!isEmpty && (
            <button
              type="button"
              onClick={() => { onChange?.("", ""); ref.current?.focus(); }}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={text}
        disabled={disabled}
        spellCheck
        onChange={(e) => onChange?.(e.target.value, e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm leading-relaxed px-4 py-3.5 resize-none"
        style={{ minHeight, maxHeight, caretColor: "#a78bfa" }}
      />

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/40">
        <span className="text-[10px] text-slate-600">Enter = new line &nbsp;·&nbsp; Ctrl+Enter = send</span>
        <span className="text-[10px] text-slate-600">Spellcheck active</span>
      </div>
    </div>
  );
}