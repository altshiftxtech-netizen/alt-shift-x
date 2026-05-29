import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * Renders a LegalDocument from the database if one exists for the given slug.
 * If no DB record exists yet, renders `children` (static fallback).
 */
export default function LegalDocumentViewer({ slug, children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LegalDocument.filter({ slug })
      .then(data => {
        if (data && data[0] && data[0].content) {
          setContent(data[0].content);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // If admin has saved custom content, render it as plain text
  if (content) {
    return (
      <div className="prose prose-sm prose-slate max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed bg-transparent p-0 m-0 border-0">{content}</pre>
      </div>
    );
  }

  // Fallback to static JSX children
  return children;
}