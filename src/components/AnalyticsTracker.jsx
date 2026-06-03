import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = "G-VH2R8WDX7K";

// Paths that must NEVER be sent to Google Analytics (protect proprietary / sensitive areas)
const EXCLUDED_PREFIXES = ["/speakeasy"];

function isExcluded(pathname) {
  return EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Sends a GA page_view on every route change, except on excluded paths
 * (e.g. the Speakeasy). Loads nothing itself — gtag is bootstrapped in index.html.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    if (isExcluded(location.pathname)) return;

    window.gtag("config", GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}