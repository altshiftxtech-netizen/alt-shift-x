import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ProfileHeader from "@/components/builder-profile/ProfileHeader";
import ProfileEditForm from "@/components/builder-profile/ProfileEditForm";
import ProfilePreviewCard from "@/components/builder-profile/ProfilePreviewCard";

export default function BuilderProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        // Load builder badge data
        const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
        const badge = badges[0];

        // Load components for stats
        const components = await base44.entities.Component.filter({ builder_id: user.id });

        setProfile({
          name: badge?.display_name || user.full_name || 'Builder',
          tier: badge?.tier || 'bronze',
          tagline: badge?.tagline || '',
          bio: badge?.bio || '',
          specializations: badge?.specializations || [],
          location: badge?.location || '',
          website: badge?.website || '',
          twitter: badge?.twitter || '',
          totalInstalls: badge?.total_installs || 0,
          avgTrustScore: Math.round(badge?.avg_rating * 10) / 10 || 0,
          components: components.length,
          memberSince: badge?.created_date ? new Date(badge.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Failed to load profile</div>
      </div>
    );
  }

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