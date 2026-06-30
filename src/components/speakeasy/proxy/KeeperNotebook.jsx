import React, { useState, useEffect } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * A quiet, private "leave a word with the keeper" board in the Powder Room.
 * Notes are private to the member (and admins) — a calm place to drop a
 * suggestion or concern without broadcasting it to the whole room.
 */
export default function KeeperNotebook() {
  const [user, setUser] = useState(null);
  const [note, setNote] = useState("");
  const [mine, setMine] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async (me) => {
    if (!me) return;
    const rows = await base44.entities.PowderRoomNote.filter({ user_id: me.id }, "-created_date", 5);
    setMine(rows || []);
  };

  useEffect(() => {
    base44.auth.me().then((me) => { setUser(me); load(me); }).catch(() => {});
  }, []);

  const submit = async () => {
    const body = note.trim();
    if (!body || sending || !user) return;
    setSending(true);
    await base44.entities.PowderRoomNote.create({
      user_id: user.id, user_name: user.full_name || user.email, note: body, resolved: false,
    });
    setNote("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    await load(user);
    setSending(false);
  };

  return (
    <div className="rounded-2xl border-2 border-[#d4af37]/40 bg-white p-5 shadow-md mt-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b8973f] mb-1">Keeper's Notebook</p>
      <p className="text-[11px] text-[#2c2c2c]/60 mb-3">Leave a quiet word — a suggestion or concern. Only you and the keeper see it.</p>

      <div className="flex items-end gap-2">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={400}
          placeholder="Dear keeper…"
          className="flex-1 bg-[#faf8f3] border border-black/10 rounded-xl px-3 py-2 text-sm text-[#2c2c2c] placeholder:text-[#2c2c2c]/40 resize-none focus:outline-none focus:border-[#d4af37]" />
        <button onClick={submit} disabled={!note.trim() || sending}
          className="p-2.5 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8973f] text-white disabled:opacity-40 shrink-0">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {mine.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2c2c2c]/40">Your recent notes</p>
          {mine.map((n) => (
            <div key={n.id} className="flex items-start gap-2 text-xs text-[#2c2c2c] bg-[#faf8f3] border border-black/5 rounded-lg px-3 py-2">
              <span className="flex-1">{n.note}</span>
              {n.resolved && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">Read</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}