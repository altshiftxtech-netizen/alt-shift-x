import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { robotWaveUnlocked } from '../../shared/robotWaveReward.ts';
export default async function(req) {
  try {
    // Deliberately public campaign status; no personal records or service-role writes.
    const base44 = createClientFromRequest(req);
    const unlocked = await robotWaveUnlocked(base44);
    return Response.json({ unlocked, percentOff: unlocked ? 20 : 0, duration: 'forever' });
  } catch (error) {
    console.error('[getRobotWaveReward]', error.message);
    return Response.json({ error: 'Community reward status is unavailable.' }, { status: 500 });
  }
}