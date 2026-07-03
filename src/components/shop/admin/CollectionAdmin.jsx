import React, { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BLANK = {
  title: "", slug: "", tagline: "", description: "", emoji: "🚀",
  hero_image_url: "", accent: "#0066FF", sort_order: 0, is_active: true,
};

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function CollectionAdmin({ collections, reload }) {
  const [editing, setEditing] = useState(null);

  const save = async () => {
    const data = { ...editing };
    data.slug = data.slug || slugify(data.title);
    data.sort_order = Number(data.sort_order) || 0;
    if (data.id) {
      const { id, ...rest } = data;
      await base44.entities.ShopCollection.update(id, rest);
    } else {
      await base44.entities.ShopCollection.create(data);
    }
    setEditing(null);
    reload();
  };
  const remove = async (id) => {
    if (!confirm("Delete this collection?")) return;
    await base44.entities.ShopCollection.delete(id);
    reload();
  };

  const field = (label, key, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input type={type} value={editing[key] ?? ""} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </label>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{collections.length} collections</p>
        <button onClick={() => setEditing({ ...BLANK })} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      <div className="space-y-2">
        {collections.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{c.title}</p>
              <p className="text-xs text-slate-400 truncate">/{c.slug} · {c.tagline}</p>
            </div>
            <button onClick={() => setEditing(c)} className="text-sm text-[#0066FF] font-medium">Edit</button>
            <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">{editing.id ? "Edit" : "New"} Collection</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("Title", "title")}
              {field("Slug (auto if blank)", "slug")}
              <div className="col-span-2">{field("Tagline", "tagline")}</div>
              <label className="col-span-2 block">
                <span className="text-xs font-medium text-slate-500">Description ("why we picked these")</span>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              {field("Emoji", "emoji")}
              {field("Accent color", "accent")}
              <div className="col-span-2">{field("Hero image URL", "hero_image_url")}</div>
              {field("Sort order", "sort_order", "number")}
              <label className="flex items-center gap-2 mt-6 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active
              </label>
            </div>
            <button onClick={save} className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0066FF] text-white py-2.5 font-bold">
              <Save className="w-4 h-4" /> Save Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}