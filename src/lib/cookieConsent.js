// GDPR/PECR cookie consent storage + pub/sub.
// Consent is stored per browser/session in localStorage. Non-essential
// categories default to FALSE — nothing fires until the user actively accepts.

const STORAGE_KEY = "altx_cookie_consent_v1";

// Category definitions. "essential" is always on (strictly necessary).
export const COOKIE_CATEGORIES = [
  {
    id: "essential",
    label: "Strictly Necessary",
    description: "Required for the site to function (login, security, session). Always on.",
    required: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Helps us understand how the site is used (Google Analytics page views).",
    required: false,
  },
  {
    id: "attribution",
    label: "Attribution",
    description: "Remembers referral/affiliate links so partners get credited.",
    required: false,
  },
];

const listeners = new Set();

export function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasDecided() {
  return getConsent() !== null;
}

export function isAllowed(category) {
  if (category === "essential") return true;
  const consent = getConsent();
  return !!(consent && consent.categories && consent.categories[category]);
}

// Persist the user's choice. `categories` is a map like { analytics: true, attribution: false }.
export function saveConsent(categories) {
  const record = {
    categories: { essential: true, ...categories },
    decided_at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore storage failures
  }
  listeners.forEach((fn) => fn(record));
  return record;
}

export function acceptAll() {
  return saveConsent({ analytics: true, attribution: true });
}

export function rejectAll() {
  return saveConsent({ analytics: false, attribution: false });
}

export function subscribeConsent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}