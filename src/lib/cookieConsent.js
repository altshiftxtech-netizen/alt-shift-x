// GDPR/PECR cookie consent storage + pub/sub.
// Consent is stored in a strictly-necessary first-party cookie `ax_cookie_consent`
// for up to 12 months. Non-essential categories default to FALSE — nothing
// fires until the user actively accepts.

const COOKIE_NAME = "ax_cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 12 months

// Category definitions. "essential" is always on (strictly necessary).
export const COOKIE_CATEGORIES = [
  {
    id: "essential",
    label: "Strictly Necessary",
    description: "Required for the site to function — login, security, sessions, and payment processing. Always on.",
    required: true,
  },
  {
    id: "functional",
    label: "Functional",
    description: "Remembers your preferences and settings to improve your experience.",
    required: false,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Helps us understand how the Platform is used (Google Analytics page views).",
    required: false,
  },
  {
    id: "marketing",
    label: "Marketing & Attribution",
    description: "Remembers referral/affiliate links so partners get credited for sign-ups.",
    required: false,
  },
];

const listeners = new Set();

function readCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getConsent() {
  try {
    const raw = readCookie(COOKIE_NAME);
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

// Persist the user's choice. `categories` is a map like { analytics: true, marketing: false }.
export function saveConsent(categories) {
  const record = {
    categories: { essential: true, ...categories },
    decided_at: new Date().toISOString(),
  };
  try {
    writeCookie(COOKIE_NAME, JSON.stringify(record));
  } catch {
    // ignore storage failures
  }
  listeners.forEach((fn) => fn(record));
  return record;
}

export function acceptAll() {
  return saveConsent({ functional: true, analytics: true, marketing: true });
}

export function rejectAll() {
  return saveConsent({ functional: false, analytics: false, marketing: false });
}

export function subscribeConsent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}