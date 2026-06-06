import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useBuilderAnalytics — loads REAL analytics for the signed-in builder.
 * No fictitious data: everything is derived from the builder's own
 * Component, InstalledComponent and RevenueSplit records. When there is
 * no activity yet, values are zero/empty so incoming developers see an
 * honest, un-cheated dashboard.
 */
export default function useBuilderAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    components: [],
    selectorOptions: [{ id: "all", label: "All Components" }],
    earnings: { months: [], thisMonth: 0, payout: 0, growthPct: null, revShare: 70 },
    retention: [],
    installTrend: [],
    breakdown: { enterprise: 0, community: 0, activeInstalls: 0, churnedInstalls: 0 },
    geo: [],
    churnReasons: [],
    totalChurned: 0,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const me = await base44.auth.me();
      const [components, badges] = await Promise.all([
        base44.entities.Component.filter({ builder_id: me.id }),
        base44.entities.BuilderBadge.filter({ builder_id: me.id }),
      ]);
      const badge = badges?.[0] || null;
      const compIds = components.map((c) => c.id);

      // Installs for this builder's components
      const allInstalls = await base44.entities.InstalledComponent.list("-created_date", 2000);
      const myInstalls = allInstalls.filter((i) => compIds.includes(i.component_id));

      // Revenue splits for this builder
      const splits = await base44.entities.RevenueSplit.filter({ builder_id: me.id });

      // ── Selector options from real published/all components ──
      const selectorOptions = [
        { id: "all", label: "All Components" },
        ...components.map((c) => ({ id: c.id, label: c.name })),
      ];

      // ── Earnings (last 6 months) from RevenueSplit period (YYYY-MM) ──
      const revShare = badge?.revenue_share_pct || 70;
      const months = lastNMonths(6);
      const earningsMonths = months.map((m) => {
        const periodSplits = splits.filter((s) => s.period === m.key);
        const revenue = periodSplits.reduce((sum, s) => sum + (s.gross_revenue || 0), 0);
        const payout = periodSplits.reduce((sum, s) => sum + (s.builder_payout || 0), 0);
        return { month: m.label, revenue, payouts: payout };
      });
      const cur = earningsMonths[earningsMonths.length - 1] || { revenue: 0, payouts: 0 };
      const prev = earningsMonths[earningsMonths.length - 2] || { revenue: 0 };
      const growthPct = prev.revenue > 0
        ? (((cur.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1)
        : null;

      // ── Retention / active installs per component (top by installs) ──
      const colors = ["#7c3aed", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];
      const retention = components
        .map((c) => {
          const ci = myInstalls.filter((i) => i.component_id === c.id);
          const active = ci.filter((i) => i.status === "active").length;
          const total = ci.length;
          return {
            name: c.name,
            type: c.type,
            installs: active,
            retention: total ? Math.round((active / total) * 100) : null,
          };
        })
        .filter((r) => r.installs > 0)
        .sort((a, b) => b.installs - a.installs)
        .slice(0, 5)
        .map((r, i) => ({ ...r, color: colors[i % colors.length] }));

      // ── Install trend (new installs per month, last 5 months) ──
      const trendMonths = lastNMonths(5);
      const installTrend = trendMonths.map((m) => {
        const inMonth = myInstalls.filter((i) => sameMonth(i.created_date, m.key));
        const churned = inMonth.filter((i) => i.status === "cancelled").length;
        return { month: m.label, installs: inMonth.length, churned };
      });

      // ── Breakdown: active vs cancelled ──
      const activeInstalls = myInstalls.filter((i) => i.status === "active").length;
      const churnedInstalls = myInstalls.filter((i) => i.status === "cancelled").length;

      setData({
        components,
        selectorOptions,
        earnings: {
          months: earningsMonths,
          thisMonth: cur.revenue,
          payout: cur.payouts,
          growthPct,
          revShare,
        },
        retention,
        installTrend,
        breakdown: { enterprise: 0, community: 0, activeInstalls, churnedInstalls },
        geo: [], // geography requires per-install location data we don't collect
        churnReasons: [], // churn-reason data isn't captured — show empty state
        totalChurned: churnedInstalls,
      });
    } catch (e) {
      console.error("Builder analytics load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { loading, ...data };
}

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }
  return out;
}

function sameMonth(dateStr, key) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return k === key;
}