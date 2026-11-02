import React from 'react';
import {logoSvg} from '@/components/upkeeper/creativeAssets';
export default function UpkeeperEmblemEngine({settings}) {
  return <div className="emblem-canvas rounded-2xl border bg-secondary flex items-center justify-center p-4" aria-label="Live emblem canvas"><div data-testid="logo-preview" className="w-full max-w-96" dangerouslySetInnerHTML={{__html:logoSvg(settings)}}/></div>;
}