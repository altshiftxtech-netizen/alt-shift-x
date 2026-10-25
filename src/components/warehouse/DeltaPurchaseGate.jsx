import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InstallButton from '@/components/InstallButton';
import DeltaAccountModal from '@/components/warehouse/DeltaAccountModal';
import { canInspectDelta } from '@/components/warehouse/deltaAccess';
import '@/components/warehouse/deltaIp.css';

export default function DeltaPurchaseGate({ component, currentUser, onClose, installedRecord, onUninstalled }) {
  if (!component) return null;
  if (!canInspectDelta(currentUser)) return <DeltaAccountModal component={component} currentUser={currentUser} open onOpenChange={open => { if (!open) onClose(); }} />;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="delta-ip-theme bg-card text-card-foreground rounded-3xl border-primary/30 max-h-[90dvh] overflow-y-auto">
    <DialogTitle>Purchase &amp; Install</DialogTitle><DialogDescription className="text-muted-foreground">{component.name} · ${component.price ?? 49}/mo. Review the required acknowledgments before continuing.</DialogDescription>
    <InstallButton component={component} userId={currentUser.id} installedRecord={installedRecord} onUninstalled={id => { onUninstalled?.(id); onClose(); }} />
  </DialogContent></Dialog>;
}