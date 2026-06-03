import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureRefFromUrl } from "@/lib/affiliate";

// Captures ?ref=CODE on every navigation and persists it for later attribution.
export default function AffiliateCapture() {
  const location = useLocation();
  useEffect(() => {
    captureRefFromUrl();
  }, [location.search]);
  return null;
}