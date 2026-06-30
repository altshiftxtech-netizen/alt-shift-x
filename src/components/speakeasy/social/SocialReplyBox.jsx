import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Inline reply composer. Awards "reply" participation points (the backend
 * length-gates it so only substantive replies earn recognition).
 */
export default function SocialReplyBox({ parent, user, onReplied, award, groupId }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    await base44.entities.SpeakeasyPost.create({
      author_id: user.id,
      author_name: user.full_name || user.email,
      content: body,
      post_type: "text",
      parent_id: parent.id,
      ...(groupId ? { group_id: groupId } : {}),
      reactions: {},
    });
    await base44.entities.SpeakeasyPost.update(parent.id, { reply_count: (parent.reply_count || 0) + 1 });
    await award?.("reply", body);
    setText("");
    setSending(false);
    onReplied?.();
  };

  return (
    <div className="ml-6 flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder="Add something thoughtful…"
        className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40"
      />
      <button onClick={submit} disabled={!text.trim() || sending}
        className="p-2 rounded-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] disabled:opacity-40">
        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}