export const robotWaveCampaign = 'robot-waves-v1';
export const robotWaveCoupon = 'asx_robot_waves_20_forever_v1';
export const robotWaveGoal = 500000;
export const robotWaveRooms = Array.from({ length: 64 }, (_, i) => `robot-waves-v1-${i}`);
export async function robotWaveUnlocked(client) {
  const result = await client.entities.RobotWaveShard.aggregate({ query: { campaign: robotWaveCampaign, room_id: { $in: robotWaveRooms } }, sum: ['total'] });
  return (result.rows?.[0]?.sum_total || 0) >= robotWaveGoal;
}