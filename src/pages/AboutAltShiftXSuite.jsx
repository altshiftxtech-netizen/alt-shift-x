import React from 'react';
import { Link } from 'react-router-dom';
import AboutSuiteContent from '@/components/suite/about/AboutSuiteContent';
import AboutSuiteLogo from '@/components/suite/about/AboutSuiteLogo';
import AboutSuiteWaves from '@/components/suite/about/AboutSuiteWaves';
import '@/components/suite/about/aboutSuite.css';
export default function AboutAltShiftXSuite({ embedded = false, onPasses, onReturn }) {
  return <div className={`about-suite about-suite-wave-surface bg-background text-foreground font-sans ${embedded ? 'about-suite-embedded' : 'min-h-screen'}`}>
    <AboutSuiteWaves />
    {!embedded && <header className="about-suite-header sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-primary/20 px-4 sm:px-6 flex items-center justify-between">
      <Link to="/" aria-label="Go to homepage" className="flex items-center gap-3 group"><AboutSuiteLogo /><div><span className="font-black tracking-widest text-base text-primary">ALTSHIFTX.TECH</span><span className="text-xs text-muted-foreground tracking-wider ml-2 hidden sm:inline">SOVEREIGN SUITE</span></div></Link>
      <div className="about-suite-header-actions flex items-center gap-4 text-xs font-mono"><Link to="/suite?modal=sovereignpass" className="text-secondary-foreground hover:text-primary transition-colors">/sovereignpass</Link><Link to="/suite" className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90">Launch Suite Hub →</Link></div>
    </header>}
    <AboutSuiteContent onPasses={onPasses} onReturn={onReturn} />
    {!embedded && <footer className="about-suite-footer bg-background/80 border-t border-primary/20 px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground font-mono"><div>SOLE TITLE: Magna Lorem // MGMT: Magna Lorem LLC // Secured Asset Repository: Trust AR LLC</div><div className="flex items-center gap-4"><Link to="/legal/terms" className="hover:text-primary">Terms</Link><Link to="/legal/privacy" className="hover:text-primary">Privacy</Link></div></footer>}
  </div>;
}