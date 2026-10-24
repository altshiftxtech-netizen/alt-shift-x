import React from 'react';
import { Link } from 'react-router-dom';
import AboutSuiteLogo from '@/components/suite/about/AboutSuiteLogo';
export default function PassFoundryHeader() {
  return <header className="pass-foundry-header sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-primary/20 px-4 sm:px-6 py-3 flex items-center gap-4">
    <Link to="/" className="flex items-center gap-3 shrink-0"><span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-black">ASX</span><span className="font-black tracking-widest text-primary">ALTSHIFTX<span className="hidden lg:inline text-xs text-muted-foreground font-normal ml-2">SOVEREIGN PASS</span></span></Link>
    <nav className="pass-foundry-nav flex items-center gap-4 ml-auto text-xs font-mono"><Link to="/aboutaltshiftxsuite" className="text-secondary-foreground hover:text-primary">/aboutaltshiftxsuite</Link><Link to="/suite" className="rounded-full bg-primary text-primary-foreground px-3 py-2 font-bold">Launch Proving Ground →</Link></nav>
    <AboutSuiteLogo />
  </header>;
}