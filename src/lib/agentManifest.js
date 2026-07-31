// Agent Wrapper PWA manifest — the domain is USER-CONFIGURABLE.
// Unlike the Site Mirror (locked to pwa.altshiftx.tech via lockedManifest.js),
// the Agent Wrapper can be deployed to any domain the user specifies.

export const DEFAULT_AGENT_DOMAIN = "https://pwa.altshiftx.tech";

export const AGENT_MANIFEST_BASE = {
  name: "Agent Wrapper",
  short_name: "Agent Wrapper",
  description: "PWA-AGENT-WRAPPER-1.0 · Generic Office — portable neutral container for AI services.",
  icons: [
    { src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png", sizes: "192x192", type: "image/png" },
    { src: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png", sizes: "512x512", type: "image/png" },
  ],
  display: "standalone",
  theme_color: "#0d1117",
  background_color: "#ffffff",
};

// Generates a blob URL for a manifest with the user-specified domain.
export function getAgentManifestUrl(domain = DEFAULT_AGENT_DOMAIN) {
  let normalized = domain.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  normalized = normalized.replace(/\/+$/, "");

  const manifest = {
    ...AGENT_MANIFEST_BASE,
    start_url: normalized,
    scope: normalized,
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}