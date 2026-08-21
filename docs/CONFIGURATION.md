# Configuration

This document covers the environment variables, feature flags, theming, and Storybook usage for the Vonage Video API Reference App.

## Environment Configuration

The app has two parts — a **backend** server and a **frontend** UI. The backend is configured through `backend/.env`. Frontend settings are configured through [`env.sh`](../env.sh).

For initial setup instructions (creating `.env` files, obtaining credentials), see [Getting Started](./GETTING_STARTED.md).

---

### Backend (`backend/.env`)

Open `backend/.env` and configure the following variables.

#### Video service provider

Exactly one provider block must be configured.

**Vonage Video API (default)**

| Variable | Required | Description |
|----------|----------|-------------|
| `VIDEO_SERVICE_PROVIDER` | ✅ | Must be `vonage` |
| `VONAGE_APP_ID` | ✅ | Your Vonage application ID from the [dashboard](https://dashboard.vonage.com/applications) |
| `VONAGE_PRIVATE_KEY` | ✅ | Contents of the private key file downloaded when creating the application |

```ini
VIDEO_SERVICE_PROVIDER='vonage'
VONAGE_APP_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
VONAGE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----'
```

**OpenTok (TokBox) SDK**

| Variable | Required | Description |
|----------|----------|-------------|
| `VIDEO_SERVICE_PROVIDER` | ✅ | Must be `opentok` |
| `OT_API_KEY` | ✅ | Your OpenTok API key |
| `OT_API_SECRET` | ✅ | Your OpenTok API secret |

```ini
VIDEO_SERVICE_PROVIDER='opentok'
OT_API_KEY='your-api-key'
OT_API_SECRET='your-api-secret'
```

#### Vonage Cloud Runtime (VCR)

| Variable | Required | Description |
|----------|----------|-------------|
| `VCR_PORT` | ⚠️ VCR only | Port exposed by VCR (typically `3345`). **Do not set this locally** — its presence switches the app to VCR storage. |

#### Jira feedback integration (optional)

Enables the in-call issue reporting tool to file tickets directly into Jira.

| Variable | Description |
|----------|-------------|
| `JIRA_URL` | Base URL of your Jira instance |
| `JIRA_API_URL` | Jira REST API base URL |
| `JIRA_TOKEN` | API token for authentication |
| `JIRA_PROJECT_KEY` | Target project key |
| `JIRA_COMPONENT_ID` | Default component ID for filed issues |
| `JIRA_iOS_COMPONENT_ID` | Component ID for iOS issues |
| `JIRA_ANDROID_COMPONENT_ID` | Component ID for Android issues |
| `JIRA_EPIC_LINK` | Epic link field value |
| `JIRA_EPIC_URL` | URL to the target epic |

#### Okta authentication (optional, opt-in)

Validates the caller's Okta access token on the protected session/token endpoints (`POST /v2/createSession`, `POST /v2/joinSession`) by calling Okta's introspection endpoint on every request. **Disabled by default** — when `OKTA_AUTH_ENABLED` is absent or `false`, the middleware is a no-op and existing behaviour is unchanged.

| Variable | Required | Description |
|----------|----------|-------------|
| `OKTA_AUTH_ENABLED` | ⚠️ opt-in | Set to `true` to enable Okta JWT validation. Any other value (or unset) keeps the middleware a no-op. |
| `OKTA_CLIENT_ID` | ✅ if enabled | Your Okta application's client ID. Client IDs are public values (not secrets). |
| `OKTA_ISSUER_URL` | ✅ if enabled | Your Okta org's root URL — not a path like `/oauth2/default`, which requires a Custom Authorization Server that may not exist on every tenant and can 400. The introspection URL is derived as `${OKTA_ISSUER_URL}/oauth2/v1/introspect`. |

```ini
OKTA_AUTH_ENABLED='true'
OKTA_CLIENT_ID='your-okta-client-id'
OKTA_ISSUER_URL='https://your-org.okta.com'
```

**Dual token source.** The middleware checks the `Authorization: Bearer <token>` header first — this is how mobile clients (iOS/Android) authenticate, since they hold the Okta access token directly. If no Bearer header is present, it falls back to `req.session.accessToken` — the path web clients use, since the browser never touches the token directly; the Node.js backend is expected to store it server-side at login. Both paths are validated through the same Okta introspection call, and a `401` is returned if the token is missing from both sources, inactive, or the introspection call fails.

> ⚠️ The session-based path requires a server-side session populated at login (`req.session.accessToken`). That login flow (Okta Authorization Code redirect + callback + session write) is separate, not-yet-built work — this repo has no session middleware installed today. Until it ships, web requests relying on the session fallback will always 401 when `OKTA_AUTH_ENABLED=true`; only the mobile Bearer-header path is exercisable end-to-end right now.

---

### Frontend (`env.sh`)

Frontend settings control the browser application. They define which features are visible, which defaults are applied when a participant joins, and how the app connects to the backend.

All frontend configuration lives in [`env.sh`](../env.sh). To change a setting, update the relevant `export` line and restart the app or trigger a new build.

```bash
# env.sh
export ALLOW_CHAT=false
export DEFAULT_LAYOUT_MODE='grid'
export I18N_SUPPORTED_LANGUAGES='en|es'
```

> **Note:** Changes to [`env.sh`](../env.sh) are applied at build time. Restart `yarn dev` locally or create a new build/deployment for the changes to take effect.

#### Value types

| Type | Description | Example |
|------|-------------|---------|
| `boolean` | Enables or disables a feature or behavior. | `true`, `false` |
| `number` | Numeric value. The description explains the expected unit. | `5000`, `10000000` |
| `string` | Single text value, usually selected from a fixed set. | `grid` |
| `string-list` | Pipe-separated list of values. | `en\|es\|it` |

---

#### Network

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `API_URL` | `string` | `http://localhost:3345` locally, `window.location.origin` in production | Valid URL | URL of the backend API server |
| `TUNNEL_DOMAIN` | `string` | Not set | Domain name | Public tunnel domain used when testing across devices. See [Getting Started](./GETTING_STARTED.md) |

---

#### Internationalisation

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `I18N_FALLBACK_LANGUAGE` | `string` | `en` | `en` \| `en-US` \| `es` \| `es-MX` \| `it` | Language used when the user's locale is not supported |
| `I18N_SUPPORTED_LANGUAGES` | `string-list` | `en` | Pipe-separated list, for example `en\|es\|it` | Languages offered in the UI |

---

#### Join experience

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `BYPASS_WAITING_ROOM` | `boolean` | `false` | `true` \| `false` | Skip the waiting room and join directly |
| `ALLOW_AUDIO_ON_JOIN` | `boolean` | `true` | `true` \| `false` | Start with microphone enabled when joining |
| `ALLOW_VIDEO_ON_JOIN` | `boolean` | `true` | `true` \| `false` | Start with camera enabled when joining |
| `DEFAULT_LAYOUT_MODE` | `string` | `active-speaker` | `active-speaker` \| `grid` | Default in-room layout when a participant joins |

> **Note:** `DEFAULT_LAYOUT_MODE`, `ALLOW_AUDIO_ON_JOIN`, and `ALLOW_VIDEO_ON_JOIN` require the participant to rejoin the room to apply updated values.

---

#### Audio and video controls

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `ALLOW_CAMERA_CONTROL` | `boolean` | `true` | `true` \| `false` | Show the camera on/off toggle |
| `ALLOW_MICROPHONE_CONTROL` | `boolean` | `true` | `true` \| `false` | Show the microphone on/off toggle |
| `ALLOW_BACKGROUND_EFFECTS` | `boolean` | `true` | `true` \| `false` | Enable virtual background and blur effects |
| `ALLOW_ADVANCED_NOISE_SUPPRESSION` | `boolean` | `true` | `true` \| `false` | Enable the advanced noise-suppression toggle |
| `WAITING_ROOM_ALLOW_ADVANCED_SETTINGS` | `boolean` | `true` | `true` \| `false` | Show the Advanced Settings panel in the waiting room |

---

#### Device selection

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `DEVICE_SELECTION` | `boolean` | `true` | `true` \| `false` | Enable device selection globally |
| `WAITING_ROOM_ALLOW_DEVICE_SELECTION` | `boolean` | `true` | `true` \| `false` | Show device selectors in the waiting room |
| `MEETING_ROOM_ALLOW_DEVICE_SELECTION` | `boolean` | `true` | `true` \| `false` | Show device selectors inside the meeting room |

---

#### In-call collaboration

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `ALLOW_CAPTIONS` | `boolean` | `true` | `true` \| `false` | Enable live captions |
| `ALLOW_CHAT` | `boolean` | `true` | `true` \| `false` | Enable the in-call group chat |
| `ALLOW_EMOJIS` | `boolean` | `true` | `true` \| `false` | Enable emoji reactions |
| `ALLOW_SCREEN_SHARE` | `boolean` | `true` | `true` \| `false` | Enable screen sharing |

---

#### Archiving

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `ALLOW_ARCHIVING` | `boolean` | `true` | `true` \| `false` | Enable meeting recording |
| `ARCHIVES_REFRESH_INTERVAL_MS` | `number` | `5000` | Positive integer, in milliseconds | Interval for refreshing archived meeting recordings |

---

#### Meeting room UI

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `SHOW_PARTICIPANT_LIST` | `boolean` | `true` | `true` \| `false` | Show the participant list panel |
| `ENABLE_REPORT_ISSUE` | `boolean` | `false` | `true` \| `false` | Show the in-call issue reporting tool |
| `MEETING_ROOM_ALLOW_ADVANCED_SETTINGS` | `boolean` | `true` | `true` \| `false` | Show the Advanced Settings panel inside the meeting room |
| `SHOW_VIDEO_STATS` | `boolean` | `false` | `true` \| `false` | Show overlay video stats on the waiting room |
| `NOTIFICATION_DURATION_MS` | `number` | `4000` | Positive integer, in milliseconds | Duration in-app notifications are displayed before auto-dismissing |
| `AVOID_FETCHING_APP_CONFIG` | `boolean` | `true` | `true` \| `false` | Skip fetching remote app configuration on startup |

---

#### Video quality defaults

| Variable | Type | Default | Accepted values | Description |
|----------|------|---------|-----------------|-------------|
| `DEFAULT_RESOLUTION` | `string` | `1280x720` | `1920x1080` \| `1280x960` \| `1280x720` \| `640x480` \| `640x360` \| `320x240` \| `320x180` | Format: `widthxheight` in pixels |
| `PUBLISHER_MAX_RESOLUTION` | `string` | `1920x1080` | `1920x1080` \| `1280x960` \| `1280x720` \| `640x480` \| `640x360` \| `320x240` \| `320x180` | Maximum resolution the publisher is allowed to use |
| `MIN_CUSTOM_VIDEO_BITRATE_BPS` | `number` | `5000` | Positive integer, in bps | Minimum selectable custom video bitrate in the Advanced Settings dialog |
| `MAX_CUSTOM_VIDEO_BITRATE_BPS` | `number` | `10000000` | Positive integer, in bps | Maximum selectable custom video bitrate in the Advanced Settings dialog |
| `SUPPORTED_FRAME_RATES` | `string-list` | `30\|15\|7\|1` | Pipe-separated positive integers, in fps | Frame rate options shown in the Advanced Settings video tab |

---

## UI Customization

The app theme is configured through the root `designTokens.json` file.

### Customize your theme

1. Edit `designTokens.json` at the project root with your palette/theme values.
2. Sync theme artifacts:

```bash
yarn sync:theme-tokens
```

This command always regenerates `designTokens.example.json`, syncs `libs/ui/src/theme/helpers/designTokens/designTokens.json` from root `designTokens.json` when present, creates root `designTokens.json` from defaults when missing, rebuilds the Tailwind plugin, and formats the generated plugin file.
