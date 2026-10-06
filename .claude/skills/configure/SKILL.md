---
name: configure
description: Change how the Vonage Video React reference app (VERA web) is configured without writing TypeScript — toggle existing features (chat, captions, recording/archiving, screen share, reactions/emojis, background effects, noise suppression, device selection, waiting room, advanced settings, report issue, video stats), change languages or the default layout/resolution, rebrand via theme.json, point the frontend at another backend, or override values locally with frontend/.env. Use whenever the user edits app-config.json, env.sh, theme.json or frontend/.env, mentions yarn sync:env or yarn sync:theme-tokens, or asks why a config change "isn't taking effect". For ADDING a brand-new config key use the feature-flag guide instead.
inclusion: fileMatch
fileMatchPattern: ['app-config.json', 'env.sh', 'theme.json', 'frontend/.env*']
---

# Configuring VERA Web (existing keys)

In kiro this attaches automatically when `app-config.json`, `env.sh`, `theme.json` or `frontend/.env*` is in context; pull it in with `#vera-configure` otherwise. Adding a key that doesn't exist yet is a different job: `/feature-flag` in Claude Code, `#vera-feature-flags` in kiro.

Nothing in `frontend/src` should be edited to flip a feature. If the user is reaching for a default in `frontend/src/env.ts`, redirect them to `app-config.json` (shared, committed) or `frontend/.env` (local only).

## How a value reaches the browser

Knowing this path is how you debug "the flag does nothing":

1. **`app-config.json`** (repo root) — source of truth, the same file shape as the Android and iOS apps, validated by `specs/app-config.schema.json`.
2. **`yarn sync:env`** (`scripts/generateEnv.ts`) → **`env.sh`** — flat `export ALLOW_CHAT=true` lines. Generated and committed.
3. Every frontend Nx target (`dev`, `build`, `storybook`, `test`) runs `source ../env.sh` first, so the values are process env vars.
4. **`frontend/vite.config.ts`** — merges `frontend/.env` / `.env.<mode>` **over** the process env (the file wins), keeps only the keys listed in `appEnvKeys`, and bakes them into the bundle as `__APP_ENV__` **at build/dev-server start time**.
5. **`frontend/src/env.ts`** — the `Env` class parses `__APP_ENV__` with zod and applies defaults; components read `env.ALLOW_CHAT` etc.

Consequences:

- Changes need a **restart** of `yarn dev` (or a rebuild). Vite's HMR does not re-read env.
- Under Vitest (`mode === 'test'`) **no** env values are injected; `Env` defaults apply, and specs flip flags with `env.partialUpdate({...})` (reset automatically after each test). A config change never changes unit-test behaviour.
- `DEFAULT_LAYOUT_MODE`, `ALLOW_AUDIO_ON_JOIN`, `ALLOW_VIDEO_ON_JOIN` apply on (re)join, so rejoin the room after a restart.

## Shared change: `app-config.json` → `yarn sync:env`

```bash
# 1. edit app-config.json
yarn sync:env
git diff env.sh          # 2. CHECK before committing — see warning
# 3. restart yarn dev
```

> **Warning — `yarn sync:env` deletes the Okta block.** The committed `env.sh` ends with hand-added `AUTH_*` / `OIDC_*` exports (DEV Okta defaults used by VCR deployments and backend tests). The generator does not know about them and drops them. After syncing, restore them before committing: `git diff env.sh` should show only the lines you meant to change (`git checkout -p env.sh` to take back the deleted hunk). The generator also writes no trailing newline; that diff is harmless.

| `app-config.json` | `env.sh` |
|---|---|
| `appSettings.enableReportIssue` / `showVideoStats` | `ENABLE_REPORT_ISSUE` / `SHOW_VIDEO_STATS` |
| `localizationSettings.fallbackLanguage` / `supportedLanguages` (array) | `I18N_FALLBACK_LANGUAGE` / `I18N_SUPPORTED_LANGUAGES` (`en\|es`) |
| `videoSettings.allowBackgroundEffects` / `allowCameraControl` / `allowVideoOnJoin` / `defaultResolution` | `ALLOW_BACKGROUND_EFFECTS` / `ALLOW_CAMERA_CONTROL` / `ALLOW_VIDEO_ON_JOIN` / `DEFAULT_RESOLUTION` |
| `audioSettings.allowAdvancedNoiseSuppression` / `allowAudioOnJoin` / `allowMicrophoneControl` | `ALLOW_ADVANCED_NOISE_SUPPRESSION` / `ALLOW_AUDIO_ON_JOIN` / `ALLOW_MICROPHONE_CONTROL` |
| `waitingRoomSettings.allowDeviceSelection` / `allowSettings` / `bypassWaitingRoom` | `WAITING_ROOM_ALLOW_DEVICE_SELECTION` / `WAITING_ROOM_ALLOW_ADVANCED_SETTINGS` / `BYPASS_WAITING_ROOM` |
| `meetingRoomSettings.allowArchiving` / `allowCaptions` / `allowChat` / `allowEmojis` / `allowScreenShare` / `showParticipantList` | `ALLOW_ARCHIVING` / `ALLOW_CAPTIONS` / `ALLOW_CHAT` / `ALLOW_EMOJIS` / `ALLOW_SCREEN_SHARE` / `SHOW_PARTICIPANT_LIST` |
| `meetingRoomSettings.allowDeviceSelection` | `MEETING_ROOM_ALLOW_DEVICE_SELECTION` **and** `DEVICE_SELECTION` |
| `meetingRoomSettings.allowSettings` | `MEETING_ROOM_ALLOW_ADVANCED_SETTINGS` |
| `meetingRoomSettings.defaultLayoutMode` = `activeSpeaker` \| `grid` | `DEFAULT_LAYOUT_MODE` = `active-speaker` \| `grid` (the generator translates) |

