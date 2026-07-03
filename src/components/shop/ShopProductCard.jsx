import React from "react";
import { Star, Sparkles, Heart, ExternalLink } from "lucide-react";

// A single affiliate product card. "Get Deal" opens the affiliate link in a new
// tab; if no link is set it's disabled. Exclusive deals get the Speakeasy badge.
export default function ShopProductCard({ product }) {
  const hasDeal = !!product.exclusive_deal;
  const openDeal = () => {
    if (product.affiliate_url) window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all">
      {/* image */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
            {product.name?.[0] || "?"}
          </div>
        )}
        {hasDeal && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold text-white px-2 py-1 rounded-full"
            style={{ background: "linear-gradient(90deg,#9D4EDD,#FF006E)" }}>
            <Sparkles className="w-3 h-3" /> Speakeasy Exclusive
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-slate-900 leading-tight">{product.name}</h3>
        {product.short_description && (
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{product.short_description}</p>
        )}

        {(product.rating > 0 || product.reviews_count > 0) && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-700">{product.rating?.toFixed(1)}</span>
            {product.reviews_count > 0 && <span>· {product.reviews_count} reviews</span>}
          </div>
        )}

        {product.price_label && (
          <p className="text-sm text-slate-700 mt-2"><span className="text-slate-400">Price:</span> {product.price_label}</p>
        )}

        {hasDeal && (
          <div className="mt-2 rounded-lg bg-purple-50 border border-purple-100 px-3 py-2">
            <p className="text-xs font-semibold text-purple-700">🎁 {product.exclusive_deal}</p>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-orange-700 bg-orange-50 border border-orange-100">
            <Heart className="w-3 h-3 fill-orange-400 text-orange-400" /> Commission → Community Fund
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={openDeal}
          disabled={!product.affiliate_url}
          className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(90deg,#0066FF,#00CCFF)" }}
        >
          {product.affiliate_url ? <>Get Deal <ExternalLink className="w-4 h-4" /></> : "Coming Soon"}
        </button>

        {product.partner && (
          <p className="text-[10px] text-slate-400 mt-2 text-center">Partner: {product.partner}</p>
        )}
      </div>
    </div>
  );
}