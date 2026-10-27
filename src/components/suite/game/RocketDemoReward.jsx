import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DEMO_PASSES } from '@/components/suite/game/rocketDemoSession';
export default function RocketDemoReward({ game }) {
  const reward = game.state.reward;
  const [tier, setTier] = useState(DEMO_PASSES[0]), [acknowledged, setAcknowledged] = useState(false), [now, setNow] = useState(Date.now);
  useEffect(() => { setTier(DEMO_PASSES[0]); setAcknowledged(false); }, [reward?.code]);
  useEffect(() => { if (!game.open) return; setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [game.open]);
  if (!reward) return null;
  const remaining = Math.max(0, Math.ceil((reward.expiresAt - now) / 1000)), expired = !remaining;
  return <Dialog open={game.open} onOpenChange={game.setOpen}>
    <DialogContent className="proving-reward">
      <span className="demo-badge">DEMO ONLY · NO MONETARY VALUE</span>
      <DialogTitle>DELTA MILESTONE ACHIEVED</DialogTitle>
      <DialogDescription>100 pressure reached. Demo launch #{game.state.launches}: one simulated free month unlocked.</DialogDescription>
      <p className="text-sm">Choose Dynamic Flex, Duo-Mesh Founder, or All-Access Apex. This demonstration does not grant access, charge a card, or issue a Stripe promotion.</p>
      {reward.claimed ? <p role="status" className="font-semibold">Demo reward claimed for {reward.tier}. No paid access was granted.</p> : expired ? <p role="status">This demo reward expired. Fuel the rocket to earn another.</p> : <>
        <label className="text-sm" htmlFor="rocket-demo-tier">Demo pass<select id="rocket-demo-tier" value={tier} onChange={event => setTier(event.target.value)}>{DEMO_PASSES.map(name => <option key={name}>{name}</option>)}</select></label>
        {!game.signedIn && <label className="demo-ack"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I understand this is a demo, not a redeemable discount.</label>}
        <Button onClick={() => game.claim(tier)} disabled={!game.signedIn && !acknowledged}>Claim demo month</Button>
      </>}
      <code>{reward.code}</code>
      <p className="text-xs text-muted-foreground">{reward.claimed ? 'Single-use demo claim recorded in this browser tab.' : `Demo claim expires in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}.`} Not valid at checkout.</p>
      <Button variant="outline" onClick={() => game.setOpen(false)}>Return to Proving Ground</Button>
    </DialogContent>
  </Dialog>;
}