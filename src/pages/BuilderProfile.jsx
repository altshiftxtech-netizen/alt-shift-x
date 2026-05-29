import React, { useState } from "react";
import ProfileHeader from "@/components/builder-profile/ProfileHeader";
import ProfileEditForm from "@/components/builder-profile/ProfileEditForm";
import ProfilePreviewCard from "@/components/builder-profile/ProfilePreviewCard";

const INITIAL_PROFILE = {
  name: "Marcus Holloway",
  tier: "certified",
  tagline: "Construction tech specialist. Building AI intelligence for the built environment.",
  bio: "10+ years in construction project management and contracts administration before pivoting to AI-native tooling. I build components that solve real problems I've personally faced on-site and in the contracts room.",
  specializations: ["Risk & Compliance", "Site Reporting", "Bid Estimation"],
  location: "Auckland, New Zealand",
  website: "https://marcusholloway.dev",
  twitter: "@marcusholloway",
  totalInstalls: 1362,
  avgTrustScore: 90,
  components: 3,
  memberSince: "January 2026",
};

export default function BuilderProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleSave = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ProfileHeader saved={saved} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ProfileEditForm profile={profile} onSave={handleSave} />
          </div>
          <div className="lg:col-span-2">
            <ProfilePreviewCard profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}