import React from 'react';
import walkthroughSvg from '@/components/upkeeper/walkthroughSvg';
export default function UpkeeperCursorSimulator({time=0,settings={}}){
  if(!settings.walkthrough?.enabled)return null;
  return <div data-testid="walkthrough-motion-overlay" className="absolute inset-0 pointer-events-none" dangerouslySetInnerHTML={{__html:walkthroughSvg(time,settings)}}/>;
}