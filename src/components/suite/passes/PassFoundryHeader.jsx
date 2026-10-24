import React from 'react';
import { Link } from 'react-router-dom';

export default function PassFoundryHeader() {
  return <header className="pass-foundry-header sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-primary/20 px-4 sm:px-6 py-3 flex items-center gap-4">
    <Link to="/" className="flex items-center gap-3 shrink-0"><img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/5f7d18ff8_Screenshot2026-10-24001241.png" alt="altshiftx.tech suite logo" width="48" height="48" className="w-12 h-12 object-contain shrink-0" /><span className="font-black tracking-widest text-primary">ALTSHIFTX<span className="hidden lg:inline text-xs text-muted-foreground font-normal ml-2">SOVEREIGN PASS</span></span></Link>
    <nav className="pass-foundry-nav flex items-center gap-4 ml-auto text-xs font-mono"><Link to="/aboutaltshiftxsuite" className="text-secondary-foreground hover:text-primary">/aboutaltshiftxsuite</Link><Link to="/suite" className="rounded-full bg-primary text-primary-foreground px-3 py-2 font-bold">Launch Proving Ground →</Link></nav>
  </header>;
}