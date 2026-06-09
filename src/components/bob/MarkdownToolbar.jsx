import React from "react";
import { Bold, Italic, Code, List, ListOrdered, Heading, Quote, Link2 } from "lucide-react";

/**
 * MarkdownToolbar — power-user formatting for BOB's chat input.
 *
 * Lightweight: it only inserts plain-text markdown markers into the existing
 * textarea (no contentEditable). Works against a textarea ref so it can wrap
 * the current selection or drop a marker at the caret.
 *
 * Props:
 *  - textareaRef: ref to the underlying <textarea>
 *  - value: current text
 *  - onChange(newText): commit the edited text
 */
const WRAPS = [
  { icon: Bold, title: "Bold", before: "**", after: "**", ph: "bold" },
  { icon: Italic, title: "Italic", before: "_", after: "_", ph: "italic" },
  { icon: Code, title: "Inline code", before: "`", after: "`", ph: "code" },
  { icon: Quote, title: "Quote", before: "> ", after: "", ph: "quote", line: true },
  { icon: Heading, title: "Heading", before: "## ", after: "", ph: "Heading", line: true },
  { icon: List, title: "Bullet list", before: "- ", after: "", ph: "item", line: true },
  { icon: ListOrdered, title: "Numbered list", before: "1. ", after: "", ph: "item", line: true },
  { icon: Link2, title: "Link", before: "[", after: "](url)", ph: "text" },
];

function MarkdownToolbar({ textareaRef, value = "", onChange }) {
  const apply = (tool) => {
    const el = textareaRef?.current;
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    const selected = value.slice(start, end) || tool.ph;

    // Line-prefix tools (lists, quote, heading) anchor to the start of the line.
    let insertStart = start;
    if (tool.line) {
      insertStart = value.lastIndexOf("\n", start - 1) + 1;
    }

    const newText =
      tool.line
        ? value.slice(0, insertStart) + tool.before + value.slice(insertStart, end) + tool.after + value.slice(end)
        : value.slice(0, start) + tool.before + selected + tool.after + value.slice(end);

    onChange?.(newText);

    // Restore focus + place caret inside the inserted markers.
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const caret = tool.line
        ? end + tool.before.length
        : start + tool.before.length + selected.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="flex items-center gap-0.5 px-1 pb-1.5">
      {WRAPS.map((tool, i) => (
        <button
          key={i}
          type="button"
          title={tool.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => apply(tool)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-violet-300 hover:bg-slate-700/70 transition-colors"
        >
          <tool.icon className="w-3.5 h-3.5" />
        </button>
      ))}
      <span className="ml-1.5 text-[10px] text-slate-600 font-mono hidden sm:inline">markdown</span>
    </div>
  );
}

export default React.memo(MarkdownToolbar);