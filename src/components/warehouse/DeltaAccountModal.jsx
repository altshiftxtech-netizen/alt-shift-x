import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { deltaReturnPath } from '@/components/warehouse/deltaAccess';
import '@/components/warehouse/deltaIp.css';

export default function DeltaAccountModal({ component, currentUser, open, onOpenChange }) {
  const returnTo = encodeURIComponent(deltaReturnPath());
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="delta-ip-theme bg-card text-card-foreground border-primary/40 rounded-3xl max-w-md p-6 sm:p-8 text-center">
    <ShieldCheck className="mx-auto h-12 w-12 rounded-2xl p-3 text-primary bg-primary/10 border border-primary/30" />
    <DialogTitle className="text-lg font-black">{currentUser ? 'Developer Access Required' : 'Free Developer Account Required'}</DialogTitle>
    <DialogDescription className="text-xs leading-relaxed text-muted-foreground">To protect Delta Warehouse intellectual property and proprietary AST schemas, purchases and detailed specifications require at least a verified Free Developer Account.{currentUser && ' Your current account role does not include developer access. An administrator can assign the appropriate role.'}</DialogDescription>
    <div className="rounded-2xl bg-secondary/50 border border-border p-4 text-left"><p className="text-[10px] text-primary font-mono uppercase font-bold mb-1">Intended item:</p><p className="font-bold text-sm">{component.name}</p><p className="text-xs text-muted-foreground font-mono">${component.price ?? 49}/mo · Instant Key Provisioning</p></div>
    {!currentUser && <div className="space-y-2.5"><Link to={`/register?role=developer&returnTo=${returnTo}`} className="block rounded-xl py-3 text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90">Create Free Developer Account →</Link><Link to={`/login?returnTo=${returnTo}`} className="block rounded-xl py-3 text-xs font-bold bg-secondary text-secondary-foreground border border-border">Already have an account? Sign In</Link></div>}
    <p className="text-[10px] text-muted-foreground font-mono">Zero Token Surcharges · Immediate Node Access · 72-Hr Escrow Protection</p>
  </DialogContent></Dialog>;
}