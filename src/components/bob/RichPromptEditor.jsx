import React, { useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from "lucide-react";

/**
 * Prompt editor for BOB.
 *
 * A plain controlled <textarea> for rock-solid reliability — it never freezes,
 * never drops the caret, and handles very large text without lag (a previous
 * contentEditable version stuttered and mis-synced on big pastes/replies).
 *
 * The formatting toolbar wraps the current selection with lightweight markdown
 * markers (**bold**, *italic*, etc.), which BOB reads natively as plain text —
 * so the parent still receives plain text and nothing downstream changes.
 *
 * Public API unchanged: value, onChange(text), onSubmit, placeholder,
 * minHeight, maxHeight, autoFocus, clearSignal.
 */
const TOOLS = [
  { key: "bold", icon: Bold, title: "Bold", wrap: ["**", "**"] },
  { key: "italic", icon: Italic, title: "Italic", wrap: ["*", "*"] },
  { key: "underline", icon: Underline, title: "Underline", wrap: ["__", "__"] },
  { key: "strike", icon: Strikethrough, title: "Strikethrough", wrap: ["~~", "~~"] },
  { key: "ul", icon: List, title: "Bullet list", line: "- " },
  { key: "ol", icon: ListOrdered, title: "Numbered list", line: "1. " },
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

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Parent bumps clearSignal after a successful send → restore focus.
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

  // Apply a formatting tool to the current textarea selection.
  const applyTool = (tool) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const v = value || "";

    let next;
    let caretStart;
    let caretEnd;

    if (tool.wrap) {
      const [open, close] = tool.wrap;
      const selected = v.slice(start, end) || "text";
      next = v.slice(0, start) + open + selected + close + v.slice(end);
      caretStart = start + open.length;
      caretEnd = caretStart + selected.length;
    } else if (tool.line) {
      // Prefix the start of each selected line (or the current line).
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const before = v.slice(0, lineStart);
      const block = v.slice(lineStart, end);
      const prefixed = block.length
        ? block.split("\n").map((ln) => tool.line + ln).join("\n")
        : tool.line;
      next = before + prefixed + v.slice(end);
      caretStart = lineStart + prefixed.length;
      caretEnd = caretStart;
    }

    onChange?.(next);
    requestAnimationFrame(() => {
      el.focus();
      try { el.setSelectionRange(caretStart, caretEnd); } catch {}
    });
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
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                type="button"
                title={tool.title}
                onMouseDown={(e) => { e.preventDefault(); applyTool(tool); }}
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">{wordCount}w · {charCount}c</span>
          {!isEmpty && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange?.(""); ref.current?.focus(); }}
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
        spellCheck
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm leading-relaxed px-4 py-3.5 resize-none"
        style={{ minHeight, maxHeight, caretColor: "#a78bfa" }}
      />

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/40">
        <span className="text-[10px] text-slate-600">Enter = new line &nbsp;·&nbsp; Ctrl+Enter = send</span>
        <span className="text-[10px] text-slate-600">Bold · Italic · Lists</span>
      </div>
    </div>
  );
}