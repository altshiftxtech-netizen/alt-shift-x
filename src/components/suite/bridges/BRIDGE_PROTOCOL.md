# Suite component bridge, version 1

The action bar sends the current JSON snapshot using postMessage, never an authentication token or paid entitlement. It does not use the navigation-only session bridge as a payload ticket.

Destinations are fixed to https://altshiftx.tech/codevault, /dblive, /bitfolio and /magna. Each click opens a new tab with `bridge=<random requestId>&source=<sender origin>`. The request expires after 60 seconds. A destination receiver must be installed in the respective node; these independently hosted node applications are not part of this workspace. Code Vault returned a Page Not Found during implementation.

## Receiver contract

1. Only trust explicitly configured sender origins (the production sender uses https://altshiftx.tech; previews need their own explicit origin if enabled). Do not trust the `source` query parameter alone. Verify `event.origin`, `event.source === window.opener`, the requested node, version, request ID and expiry. Each node must enforce its own login, permissions and import validation.
2. Sender sends `SUITE_BRIDGE_HELLO` with `{version:1, requestId, nodeId, expiresAt}` every 500ms until ready or expired.
3. When ready to receive, reply to `event.source` with `{type:'SUITE_BRIDGE_READY', requestId, nodeId}`, using the exact sender origin, never `*`.
4. Sender sends `{type:'SUITE_COMPONENT_IMPORT', version:1, requestId, nodeId, expiresAt, payload:<current component JSON>}` exactly once, and stops the hello loop. Keep the live request window and reject expired or duplicate imports; do not treat JSON fields as trusted executable code or entitlement claims.
5. After validation and successful receipt by the node's actual import flow, reply `{type:'SUITE_BRIDGE_ACCEPTED', requestId, nodeId}`. On rejection reply `SUITE_BRIDGE_REJECTED`. Track handled request IDs to avoid duplicate mutations and never derive external destinations from payload fields.
6. Sender only reports confirmed receipt after the authenticated-origin/window acknowledgment. Without a receiver it times out visibly, never claims a commit, ledger record or mint occurred. Receipt alone does not claim the node completed any subsequent operation.

No component JSON is placed in a URL or stored in browser storage by this bridge. Draft context is memory-only and resets when the app user changes. Publishing drafts remain available during in-app navigation; active builder drafts take precedence over catalog selections, which take precedence over publishing drafts. Reloading clears this context; a selected component can be restored explicitly with `/aibuilder?component=<id>` through the normal access-controlled entity read.