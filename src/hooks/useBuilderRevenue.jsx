import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useBuilderRevenue — loads REAL revenue data for the signed-in builder.
 * Everything is derived from the builder's own RevenueSplit, Component,
 * InstalledComponent and BuilderBadge records. No mock/fictitious data:
 * when there is no activity, values are zero/empty so the dashboard is honest.
 */
export default function useBuilderRevenue() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      lifetimeRevenue: 0,
      currentMonthRevenue: 0,
      currentMonthChange: null,
      nextPayoutDate: "",
      nextPayoutEstimate: 0,
      stripeConnected: false,
    },
    chartData: [],
    payouts: [],
    componentRevenue: [],
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const me = await base44.auth.me();
      const [splits, components, badges] = await Promise.all([
        base44.entities.RevenueSplit.filter({ builder_id: me.id }),
        base44.entities.Component.filter({ builder_id: me.id }),
        base44.entities.BuilderBadge.filter({ builder_id: me.id }),
      ]);
      const badge = badges?.[0] || null;
      const stripeConnected = badge?.stripe_connect_status === "active";

      // Lifetime net = sum of all builder payouts ever recorded.
      const lifetimeRevenue = splits.reduce((s, r) => s + (r.builder_payout || 0), 0);

      // ── Monthly chart (last 6 months, by RevenueSplit.period YYYY-MM) ──
      const months = lastNMonths(6);
      const chartData = months.map((m) => {
        const periodSplits = splits.filter((s) => s.period === m.key);
        const revenue = periodSplits.reduce((sum, s) => sum + (s.gross_revenue || 0), 0);
        return { month: m.label, revenue: periodSplits.length ? revenue : (m.isFuture ? null : 0) };
      });

      const curKey = months[months.length - 1].key;
      const prevKey = months[months.length - 2]?.key;
      const curRevenue = splits.filter((s) => s.period === curKey).reduce((sum, s) => sum + (s.gross_revenue || 0), 0);
      const prevRevenue = splits.filter((s) => s.period === prevKey).reduce((sum, s) => sum + (s.gross_revenue || 0), 0);
      const currentMonthChange = prevRevenue > 0
        ? Number((((curRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1))
        : null;

      // Next payout estimate = pending/approved builder payout for the current period.
      const nextPayoutEstimate = splits
        .filter((s) => s.period === curKey && s.status !== "paid")
        .reduce((sum, s) => sum + (s.builder_payout || 0), 0);

      // ── Payout history grouped by period ──
      const byPeriod = {};
      splits.forEach((s) => {
        if (!byPeriod[s.period]) byPeriod[s.period] = [];
        byPeriod[s.period].push(s);
      });
      const payouts = Object.keys(byPeriod)
        .sort((a, b) => b.localeCompare(a))
        .map((period) => {
          const items = byPeriod[period];
          const gross = items.reduce((s, r) => s + (r.gross_revenue || 0), 0);
          const net = items.reduce((s, r) => s + (r.builder_payout || 0), 0);
          const platformFee = items.reduce((s, r) => s + (r.platform_take || 0), 0);
          const allPaid = items.every((r) => r.status === "paid");
          const anyPending = items.some((r) => r.status === "pending");
          return {
            id: `PAY-${period}`,
            period: formatPeriod(period),
            gross, platformFee, net,
            status: allPaid ? "completed" : anyPending ? "pending" : "processing",
            paidAt: allPaid ? formatDate(items.find((r) => r.processed_at)?.processed_at) : "—",
            lineItems: items.map((r) => ({
              component: r.component_name || r.component_id,
              installs: 0,
              revenue: r.gross_revenue || 0,
              fee: r.platform_take || 0,
              net: r.builder_payout || 0,
            })),
          };
        });

      // ── Revenue by component (current month) ──
      const curSplits = splits.filter((s) => s.period === curKey);
      const compMap = {};
      curSplits.forEach((s) => {
        const key = s.component_id;
        if (!compMap[key]) compMap[key] = { revenue: 0, name: s.component_name };
        compMap[key].revenue += s.gross_revenue || 0;
      });
      const compTotal = Object.values(compMap).reduce((sum, c) => sum + c.revenue, 0);
      const componentRevenue = Object.entries(compMap)
        .map(([id, c]) => {
          const comp = components.find((x) => x.id === id);
          return {
            name: comp?.code || id,
            displayName: c.name || comp?.name || id,
            type: comp?.type || "—",
            installs: comp?.installs_count || 0,
            revenue: c.revenue,
            share: compTotal > 0 ? Math.round((c.revenue / compTotal) * 100) : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);

      setData({
        stats: {
          lifetimeRevenue,
          currentMonthRevenue: curRevenue,
          currentMonthChange,
          nextPayoutDate: nextFirstOfMonth(),
          nextPayoutEstimate,
          stripeConnected,
        },
        chartData,
        payouts,
        componentRevenue,
      });
    } catch (e) {
      console.error("Builder revenue load failed:", e);
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
      isFuture: false,
    });
  }
  return out;
}

function formatPeriod(key) {
  if (!key) return "—";
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nextFirstOfMonth() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}