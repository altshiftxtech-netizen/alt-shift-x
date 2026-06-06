import React, { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from "lucide-react";

/**
 * Rich prompt editor for BOB.
 *
 * A contentEditable surface with a formatting toolbar (bold, italic, underline,
 * strikethrough, bullet & numbered lists). The parent still receives PLAIN TEXT
 * via onChange (BOB consumes plain text), so nothing downstream changes.
 *
 * Reliability rules that keep it from ever "freezing":
 *  - It is NEVER disabled. The editor stays interactive even while BOB replies,
 *    so the builder can always type/queue the next prompt.
 *  - We only push the parent's `value` into the DOM when they genuinely differ
 *    (e.g. external clear / voice transcript), so typing is never interrupted
 *    by a re-render wiping the caret.
 *
 * Public API unchanged: value, onChange(text), onSubmit, placeholder,
 * minHeight, maxHeight, autoFocus, clearSignal.
 */
const TOOLS = [
  { cmd: "bold", icon: Bold, title: "Bold (Ctrl+B)" },
  { cmd: "italic", icon: Italic, title: "Italic (Ctrl+I)" },
  { cmd: "underline", icon: Underline, title: "Underline (Ctrl+U)" },
  { cmd: "strikeThrough", icon: Strikethrough, title: "Strikethrough" },
  { cmd: "insertUnorderedList", icon: List, title: "Bullet list" },
  { cmd: "insertOrderedList", icon: ListOrdered, title: "Numbered list" },
];

export default function RichPromptEditor({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Start typing your prompt... (Ctrl+Enter to send)",
  minHeight = 160,
  maxHeight = 400,
  autoFocus = false,
  clearSignal = 0,
}) {
  const ref = useRef(null);

  // Emit the editor's plain text up to the parent.
  const emit = useCallback(() => {
    if (!ref.current) return;
    onChange?.(ref.current.innerText || "");
  }, [onChange]);

  // Sync the parent value into the DOM ONLY when they actually differ, so normal
  // typing isn't disrupted (which would drop the caret and feel "frozen").
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if ((el.innerText || "") !== (value || "")) {
      el.innerText = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Parent bumps clearSignal after a successful send → restore focus.
  useEffect(() => {
    if (clearSignal === 0) return;
    requestAnimationFrame(() => ref.current?.focus());
  }, [clearSignal]);

  const exec = (cmd) => {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    emit();
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter / Cmd+Enter → send. Enter alone = new line.
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handlePaste = (e) => {
    // Paste as plain text so external rich formatting doesn't break the box.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  };

  const text = value || "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isEmpty = charCount === 0;

  return (
    <div className="flex flex-col bg-slate-800/90 border border-slate-600 hover:border-violet-500 focus-within:border-violet-500 rounded-2xl shadow-2xl transition-all overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700 bg-slate-900/60">
        <div className="flex items-center gap-0.5">
          {TOOLS.map(({ cmd, icon: Icon, title }) => (
            <button
              key={cmd}
              type="button"
              title={title}
              onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">{wordCount}w · {charCount}c</span>
          {!isEmpty && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange?.(""); if (ref.current) ref.current.innerText = ""; ref.current?.focus(); }}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Editable surface */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={emit}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="w-full bg-transparent outline-none text-slate-100 text-sm leading-relaxed px-4 py-3.5 overflow-y-auto whitespace-pre-wrap break-words rpe-editable"
        style={{ minHeight, maxHeight, caretColor: "#a78bfa" }}
      />

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/40">
        <span className="text-[10px] text-slate-600">Enter = new line &nbsp;·&nbsp; Ctrl+Enter = send</span>
        <span className="text-[10px] text-slate-600">Bold · Italic · Lists</span>
      </div>

      {/* Placeholder styling for the empty contentEditable */}
      <style>{`
        .rpe-editable:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
        .rpe-editable ul { list-style: disc; margin-left: 1.25rem; }
        .rpe-editable ol { list-style: decimal; margin-left: 1.25rem; }
      `}</style>
    </div>
  );
}