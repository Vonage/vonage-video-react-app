---
name: deploy-vcr
description: Deploy the Vonage Video React reference app (VERA web) to Vonage Cloud Runtime (VCR) — your own test instance with pnpm vcr:dev, a preview for a pull request by commenting vcr:deploy, and the automatic deploy when a pull request is merged into develop. Use when someone wants a shareable HTTPS link for testing, a cloud backend for the Android or iOS VERA app, asks about vcr-dev.yml, vcr.yml.example, vcrBuild.sh, the vcr command, the "vcr:deploy" / "vcr:remove" comments, or a deploy that fails.
inclusion: manual
---

# Deploying VERA Web to Vonage Cloud Runtime (VCR)

Use `/deploy-vcr` in Claude Code, or `#vera-deploy-vcr` in kiro.

A VCR deploy gives you the whole app on one HTTPS link. That's the easiest way to test on a phone (the camera needs HTTPS) or to give the mobile apps a backend.

## Pick a way

| Way | When | How |
|---|---|---|
| **Pull request preview** | You want to try a pull request | Comment exactly `vcr:deploy` on the pull request. A bot replies with the link. Comment `vcr:remove` to delete it; closing the pull request also deletes it. Only for branches in this repo. **Sign-in is on** (Okta). |
| **Your own instance** | You test your branch with your own Vonage account | `pnpm vcr:dev` (below) |
| **Shared `dev` instance** | Happens by itself | Every merge into `develop` deploys it. Don't deploy there by hand. |

## Your own instance: first time only

1. **Install the VCR CLI** ([guide](https://developer.vonage.com/en/vonage-cloud-runtime/getting-started/working-locally#cli-installation)), then run `vcr configure`.
2. **Make a separate Vonage application for VCR**, then run `vcr app generate-keys --app-id <vcr-app-id> --region <region>`. Don't use the application from `backend/.env`: this command replaces its key, and your local setup stops working.
3. **Create your config file:**
   ```bash
   cp vcr.yml.example vcr-dev.yml   # not committed
   ```
   Put your VCR application ID in `application-id` (replace `${DEV_VCR_APP_ID}` with the real ID). Give `project.name` and `instance.name` your own names, so you don't overwrite a colleague's instance.

## Deploy

```bash
pnpm vcr:dev
```

This builds the app, writes the backend settings (from `env.defaults.sh` and then your `backend/.env`) into the build, and uploads it. The link is printed at the end.

Good to know:

- **Sign-in is always off** on your own instance, whatever `backend/.env` says. To try sign-in in the cloud, use a pull request preview.
- `backend/.env` needs working Vonage credentials and a `SESSION_KEY_SECRET`. It must **not** contain `VCR_PORT`; VCR sets that itself.
- `frontend/.env` is included in the build too. Clear anything there you don't want deployed, and leave `API_URL` empty.
- If your pnpm version isn't exactly 12.11.2, the build installs that version globally on your machine.
- `vcr-gha.yml` is only for CI. Don't deploy with it yourself.

**Remove your instance:** `pnpm vcr:dev rm`. This only works for the default names (`vonage-video-react-app` / `vera-dev`). If you changed them, run `vcr instance rm --project-name <yours> --instance-name <yours>`.

## Use it from the mobile apps

Use the instance link without a slash at the end: Android `BASE_API_URL` in `local.properties`, iOS in its config.

## Problems

| You see | Fix |
|---|---|
| `./backend/.env file not found` or `./vcr-dev.yml not found` | Do the first-time steps above. |
| The app opens but rooms fail | Check the instance logs for `Missing config values for Vonage`: your `backend/.env` is missing credentials. |
| Local setup broke right after VCR setup | You ran `generate-keys` on your local application. Make a new key for it, update `backend/.env`, and use a separate application for VCR. |
| The `vcr:deploy` comment did nothing | It must be exactly `vcr:deploy`, on a pull request, from a branch in this repo. |
| Build fails with `--frozen-lockfile` | `pnpm-lock.yaml` is out of date. Run `pnpm install` and commit it. |
| CI: `environment secret references not found` | A secret (often `AUTH_COOKIE_SECRET`) is missing on VCR. Create it: `vcr secret create --name AUTH_COOKIE_SECRET --value '<new pnpm generate:secret value>'`. |
