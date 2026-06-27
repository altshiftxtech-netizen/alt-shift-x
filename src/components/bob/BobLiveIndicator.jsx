import React, { useEffect, useState } from "react";

/**
 * Live/connectivity badge for BOB.
 * Reflects the browser's real internet connection: green "LIVE" when online and
 * ready to take queries, red "OFFLINE" when the connection drops. Verifies the
 * initial state with a lightweight network probe so a stale `navigator.onLine`
 * doesn't show LIVE while actually disconnected.
 */
export default function BobLiveIndicator({ className = "" }) {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Confirm real connectivity on mount (navigator.onLine can be stale).
    let cancelled = false;
    fetch("https://www.gstatic.com/generate_204", { method: "GET", mode: "no-cors", cache: "no-store" })
      .then(() => { if (!cancelled) setOnline(true); })
      .catch(() => { if (!cancelled) setOnline(false); });

    return () => {
      cancelled = true;
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) {
    return (
      <span className={`text-[10px] bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full font-semibold animate-pulse ${className}`}>
        ● LIVE
      </span>
    );
  }
  return (
    <span className={`text-[10px] bg-red-900 text-red-400 px-2 py-1 rounded-full font-semibold ${className}`}>
      ● OFFLINE
    </span>
  );
}