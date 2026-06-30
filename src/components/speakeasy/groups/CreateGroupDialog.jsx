import React, { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const EMOJIS = ["🛋️", "🏗️", "🤖", "🎨", "📈", "⚖️", "🧠", "☕", "🔬", "🚀", "🎬", "🎵"];
const ACCENTS = ["#C8A95B", "#8B6FB8", "#4169e1", "#3fb950", "#e0719c", "#e06c4a"];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

/**
 * Lets a member found a new circle. Keeps it lightweight — name, blurb, icon.
 */
export default function CreateGroupDialog({ user, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🛋️");
  const [accent, setAccent] = useState("#C8A95B");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError("");
    const slug = slugify(trimmed) || `circle-${Date.now()}`;
    const existing = await base44.entities.SpeakeasyGroup.filter({ slug });
    if (existing.length > 0) {
      setError("A circle with a similar name already exists — try another.");
      setSaving(false);
      return;
    }
    const group = await base44.entities.SpeakeasyGroup.create({
      name: trimmed, slug, description: description.trim(), emoji, accent,
      created_by_id: user.id, created_by_name: user.full_name || user.email,
      member_count: 1, post_count: 0,
    });
    // Founder auto-joins.
    await base44.entities.SpeakeasyGroupMember.create({
      group_id: group.id, group_slug: slug, user_id: user.id,
      user_name: user.full_name || user.email, joined_at: new Date().toISOString(),
    });
    setSaving(false);
    onCreated?.(group);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#C8A95B]/20 bg-[#0E0E12] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Found a Circle</h2>
          <button onClick={onClose} className="text-[#9CA0A8] hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={48}
          placeholder="e.g. Construction Builders"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40 mb-3" />

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">What's it for?</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={160}
          placeholder="A one-line description of this circle…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6B6F76] resize-none focus:outline-none focus:border-[#C8A95B]/40 mb-3" />

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Icon</label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${emoji === e ? "border-[#C8A95B] bg-[#C8A95B]/15" : "border-white/10 hover:border-white/30"}`}>{e}</button>
          ))}
        </div>

        <label className="block text-[11px] font-semibold text-[#9CA0A8] mb-1.5">Accent</label>
        <div className="flex gap-2 mb-4">
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => setAccent(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${accent === c ? "scale-110 border-white" : "border-transparent"}`}
              style={{ background: c }} />
          ))}
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <Button onClick={submit} disabled={!name.trim() || saving}
          className="w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Circle
        </Button>
      </div>
    </div>
  );
}