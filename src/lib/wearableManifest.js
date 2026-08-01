// Wearable & Voice PWA manifest — SOV-WEARABLE-VOICE-1.0.
// A glanceable, high-contrast shell for smartwatches (watchOS/Wear OS) and
// voice-assistant surfaces (Alexa/Siri/Google Assistant). Installed alongside
// the secure API-key gateway (base44/functions/wearableGateway).

const WEARABLE_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png";

const WEARABLE_MANIFEST_BASE = {
  short_name: "ASX Wear",
  display: "standalone",
  display_override: ["standalone"],
  // High-contrast pure-black + gold for OLED watch faces / glanceable reads.
  theme_color: "#000000",
  background_color: "#000000",
  orientation: "portrait",
  categories: ["productivity", "utilities"],
  icons: [
    { src: WEARABLE_LOGO, sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: WEARABLE_LOGO, sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
};

// Generates a blob URL for the wearable PWA manifest. `gatewayDomain` is the
// domain the wearable/voice surface reaches the gateway on (defaults to the
// portal). The start_url deep-links into the glanceable gateway status page.
export function getWearableManifestUrl(gatewayDomain = "") {
  let normalized = gatewayDomain.trim();
  if (normalized && !normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  normalized = normalized.replace(/\/+$/, "");
  const startUrl = normalized || "https://altshiftx.tech/dashboard/pwa";
  const manifest = {
    ...WEARABLE_MANIFEST_BASE,
    id: "/asx-wearable-voice",
    name: "Alt+Shift+X Wearable & Voice",
    description: "SOV-WEARABLE-VOICE-1.0 · Glanceable substrate access for smartwatches & voice assistants via a secure API-key gateway.",
    start_url: startUrl,
    scope: startUrl,
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}