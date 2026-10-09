# Authentication

## 1. Introduction

The backend can require a signed-in user on every route, validated through any OIDC provider that supports token introspection (RFC 7662), such as Okta or Keycloak. It's opt-in: with `AUTH_ENABLED` unset or not `true`, the app behaves exactly as before and `authMiddleware` is a no-op.

Mobile and Web authenticate differently. Mobile sends a Bearer token it obtained itself. Web never sees a token at all: the backend runs the login (Backend-for-Frontend) and keeps the tokens in encrypted, `HttpOnly` cookies, so nothing is stored server side.

## 2. Architecture

### 2.1 Overview

```text
Browser        → GET /auth/signin?returnTo=/waiting-room/abc
Backend        → sets the encrypted vera-sign-in cookie → 302 to OIDC_AUTHORIZATION_ENDPOINT
OIDC provider  → user logs in → 302 to OIDC_WEB_REDIRECT_URI?code=...&state=...
Backend        → POST OIDC_TOKEN_ENDPOINT (code + PKCE verifier) → access, refresh and ID tokens
Backend        → sets the encrypted vera-session and vera-id-token cookies → 302 to returnTo
Browser        → API request (cookies attached)
authMiddleware → decrypts the session cookie → introspects (or refreshes) → 200
```

### 2.2 Backend-for-Frontend (BFF)

The browser never receives a usable token. The tokens live inside cookies encrypted with AES-256-GCM using `AUTH_COOKIE_SECRET`, and the cookies are `HttpOnly`, `SameSite=Lax` and `Secure` on VCR. A modified cookie fails decryption and is treated as signed out. Because the session is in the cookie, any instance with the same secret can serve the user and there is no server-side session store.

| Cookie | Holds | Path | Lifetime |
|---|---|---|---|
| `AUTH_TRANSACTION_COOKIE_NAME` (`vera-sign-in`) | `state`, PKCE verifier, `returnTo` | the callback path | `AUTH_TRANSACTION_MAX_AGE_SECONDS` (600) |
| `AUTH_SESSION_COOKIE_NAME` (`vera-session`) | access token, its expiry, refresh token | `/` | see below |
| `AUTH_ID_TOKEN_COOKIE_NAME` (`vera-id-token`) | ID token, for logout | `/auth/signout` | same as the session cookie |

Session cookie lifetime: without a refresh token, the access token's `expires_in`; with one, the refresh lifetime the provider reports (`refresh_expires_in` / `refresh_token_expires_in`); otherwise a browser-session cookie.

Mobile doesn't use any of this: it sends `Authorization: Bearer <token>` on every request, and that path never sets cookies or refreshes.

### 2.3 `authMiddleware`

`authMiddleware` (`backend/middleware/authMiddleware/authMiddleware.ts`) runs app-wide in `server.ts`, ahead of the router, including the legacy `backend/routes/session.ts` routes that Android still calls.

1. **Bearer header** (`AUTH_HEADER_NAME` + `AUTH_SCHEME`, default `Authorization: Bearer`), checked first: introspected on every request.
2. **Session cookie** otherwise: when the access token has less than `AUTH_REFRESH_WINDOW_SECONDS` left (or introspection reports it inactive) and a refresh token exists, the backend refreshes it and writes new cookies; otherwise it introspects.

A token is accepted when introspection reports it `active` and issued to `OIDC_CLIENT_ID`, through `client_id` or, when the provider omits it, `aud`.

When a user isn't authenticated:

- **Page requests** (`GET` that accepts HTML) redirect to `/auth/signin?returnTo=<original URL>`.
- **Other requests** get `401`.
- **Provider failures** never redirect, so an outage can't cause a sign-in loop. A failed introspection is a `401`; a refresh that fails for any reason other than a rejected refresh token is a `502`.
- **Rejected refresh token** (`invalid_grant`): if the access token is still live, the request goes through (a parallel request already rotated it); if it has expired, the cookies are cleared and the user signs in again.

