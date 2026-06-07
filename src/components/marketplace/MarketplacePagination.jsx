import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Compact page bar for the marketplace grid. Shows first/last, the current page
// with a small window of neighbors, and prev/next arrows. Glassy dark styling to
// match the marketplace.
export default function MarketplacePagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null;

  const go = (p) => {
    const next = Math.min(Math.max(1, p), pageCount);
    if (next !== page) {
      onPage(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Build a windowed page list: 1 … (p-1 p p+1) … last
  const pages = [];
  const push = (p) => { if (!pages.includes(p) && p >= 1 && p <= pageCount) pages.push(p); };
  push(1);
  for (let p = page - 1; p <= page + 1; p++) push(p);
  push(pageCount);
  pages.sort((a, b) => a - b);

  const btn = "min-w-[34px] h-[34px] px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className={`${btn} bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {gap && <span className="text-white/30 px-1 text-xs">…</span>}
            <button
              onClick={() => go(p)}
              className={`${btn} ${p === page ? "bg-violet-600 border border-violet-500 text-white" : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"}`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => go(page + 1)}
        disabled={page === pageCount}
        className={`${btn} bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}