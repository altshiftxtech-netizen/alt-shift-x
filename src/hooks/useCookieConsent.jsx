import { useState, useEffect, useCallback } from "react";
import { getConsent, isAllowed, subscribeConsent } from "@/lib/cookieConsent";

/**
 * useCookieConsent — reactive view of the stored consent record.
 * Re-renders whenever consent changes (accept/reject/save).
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(() => getConsent());

  useEffect(() => {
    return subscribeConsent((record) => setConsent(record));
  }, []);

  const allowed = useCallback((category) => {
    // read live so it reflects the latest decision
    return isAllowed(category);
  }, [consent]);

  return { consent, decided: consent !== null, allowed };
}