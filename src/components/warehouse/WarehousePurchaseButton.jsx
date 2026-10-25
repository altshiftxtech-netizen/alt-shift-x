import React, { useState } from 'react';
import { Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { canInspectDelta } from '@/components/warehouse/deltaAccess';
import DeltaPurchaseGate from '@/components/warehouse/DeltaPurchaseGate';

export default function WarehousePurchaseButton({ component, componentId }) {
  const { user, isLoadingAuth } = useAuth();
  const [open, setOpen] = useState(false);
  if (isLoadingAuth) return <Button disabled size="sm">Checking account…</Button>;
  const item = component || { id: componentId, name: 'Selected component' };
  return <><Button size="sm" variant="secondary" onClick={() => setOpen(true)}>{canInspectDelta(user) ? <ShoppingBag className="h-4 w-4" /> : <Lock className="h-4 w-4" />}{canInspectDelta(user) ? 'Purchase & Install' : user ? 'Developer Access Required' : 'Sign In to Buy'}</Button>{open && <DeltaPurchaseGate component={item} currentUser={user} onClose={() => setOpen(false)} />}</>;
}