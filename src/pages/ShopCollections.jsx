import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShopShell from "@/components/shop/ShopNav";
import ShopProductCard from "@/components/shop/ShopProductCard";
import { SHOP_CATEGORIES } from "@/components/shop/shopConstants";
import useIsAdmin from "@/hooks/useIsAdmin";

export default function ShopCollections() {
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlCategory = new URLSearchParams(window.location.search).get("category") || "";
  const [category, setCategory] = useState(urlCategory);

  useEffect(() => {
    (async () => {
      const [cols, prods] = await Promise.all([
        base44.entities.ShopCollection.filter({ is_active: true }, "sort_order", 50),
        base44.entities.ShopProduct.filter({ is_active: true }, "sort_order", 300),
      ]);
      setCollections(cols);
      setProducts(prods);
      setLoading(false);
    })();
  }, []);

  const filteredProducts = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [products, category]
  );

  return (
    <ShopShell isAdmin={isAdmin}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Collections</h1>
        <p className="text-slate-500 mt-1">Curated bundles and category picks, built by the community.</p>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap mt-6">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 mr-1"><Filter className="w-4 h-4" /> Category:</span>
          <button onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${!category ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
            All
          </button>
          {SHOP_CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${category === c.key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
              {c.key}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066FF] rounded-full animate-spin" />
          </div>
        ) : category ? (
          // Category view — flat product grid
          <div className="mt-8">
            {filteredProducts.length === 0 ? (
              <p className="text-slate-400 py-12 text-center">No products in this category yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => <ShopProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        ) : (
          // Collections view — cards linking to detail pages
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {collections.length === 0 ? (
              <p className="text-slate-400 py-12 text-center col-span-full">No collections yet.</p>
            ) : collections.map((col) => {
              const count = products.filter((p) => (p.collection_ids || []).includes(col.id)).length;
              return (
                <button key={col.id} onClick={() => navigate(`/shop/collections/${col.slug}`)}
                  className="group text-left rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="h-28 relative flex items-center justify-center text-4xl"
                    style={{ background: `linear-gradient(135deg,${col.accent || "#0066FF"},#1A1A2E)` }}>
                    {col.hero_image_url
                      ? <img src={col.hero_image_url} alt={col.title} className="w-full h-full object-cover" />
                      : <span>{col.emoji}</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900">{col.title}</h3>
                    {col.tagline && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{col.tagline}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">{count} tools</span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0066FF]">
                        See All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ShopShell>
  );
}