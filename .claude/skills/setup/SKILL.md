---
name: setup
description: First-time setup and "why won't it start" help for the Vonage Video React reference app (VERA web). Use when someone sets up the repo, installs dependencies with pnpm, runs the app for the first time, or hits errors like "Dependencies cannot be installed with yarn/npm", "pnpm … is too old", "Permission denied", "Missing config values for Vonage", a ZodError when the backend starts (authSessionCookieName, oidcScopes, authCookieSecret, corsAllowedOrigins), "yarn: command not found", wrong Node version, git hook failures, the video-reference-apps-common hash check, or ports 3345/3346/5173 already in use. Also use when the Android or iOS VERA app needs a backend.
inclusion: manual
---

# VERA Web — Setup

Use `/setup` in Claude Code, or `#vera-setup` in kiro.

Check first, then fix only what is broken. Run every command from the repo root.

## 1. Check

```bash
node -v; cat .nvmrc                 # should be Node 22
pnpm -v                             # should be 12 or newer
test -d node_modules/.pnpm && echo "installed" || echo "not installed with pnpm"
test -f backend/.env && echo "backend/.env found" || echo "backend/.env missing"
lsof -iTCP:3345 -iTCP:3346 -iTCP:5173 -sTCP:LISTEN   # is something already running?
```

## 2. Install the tools

- **Node 22:** `nvm install && nvm use` (reads `.nvmrc`).
- **pnpm 12 or newer:**
  ```bash
  npm i -g pnpm@12.11.2
  ```
  Don't use `corepack enable`. It gives you pnpm 11, which is too old: commands fail with "Permission denied".
- **A Vonage application with Video turned on.** Create it in the [dashboard](https://dashboard.vonage.com/applications). You need the **Application ID** and the **private key** file.

## 3. Install the project

```bash
pnpm install
```

- pnpm is the only way to install. `yarn install` and `npm install` are blocked on purpose.
- The first install also downloads browsers for the end-to-end tests, so it can take a few minutes.
- Old checkout installed with yarn? Any `pnpm` script notices and offers to run `pnpm install` for you. Say yes.

## 4. Create `backend/.env`

```bash
cp backend/.env.example backend/.env
pnpm generate:secret     # the secret is the last line; run once per secret
```

Fill in:

```ini
VIDEO_SERVICE_PROVIDER='vonage'
VONAGE_APP_ID='<your application id>'
VONAGE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
...paste the whole key file here...
-----END PRIVATE KEY-----'
SESSION_KEY_SECRET='<a secret from pnpm generate:secret>'
```

Paste the key itself, inside single quotes, not the path to the file.

**Sign-in (auth) is turned on in the example file** (`AUTH_ENABLED='true'`). Left as it is, the backend stops at start-up with a `ZodError` about `authSessionCookieName`, `oidcScopes` and others. Pick one:

1. **Easiest:** set `AUTH_ENABLED='false'`.
2. **Keep sign-in on:** set `AUTH_COOKIE_SECRET` to a new secret from `pnpm generate:secret`, and remove the `#` from every line in the "Project-level auth settings" block at the bottom of `backend/.env`. Sign-in then uses a local test login server (`apps/local-oidc`) that `pnpm dev` starts for you and that accepts every login.

Also:

- Keep `CORS_ALLOWED_ORIGINS='*'` for local work. An empty value stops the backend.
- Never set `VCR_PORT` on your machine. It is only for Vonage Cloud Runtime.
- Never commit `backend/.env` or share the key or secrets.

## 5. Run

```bash
pnpm dev
```

Open **http://localhost:5173**. The backend runs on port 3345 and the local login server on 3346.

- `pnpm dev frontend` or `pnpm dev backend` runs only one part (no login server).
- `pnpm dev debug` lets you attach a debugger to the backend (port 9229).

**Quick test:** create a room, allow camera and mic, then open the room link in a second tab. If you see two videos, everything works.

To change features, theme or backend URL: `/configure` (Claude Code) or `#vera-configure` (kiro).

## Optional

- **Production-style run:** `pnpm start` builds everything and serves it on port 3345. It copies `backend/.env` into the build, so run it again after you change `.env`.
- **Test on a phone:** open both ports through a tunnel such as ngrok (see `docs/GETTING_STARTED.md`). Then set `API_URL` and `TUNNEL_DOMAIN` in `frontend/.env` (copy `frontend/.env.example`). Phones need HTTPS for the camera.
- **Backend for the Android or iOS app:** `pnpm dev backend` (set `AUTH_ENABLED='false'`). The Android emulator uses `http://10.0.2.2:3345`.
- **Storybook:** `pnpm storybook frontend` (port 6006) or `pnpm storybook ui` (port 6007).
- **Real sign-in provider (Okta etc.):** `docs/AUTHENTICATION.md`.
- **Deploy to the cloud:** `/deploy-vcr` or `#vera-deploy-vcr`.

## Git hooks

- Before each **commit**, the hook checks types, lint and formatting. Fix most problems with `pnpm lint:fix`.
- Before each **push**, it runs all unit tests and the `libs/common` hash check.
- Don't skip them with `--no-verify`; CI runs the same checks.

**Known gap:** the git hooks, a few scripts (`ts-check`, `quality-check`, `test:ui`, `test:core`, `test:common`, `test:api`, `common:hash:update`, and `test:backend` without a file) and the Playwright auto-start still call `yarn` internally. If you get `yarn: command not found`, use the pnpm commands in `/run-tests` (`#vera-testing`), which avoid it. For the git hooks and the sign-in tests there is no pnpm-only way yet, so install yarn until those are switched to pnpm.

## Common problems

| You see | Fix |
|---|---|
| `Dependencies cannot be installed with yarn` / `npm` | Use `pnpm install`. |
| `pnpm … is too old` or `Permission denied` | `npm i -g pnpm@12.11.2`, then `pnpm install`. |
| `ZodError` about `authSessionCookieName`, `oidcScopes`, … | Step 4: turn auth off, or uncomment the auth block. |
| `authCookieSecret: must be 32 bytes` | Put a new `pnpm generate:secret` value in `AUTH_COOKIE_SECRET`. |
| `Missing config values for Vonage` | Fill `VONAGE_APP_ID` and `VONAGE_PRIVATE_KEY`. |
| Page can't reach `localhost:3346` | Auth is on but the login server isn't running. Use plain `pnpm dev`, or turn auth off. |
| `EADDRINUSE` on 3345 or 3346, or Vite uses 5174 | An old run is still going. Stop it (`lsof -iTCP:3345 -sTCP:LISTEN`). |
| Push fails: `video-reference-apps-common hash check failed` | You changed `libs/common`. Merge the latest `origin/develop`, run `pnpm nx run common:hash:update`, commit `libs/common/manifest.json`. |
| `yarn: command not found` | See "Known gap" above. |
| A config change does nothing | `/configure` or `#vera-configure`. |

## Remember

- Never commit `backend/.env`, `frontend/.env`, `vcr-dev.yml` or `integration-tests/auth/backend.env`.
- Don't edit `env.sh` by hand; it is generated.
- Pull requests go to `develop`, not `main`.
