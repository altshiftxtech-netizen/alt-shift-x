import React, { useState, useEffect } from "react";
import SharedNav from "@/components/SharedNav";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import RevenueForecastPanel from "@/components/leaderboard/RevenueForecastPanel";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import { base44 } from "@/api/base44Client";

export default function BuilderLeaderboard() {
  const [components, setComponents] = useState([]);
  const [installedData, setInstalledData] = useState([]);
  const [govScores, setGovScores] = useState([]);
  const [users, setUsers] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Component.list("-installs_count", 200),
      base44.entities.InstalledComponent.list("-created_date", 1000),
      base44.entities.GovernanceScore.list("-overall_score", 200),
      base44.entities.User.list("-created_date", 200),
    ]).then(([comps, installed, gov, usrs]) => {
      setComponents(comps);
      setInstalledData(installed);
      setGovScores(gov);
      setUsers(usrs);
    }).finally(() => setLoading(false));
  }, []);

  const loadForecast = async () => {
    setForecastLoading(true);
    const res = await base44.functions.invoke("builderRevenueForecast", {});
    setForecast(res.data);
    setForecastLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <LeaderboardHeader />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <LeaderboardTable
              components={components}
              installedData={installedData}
              govScores={govScores}
              users={users}
            />
          </div>
          <RevenueForecastPanel
            forecast={forecast}
            loading={forecastLoading}
            onGenerate={loadForecast}
          />
        </div>
      </div>
    </div>
  );
}