import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Newspaper, ArrowRight } from "lucide-react";
import BlogNav from "@/components/blog/BlogNav";

const CAT_STYLE = {
  product: "bg-violet-100 text-violet-700",
  promotion: "bg-amber-100 text-amber-700",
  event: "bg-blue-100 text-blue-700",
  site: "bg-emerald-100 text-emerald-700",
  general: "bg-slate-100 text-slate-600",
};

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Article.filter({ status: "published" }, "-published_at", 50)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <BlogNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-6 h-6 text-violet-600" />
          <h1 className="text-3xl font-black text-slate-900">The Blog</h1>
        </div>
        <p className="text-slate-500 mb-8">News, product updates, promotions, and events from Alt+Shift+X.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No articles published yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {articles.map((a) => (
              <Link key={a.id} to={`/blog/${a.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-lg overflow-hidden transition-all">
                {a.hero_image_url && (
                  <img src={a.hero_image_url} alt="" className="w-full h-44 object-cover" />
                )}
                <div className="p-5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CAT_STYLE[a.category] || CAT_STYLE.general}`}>{a.category}</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-violet-700 transition-colors">{a.title}</h2>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 mt-3">
                    Read more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}