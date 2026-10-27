import React from 'react';

function duration(seconds = 0) {
  const value = Math.floor(seconds);
  return `${Math.floor(value / 3600).toLocaleString()}h ${Math.floor(value % 3600 / 60)}m ${value % 60}s`;
}
export default function ProvingGroundTotals({ totals }) {
  const metrics = [
    ['All open-page time', 'open_seconds', 'Time the Proving Ground remains mounted, including hidden tabs.'],
    ['Visible-tab time', 'visible_seconds', 'Time the Proving Ground tab is visible.'],
    ['Active interaction time', 'active_seconds', 'Visible time within 30 seconds of a pointer, keyboard, or scroll interaction.'],
    ['Theme music playback', 'music_seconds', 'Playing, unmuted audio with a running audio output; excludes pauses and buffering.'],
  ];
  return <div className="grid gap-4 sm:grid-cols-2">
    {metrics.map(([label, field, description]) => <section key={field} className="rounded-lg border border-border bg-card text-card-foreground p-6">
      <h2 className="text-sm font-semibold text-muted-foreground">{label}</h2>
      <p data-metric={field} className="my-3 text-3xl font-semibold tabular-nums">{duration(totals[`sum_${field}`])}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </section>)}
  </div>;
}