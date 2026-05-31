import React, { useState, useEffect, useCallback } from "react";
import SharedNav from "@/components/SharedNav";
import ComponentRevenueTable from "@/components/analytics-suite/ComponentRevenueTable";
import RevenueTrendChart from "@/components/analytics-suite/RevenueTrendChart";
import ApiUsageBreakdown from "@/components/analytics-suite/ApiUsageBreakdown";
import GovernanceCompliancePanel from "@/components/analytics-suite/GovernanceCompliancePanel";
import SuiteHeaderStats from "@/components/analytics-suite/SuiteHeaderStats";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import BobAdvisorWidget from "@/components/BobAdvisorWidget";

export default function BuilderAnalyticsSuite() {
  const [components, setComponents] = useState([]);
  const [installedData, setInstalledData] = useState([]);
  const [governanceScores, setGovernanceScores] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    const me = await base44.auth.me();
    setUser(me);

    const [comps, installed, govScores, metrics] = await Promise.all([
      base44.entities.Component.filter({ builder_id: me.id }),
      base44.entities.InstalledComponent.list("-created_date", 500),
      base44.entities.GovernanceScore.list("-created_date", 200),
      base44.entities.PlatformMetric.list("-created_date", 30),
    ]);

    setComponents(comps);
    setInstalledData(installed);
    setGovernanceScores(govScores);
    setPlatformMetrics(metrics);
  }, []);

  const collectPerf = useCallback(async () => {
    const res = await base44.functions.invoke("collectPerformanceData", {});
    setPerformanceData(res.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([load(), collectPerf()]).finally(() => setLoading(false));
  }, [load, collectPerf]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), collectPerf()]);
    toast.success("Analytics refreshed");
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SharedNav mode="builder" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />

      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Builder Analytics Suite</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Revenue trends · Component installs · API usage · Governance compliance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Do-No-Harm Oath Active
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI header stats */}
        <SuiteHeaderStats
          components={components}
          installedData={installedData}
          platformMetrics={platformMetrics}
          performanceData={performanceData}
        />

        {/* Revenue trend + API usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart platformMetrics={platformMetrics} components={components} />
          <ApiUsageBreakdown components={components} installedData={installedData} />
        </div>

        {/* Per-component revenue table */}
        <ComponentRevenueTable
          components={components}
          installedData={installedData}
          governanceScores={governanceScores}
        />

        {/* Governance compliance panel */}
        <GovernanceCompliancePanel
          components={components}
          governanceScores={governanceScores}
        />
      </div>
      <BobAdvisorWidget />
    </div>
  );
}