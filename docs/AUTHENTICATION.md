# Authentication

## 1. Introduction

The backend can require a valid OIDC access token on every route, validated through the configured identity provider's OAuth 2.0 introspection endpoint. It's opt-in: set `AUTH_ENABLED=false` (or leave it unset) and the app behaves exactly as it always has, with zero overhead. Mobile and Web authenticate differently, Mobile sends a Bearer token it minted itself, while Web never sees a real token at all and instead relies on a server-side session managed by this backend.

## 2. Architecture

### 2.1 Overview diagram

```text
Browser   → GET /auth/signin                      → OIDC provider authorize URL
OIDC provider → GET /api/auth/callback/okta?code=...
Backend   → POST /oauth2/v1/token                  → access_token
Backend   → stores token in SessionStorage (keyed by opaque session ID)
Backend   → sets HttpOnly oidc_session_id cookie   → redirects browser
Browser   → POST /v2/createSession (with cookie)
authMiddleware → reads cookie → looks up token → introspects → 200 ✅
```

### 2.2 Backend-for-Frontend (BFF) pattern

The browser never sees the real OIDC access token. The Node.js backend performs the OIDC exchange itself and holds the token server-side, in `SessionStorage`, keyed by an opaque session id. The browser only ever receives that opaque id, carried in an `HttpOnly` cookie it cannot read from JavaScript, so there's nothing for XSS to steal that would authenticate as the user directly against the identity provider.

Mobile doesn't need this: a native app sends `Authorization: Bearer <token>` directly on every request, having obtained the token itself via its own OIDC SDK. There's no server-side session to manage because the token already lives safely in the OS's secure storage.

### 2.3 `authMiddleware`

`authMiddleware` (`backend/middleware/authMiddleware/authMiddleware.ts`) is applied app-wide in `server.ts`, before the router and ahead of every route it protects.

It reads the access token from two possible sources, Bearer header checked first:

1. The configured header (`AUTH_HEADER_NAME`, default `authorization`) with the configured scheme prefix (`AUTH_SCHEME`, default `Bearer`), Mobile's path.
2. Failing that, the `oidc_session_id` cookie, resolved to an access token via `SessionStorage.getAccessToken()`, Web's path.

Whichever token it finds, it's validated the same way: `POST ${OIDC_ISSUER_URL}${OIDC_INTROSPECT_PATH}` (default path `/oauth2/v1/introspect`). The response must have `active: true` *and* a `client_id` matching the configured `OIDC_CLIENT_ID`, this tenant has no Custom Authorization Server, so `client_id` (not `aud`) is the signal that the token was actually issued to this application, not just to some other app in the same org.

The middleware is feature-flagged at construction time: when `AUTH_ENABLED` is not `'true'`, `authMiddleware()` returns a plain `(req, res, next) => next()`, a complete no-op, built once and never touching introspection, cookies, or config again.

A fixed set of paths bypass the middleware entirely (passed in as `excludedPaths` when `server.ts` constructs it), because these callers structurally can't carry a user's token:

| Path | Why it's excluded |
|---|---|
| `/_/health` | Infra liveness/readiness probe, no user involved |
| `/v2/hooks/session`, `/v2/hooks/captions`, `/v2/hooks/archive` | Server-to-server webhooks from the video provider |
| `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json` | Fetched anonymously by the OS for deep-link verification |
| `/auth/signin`, `/api/auth/callback/okta` | The login routes themselves, a caller hitting these can't have a token yet |

### 2.4 Session storage

`SessionStorage` (`backend/storage/sessionStorage.ts`) is an interface, not tied to auth specifically, it's the same abstraction the app already uses for room sessions, captions, and archive ids. `getSessionStorageService()` picks the implementation once, memoized for the process lifetime:

- **`InMemorySessionStorage`** (local dev, when `VCR_PORT` is unset), plain in-process maps. Nothing expires; entries live until the process restarts.
- **`VcrSessionStorage`** (Vonage Cloud Runtime, when `VCR_PORT` is set), backed by `vcr.getInstanceState()`, a cross-instance key-value store that survives an individual instance being replaced.

Two kinds of auth data live there:

- **Auth transactions** (`state`, `codeVerifier`, `returnTo`), written by `/auth/signin`, read and deleted by the callback. On VCR these expire after 10 minutes, matching the transaction cookie's own `maxAge`.
- **Access tokens**, written by the callback after a successful token exchange. On VCR these expire after the token response's `expires_in`, which is required: a token response without it is rejected with `401`.

