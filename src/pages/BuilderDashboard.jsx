import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import DashboardHeader from "@/components/builder-dashboard/DashboardHeader";
import DashboardStatRow from "@/components/builder-dashboard/DashboardStatRow";
import DashboardTrustSummary from "@/components/builder-dashboard/DashboardTrustSummary";
import DashboardActivityFeed from "@/components/builder-dashboard/DashboardActivityFeed";
import DashboardQuickLinks from "@/components/builder-dashboard/DashboardQuickLinks";
import ComponentExportButton from "@/components/builder-dashboard/ComponentExportButton";
import BobAdvisorWidget from "@/components/BobAdvisorWidget";
import BuilderTestBot from "@/components/BuilderTestBot";
import W9RequiredBanner from "@/components/tax/W9RequiredBanner";
import { Loader2, Package } from "lucide-react";

// Builds the dashboard's stat row from the builder's REAL components only.
function deriveStats(components) {
  const totalInstalls = components.reduce((s, c) => s + (c.installs_count || 0), 0);
  const monthlyRevenue = components.reduce((s, c) => s + (c.price || 0) * (c.installs_count || 0), 0);
  const scored = components.filter(c => (c.trust_score || 0) > 0);
  const avgTrustScore = scored.length
    ? Math.round(scored.reduce((s, c) => s + (c.trust_score || 0), 0) / scored.length)
    : 0;
  return {
    totalInstalls,
    installsDelta: 0,
    lifetimeRevenue: monthlyRevenue,
    currentMonthRevenue: monthlyRevenue,
    revenueDelta: 0,
    activeComponents: components.filter(c => c.status === "published").length,
    avgTrustScore,
  };
}

export default function BuilderDashboard() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderName, setBuilderName] = useState("Builder");

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setBuilderName(user?.full_name || "Builder");
        // Only this builder's own components — no fictional data.
        const mine = await base44.entities.Component.filter({ builder_id: user.id }, "-updated_date", 500);
        setComponents(mine || []);
      } catch {
        setComponents([]);
      }
      setLoading(false);
    })();
  }, []);

  const stats = deriveStats(components);
  const trust = components
    .filter(c => (c.trust_score || 0) > 0)
    .slice(0, 8)
    .map(c => ({ name: c.name, score: c.trust_score, type: c.type }));

  // Real activity = most recently updated components.
  const activity = components.slice(0, 7).map((c, i) => ({
    id: c.id || i,
    type: "publish",
    icon: "publish",
    message: `${c.name}${c.sku ? ` (${c.sku})` : ""} — ${c.status}`,
    time: c.updated_date ? new Date(c.updated_date).toLocaleDateString() : "",
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BobAdvisorWidget />
        <W9RequiredBanner />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <DashboardHeader builderName={builderName} tier="certified" />
          <ComponentExportButton components={components} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">No components yet</p>
            <p className="text-sm text-slate-400 mt-1">Components you build will appear here with live stats.</p>
          </div>
        ) : (
          <>
            <DashboardStatRow stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {trust.length > 0 && <DashboardTrustSummary components={trust} />}
                <DashboardActivityFeed activity={activity} />
              </div>
              <div className="lg:col-span-1">
                <DashboardQuickLinks />
              </div>
            </div>
          </>
        )}
      </div>
      <BuilderTestBot />
    </div>
  );
}