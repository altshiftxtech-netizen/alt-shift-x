import React from 'react';
import ReelStudio from '@/components/upkeeper/ReelStudio';
export default function UpkeeperReelEngine({assets,...props}) {
  return <ReelStudio {...props} assets={{...assets,campaign:assets.reelCampaign||assets.campaign}} autoRun={assets.reelRequest}/>;
}