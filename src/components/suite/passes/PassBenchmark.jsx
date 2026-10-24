import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
export default function PassBenchmark() {
  return <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16 text-center"><div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-primary/10 to-transparent border border-primary/30">
    <ShieldCheck className="w-9 h-9 mx-auto mb-4 text-primary" aria-hidden="true" /><h2 className="text-xl font-black mb-3">72-Hour Benchmark Window</h2>
    <p className="text-xs sm:text-sm text-secondary-foreground max-w-xl mx-auto leading-relaxed">Evaluate your chosen node against your own hardware, workloads, and architecture requirements. Performance depends on your device and workload; refund eligibility follows the published refund policy.</p>
    <Link to="/legal/refunds" className="inline-block text-xs text-primary underline underline-offset-4 mt-4">Review the refund policy →</Link>
  </div></section>;
}