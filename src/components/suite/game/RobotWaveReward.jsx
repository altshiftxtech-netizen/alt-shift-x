import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export default function RobotWaveReward({ reward }) {
  return <Dialog open={reward.open} onOpenChange={reward.dismiss}>
    <DialogContent>
      <DialogTitle>The robots are waving back</DialogTitle>
      <DialogDescription>Together, visitors have reached 500,000 robot waves.</DialogDescription>
      <p>The community has unlocked 20% off Dynamic Flex, Duo-Mesh Founder, and All-Access Apex, including every monthly renewal.</p>
      <p className="text-sm text-muted-foreground">Applied automatically when starting an eligible new pass subscription. Existing subscriptions are unchanged.</p>
      <Button asChild><Link to="/sovereignpass" onClick={() => reward.dismiss(false)}>Choose a monthly pass</Link></Button>
      <Button variant="outline" onClick={() => reward.dismiss(false)}>Return to the ground</Button>
    </DialogContent>
  </Dialog>;
}