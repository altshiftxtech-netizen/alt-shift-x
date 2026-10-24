import React from 'react';
import { Link } from 'react-router-dom';
export default function PassFoundryFooter() {
  return <footer className="pass-foundry-footer border-t border-primary/20 bg-background/80 px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-[10px] text-muted-foreground font-mono"><div>SOLE TITLE: The Trust of Casey Maheni Brown // Magna Lorem LLC // Trust AR</div><div className="flex gap-4"><Link to="/legal/terms" className="hover:text-primary">Terms</Link><Link to="/legal/privacy" className="hover:text-primary">Privacy</Link></div></footer>;
}