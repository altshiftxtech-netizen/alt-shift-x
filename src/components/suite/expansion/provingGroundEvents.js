export const PROVING_GROUND_ENGINE = 'SYS-PROVING-GROUND-INTERACTIVE-DISCOUNT-ENGINE-1.0';

export default function provingGroundEvents(type, detail) {
  const payload = { ...detail, timestamp: Date.now() };
  window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  // Notification bridge only. Browser events never grant paid entitlements.
  window.dispatchEvent(new CustomEvent(PROVING_GROUND_ENGINE, { detail: { event: type, ...payload } }));
}