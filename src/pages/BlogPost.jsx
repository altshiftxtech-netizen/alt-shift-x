import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        <div className="flex items-center justify-between mb-6">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
            Home <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

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

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
            prose-h3:text-lg prose-h3:mt-9 prose-h3:mb-2
            prose-p:leading-relaxed prose-p:text-slate-600 prose-p:my-4
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-em:text-slate-500
            prose-a:text-violet-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-li:text-slate-600 prose-li:my-1 prose-ol:my-4 prose-ul:my-4
            prose-blockquote:border-l-4 prose-blockquote:border-violet-400 prose-blockquote:bg-violet-50/60
            prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:not-italic
            prose-blockquote:font-medium prose-blockquote:text-slate-700
            prose-hr:my-10 prose-hr:border-slate-200
            prose-table:my-6 prose-table:w-full prose-table:text-sm
            prose-thead:border-b-2 prose-thead:border-slate-300
            prose-th:text-left prose-th:font-bold prose-th:text-slate-900 prose-th:py-2.5 prose-th:px-3
            prose-td:py-2.5 prose-td:px-3 prose-td:border-t prose-td:border-slate-100 prose-td:align-top"
        >
          {article.body}
        </ReactMarkdown>

        <BlogReactions slug={article.slug} />
        <BlogComments slug={article.slug} />
      </div>
    </div>
  );
}