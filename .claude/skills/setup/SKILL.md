---
name: setup
description: First-time environment setup and environment doctor for the Vonage Video React reference app (VERA web). Use whenever the user wants to set up or onboard onto this repo, bootstrap a new machine, run the app locally for the first time, or hits "Missing config values for Vonage", "Unknown video service provider", "yarn: command not found", wrong Node version, husky/pre-commit/pre-push failures, the @vonage/video-common hash check, ports 3345/5173 already in use, or asks "why won't this start". Also use when they need a backend for the Android or iOS VERA apps.
inclusion: manual
---

# VERA Web — Environment Setup & Doctor

Invoke with `/setup` in Claude Code, or `#vera-setup` in kiro.

Diagnose first, then fix only what is actually broken. Almost every "it won't start" report comes down to one of four things: wrong Node version, no `yarn`, no `backend/.env` (or an empty one), or dependencies never installed. Checking takes seconds; re-running the whole setup on a working machine wastes minutes and can clobber a good `.env`.

All commands run from the repo root.

## Step 1: Diagnose

```bash
node -v; cat .nvmrc                 # must match the major in .nvmrc (22)
yarn -v                             # Yarn 1.22.x (pinned via "packageManager" in package.json)
test -d node_modules && echo "deps installed" || echo "deps MISSING"
test -f backend/.env && grep -E '^(VIDEO_SERVICE_PROVIDER|VONAGE_APP_ID)=' backend/.env || echo "backend/.env MISSING"
git config core.hooksPath || echo "husky hooks NOT installed"
lsof -iTCP:3345 -iTCP:5173 -sTCP:LISTEN   # anything already holding the backend/frontend ports?
```

## Step 2: Prerequisites

