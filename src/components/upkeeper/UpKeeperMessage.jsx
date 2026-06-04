import React from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import MessageActions from "@/components/upkeeper/MessageActions";

const AVATAR = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/3f9a15d43_generated_image.png";

// Peach-themed chat bubble for The UpKeeper.
export default function UpKeeperMessage({ m }) {
  const isUser = m.role === "user";
  const hasText = typeof m.content === "string" && m.content.trim().length > 0;
  const runningTools = (m.tool_calls || []).filter(
    (t) => !t.status || ["pending", "in_progress", "running"].includes(t.status)
  );

  // Assistant message that's mid-work (running a tool, no text yet) — show a
  // "working" indicator instead of a blank empty bubble.
  if (!isUser && !hasText) {
    if (runningTools.length === 0) return null; // nothing to show, avoid empty box
    return (
      <div className="flex items-start gap-2.5">
        <img src={AVATAR} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" alt="The UpKeeper" />
        <div className="bg-[#3a2a24] text-orange-200/80 px-4 py-3 rounded-2xl rounded-tl-sm text-xs flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
          Working… running diagnostics
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <img src={AVATAR} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" alt="The UpKeeper" />
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser ? "bg-orange-500 text-white rounded-tr-sm" : "bg-[#3a2a24] text-orange-50 rounded-tl-sm"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{m.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-headings:text-orange-100"
            components={{
              code: ({ inline, children }) => inline
                ? <code className="bg-[#4a352c] px-1 py-0.5 rounded text-orange-300 text-xs">{children}</code>
                : <pre className="bg-[#26190f] rounded-lg p-3 overflow-x-auto text-xs text-orange-300 my-2">{children}</pre>,
              p: ({ children }) => <p className="my-1">{children}</p>,
            }}
          >{m.content}</ReactMarkdown>
        )}
        {!isUser && hasText && <MessageActions text={m.content} />}
      </div>
    </div>
  );
}