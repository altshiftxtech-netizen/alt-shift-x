import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ShopProductCard from "./ShopProductCard";

// A single curated collection shown as a titled, horizontally-scrolling row.
export default function ShopCollectionRow({ collection, products }) {
  if (!products || products.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>{collection.emoji}</span> {collection.title}
        </h3>
        <Link to={`/shop/collections/${collection.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0066FF] hover:underline">
          See All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {products.slice(0, 8).map((p) => (
          <div key={p.id} className="min-w-[260px] max-w-[260px]">
            <ShopProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}