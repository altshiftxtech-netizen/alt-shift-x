import React from "react";

/**
 * DevNavChrome — wraps the nav in an IDE / terminal "window chrome" aesthetic.
 * Used on pages WITHOUT the background video so tech folks feel at home:
 * traffic-light window dots, a mono breadcrumb "path bar", and a code-editor frame.
 */
export default function DevNavChrome({ pathLabel = "~/altshiftx", children }) {
  return (
    <div className="bg-[#0d1117] border-b border-[#1f2733] shadow-[0_1px_0_0_#30363d] font-mono">
      {/* Title bar — traffic lights + window path */}
      <div className="flex items-center gap-2 px-4 h-7 bg-[#161b22] border-b border-[#1f2733]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 text-[11px] text-[#7d8590] tracking-tight select-none">
          <span className="text-[#3fb950]">●</span> altshiftx — zsh —
          <span className="text-[#58a6ff]"> {pathLabel}</span>
        </span>
        <span className="ml-auto text-[10px] text-[#484f58] tracking-widest hidden sm:inline">
          UTF-8 · LF · main
        </span>
      </div>
      {/* The actual nav content rendered in IDE skin */}
      {children}
    </div>
  );
}