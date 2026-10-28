export const personalGameGoal = 50;
export async function personalGameRecord(client, userId) {
  const { items } = await client.asServiceRole.entities.PersonalGameProgress.filter({ user_id: userId }, { sort: '-created_date', limit: 1 });
  return items[0] || null;
}
export async function personalGameUnlocked(client, userId) {
  const { items } = await client.asServiceRole.entities.PersonalGameProgress.filter({ user_id: userId, successes: { $gte: personalGameGoal } }, { limit: 1 });
  return items.length > 0;
}
export function personalGameStatus(record) {
  return { successes: record?.successes || 0, planted: record?.planted || [], goal: personalGameGoal, unlocked: (record?.successes || 0) >= personalGameGoal };
}