import React from 'react';
import kineticTextSvg from '@/components/upkeeper/kineticTextSvg';
import UpkeeperCursorSimulator from '@/components/upkeeper/UpkeeperCursorSimulator';
export default function UpkeeperKineticTextLayer({time=0,campaign,source,settings}){
  return <><div data-testid="kinetic-text-overlay" className="absolute inset-0 pointer-events-none" dangerouslySetInnerHTML={{__html:settings?.walkthrough?.enabled?'':kineticTextSvg(time,campaign,source,settings)}}/><UpkeeperCursorSimulator time={time} settings={settings}/></>;
}