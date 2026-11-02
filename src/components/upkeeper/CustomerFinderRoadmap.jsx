import React from 'react';

export default function CustomerFinderRoadmap({weeks}) {
  return <section className="rounded-xl border p-4 space-y-4 min-w-0" aria-label="3-Week Sprint Roadmap">
    <h3 className="text-lg font-semibold">3. 3-Week Sprint Roadmap</h3>
    <p className="text-xs text-muted-foreground">21 daily actions · $0 ad spend. Start with Day 1; goals are targets, not guaranteed paying customers.</p>
    {weeks.map((week,i)=><article key={i} className="space-y-3 border-t pt-4">
      <h4 className="font-semibold text-sm break-words">{week.title}</h4>
      <ol className="space-y-3">{(week.days||week.actions.map((action,j)=>({day:i*7+j+1,action}))).map((day,j)=><li key={j} className="text-sm break-words" data-testid="customer-finder-day"><span className="font-semibold">Day {day.day}</span><p>{day.action}</p>{day.success_metric&&<p className="text-xs text-muted-foreground mt-1">Measure: {day.success_metric}</p>}</li>)}</ol>
      <p className="text-xs text-muted-foreground">Goal: {week.goal}</p>
    </article>)}
  </section>;
}