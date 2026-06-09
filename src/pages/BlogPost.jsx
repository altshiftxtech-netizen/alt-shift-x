import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import BlogReactions from "@/components/blog/BlogReactions";
import BlogComments from "@/components/blog/BlogComments";

export default function BlogPost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Article.filter({ slug, status: "published" })
      .then((list) => setArticle(list[0] || null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500">Article not found.</p>
        <Link to="/blog" className="text-violet-600 font-semibold text-sm">← Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        {article.hero_image_url && (
          <img src={article.hero_image_url} alt="" className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-6" />
        )}

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 capitalize">{article.category}</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">{article.title}</h1>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 mb-8">
          <span>{article.author_name}</span>
          {article.published_at && (
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.published_at).toLocaleDateString()}</span>
          )}
        </div>

        <ReactMarkdown className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-violet-600">
          {article.body}
        </ReactMarkdown>

        <BlogReactions slug={article.slug} />
        <BlogComments slug={article.slug} />
      </div>
    </div>
  );
}