Keys in `app-config.json` that the web app ignores (cross-platform parity, read by Android/iOS only): `audioSettings.allowAudioDiagnostics`, `meetingRoomSettings.allowFeedback`, `allowPictureInPicture`, `baseApiUrl`, `connectionSettings.*`. Editing them changes nothing here.

Allowed values: languages `en`, `en-US`, `es`, `es-MX`, `it`, `de`, `ja` (unknown codes make `Env` fail to parse); resolutions `1920x1080`, `1280x960`, `1280x720`, `640x480`, `640x360`, `320x240`, `320x180`.

## Local-only change: `frontend/.env`

For "just on my machine" (try a flag, point at a tunnel), don't touch the committed files:

```bash
cp frontend/.env.example frontend/.env   # gitignored; uncomment only what you override
```

It wins over `env.sh`. This is also the **only** place for network values, which are not generated from `app-config.json`:

- `API_URL` — backend origin. Empty → `http://localhost:3345` on localhost, `window.location.origin` elsewhere (the production layout where the backend serves the frontend).
- `TUNNEL_DOMAIN` — the frontend tunnel host, added to Vite's `allowedHosts`.
- `VONAGE_VIDEO_HOST` — non-default Video API host.

## Values you can't change from config

`PUBLISHER_MAX_RESOLUTION`, `NOTIFICATION_DURATION_MS`, `MIN_/MAX_CUSTOM_VIDEO_BITRATE_BPS`, `SUPPORTED_FRAME_RATES` and `ARCHIVES_REFRESH_INTERVAL_MS` appear in `env.sh` / `.env.example` / `docs/CONFIGURATION.md`, but they are **not** in `appEnvKeys` in `frontend/vite.config.ts`, so they never reach the browser — the defaults in `frontend/src/env.ts` always win. Changing them requires code (add the key to `appEnvKeys`; `/feature-flag` covers the steps).

## Theme: `theme.json` → `yarn sync:theme-tokens`

`theme.json` (root) drives colours, radii and typography for the Tailwind design tokens; `specs/theme.schema.json` describes it.

```bash
yarn sync:theme-tokens
```

This copies `theme.json` into `libs/ui/src/theme/helpers/designTokens/designTokens.json`, regenerates `theme.example.json` and the Tailwind plugin `libs/ui/src/theme/helpers/tailwind/veraUI.cjs`, and Prettier-formats it. Commit all of them with `theme.json`. Restart `yarn dev` afterwards. Theme edits change Playwright visual baselines — re-record them (`/record-snapshots`, or `#vera-snapshot-tests` in kiro).

## Backend settings

Backend config is `backend/.env` (credentials, `AUTH_ENABLED`, Jira) — not `app-config.json`. Setup lives in `/setup` / `#vera-setup`; Okta in `docs/AUTHENTICATION.md`.

## "My change isn't taking effect" — checklist

1. Edited `app-config.json` but not run `yarn sync:env`? `env.sh` is what's sourced.
2. Restarted `yarn dev` (or rebuilt for `yarn start`)? Values are baked in at start.
3. Does `frontend/.env` set the same key? It overrides `env.sh`.
4. Is the key one the web ignores (parity keys) or one not in `appEnvKeys`? Then nothing reads it.
5. Layout/audio/video-on-join? Rejoin the room.
6. Expecting a unit test to change? Tests use `Env` defaults plus `env.partialUpdate`.
7. Deployed build? It used the `env.sh` committed at build time (`vcrBuild.sh` sources it).
8. Theme? Needs `yarn sync:theme-tokens`, not `sync:env`.
