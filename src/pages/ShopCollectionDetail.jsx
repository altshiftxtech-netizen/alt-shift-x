import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShopShell from "@/components/shop/ShopNav";
import ShopProductCard from "@/components/shop/ShopProductCard";
import useIsAdmin from "@/hooks/useIsAdmin";

export default function ShopCollectionDetail() {
  const { slug } = useParams();
  const isAdmin = useIsAdmin();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cols = await base44.entities.ShopCollection.filter({ slug });
      const col = cols[0] || null;
      setCollection(col);
      if (col) {
        const all = await base44.entities.ShopProduct.filter({ is_active: true }, "sort_order", 300);
        setProducts(all.filter((p) => (p.collection_ids || []).includes(col.id)));
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <ShopShell isAdmin={isAdmin}>
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066FF] rounded-full animate-spin" />
        </div>
      </ShopShell>
    );
  }

  if (!collection) {
    return (
      <ShopShell isAdmin={isAdmin}>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-500">That collection couldn't be found.</p>
          <Link to="/shop/collections" className="text-[#0066FF] font-medium mt-2 inline-block">Back to Collections</Link>
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell isAdmin={isAdmin}>
      {/* Header */}
      <div className="relative text-white" style={{ background: `linear-gradient(135deg,${collection.accent || "#0066FF"},#1A1A2E)` }}>
        {collection.hero_image_url && (
          <img src={collection.hero_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link to="/shop/collections" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Collections
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
            <span>{collection.emoji}</span> {collection.title}
          </h1>
          {collection.tagline && <p className="text-white/75 mt-2 max-w-2xl">{collection.tagline}</p>}
          <p className="text-white/50 text-sm mt-3">Created by The Speakeasy Community</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {products.length === 0 ? (
          <p className="text-slate-400 py-12 text-center">No products in this collection yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ShopProductCard key={p.id} product={p} />)}
          </div>
        )}

        {collection.description && (
          <div className="mt-12 rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-2">Why we picked these</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{collection.description}</p>
          </div>
        )}
      </div>
    </ShopShell>
  );
}