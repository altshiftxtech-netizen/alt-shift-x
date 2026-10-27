export const ROCKET_DEMO_KEY = 'suite-rocket-demo-v1';
export const DEMO_PASSES = ['Dynamic Flex', 'Duo-Mesh Founder', 'All-Access Apex'];
export const emptyRocketDemo = () => ({ pressure: 0, launches: 0, reward: null });
export function loadRocketDemo() {
  return JSON.parse(sessionStorage.getItem(ROCKET_DEMO_KEY) || 'null') || emptyRocketDemo();
}
export function saveRocketDemo(state) {
  sessionStorage.setItem(ROCKET_DEMO_KEY, JSON.stringify(state));
}
export function fuelRocketDemo(state, signedIn, now = Date.now()) {
  const pressure = state.pressure + (signedIn ? 2 : 1);
  if (pressure < 100) return { ...state, pressure };
  return { pressure: 0, launches: state.launches + 1, reward: {
    code: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    expiresAt: now + 15 * 60 * 1000, claimed: false, tier: null,
  } };
}
export function claimRocketDemo(state, tier, now = Date.now()) {
  if (!state.reward || state.reward.claimed || state.reward.expiresAt <= now || !DEMO_PASSES.includes(tier)) return state;
  return { ...state, reward: { ...state.reward, claimed: true, tier } };
}