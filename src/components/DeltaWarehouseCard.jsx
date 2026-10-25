import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, Lock, ArrowRight } from 'lucide-react';
import DeltaIpSection from '@/components/warehouse/DeltaIpSection';
import DeltaAccountModal from '@/components/warehouse/DeltaAccountModal';
import { canInspectDelta, DELTA_SECURITY_STANDARD } from '@/components/warehouse/deltaAccess';
import '@/components/warehouse/deltaIp.css';

export default function DeltaWarehouseCard({ component, currentUser, onTriggerPurchase, detailPath, footer }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const allowed = canInspectDelta(currentUser);
  const handleActionClick = () => {
    if (!allowed) { setShowAuthModal(true); return; }
    onTriggerPurchase(component);
  };
  return <>
    <article data-testid="delta-component-card" data-component-id={component.id} data-security-standard={DELTA_SECURITY_STANDARD} className="delta-ip-theme relative rounded-3xl bg-card/80 border border-border hover:border-primary/30 p-6 flex flex-col justify-between transition-colors group shadow-lg min-w-0">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground border border-border">{component.category || 'Delta Core'}</span><div className="flex items-center gap-1.5 text-xs font-mono"><span className="delta-success inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{component.trust_score ?? 0}</span><span className="text-muted-foreground">·</span><span className="text-primary inline-flex items-center gap-1"><Star className="h-3 w-3" />{Number(component.rating ?? 0).toFixed(1)}</span></div></div>
        <Link to={detailPath || `/marketplace/${component.id}`} className="block"><h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors mb-1.5">{component.name}</h3><p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{component.description}</p></Link>
        <DeltaIpSection component={component} currentUser={currentUser} />
      </div>
      <div className="pt-2 border-t border-border flex flex-wrap gap-3 items-center justify-between"><div><div className="text-[10px] font-mono text-muted-foreground uppercase">Monthly Price</div><div className="text-lg font-black text-foreground font-mono">${component.price ?? 49}<span className="text-xs text-muted-foreground font-normal">/mo</span></div></div><button onClick={handleActionClick} className={allowed ? 'px-4 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground' : 'px-4 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border'}>{allowed ? <>{'Purchase & Install'}<ArrowRight className="h-3 w-3" /></> : <><Lock className="h-3 w-3" />{currentUser ? 'Developer Access Required' : 'Sign In to Buy'}</>}</button></div>
      {footer && <div className="mt-3">{footer}</div>}
    </article>
    <DeltaAccountModal component={component} currentUser={currentUser} open={showAuthModal} onOpenChange={setShowAuthModal} />
  </>;
}