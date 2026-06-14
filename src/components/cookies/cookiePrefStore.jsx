// Tiny global trigger so any "Cookie Settings" link can open the preference
// center, regardless of where it lives in the tree.
const openListeners = new Set();

export function openCookiePreferences() {
  openListeners.forEach((fn) => fn());
}

export function onOpenCookiePreferences(fn) {
  openListeners.add(fn);
  return () => openListeners.delete(fn);
}