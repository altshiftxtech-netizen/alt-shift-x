# Sentinel Security Layer — Standing Practices

**Purpose:** A living checklist of security/auth standards that MUST be upheld on every change to this app from here on out. Treat every item below as a non-negotiable baseline. When adding new pages, routes, auth flows, or backend functions, re-verify the relevant sections.

**Last updated:** 2026-06-02

---

## 1. Page Discoverability & Indexing

Only **public marketing pages** may be crawled or indexed. Everything authenticated must be invisible to search engines and protected at runtime.

**Public (indexable):** `/`, `/marketplace`, `/marketplace/:id`, `/pricing`, `/builders/:id`, `/privacy`, `/terms`, `/contact`, `/tutorials`, `/sensitive-intelligence-policy`, `/mobile`

**Private (never indexed):** all `/dashboard/*`, `/builder/*`, `/admin/*`, `/finance`, `/vendor-portal`, `/api-partners`, `/spend-intelligence`, `/vendor-scores`, `/onboarding`, and all auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/success/*`).

**Controls in place:**
- `public/robots.txt` — explicitly `Allow`s public pages and `Disallow`s every private section. **Update this file whenever a new route is added.**
- `components/NoIndex.jsx` — injects `<meta name="robots" content="noindex, nofollow">` while mounted.
- `NoIndex` is wired into `components/ProtectedRoute.jsx`, so **every** protected route is automatically `noindex` even if a crawler ignores robots.txt.

**Rule:** Any new private page MUST go inside the `ProtectedRoute` group in `App.jsx` AND be added to `robots.txt` `Disallow`. Any new public page MUST be added to `robots.txt` `Allow`.

---

## 2. Route Protection (Direct-Access Defense)

- All authenticated routes live under the `<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />` layout route in `App.jsx`.
- `ProtectedRoute` renders the login redirect (or `UserNotRegisteredError`) until auth is confirmed — direct URL access to a private page redirects to `/login`, never leaks content.
- Backend RLS on every entity is the second layer — frontend gating is never the only defense.

**Rule:** Never expose a data-bearing or admin page outside `ProtectedRoute`. Never rely on UI hiding alone.

---

## 3. Authentication Flow Standards

**Login (`pages/Login.jsx`)**
- Email/password + Google provider.
- Already-authenticated users are redirected to `/dashboard` (no re-showing the form).
- Hard redirect (`window.location.href`) after login so auth state re-initializes.

**Register (`pages/Register.jsx`)**
- Enforces password strength via `evaluatePassword` before submit.
- Requires password confirmation match.
- OTP email verification (`register` → OTP → `verifyOtp` → `setToken`). Never auto-login an unverified user.
- "Resend code" has a **30-second cooldown** to prevent spam/rate-limit abuse.
- Already-authenticated users (not mid-OTP) are redirected to `/dashboard`.

**Forgot Password (`pages/ForgotPassword.jsx`)**
- Always shows a generic success message regardless of whether the email exists (no account enumeration).

**Reset Password (`pages/ResetPassword.jsx`)**
- Reads `?token=` from the URL; shows an invalid-link state if missing.
- Enforces the **same password strength rules as registration** (`evaluatePassword`) + confirmation match.

**Rule:** Password strength must be enforced **everywhere** a password is set (register AND reset). Any new password-setting flow must use `evaluatePassword` and show `PasswordStrength`.

---

## 4. Backend Function Security

- Admin-only functions verify `user.role === 'admin'` and return **403** otherwise.
- Sensitive operations verify the session via `base44.auth.me()` before acting.
- Service role (`asServiceRole`) is used only for admin-initiated or webhook-validated tasks.
- Webhooks (Stripe) validate signatures with `constructEventAsync` **before** any side effects, and use event-level idempotency (`ProcessedWebhookEvent`).
- All functions log errors to stderr for observability.

---

## 5. Data Validation & Abuse Prevention

- Rate-limiting on payment/checkout entry points.
- Duplicate detection on invoices (vendor_id + invoice_number) and webhook events (event_id).
- Input format validation (URLs, handles, positive amounts, vendor active+verified status).
- OTP resend cooldown (see §3).

---

## Maintenance Checklist (run on every relevant PR)

- [ ] New route added → updated `robots.txt` (Allow or Disallow) and placed under correct route group in `App.jsx`.
- [ ] New private page → inside `ProtectedRoute` (auto `noindex`).
- [ ] New password-setting flow → uses `evaluatePassword` + `PasswordStrength`.
- [ ] New admin/sensitive function → `user.role === 'admin'` check, returns 403.
- [ ] New webhook → signature validation before side effects + idempotency guard.
- [ ] Any "resend"/"send" action exposed to users → has a cooldown.