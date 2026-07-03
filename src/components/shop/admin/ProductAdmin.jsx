import React, { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SHOP_CATEGORIES } from "@/components/shop/shopConstants";

const BLANK = {
  name: "", partner: "", short_description: "", category: "IDEs & Dev Tools",
  image_url: "", price_label: "", affiliate_url: "", exclusive_deal: "",
  rating: 0, reviews_count: 0, featured: false, sort_order: 0, is_active: true,
  collection_ids: [],
};

export default function ProductAdmin({ products, collections, reload }) {
  const [editing, setEditing] = useState(null); // object being edited/created

  const save = async () => {
    const data = { ...editing };
    data.rating = Number(data.rating) || 0;
    data.reviews_count = Number(data.reviews_count) || 0;
    data.sort_order = Number(data.sort_order) || 0;
    if (data.id) {
      const { id, ...rest } = data;
      await base44.entities.ShopProduct.update(id, rest);
    } else {
      await base44.entities.ShopProduct.create(data);
    }
    setEditing(null);
    reload();
  };
  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await base44.entities.ShopProduct.delete(id);
    reload();
  };
  const toggleCollection = (cid) => {
    const ids = editing.collection_ids || [];
    setEditing({ ...editing, collection_ids: ids.includes(cid) ? ids.filter((x) => x !== cid) : [...ids, cid] });
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
        <p className="text-sm text-slate-500">{products.length} products</p>
        <button onClick={() => setEditing({ ...BLANK })} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 overflow-hidden">
              {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : p.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{p.name} {p.featured && <span className="text-[10px] text-purple-600">★ featured</span>}</p>
              <p className="text-xs text-slate-400 truncate">{p.category} · {p.price_label}</p>
            </div>
            <button onClick={() => setEditing(p)} className="text-sm text-[#0066FF] font-medium">Edit</button>
            <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">{editing.id ? "Edit" : "New"} Product</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("Name", "name")}
              {field("Partner", "partner")}
              <div className="col-span-2">{field("Short description", "short_description")}</div>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Category</span>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {SHOP_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
                </select>
              </label>
              {field("Price label", "price_label")}
              <div className="col-span-2">{field("Image URL", "image_url")}</div>
              <div className="col-span-2">{field("Affiliate URL", "affiliate_url")}</div>
              <div className="col-span-2">{field("Exclusive deal (optional)", "exclusive_deal")}</div>
              {field("Rating", "rating", "number")}
              {field("Reviews count", "reviews_count", "number")}
              {field("Sort order", "sort_order", "number")}
              <label className="flex items-center gap-2 mt-6 text-sm text-slate-700">
                <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured
              </label>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-500">Collections</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {collections.map((c) => {
                  const on = (editing.collection_ids || []).includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCollection(c.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {c.emoji} {c.title}
                    </button>
                  );
                })}
                {collections.length === 0 && <span className="text-xs text-slate-400">Create a collection first.</span>}
              </div>
            </div>

            <label className="flex items-center gap-2 mt-4 text-sm text-slate-700">
              <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active (visible in shop)
            </label>

            <button onClick={save} className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0066FF] text-white py-2.5 font-bold">
              <Save className="w-4 h-4" /> Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}