### 2.5 PKCE flow

Both Mobile and Web register as public, SPA-type OIDC clients, there's no client secret to protect, so PKCE's `code_verifier` is the substitute proof that the party exchanging the code is the same one that started the flow.

- `code_verifier`, `state`, the transaction id, and the eventual session id are all the same primitive: `generateOpaqueToken()` (`backend/routes/auth/helpers/generateOpaqueToken.ts`), 32 bytes from `crypto.randomBytes`, base64url-encoded.
- `code_challenge = SHA256(code_verifier)`, base64url-encoded (`computeCodeChallenge.ts`, RFC 7636's `S256` method), sent to the provider's authorize endpoint alongside `code_challenge_method=S256`.
- `state` guards against CSRF: generated and stored at `/auth/signin`, compared against the callback's `state` query param. A mismatch is rejected before any token exchange happens.

`state`, `code_verifier`, and `returnTo` are all written to `SessionStorage` together as one auth transaction (keyed by the transaction id in the `oidc_transaction_id` cookie) when the flow starts, and deleted together once the callback successfully exchanges the code for a token.

### 2.6 Frontend integration

`fetchWithAuthRedirect` (`frontend/src/services/videoClient.ts`) wraps every request the video client makes:

- It always sends `credentials: 'include'`, regardless of outcome, required for the browser to attach the `oidc_session_id` cookie across origins in local dev (Vite on `localhost:5173`, backend on `localhost:3345`).
- If the response is `401`, it builds `returnTo` from the current `window.location.pathname` + `search` and does a full-page redirect to `${API_URL}/auth/signin?returnTo=<encoded returnTo>`, an expired or missing session sends the user back through the login flow instead of surfacing a failed request.

Server-side, `/auth/signin` only honors a `returnTo` that `isSafeReturnToPath` accepts: it must start with `/` and not with `//` or `/\`, rejecting protocol-relative and other open-redirect-shaped values, falling back to `/`.

## 3. Configuration

Quick reference, see [Configuration](./CONFIGURATION.md) for how the backend's `.env` and the frontend's `env.sh` fit together, and for every other (non-auth) variable in the app.

| Variable | Required | Default (DEV) | Description |
|---|---|---|---|
| `AUTH_ENABLED` | No | `false` | Set to `true` to enable auth |
| `OIDC_CLIENT_ID` | When enabled | `<your-client-id>` | OIDC provider client ID, one shared app registration for Mobile + Web |
| `OIDC_ISSUER_URL` | When enabled | `<your-issuer-url>` | OIDC provider issuer URL (org root, never a path like `/oauth2/default`) |
| `OIDC_WEB_REDIRECT_URI` | When enabled | `<your-redirect-uri>` | Must match the redirect URI registered with the provider exactly |
| `AUTH_HEADER_NAME` | No | `authorization` | Request header `authMiddleware` reads the Mobile token from |
| `AUTH_SCHEME` | No | `Bearer` | Scheme prefix on that header, matched case-insensitively |
| `OIDC_INTROSPECT_PATH` | No | `/oauth2/v1/introspect` | Appended to `OIDC_ISSUER_URL` for introspection calls |
| `OIDC_AUTHORIZE_PATH` | No | `/oauth2/v1/authorize` | Appended to `OIDC_ISSUER_URL` for the Web login flow's authorize redirect |
| `OIDC_TOKEN_PATH` | No | `/oauth2/v1/token` | Appended to `OIDC_ISSUER_URL` for the Web login flow's code-for-token exchange |
| `AUTH_INTROSPECTION_TIMEOUT_MS` | No | `5000` | Timeout for the introspection HTTP call |

`AUTH_ENABLED`, `OIDC_CLIENT_ID`, `OIDC_ISSUER_URL`, and `OIDC_WEB_REDIRECT_URI` go in `backend/.env`. The rest are non-secret tuning knobs that already default in [`env.sh`](../env.sh); override them in `backend/.env` only if you need something other than the default.

```ini
AUTH_ENABLED='true'
OIDC_CLIENT_ID='<your-client-id>'
OIDC_ISSUER_URL='<your-issuer-url>'
OIDC_WEB_REDIRECT_URI='<your-redirect-uri>'
```

## 4. Setup

### 4.1 Local development

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `AUTH_ENABLED=true`.
3. Set `OIDC_CLIENT_ID`, `OIDC_ISSUER_URL`, and `OIDC_WEB_REDIRECT_URI` in `backend/.env`. The copied `.env.example` leaves them empty, and the backend dev server does not source [`env.sh`](../env.sh), so the DEV values listed there must be copied in explicitly.
4. `yarn dev`.
5. Open the app in an **incognito window**, avoids a cached session from a previous run.
6. Trigger a protected action (create or join a room).
7. You're redirected to the OIDC provider's login page, sign in with your credentials.
8. After MFA, you land back where you started and the action completes.

`AUTH_ENABLED=false` by default, so the app works without any of this unless you opt in.

### 4.2 VCR deployment

The non-secret tuning knobs (`AUTH_HEADER_NAME`, `AUTH_SCHEME`, `OIDC_INTROSPECT_PATH`, `OIDC_AUTHORIZE_PATH`, `OIDC_TOKEN_PATH`, `AUTH_INTROSPECTION_TIMEOUT_MS`) are already declared as plain values in `vcr-gha.yml`'s `environment:` block.

`AUTH_ENABLED`, `OIDC_CLIENT_ID`, `OIDC_ISSUER_URL`, and `OIDC_WEB_REDIRECT_URI` are **not** currently declared there. To enable auth on a deployment, add them following the same pattern already used for `VONAGE_APP_ID` / `VONAGE_PRIVATE_KEY`, `OIDC_CLIENT_ID` and `OIDC_ISSUER_URL` as VCR project secrets (they differ per environment and PROD's values shouldn't live in plain text), `OIDC_WEB_REDIRECT_URI` set to that instance's own URL plus `/api/auth/callback/okta`, and `AUTH_ENABLED='true'`.

Whatever redirect URI you configure must also be registered with the OIDC provider on the application's side. At Vonage, that means asking the IAM team to add it; if you're running this app elsewhere, register it with whoever administers your own OIDC provider instead.

### 4.3 Vite dev-server proxy

`frontend/vite.config.ts` proxies both `/auth/signin` and `/api/auth/callback/okta` to the backend (`API_URL`, default `http://localhost:3345`), nothing extra to configure. It's needed because the redirect URI registered with the provider is fixed to the Vite dev server's own origin (`http://localhost:5173`), but neither login route is actually implemented there, the backend is the only thing that handles them. Proxying both legs keeps the whole flow same-origin from the browser's point of view, which matters since `/auth/signin` sets the transaction cookie that the callback then has to read back.

## 5. Enabling / Disabling

```bash
# Enable (opt-in)
AUTH_ENABLED=true

# Disable (default, middleware is a complete no-op)
AUTH_ENABLED=false  # or unset
```

When disabled, `authMiddleware()` is built once at startup and immediately returns a handler that calls `next()` and nothing else, no cookie parsing, no introspection, no `SessionStorage` lookup, on every request. Zero performance impact, zero behavior change versus the app before auth existed.

## 6. Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `redirect_uri mismatch` | Redirect URI not registered with the OIDC provider | Ask your identity provider admin to add your URI (at Vonage: the IAM team) |
| `invalid_client` | Wrong `OIDC_CLIENT_ID` or app requires client secret | Confirm the client ID with your identity provider admin |
| `access_denied: User is not assigned` | Your account not assigned to the OIDC app | Ask your identity provider admin to assign your account |
| `Token inactive or expired` | DEV token used against PROD introspection endpoint (or vice versa) | Match `OIDC_ISSUER_URL` to the token's issuer |
| `401` on every request after login | Cookie not sent, missing `credentials: 'include'` on fetch call | Add `credentials: 'include'` to the fetch |
| Infinite redirect loop | `authMiddleware` blocking its own login routes | Confirm `/auth/signin` and `/api/auth/callback/okta` are in its `excludedPaths` |

## 7. Mobile vs Web differences

| | Mobile (iOS/Android) | Web |
|---|---|---|
| Token source | `Authorization: Bearer <token>` header | `oidc_session_id` cookie → `SessionStorage` |
| Login flow | Client-side (native OIDC SDK) | Server-side BFF (`/auth/signin` → callback) |
| Token storage | Keychain (iOS) / encrypted Room database (Android) | `VcrSessionStorage` / `InMemorySessionStorage` |
| Token visible to client? | Yes (native app handles it) | No, browser only sees an opaque cookie |
| PKCE | Yes (client-side) | Yes (server-side) |
