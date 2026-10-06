---
name: deploy-vcr
description: Deploy the Vonage Video React reference app (VERA web) to Vonage Cloud Runtime (VCR) — a personal dev instance from your machine with yarn vcr:dev, a per-PR preview by commenting vcr:deploy on a pull request, and what deploys automatically when a PR merges to develop. Use whenever the user wants a shareable/HTTPS URL for testing, a cloud backend for the Android or iOS VERA apps, asks about vcr-dev.yml, vcr.yml.example, vcrBuild.sh, the vcr CLI, "vcr:deploy" / "vcr:remove" comments, or a VCR deployment that fails or misbehaves.
inclusion: manual
---

# Deploying VERA Web to Vonage Cloud Runtime

Invoke with `/deploy-vcr` in Claude Code, or `#vera-deploy-vcr` in kiro.

A VCR deployment is the production build: `backend/dist/bundle.cjs` serving the built frontend from `backend/dist/dist`, on one HTTPS origin. That makes it the easiest way to test on phones (camera/mic need HTTPS) or give the mobile apps a backend without tunnels.

## Pick the route

| Route | When | How |
|---|---|---|
| **PR preview** | Reviewing a PR; no local VCR setup | Comment exactly `vcr:deploy` on the PR. The bot builds the PR head and replies with the URL. Instance `vera-pr-<number>`; `vcr:remove` deletes it, closing the PR deletes it too. Same-repo branches only (needs repo secrets). |
| **Personal dev instance** | Iterating on your own branch / your own Vonage account | `yarn vcr:dev` (below) |
| **Shared `dev` instance** | Automatic | `deploy-to-vcr.yml` runs when a PR is **merged into `develop`**. Don't deploy to it by hand. |

## Personal dev instance — one-time setup

1. **VCR CLI** — install per [Working locally](https://developer.vonage.com/en/vonage-cloud-runtime/getting-started/working-locally#cli-installation), then `vcr configure` (API key/secret, region).
2. **A separate Vonage application for VCR.** Create a new app in the dashboard and run `vcr app generate-keys --app-id <vcr-app-id> --region <region>`. Don't reuse the `VONAGE_APP_ID` from `backend/.env`: generate-keys **rotates** that application's private key, which would break your local `backend/.env`.
3. **Manifest:**
   ```bash
   cp vcr.yml.example vcr-dev.yml   # gitignored
   ```
   Set `instance.application-id` to the VCR app id (replace the literal `${DEV_VCR_APP_ID}` placeholder; it is not substituted). Set `project.name`, `instance.name` and `region` to your own values so you don't overwrite a colleague's `vera-dev`.

## Deploy

```bash
yarn vcr:dev
```

This runs `vcrBuild.dev.sh` → `vcrBuild.sh` (`source env.sh`, `yarn install --ignore-scripts --frozen-lockfile`, `yarn build`) → copies `backend/.env` and `vcr-dev.yml` into `backend/dist` → `cd backend/dist && vcr deploy -f vcr-dev.yml`. The CLI prints the instance URL.

What that implies:

- **Frontend config** comes from the committed `env.sh` at build time. `frontend/.env` is also read by Vite during the build, so a local override there ends up in the deployed bundle — clear it if you don't want that. Leave `API_URL` empty for VCR so the app uses its own origin.
- **Backend config** comes from your `backend/.env`, copied verbatim. It needs working video credentials and must **not** contain `VCR_PORT` (VCR sets it; that's what switches storage to VCR's state store).
- Committed `vcr-gha.yml` is the CI manifest (secrets, `<DOMAIN>` placeholder); don't deploy with it locally.

**Remove:** `yarn vcr:dev rm` — but it hard-codes `--project-name vonage-video-react-app --instance-name vera-dev`. If you renamed them in step 3, remove with `vcr instance rm --project-name <yours> --instance-name <yours>`.

## Pointing the mobile apps at a VCR instance

Use the instance URL, no trailing slash: Android `BASE_API_URL` in `local.properties`, iOS per that repo's config. HTTPS means no cleartext exceptions are needed.

## Failures

- **`vcrBuild.dev.sh`: `./backend/.env file not found` / `./vcr-dev.yml not found`** — setup steps above.
- **Deploy succeeds, app shows errors creating rooms** — check `vcr instance log` (or the dashboard logs) for `Missing config values for Vonage`: `backend/.env` was empty or used the OpenTok block without its keys.
- **Local dev broke right after VCR setup** — you ran `generate-keys` against your local app; regenerate a key for it and update `backend/.env`, then use a separate app for VCR.
- **`vcr:deploy` comment did nothing** — body must be exactly `vcr:deploy`, on a PR (not an issue), from a branch in this repo.
- **Build fails on `--frozen-lockfile`** — `yarn.lock` is out of date with a `package.json` change; run `yarn install` and commit the lockfile.
