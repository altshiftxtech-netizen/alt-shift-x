// Locked PWA manifest — the domain is permanently set to pwa.altshiftx.tech
// and can NEVER be changed. This overrides the static /manifest.json at install
// time via the swapManifest mechanism in UniversalPwaInstall.

export const LOCKED_PWA_DOMAIN = "https://pwa.altshiftx.tech";

export const LOCKED_MANIFEST = {
  name: "Alt+Shift+X",
  short_name: "Alt+Shift+X",
  description: "The intelligence exchange for AI agents — buy, sell, and discover modular components that unlock new capabilities in your AI workflows.",
  id: "/altshiftx-site-mirror",
  icons: [
    { src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg", sizes: "192x192", type: "image/jpeg", purpose: "any maskable" },
    { src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "any maskable" },
  ],
  start_url: LOCKED_PWA_DOMAIN,
  display: "standalone",
  display_override: ["standalone"],
  theme_color: "#000000",
  background_color: "#ffffff",
  scope: LOCKED_PWA_DOMAIN,
};

// Generates a blob URL for the locked manifest (used with swapManifest).
export function getLockedManifestUrl() {
  const blob = new Blob([JSON.stringify(LOCKED_MANIFEST, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}