Cookie-authenticated requests carrying an `Origin` header outside `CORS_ALLOWED_ORIGINS` are rejected with `401`, so other sites can't use a signed-in user's cookie. Per-PR hosts need this because other VCR customers' apps also live under `vonage.cloud`, which browsers treat as the same site. The Bearer path isn't affected. See [Configuration](./CONFIGURATION.md#allowed-web-origins-cors).

These paths skip the middleware, because their callers can't carry a user token:

| Path | Why |
|---|---|
| `/_/health` | Infra liveness/readiness probe |
| `/v2/hooks/session`, `/v2/hooks/captions`, `/v2/hooks/archive` | Server-to-server webhooks from the video provider |
| `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json` | Fetched anonymously by the OS for deep-link verification |
| `/auth/signin`, `/auth/signout`, the path of `OIDC_WEB_REDIRECT_URI` | The login and logout routes themselves |

`/feedback` is not excluded and hasn't been reviewed for whether it should be.

### 2.4 Login (Authorization Code + PKCE)

Mobile and Web share one public client registration with no client secret, so PKCE proves that whoever exchanges the code started the flow.

1. `GET /auth/signin` generates `state` and a PKCE `code_verifier` (`generateOpaqueToken`, 32 random bytes, base64url), stores them with `returnTo` in the transaction cookie, and redirects to `OIDC_AUTHORIZATION_ENDPOINT` with `code_challenge = SHA256(code_verifier)` (`S256`). `returnTo` must be a same-origin relative path (`isSafeReturnToPath`); anything else falls back to `/`.
2. The user logs in at the provider.
3. The callback (mounted on the path of `OIDC_WEB_REDIRECT_URI`) checks `state` against the transaction cookie, exchanges the code at `OIDC_TOKEN_ENDPOINT` with the same `redirect_uri` and the `code_verifier`, writes the session and ID token cookies, clears the transaction cookie and redirects to `returnTo`.

### 2.5 Logout

`GET /auth/signout`:

1. Revokes the refresh and access tokens at `OIDC_REVOCATION_ENDPOINT` (best effort: a failure doesn't stop the logout).
2. Clears the session cookies.
3. Redirects the browser to `OIDC_END_SESSION_ENDPOINT` with `client_id`, `id_token_hint` and `post_logout_redirect_uri`, which ends the provider's own login session and sends the user to `OIDC_POST_LOGOUT_REDIRECT_URI`. Without this step the next page load would sign the user straight back in.

### 2.6 Frontend

- `fetchWithAuthRedirect` (`frontend/src/services/videoClient.ts`) sends every video client request with `credentials: 'include'`. On a `401` it calls `redirectToAuthProvider`, which navigates once to `${API_URL}/auth/signin?returnTo=<current path>` and returns a promise that never settles, so the error page doesn't flash before the navigation. `reportFeedback` handles `401` the same way.
- The banner shows a **Log out** button (`BannerLogout`) when `AUTH_ENABLED` is `true` at build time; it navigates to `/auth/signout`.
- `<vera-room>` accepts a `credentials` attribute (default `include`) and a `videoClient` property for hosts that bring their own client. It never redirects on `401`: the host page owns sign-in.

## 3. Configuration

Every endpoint URL is in your provider's discovery document, `https://<your-provider-domain>/.well-known/openid-configuration`. With `AUTH_ENABLED='true'`, every value below is validated at startup and a missing or invalid one stops the server with an error naming it. On startup the server logs `Auth: on` or `Auth: off`.

### 3.1 Per environment

Set in `backend/.env` locally, or in the deployment config. Never in `env.sh`.

| Variable | Discovery field | Okta example | Description |
|---|---|---|---|
| `AUTH_ENABLED` | | `true` | Turns authentication on |
| `OIDC_CLIENT_ID` | | `your-client-id` | One client registration shared by Mobile and Web |
| `OIDC_WEB_REDIRECT_URI` | | `https://<domain>/api/auth/callback/okta` | Callback on this app where the provider sends the browser after login. Any path works: the backend mounts the callback on it. Register it with the provider |
| `OIDC_POST_LOGOUT_REDIRECT_URI` | | `https://<domain>/` | Where the provider sends the browser after logout. Register it with the provider ("Sign-out redirect URIs" in Okta) |
| `OIDC_AUTHORIZATION_ENDPOINT` | `authorization_endpoint` | `https://your-org.okta.com/oauth2/v1/authorize` | Provider login page |
| `OIDC_TOKEN_ENDPOINT` | `token_endpoint` | `https://your-org.okta.com/oauth2/v1/token` | Code exchange and refresh |
| `OIDC_INTROSPECTION_ENDPOINT` | `introspection_endpoint` | `https://your-org.okta.com/oauth2/v1/introspect` | Token validation on every request |
| `OIDC_REVOCATION_ENDPOINT` | `revocation_endpoint` | `https://your-org.okta.com/oauth2/v1/revoke` | Token revocation at logout |
| `OIDC_END_SESSION_ENDPOINT` | `end_session_endpoint` | `https://your-org.okta.com/oauth2/v1/logout` | Ends the provider's login session at logout |
| `AUTH_COOKIE_SECRET` | | output of `yarn generate:secret` | **Secret.** 32 random bytes, base64, that encrypt the cookies. One per environment, never committed. Changing it signs every user out |

### 3.2 Project defaults

Set in [`env.defaults.sh`](../env.defaults.sh), which the generated `env.sh` sources. Override any of them in `backend/.env` or the deployment config. They're backend-only and never reach the frontend bundle.

| Variable | Default | Description |
|---|---|---|
| `AUTH_SESSION_COOKIE_NAME` | `vera-session` | Cookie holding the encrypted access and refresh tokens |
| `AUTH_ID_TOKEN_COOKIE_NAME` | `vera-id-token` | Cookie holding the encrypted ID token, sent only to `/auth/signout` |
| `AUTH_TRANSACTION_COOKIE_NAME` | `vera-sign-in` | Cookie holding the login state between sign-in and the callback |
| `AUTH_TRANSACTION_MAX_AGE_SECONDS` | `600` | How long the user has to finish logging in at the provider |
| `AUTH_REFRESH_WINDOW_SECONDS` | `30` | Refresh the access token when it has this many seconds left |
| `AUTH_PROVIDER_TIMEOUT_MS` | `5000` | Timeout for every call to the provider |
| `OIDC_SCOPES` | `openid profile email offline_access` | Scopes requested at sign-in. `offline_access` asks for a refresh token |
| `AUTH_HEADER_NAME` | `authorization` | Header that carries a Bearer token (Mobile) |
| `AUTH_SCHEME` | `Bearer` | Scheme prefix on that header, matched case-insensitively |

## 4. Setup

### 4.1 Local development

`yarn dev` also starts `apps/local-oidc` on `localhost:3346`, a minimal dev-only provider that approves every login without a form. [`backend/.env.example`](../backend/.env.example) is pre-filled for it.

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `AUTH_ENABLED='true'` and fill `AUTH_COOKIE_SECRET` with `yarn generate:secret`.
3. Set the same `OIDC_WEB_REDIRECT_URI` in `frontend/.env` ([`frontend/.env.example`](../frontend/.env.example)). The Vite dev server proxies that path, `/auth/signin` and `/auth/signout` to the backend, so you land back on the dev server after signing in.
4. Run `yarn dev`. Opening the app sends you through local-oidc and back.

To use a real provider instead, replace the `OIDC_*` values with its endpoints and register `http://localhost:5173/api/auth/callback/okta` and `http://localhost:5173/` with it.

`local-oidc` doesn't check client IDs, redirect URIs or PKCE, so those checks are only exercised against a real provider.

### 4.2 Tests

- **Backend unit tests** use their own fixed test secret and mocked provider calls.
- **Auth E2E:** `yarn test:integration auth` runs the built app with auth on against local-oidc. It covers sign-in, Bearer access, cookie flags, refresh, tampered cookies and logout, and runs as its own CI job. The values come from the environment: in CI, the `auth-e2e` job in `run-tests.yml` sets them, with `AUTH_COOKIE_SECRET` from the GitHub secret of the same name; locally, export the same values or put them in `integration-tests/auth/backend.env` (gitignored), with an `AUTH_COOKIE_SECRET` from `yarn generate:secret`.

### 4.3 VCR deployment

[`vcr-gha.yml`](../vcr-gha.yml) sets the values inline, including the project defaults, since VCR doesn't run `env.sh`. The deploy workflow fills `<DOMAIN>` (VCR's `domains` value) from the `DOMAIN` secret, and `<APP_HOST>` in the redirect URIs with the first hostname in that secret; it fails before deploying if there isn't one. `AUTH_COOKIE_SECRET` must exist as a VCR secret (`vcr secret create`), like `SESSION_KEY_SECRET`; a GitHub secret isn't visible to the instance. To turn auth on, set `AUTH_ENABLED` to `'true'` in `vcr-gha.yml` and register the main host's redirect URIs with the provider.

- **Per-PR instances** (`vcr:deploy` comment, or running the workflow manually) use the same values, except that `OIDC_WEB_REDIRECT_URI` points at the PR instance: `https://neru-<VCR API key>-vonage-video-react-app-vera-pr-<number>.euw1.runtime.vonage.cloud/api/auth/callback/okta`. Register that pattern in Okta as a wildcard sign-in redirect URI (`…-vera-pr-*.euw1.runtime.vonage.cloud/api/auth/callback/okta`). Okta doesn't allow wildcard sign-out URIs, so logout from a PR instance returns to the main host. A manual run takes an `auth` input (`config`, `on`, `off`) that overrides `AUTH_ENABLED` for that instance only; with auth on, the run fails if the deployed URL doesn't match the redirect URI it built.
- **`yarn vcr:dev`** (personal instances) always deploys with auth off, since a personal instance has no registered redirect URI or cookie secret.

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Server exits at startup with a config error | A required value is missing or invalid while `AUTH_ENABLED='true'` | Set the variable named in the error |
| `authCookieSecret` startup error | `AUTH_COOKIE_SECRET` isn't 32 bytes, base64 | Regenerate it with `yarn generate:secret` |
| VCR: `environment secret references not found` | The `AUTH_COOKIE_SECRET` VCR secret doesn't exist | `vcr secret create --name AUTH_COOKIE_SECRET --value "$(yarn -s generate:secret)"` |
| Provider shows `redirect_uri` mismatch | The redirect URI isn't registered with the provider | Register it (at Vonage: ask the IAM team) |
| `invalid_client` | Wrong `OIDC_CLIENT_ID` | Confirm the client ID with your provider admin |
| `access_denied: User is not assigned` | Your account isn't assigned to the app | Ask your provider admin to assign it |
| Log out signs you straight back in | The provider session wasn't ended | Check `OIDC_END_SESSION_ENDPOINT` and the registered sign-out URI |
| Local sign-in lands on the backend port or 404s | `OIDC_WEB_REDIRECT_URI` missing from `frontend/.env` | Set the same value as in `backend/.env` |

## 6. Mobile vs Web

| | Mobile (iOS/Android) | Web |
|---|---|---|
| Token source | `Authorization: Bearer <token>` header | Encrypted `vera-session` cookie |
| Login flow | Client-side (native OIDC SDK) | Server-side BFF (`/auth/signin` → callback) |
| Refresh | Handled by the app | Handled by the backend, ahead of expiry |
| Logout | Handled by the app | `/auth/signout`: revoke, clear cookies, end the provider session |
| Token visible to client? | Yes | No |
| PKCE | Yes (client-side) | Yes (server-side) |
