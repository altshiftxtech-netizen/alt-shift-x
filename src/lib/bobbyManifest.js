// BOBby PWA manifests — BOBby the Build Yielder.
// 1.0 = standard builder yield; 1.1 = enterprise yield (enterprise role only).

const BOBBY_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png";

const BOBBY_MANIFEST_BASE = {
  short_name: "BOBby",
  display: "standalone",
  display_override: ["standalone"],
  theme_color: "#000000",
  background_color: "#000000",
  icons: [
    { src: BOBBY_LOGO, sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: BOBBY_LOGO, sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
};

// Generates a blob URL for a BOBby manifest. Enterprise (1.1) yields a distinct
// name/description so the installed shell is identifiable as the enterprise build.
export function getBobbyManifestUrl(version = "1.0", domain = "") {
  const isEnterprise = version === "1.1";
  let normalized = domain.trim();
  if (normalized && !normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  normalized = normalized.replace(/\/+$/, "");
  const startUrl = normalized || "https://altshiftx.tech/builder/bobby";

  const manifest = {
    ...BOBBY_MANIFEST_BASE,
    id: isEnterprise ? "/bobby-1-1-enterprise" : "/bobby-1-0",
    name: isEnterprise ? "BOBby 1.1 Enterprise" : "BOBby 1.0",
    description: isEnterprise
      ? "BOBby 1.1 Enterprise · Sovereign build yielder — enterprise substrate access."
      : "BOBby 1.0 · Builder Operated Bot Build Yielder — the developer's canvas.",
    start_url: startUrl,
    scope: startUrl,
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}