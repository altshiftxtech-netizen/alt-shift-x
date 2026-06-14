import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

/**
 * RatingDisplay — shows component rating with these rules:
 * - reviews_count = 0 & rating > 0 → "✅ Verified Rating"
 * - reviews_count > 0 → "⭐ X.X (N verified reviews)"
 * - rating = 0 → "Not yet rated"
 */
export default function RatingDisplay({ rating = 0, reviewsCount = 0, className = "" }) {
  if (reviewsCount === 0 && rating > 0) {
    return (
      <span className={`flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        Verified Rating
      </span>
    );
  }

  if (reviewsCount > 0) {
    return (
      <span className={`flex items-center gap-1 text-xs font-semibold text-amber-600 ${className}`}>
        <Star className="w-3 h-3 fill-amber-600" />
        {rating.toFixed(1)} ({reviewsCount} verified review{reviewsCount !== 1 ? "s" : ""})
      </span>
    );
  }

  return (
    <span className={`text-xs font-medium text-slate-400 ${className}`}>
      Not yet rated
    </span>
  );
}