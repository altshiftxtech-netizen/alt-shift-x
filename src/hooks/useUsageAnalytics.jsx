import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useUsageAnalytics — loads REAL usage data for the signed-in user's
 * installed components. No fictitious data: everything is derived from
 * the user's own InstalledComponent records. When there is no activity,
 * values are zero/empty so the dashboard is honest.
 */
export default function useUsageAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalCalls: 0, documentsProcessed: 0, avgLatency: "—" },
    byComponent: [],
    componentChart: [],
    dailyUsage: [],
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const me = await base44.auth.me();
      const installs = await base44.entities.InstalledComponent.filter({ user_id: me.id });
      const active = installs.filter((i) => i.status !== "cancelled");

      const totalCalls = active.reduce((s, i) => s + (i.calls_this_month || 0), 0);

      const byComponent = active
        .map((i) => ({ name: i.component_name, calls: i.calls_this_month || 0 }))
        .filter((c) => c.calls > 0)
        .sort((a, b) => b.calls - a.calls);

      const componentChart = byComponent.slice(0, 6).map((c) => ({
        name: c.name.length > 14 ? c.name.slice(0, 13) + "…" : c.name,
        calls: c.calls,
      }));

      setData({
        stats: {
          totalCalls,
          documentsProcessed: totalCalls, // 1 call ≈ 1 document processed
          avgLatency: "—", // per-call latency isn't tracked on installs
        },
        byComponent,
        componentChart,
        dailyUsage: [], // per-day breakdown isn't captured — show empty state
      });
    } catch (e) {
      console.error("Usage analytics load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { loading, ...data };
}