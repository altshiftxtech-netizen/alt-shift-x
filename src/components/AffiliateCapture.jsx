import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureRefFromUrl } from "@/lib/affiliate";
import { isAllowed } from "@/lib/cookieConsent";

// Captures ?ref=CODE on every navigation and persists it for later attribution.
export default function AffiliateCapture() {
  const location = useLocation();
  useEffect(() => {
    // GDPR/PECR: attribution is non-essential — only persist after consent.
    if (!isAllowed("attribution")) return;
    captureRefFromUrl();
  }, [location.search]);
  return null;
}