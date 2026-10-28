import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AboutSuiteWaves from '@/components/suite/about/AboutSuiteWaves';
import PassFoundryHeader from '@/components/suite/passes/PassFoundryHeader';
import PassFoundryHero from '@/components/suite/passes/PassFoundryHero';
import PassNodeSwapper from '@/components/suite/passes/PassNodeSwapper';
import PassTierCard from '@/components/suite/passes/PassTierCard';
import PassBenchmark from '@/components/suite/passes/PassBenchmark';
import PassFoundryFooter from '@/components/suite/passes/PassFoundryFooter';
import usePassCheckout from '@/components/suite/passes/usePassCheckout';
import PersonalRewardNotice from '@/components/suite/passes/PersonalRewardNotice';
import { PASS_NODES, PASS_TIERS } from '@/components/suite/passes/passFoundryData';
import '@/components/suite/about/aboutSuite.css';
import '@/components/suite/passes/passFoundry.css';
export default function SovereignPassPage({ embedded = false }) {
  const [params] = useSearchParams();
  const [nodeId, setNodeId] = useState(() => PASS_NODES.some(node => node.id === params.get('node')) ? params.get('node') : 'codevault');
  const [secondNodeId, setSecondNodeId] = useState(() => PASS_NODES.some(node => node.id === params.get('second') && node.id !== nodeId) ? params.get('second') : nodeId === 'dblive' ? 'codevault' : 'dblive');
  const [selectedTier, setSelectedTier] = useState(params.get('tier') || 'flex');
  const { busy, error, activate } = usePassCheckout(nodeId, secondNodeId);
  const chooseNode = id => { if (id === secondNodeId) setSecondNodeId(nodeId); setNodeId(id); };
  return <div className={`about-suite sovereign-pass about-suite-wave-surface bg-background text-foreground font-sans ${embedded ? 'pass-foundry-embedded' : 'min-h-screen'}`} data-standard="SYS-SOVEREIGN-PASS-VERSATILITY-ENGINE-1.0">
    <AboutSuiteWaves />{!embedded && <PassFoundryHeader />}
    <div className="pass-foundry-content"><PassFoundryHero />
      {params.get('canceled') === '1' && <p role="status" className="text-center text-sm text-muted-foreground px-4 mb-6">Checkout canceled. No payment was completed; your selection is preserved.</p>}
      <PassNodeSwapper nodeId={nodeId} onChoose={chooseNode} />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16" aria-label="Pass tiers"><div className="text-center mb-8"><h2 className="text-2xl font-black">Choose Your Level of Versatility</h2><p className="text-xs text-muted-foreground mt-2">One focused sprint or a monthly pass that moves with your roadmap.</p><p className="text-xs text-primary mt-3">Starting node: {PASS_NODES.find(node => node.id === nodeId).name}</p></div>
        <PersonalRewardNotice tierId={selectedTier} nodeId={nodeId} secondNodeId={secondNodeId} />
        {error && <p role="alert" className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm mb-5">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">{PASS_TIERS.map(tier => <PassTierCard key={tier.id} tier={tier} selected={selectedTier === tier.id} nodeId={nodeId} secondNodeId={secondNodeId} onSecondNode={setSecondNodeId} busy={busy} onActivate={value => { setSelectedTier(value.id); activate(value); }} />)}</div>
      </section><PassBenchmark />
    </div>{!embedded && <PassFoundryFooter />}
  </div>;
}