- **Node 22** — the version in `.nvmrc`. `nvm install && nvm use` picks it up. A newer major (24, 25) is untested here; CI uses `.nvmrc` exactly.
- **Yarn 1** — `corepack enable` provides the pinned `yarn@1.22.22`; or `npm i -g yarn`. Don't use `npm install` or Yarn Berry: the lockfile is `yarn.lock` v1 and CI installs with `--frozen-lockfile`.
- **A Vonage application with Video enabled** — [dashboard → Applications](https://dashboard.vonage.com/applications). You need its **Application ID** and the **private key** file downloaded when you generated keys.

## Step 3: Install

```bash
yarn install
```

This also runs husky (`prepare` → sets `core.hooksPath`) and `postinstall` → `nx postinstall integration-tests` → `playwright install`, which downloads browsers (~hundreds of MB). If that download fails behind a proxy, `yarn install --ignore-scripts` finishes the install; run `npx husky` and `cd integration-tests && npx playwright install` later.

## Step 4: `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Fill in:

```ini
VIDEO_SERVICE_PROVIDER='vonage'
VONAGE_APP_ID='<application id>'
VONAGE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
...the whole file, newlines included...
-----END PRIVATE KEY-----'
```

- The key is pasted **inline, multi-line, inside single quotes** — not a path to the `.key` file.
- `backend/helpers/config.ts` throws `Missing config values for Vonage` when either value is empty and `Unknown video service provider` when `VIDEO_SERVICE_PROVIDER` is not `vonage`/`opentok`. The legacy OpenTok block uses `OT_API_KEY`/`OT_API_SECRET` instead.
- **Never set `VCR_PORT` locally** — its presence (`backend/middleware/isVcr.ts`) switches session storage to Vonage Cloud Runtime's state store, which doesn't exist on your machine, and moves the listen port to its value.
- Leave `AUTH_ENABLED='false'` for a first run. Okta sign-in is optional; see `docs/AUTHENTICATION.md`. If you do enable it, copy the `OIDC_*` DEV values from `env.sh` into `backend/.env` — the backend dev server does **not** source `env.sh`.
- `backend/.env` is gitignored. Never commit it or paste the private key into chat, issues or PRs.

## Step 5: Run

```bash
yarn dev
```

Backend on **http://localhost:3345**, Vite on **http://localhost:5173** (open this one). `yarn dev frontend` / `yarn dev backend` run one side; `yarn dev debug` attaches `--inspect` (port 9229) to the backend.

Frontend settings need no setup — `env.sh` is committed and sourced by every frontend Nx target. To change features, theme or backend URL use `/configure` (Claude Code) or `#vera-configure` (kiro).

**Smoke test:** open `http://localhost:5173`, create a room, allow camera/mic, and join from a second browser tab with the room URL. Two tiles means the backend minted tokens and media flows.

## Optional pieces

- **Production-like run** — `yarn start` builds the frontend, copies it into `backend/dist/dist`, bundles the backend and serves everything on **:3345**. Webpack copies `backend/.env` into `backend/dist/` at build time, so after editing `.env` you must rebuild (re-run `yarn start`), not just restart.
- **Other devices / phones** — tunnel both ports (ngrok config in `docs/GETTING_STARTED.md`), then put `API_URL=https://<backend-tunnel>` and `TUNNEL_DOMAIN=<frontend-tunnel-host>` in `frontend/.env` (copy `frontend/.env.example`). Camera/mic require HTTPS on anything but localhost, which is why a LAN IP over plain HTTP shows no devices.
- **Backend for the Android/iOS VERA apps** — they have no backend of their own; run this one (`yarn dev backend` is enough). Android emulator reaches it at `http://10.0.2.2:3345`; a physical device needs a tunnel.
- **Storybook** — `yarn storybook frontend` (:6006) or `yarn storybook ui` (:6007).
- **Cloud deploy** — `/deploy-vcr` or `#vera-deploy-vcr`.

## Git hooks (what will run on you)

- **pre-commit** → `yarn quality-check` (ts-check + ESLint + Prettier check across the workspace). Fix with `yarn lint:fix`.
- **pre-push** → `yarn test` (all unit suites) and `yarn nx run common:hash:check`.
- The hooks source `~/.nvm/nvm.sh` to find `yarn`. If you installed Node another way and the hook says `yarn: not found`, make `yarn` available on the PATH that git hooks get.
- Don't `--no-verify` past them; CI runs the same checks (`lint.yml`, `run-tests.yml`).

## Common failures

- **`Missing config values for Vonage`** — `backend/.env` missing or values empty. Step 4.
- **Rooms fail to create, backend logs VCR / state errors, or it listens on an odd port** — `VCR_PORT` is set. Remove it.
- **`yarn: command not found`** — Step 2 (`corepack enable`).
- **`EADDRINUSE :3345` or Vite moved to 5174** — an old `yarn dev`/`yarn start` is still running. `lsof -iTCP:3345 -sTCP:LISTEN`, stop it.
- **Pre-push: `@vonage/video-common hash check failed`** — you changed `libs/common/src`. Merge the latest `origin/develop`, run `yarn common:hash:update`, commit `libs/common/manifest.json`.
- **Pre-commit fails on Prettier/ESLint in files you didn't touch** — usually `node_modules` from a different branch; `yarn install`, then `yarn lint:fix`.
- **Room loads but no camera/mic on another device** — HTTP on a non-localhost origin; use a tunnel (Optional pieces).
- **Changed `backend/.env`, `yarn start` ignores it** — rebuild; see Optional pieces.
- **A feature flag edit did nothing** — not a setup problem; `/configure` or `#vera-configure` has the checklist.

## Cautions

- `backend/.env`, `frontend/.env`, `vcr.yml`, `vcr-dev.yml` are gitignored and hold secrets or personal IDs. Keep them out of commits.
- `env.sh` is generated from `app-config.json`; don't hand-edit it as part of setup.
- Pull requests target `develop`, not `main` (a workflow retargets them automatically). Branch from `origin/develop`.
