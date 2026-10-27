import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SharedNav from '@/components/SharedNav';
import ProvingGroundTotals from '@/components/suite/ProvingGroundTotals';

export default function ProvingGroundReport() {
  const { user, isLoadingAuth } = useAuth();
  const report = useQuery({ queryKey: ['proving-ground-report'], enabled: user?.role === 'admin', queryFn: async () => (await base44.functions.invoke('provingGroundUsageReport', {})).data });
  if (isLoadingAuth) return <main className="p-8" role="status">Checking access…</main>;
  if (user?.role !== 'admin') return <main className="p-8"><h1>Admin access required</h1><p>This report is private.</p></main>;
  const totals = report.data?.totals || {};
  return <div className="min-h-screen bg-background text-foreground">
    <SharedNav />
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Private · Admin only</p><h1 className="text-3xl font-semibold">Proving Ground report</h1></div>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={report.isFetching} onClick={() => report.refetch()}>Refresh totals</button></div>
      <p className="text-muted-foreground">Combined visitor-time across all visits, including guests. Each open tab counts separately; visits are not unique people. Tracking starts with this release.</p>
      {report.isPending ? <p role="status">Loading totals…</p> : report.isError ? <p role="alert">Could not load totals. Try refreshing.</p> : <>
        <p className="text-sm text-muted-foreground">{totals.count || 0} recorded visits · {report.data.refreshed_at && `Refreshed ${new Date(report.data.refreshed_at).toLocaleString()}`}</p>
        <ProvingGroundTotals totals={totals} />
        {!totals.count && <p>No visits recorded yet.</p>}
      </>}
      <p className="text-sm text-muted-foreground">Totals save about once per minute, on tab hiding, and when leaving. Abrupt browser closure or loss of connection can lose the final unsaved interval. Browser measurements estimate playback, not whether a person heard the sound.</p>
    </main>
  </div>;
}