// Affiliate / referral capture utilities.
// Captures ?ref=CODE from any landing URL and persists it so it survives
// the visitor browsing around before they sign up.

const REF_KEY = "asx_ref_code";

/**
 * Reads ?ref=CODE from the current URL and stores it in localStorage.
 * Call this once on app mount. Also bumps the link's click counter (once per code per browser).
 */
export function captureRefFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const existing = localStorage.getItem(REF_KEY);
      localStorage.setItem(REF_KEY, ref);
      // Only count a click the first time we see this code in this browser
      if (existing !== ref) {
        registerClick(ref);
      }
    }
  } catch {
    // localStorage unavailable (private mode / iframe) — silently ignore
  }
}

/** Returns the stored ref code, or null. */
export function getStoredRef() {
  try {
    return localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

/** Clears the stored ref (called after a successful attribution). */
export function clearStoredRef() {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {
    // ignore
  }
}

async function registerClick(code) {
  try {
    const { base44 } = await import("@/api/base44Client");
    await base44.functions.invoke("trackAffiliate", { action: "click", code });
  } catch {
    // best-effort, never block the page
  }
}