import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold, Italic, Underline, Type, Palette, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Code2, Trash2, ChevronDown
} from "lucide-react";

const FONT_COLORS = [
  { label: "White", value: "#f1f5f9" },
  { label: "Violet", value: "#a78bfa" },
  { label: "Cyan", value: "#67e8f9" },
  { label: "Emerald", value: "#6ee7b7" },
  { label: "Amber", value: "#fcd34d" },
  { label: "Rose", value: "#fda4af" },
  { label: "Sky", value: "#7dd3fc" },
  { label: "Orange", value: "#fdba74" },
];

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32"];

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-md transition-all text-xs font-medium select-none
        ${active
          ? "bg-violet-600 text-white shadow-inner"
          : "text-slate-400 hover:text-white hover:bg-slate-700"
        }`}
    >
      {children}
    </button>
  );
}

export default function RichPromptEditor({
  value,
  onChange,
  onSubmit,
  placeholder = "Start typing your prompt... (Ctrl+Enter to send)",
  minHeight = 160,
  maxHeight = 400,
  autoFocus = false,
  disabled = false,
}) {
  const editorRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({});

  // Sync external value → innerHTML on first mount or when cleared externally
  const lastSyncedValue = useRef(null);
  useEffect(() => {
    if (!editorRef.current) return;
    if (value === "" && lastSyncedValue.current !== "") {
      editorRef.current.innerHTML = "";
      lastSyncedValue.current = "";
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const updateCounts = useCallback(() => {
    const text = editorRef.current?.innerText || "";
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || "";
    const text = editorRef.current?.innerText || "";
    lastSyncedValue.current = text;
    onChange(text, html);
    updateCounts();
    updateActiveFormats();
  }, [onChange, updateCounts, updateActiveFormats]);

  const handleKeyDown = useCallback((e) => {
    // Ctrl+Enter or Cmd+Enter → submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
      return;
    }
    // Enter alone = new line (default contenteditable behavior) — do NOT submit
    updateActiveFormats();
  }, [onSubmit, updateActiveFormats]);

  const execCmd = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
    updateActiveFormats();
  }, [handleInput, updateActiveFormats]);

  const applyColor = useCallback((color) => {
    execCmd("foreColor", color);
    setShowColorPicker(false);
  }, [execCmd]);

  const applyFontSize = useCallback((size) => {
    // execCommand fontSize uses 1-7, so we use a workaround with span
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("fontSize", false, "7");
      // Find all font size=7 and replace with span with actual px
      const fonts = editorRef.current.querySelectorAll('font[size="7"]');
      fonts.forEach(f => {
        const span = document.createElement("span");
        span.style.fontSize = size + "px";
        span.innerHTML = f.innerHTML;
        f.replaceWith(span);
      });
    }
    setShowFontSize(false);
    handleInput();
  }, [handleInput]);

  const clearAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      lastSyncedValue.current = "";
      onChange("", "");
      updateCounts();
      editorRef.current.focus();
    }
  }, [onChange, updateCounts]);

  const isEmpty = wordCount === 0;

  return (
    <div className="flex flex-col bg-slate-800/90 border border-slate-600 hover:border-violet-500 focus-within:border-violet-500 rounded-2xl shadow-2xl transition-all overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-700 bg-slate-900/60 flex-wrap">
        {/* Text formatting */}
        <ToolbarBtn onClick={() => execCmd("bold")} active={activeFormats.bold} title="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd("italic")} active={activeFormats.italic} title="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd("underline")} active={activeFormats.underline} title="Underline (Ctrl+U)">
          <Underline className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-600 mx-1" />

        {/* Lists */}
        <ToolbarBtn onClick={() => execCmd("insertUnorderedList")} active={activeFormats.insertUnorderedList} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd("insertOrderedList")} active={activeFormats.insertOrderedList} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-600 mx-1" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => execCmd("justifyLeft")} title="Align Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd("justifyCenter")} title="Align Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd("justifyRight")} title="Align Right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-600 mx-1" />

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); setShowFontSize(v => !v); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-xs"
            title="Font Size"
          >
            <Type className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showFontSize && (
            <div className="absolute top-8 left-0 z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-2 grid grid-cols-4 gap-1 w-36">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); applyFontSize(s); }}
                  className="text-xs text-slate-300 hover:text-white hover:bg-violet-700 px-2 py-1 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); setShowColorPicker(v => !v); setShowFontSize(false); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-xs"
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showColorPicker && (
            <div className="absolute top-8 left-0 z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-3 flex flex-wrap gap-2 w-48">
              <p className="w-full text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Text Color</p>
              {FONT_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); applyColor(c.value); }}
                  title={c.label}
                  className="w-7 h-7 rounded-lg border-2 border-transparent hover:border-white transition-all hover:scale-110"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-600 mx-1" />

        {/* Code block */}
        <ToolbarBtn onClick={() => execCmd("formatBlock", "pre")} title="Code Block">
          <Code2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Word count */}
        <span className="text-[10px] text-slate-500 mr-2">{wordCount}w · {charCount}c</span>

        {/* Clear */}
        {!isEmpty && (
          <ToolbarBtn onClick={clearAll} title="Clear all">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </ToolbarBtn>
        )}
      </div>

      {/* Editable area */}
      <div className="relative flex-1">
        {isEmpty && (
          <div className="absolute top-0 left-0 px-4 py-3.5 text-slate-500 text-sm pointer-events-none select-none leading-relaxed">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          spellCheck
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          className="w-full outline-none text-slate-100 text-sm leading-relaxed px-4 py-3.5 overflow-y-auto"
          style={{
            minHeight,
            maxHeight,
            caretColor: "#a78bfa",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </div>

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/40">
        <span className="text-[10px] text-slate-600">Enter = new line &nbsp;·&nbsp; Ctrl+Enter = send</span>
        <span className="text-[10px] text-slate-600">Spellcheck active · Supports bold, italic, color, lists</span>
      </div>
    </div>
  );
}