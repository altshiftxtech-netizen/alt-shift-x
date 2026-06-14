import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAllowed } from "@/lib/cookieConsent";

const GA_ID = "G-VH2R8WDX7K";

// Paths that must NEVER be sent to Google Analytics (protect proprietary / sensitive areas)
const EXCLUDED_PREFIXES = ["/speakeasy"];

function isExcluded(pathname) {
  return EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// Inject gtag.js once at runtime so it is guaranteed present on the published
// domain even when the served index.html <head> is stripped/replaced.
function ensureGtagLoaded() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/**
 * Sends a GA page_view on every route change, except on excluded paths
 * (e.g. the Speakeasy). Loads nothing itself — gtag is bootstrapped in index.html.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // GDPR/PECR: analytics is non-essential — do nothing until the user consents.
    if (!isAllowed("analytics")) return;
    if (isExcluded(location.pathname)) return;
    ensureGtagLoaded();
    window.gtag("config", GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}