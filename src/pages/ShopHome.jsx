import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cloud, Code2, Shapes, BookOpen, Keyboard, CreditCard, Package,
  HeartHandshake, Gift, BarChart3, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShopShell from "@/components/shop/ShopNav";
import FeaturedCarousel from "@/components/shop/FeaturedCarousel";
import ShopCollectionRow from "@/components/shop/ShopCollectionRow";
import { SHOP_CATEGORIES } from "@/components/shop/shopConstants";
import useIsAdmin from "@/hooks/useIsAdmin";

const CATEGORY_ICONS = { Cloud, Code2, Shapes, BookOpen, Keyboard, CreditCard };

export default function ShopHome() {
  const isAdmin = useIsAdmin();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [prods, cols, funds] = await Promise.all([
        base44.entities.ShopProduct.filter({ is_active: true }, "sort_order", 200),
        base44.entities.ShopCollection.filter({ is_active: true }, "sort_order", 50),
        base44.entities.CommunityFund.filter({ is_current: true }, "-period", 1),
      ]);
      setProducts(prods);
      setCollections(cols);
      setFund(funds[0] || null);
      setLoading(false);
    })();
  }, []);

  const featured = products.filter((p) => p.featured);
  const productsFor = (col) => products.filter((p) => (p.collection_ids || []).includes(col.id));

  return (
    <ShopShell isAdmin={isAdmin}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1A1A2E 0%,#0d1030 50%,#0066FF 140%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">The Speakeasy Shop</h1>
          <p className="text-white/70 mt-3 text-lg max-w-xl mx-auto">Curated tools for builders. Every purchase funds the community.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Link to="/shop/collections" className="rounded-xl px-6 py-3 font-bold text-slate-900 bg-white hover:bg-slate-100">Browse Collections</Link>
            <Link to="/shop/fund" className="rounded-xl px-6 py-3 font-bold text-white border border-white/30 hover:bg-white/10">See Fund Tracker</Link>
          </div>
          {fund && (
            <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm">
              🎯 <span className="font-semibold">${fund.total_raised?.toLocaleString()} raised this month</span>
              <span className="text-white/50">·</span>
              <span className="text-white/70">{fund.contributors?.toLocaleString()} community members</span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066FF] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured deals */}
            {featured.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Featured Exclusive Deals</h2>
                <FeaturedCarousel products={featured} />
              </section>
            )}

            {/* Browse by category */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SHOP_CATEGORIES.map((c) => {
                  const Icon = CATEGORY_ICONS[c.icon] || Package;
                  return (
                    <Link key={c.key} to={`/shop/collections?category=${encodeURIComponent(c.key)}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="font-semibold text-slate-800">{c.key}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Curated collections */}
            {collections.length > 0 && (
              <section className="space-y-10">
                <h2 className="text-xl font-bold text-slate-900">Curated Collections</h2>
                {collections.map((col) => (
                  <ShopCollectionRow key={col.id} collection={col} products={productsFor(col)} />
                ))}
              </section>
            )}

            {/* Community fund snapshot */}
            {fund && (
              <section className="rounded-3xl bg-white border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-1">This Month's Impact</h2>
                <p className="text-sm text-slate-500 mb-6">{fund.month_label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: HeartHandshake, label: "Raised", value: `$${fund.total_raised?.toLocaleString()}` },
                    { icon: Users, label: "Members", value: fund.contributors?.toLocaleString() },
                    { icon: Gift, label: "Purchases", value: fund.purchases?.toLocaleString() },
                    { icon: BarChart3, label: "Growth", value: `↑ ${fund.growth_pct}%` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-slate-50 p-4">
                      <s.icon className="w-5 h-5 text-[#0066FF]" />
                      <p className="text-2xl font-extrabold text-slate-900 mt-2">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                <Link to="/shop/fund" className="inline-block mt-6 text-sm font-semibold text-[#0066FF] hover:underline">See full fund timeline →</Link>
              </section>
            )}
          </>
        )}
      </div>
    </ShopShell>
  );
}