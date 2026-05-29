import React, { useState } from "react";
import SharedNav from "@/components/SharedNav";
import ReviewsHeader from "@/components/builder-reviews/ReviewsHeader";
import ReviewFilters from "@/components/builder-reviews/ReviewFilters";
import ReviewCard from "@/components/builder-reviews/ReviewCard";
import RatingSummary from "@/components/builder-reviews/RatingSummary";

const ALL_REVIEWS = [
  { id: 1, component: "Ironclad Protocol", componentId: "rp", rating: 5, author: "Lachlan Byrne", role: "Project Director", org: "Meridian Build NZ", date: "May 26, 2026", body: "Transforms what used to take our legal team 2 hours into a 40-second automated check. The retention clause detection is frighteningly accurate.", helpful: 34, replied: false, flagged: false },
  { id: 2, component: "Ironclad Protocol", componentId: "rp", rating: 5, author: "Sarah Ng", role: "Contracts Manager", org: "Coastal Development Group", date: "May 21, 2026", body: "We use this on every subcontract now. Caught a missing LD clause that would have cost us dearly. Certified tier is well-deserved.", helpful: 28, replied: true, reply: "Thank you Sarah — this kind of feedback is exactly why we built it.", flagged: false },
  { id: 3, component: "The Site Board", componentId: "rc", rating: 5, author: "Tom Wallace", role: "Site Manager", org: "Pacific Build Group", date: "May 24, 2026", body: "Our PM can now review every site report in under 5 minutes across 6 active sites. The RFI tracking is a game changer.", helpful: 19, replied: false, flagged: false },
  { id: 4, component: "Estimator's Eye", componentId: "pm", rating: 4, author: "Priya Kaur", role: "Senior Estimator", org: "Hawke & Sons", date: "May 20, 2026", body: "Solid for CSI MasterFormat estimates. Occasionally misses alternates when the format deviates from standard. Hoping v2.0 addresses this.", helpful: 12, replied: false, flagged: false },
  { id: 5, component: "Estimator's Eye", componentId: "pm", rating: 3, author: "Daniel Marsh", role: "Quantity Surveyor", org: "Wellington City Council", date: "May 15, 2026", body: "Works well most of the time but the cycle time feels slow on large estimates (50+ divisions). Would benefit from a streaming mode.", helpful: 8, replied: false, flagged: false },
  { id: 6, component: "Ironclad Protocol", componentId: "rp", rating: 4, author: "Fiona Chen", role: "Legal Counsel", org: "BCI NZ", date: "May 10, 2026", body: "Very impressive on standard NZS forms. Took some time to calibrate on bespoke contracts, but the Pass 3 validation catches most edge cases.", helpful: 21, replied: true, reply: "Thanks Fiona — bespoke contract support is on our roadmap for v2.5.", flagged: false },
  { id: 7, component: "Estimator's Eye", componentId: "pm", rating: 2, author: "Greg Tanner", role: "Estimator", org: "Tanner Contracting", date: "May 3, 2026", body: "Couldn't get it to correctly parse our internal estimate format. Support wasn't helpful. Reverting to manual entry for now.", helpful: 3, replied: false, flagged: false },
];

const ratingDist = { 5: 3, 4: 2, 3: 1, 2: 1, 1: 0 };
const avgRating = (5*3 + 4*2 + 3*1 + 2*1) / 7;

export default function BuilderReviews() {
  const [filter, setFilter] = useState({ component: "all", rating: "all", replied: "all" });
  const [reviews, setReviews] = useState(ALL_REVIEWS);

  const filtered = reviews.filter(r => {
    if (filter.component !== "all" && r.componentId !== filter.component) return false;
    if (filter.rating !== "all" && r.rating !== parseInt(filter.rating)) return false;
    if (filter.replied === "pending" && r.replied) return false;
    return true;
  });

  const handleReply = (id, text) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true, reply: text } : r));
  };

  const handleFlag = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReviewsHeader total={reviews.length} pending={reviews.filter(r => !r.replied).length} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <RatingSummary avg={avgRating} dist={ratingDist} total={reviews.length} />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <ReviewFilters filter={filter} onChange={setFilter} />
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No reviews match your filters.</div>
            ) : (
              filtered.map(r => (
                <ReviewCard key={r.id} review={r} onReply={handleReply} onFlag={handleFlag} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}