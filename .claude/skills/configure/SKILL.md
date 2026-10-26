---
name: configure
description: Change how the Vonage Video React reference app (VERA web) behaves without writing code — turn features on or off (chat, captions, recording, post-call transcription, screen share, emojis, background effects, noise suppression, device selection, waiting room, advanced settings, report issue, video stats), change languages, default layout or resolution, change colours with theme.json, point the frontend at another backend, or try a setting only on your machine with frontend/.env. Use when someone edits app-config.json, env.sh, env.defaults.sh, theme.json or frontend/.env, mentions pnpm sync:env or pnpm sync:theme-tokens, or says a setting "isn't taking effect". To ADD a new setting use the feature-flag guide.
inclusion: fileMatch
fileMatchPattern: ['app-config.json', 'env.sh', 'env.defaults.sh', 'theme.json', 'frontend/.env*']
---

# Changing VERA Web settings

In kiro this loads by itself when a config file is open; otherwise use `#vera-configure`. To add a brand-new setting, use `/feature-flag` (Claude Code) or `#vera-feature-flags` (kiro).

Don't change code in `frontend/src` to turn a feature on or off. Change `app-config.json` (for everyone) or `frontend/.env` (only for you).

## How a setting gets to the app

1. You edit **`app-config.json`**. It has the same shape as the Android and iOS apps.
2. **`pnpm sync:env`** writes **`env.sh`** from it. `env.sh` also loads **`env.defaults.sh`** (extra defaults that are not in `app-config.json`).
3. The frontend reads those values **when it starts**, plus anything in `frontend/.env` (which wins).
4. Only names listed in `appEnvKeys` in `frontend/vite.config.ts` reach the browser.
5. `frontend/src/env.ts` checks the values and fills in defaults. Components use `env.ALLOW_CHAT` and so on.

So:

- **Restart `pnpm dev` after every change.** Values are read once at start.
- Unit tests ignore all of this and use the defaults in `env.ts`.
- Layout and "camera/mic on when joining" apply when you join, so leave and rejoin the room.

## Change a setting for everyone

```bash
# 1. edit app-config.json
pnpm sync:env
git diff env.sh     # 2. should show only what you changed
# 3. restart pnpm dev
```

Never edit `env.sh` by hand; the next sync overwrites it.

| `app-config.json` | Name in `env.sh` |
|---|---|
| `appSettings.enableReportIssue` / `showVideoStats` | `ENABLE_REPORT_ISSUE` / `SHOW_VIDEO_STATS` |
| `localizationSettings.fallbackLanguage` / `supportedLanguages` | `I18N_FALLBACK_LANGUAGE` / `I18N_SUPPORTED_LANGUAGES` |
| `videoSettings.allowBackgroundEffects` / `allowCameraControl` / `allowVideoOnJoin` / `defaultResolution` | `ALLOW_BACKGROUND_EFFECTS` / `ALLOW_CAMERA_CONTROL` / `ALLOW_VIDEO_ON_JOIN` / `DEFAULT_RESOLUTION` |
| `audioSettings.allowAdvancedNoiseSuppression` / `allowAudioOnJoin` / `allowMicrophoneControl` | `ALLOW_ADVANCED_NOISE_SUPPRESSION` / `ALLOW_AUDIO_ON_JOIN` / `ALLOW_MICROPHONE_CONTROL` |
| `waitingRoomSettings.allowDeviceSelection` / `allowSettings` / `bypassWaitingRoom` | `WAITING_ROOM_ALLOW_DEVICE_SELECTION` / `WAITING_ROOM_ALLOW_ADVANCED_SETTINGS` / `BYPASS_WAITING_ROOM` |
| `meetingRoomSettings.allowArchiving` / `allowCaptions` / `allowChat` / `allowEmojis` / `allowScreenShare` / `showParticipantList` | `ALLOW_ARCHIVING` / `ALLOW_CAPTIONS` / `ALLOW_CHAT` / `ALLOW_EMOJIS` / `ALLOW_SCREEN_SHARE` / `SHOW_PARTICIPANT_LIST` |
| `meetingRoomSettings.allowDeviceSelection` | `MEETING_ROOM_ALLOW_DEVICE_SELECTION` |
| `meetingRoomSettings.allowSettings` | `MEETING_ROOM_ALLOW_ADVANCED_SETTINGS` |
| `meetingRoomSettings.allowPostCallTranscription` (the Transcribe button) | `ALLOW_POST_CALL_TRANSCRIPTION` |
| `meetingRoomSettings.defaultLayoutMode` = `activeSpeaker` or `grid` | `DEFAULT_LAYOUT_MODE` = `active-speaker` or `grid` |

- Allowed languages: `en`, `en-US`, `es`, `es-MX`, `it`, `de`, `ja`.
- Allowed resolutions: `1920x1080`, `1280x960`, `1280x720`, `640x480`, `640x360`, `320x240`, `320x180`.
- These keys are only used by the mobile apps and do nothing on web: `audioSettings.allowAudioDiagnostics`, `meetingRoomSettings.allowFeedback`, `allowPictureInPicture`, `baseApiUrl`, `connectionSettings.*`.

## Change a setting only on your machine

```bash
cp frontend/.env.example frontend/.env   # not committed; uncomment only what you need
```

Values here win over `env.sh`. This is also where these go:

- `API_URL`: backend address. Leave empty to use `http://localhost:3345` locally.
- `TUNNEL_DOMAIN`: your tunnel's address when testing on other devices.
- `VONAGE_VIDEO_HOST`: only if you use a non-default Video API host.
- `AUTH_ENABLED=true`: shows the Log out button. The backend's own `AUTH_ENABLED` in `backend/.env` doesn't reach the frontend.

## `env.defaults.sh`

It holds public defaults only, never secrets.

- `NOTIFICATION_DURATION_MS`, `PUBLISHER_MAX_RESOLUTION`, `MIN_/MAX_CUSTOM_VIDEO_BITRATE_BPS`, `SUPPORTED_FRAME_RATES`: **changing these does nothing in the app today.** They are missing from `appEnvKeys`, so the browser never gets them. Making one work needs a small code change (see `/feature-flag`).
- The auth settings (`AUTH_SESSION_COOKIE_NAME`, `OIDC_SCOPES`, …) reach tests and cloud builds, but not `pnpm dev`. With auth on, copy them into `backend/.env` (see `/setup`, step 4).

## Change colours and fonts

```bash
# edit theme.json (both the light and dark parts)
pnpm sync:theme-tokens
```

It updates `theme.example.json`, `libs/ui/src/theme/helpers/designTokens/designTokens.json` and `libs/ui/src/theme/helpers/tailwind/veraUI.cjs`. Commit them together with `theme.json`, and restart `pnpm dev`. Screenshot tests will change too; update them with `/record-snapshots` (`#vera-snapshot-tests`).

## Backend settings

Credentials, secrets, CORS, auth and Jira live in `backend/.env`, not `app-config.json`. See `/setup` (`#vera-setup`) and `docs/AUTHENTICATION.md`.

## "My change does nothing"

1. Did you run `pnpm sync:env` after editing `app-config.json`?
2. Did you restart `pnpm dev` (or rebuild, for `pnpm start`)?
3. Does `frontend/.env` set the same name? It wins.
4. Is it a mobile-only key, or one of the `env.defaults.sh` values that don't reach the browser?
5. Layout or "on when joining"? Leave and rejoin the room.
6. Theme? That needs `pnpm sync:theme-tokens`, not `sync:env`.
7. Deployed app? It uses the files as they were when it was built.
