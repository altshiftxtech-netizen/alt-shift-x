# Suite subpath proxy deployment

Deploy `cloudflareSuiteProxy.js` as the standalone Cloudflare Worker `altshiftx-suite-proxy`. This is deployment source only: saving it in this Base44 project does not deploy or update Cloudflare. Keep the existing Worker route for `altshiftx.tech/*` and any separately configured www route unchanged.

## Request mapping

- `/dblive?session_bridge=TOKEN` -> `https://dblive-sovereign-database.base44.app/?session_bridge=TOKEN`
- `/dblive/settings` -> `https://dblive-sovereign-database.base44.app/settings`
- `/dblive/assets/main.js` -> `https://dblive-sovereign-database.base44.app/assets/main.js`
- `/dblivex` -> the master hub, not dbLive.
- All eight node prefixes use the same exact-boundary matching and stripping.
- Unmatched paths use `https://unlock-agent-flow.base44.app`.

Compared with the supplied Worker, this version also rewrites 303 redirects, resolves relative redirect locations against the actual upstream request, preserves redirect fragments, handles GET/HEAD without a body, preserves explicit HTML links to other suite nodes, leaves protocol-relative URLs alone, and prevents `//` paths from changing the selected upstream origin. Token-bearing responses use no-store and no-referrer.

## Required deployment verification

Not deployed or verified in Cloudflare from this workspace. After deployment, check each node's landing page, a real deep link, its assets, and its login/API flow. Confirm the body actually shows the intended app, not merely HTTP 200. Inspect redirects to confirm they retain the node prefix.

HTML rewriting changes server-generated attributes only. It does NOT rewrite compiled JavaScript, CSS url() references, dynamically created links, service-worker scope, cookies, client-side router behavior, or root-relative SDK API requests. Each target app needs a compatible router basename and asset/API configuration for full subpath operation. Do not route all shared `/api` or `/assets` requests using Referer guesses; requests without a prefix are ambiguous. The other apps' code is not available in this workspace.

## Signed navigation versus authentication

The existing outbound Bento click calls `createSessionBridge`. It returns an HMAC-SHA-256 signed navigation token lasting 60 seconds. This Worker preserves the query string while stripping the path prefix.

The existing `validateSessionBridge` verifies expiry, signature, issuer, destination, and path. It deliberately returns `grantsSession: false`. Tokens contain no user identity or platform session credentials. They are not single-use login credentials and must not be used to authorize protected requests.

No inbound target application integration or cross-app sign-in is implemented by this Worker. Target-side verification must be added in each target project. A valid navigation token cannot hydrate a Base44 authenticated session; session establishment needs a supported platform authentication exchange. Do not call setToken with this handoff, set an authenticated flag in browser storage, or grant entitlements from it. No custom authentication backend is provided here.

Signing and proxying do not invoke an AI model. That does not guarantee zero hosting, Worker, backend-function, or other usage charges.