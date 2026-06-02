import { useEffect } from "react";

/**
 * Injects a <meta name="robots" content="noindex, nofollow"> tag while mounted,
 * and removes it on unmount. Use on private/authenticated pages so search engines
 * don't index them even if they ignore robots.txt.
 */
export default function NoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-noindex", "true");
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return null;
}