import React from 'react';
import kineticTextSvg from '@/components/upkeeper/kineticTextSvg';
export default function UpkeeperKineticTextLayer({time=0,campaign,source,settings}){
  return <div data-testid="kinetic-text-overlay" className="absolute inset-0 pointer-events-none" dangerouslySetInnerHTML={{__html:kineticTextSvg(time,campaign,source,settings)}}/>;
}