# Configuration

This document covers all environment variables, feature flags, theming, and Storybook usage for the Vonage Video API Reference App.

## Environment Configuration

The app has two parts — a **backend** server and a **frontend** UI. The backend is configured through `backend/.env`. Frontend settings are configured through [`vcrBuild.env.sh`](../vcrBuild.env.sh), which is the single place for all frontend configuration.

Create the backend configuration file by running:

```bash
cp backend/.env.example backend/.env
```

Then open it in a text editor and fill in the values described below.

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

---

### Frontend

Frontend settings control which features are visible, what language the app uses, and how the video room behaves by default. **All frontend configuration lives in a single file: [`vcrBuild.env.sh`](../vcrBuild.env.sh).**

This file is loaded automatically whenever the app is built or deployed. To change a setting, open [`vcrBuild.env.sh`](../vcrBuild.env.sh), update the relevant `export` line, and restart or rebuild:

```bash
# vcrBuild.env.sh
export ALLOW_CHAT=false
export DEFAULT_LAYOUT_MODE='grid'
export I18N_SUPPORTED_LANGUAGES='en|es'
```

> **Note:** After editing [`vcrBuild.env.sh`](../vcrBuild.env.sh) you need to restart the app (`yarn dev`) or trigger a new build for the changes to take effect.

#### Network

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:3345` (local) / `window.location.origin` (production) | URL of the backend API server |
| `TUNNEL_DOMAIN` | — | ngrok (or similar) domain used when testing across devices. See [Getting Started](./GETTING_STARTED.md) for multi-device testing setup |

#### Internationalisation

| Variable | Default | Accepted values | Description |
|----------|---------|-----------------|-------------|
| `I18N_FALLBACK_LANGUAGE` | `en` | `en` \| `en-US` \| `es` \| `es-MX` \| `it` | Language used when the user's locale is not supported |
| `I18N_SUPPORTED_LANGUAGES` | `en` | Pipe-separated list, e.g. `en\|es\|it` | Languages offered in the UI |

#### Feature flags

All feature flags are **boolean** (`true` / `false`).

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOW_BACKGROUND_EFFECTS` | `true` | Enable virtual background and blur effects |
| `ALLOW_CAMERA_CONTROL` | `true` | Show the camera on/off toggle |
| `ALLOW_VIDEO_ON_JOIN` | `true` | Start with camera enabled when joining |
| `ALLOW_ADVANCED_NOISE_SUPPRESSION` | `true` | Enable the advanced noise-suppression toggle |
| `ALLOW_AUDIO_ON_JOIN` | `true` | Start with microphone enabled when joining |
| `ALLOW_MICROPHONE_CONTROL` | `true` | Show the microphone on/off toggle |
| `WAITING_ROOM_ALLOW_DEVICE_SELECTION` | `true` | Show device selectors in the waiting room |
| `MEETING_ROOM_ALLOW_DEVICE_SELECTION` | `true` | Show device selectors inside the meeting room |
| `ALLOW_ARCHIVING` | `true` | Enable meeting recording (archiving) |
| `ALLOW_CAPTIONS` | `true` | Enable live captions |
| `ALLOW_CHAT` | `true` | Enable the in-call group chat |
| `ALLOW_EMOJIS` | `true` | Enable emoji reactions |
| `ALLOW_SCREEN_SHARE` | `true` | Enable screen sharing |
| `SHOW_PARTICIPANT_LIST` | `true` | Show the participant list panel |
| `ENABLE_REPORT_ISSUE` | `false` | Show the in-call issue reporting tool |
| `BYPASS_WAITING_ROOM` | `false` | Skip the waiting room and join directly |
| `AVOID_FETCHING_APP_CONFIG` | `true` | Skip fetching remote app configuration on startup |
| `WAITING_ROOM_ALLOW_ADVANCED_SETTINGS` | `true` | Show the Advanced Settings panel in the waiting room |
| `MEETING_ROOM_ALLOW_ADVANCED_SETTINGS` | `true` | Show the Advanced Settings panel inside the meeting room |
| `DEFAULT_RESOLUTION` | `1920x1080` | Default video resolution for the publisher |
| `MIN_CUSTOM_VIDEO_BITRATE_BPS` | `5000` | Minimum custom video bitrate available in Advanced Settings (bps) |
| `MAX_CUSTOM_VIDEO_BITRATE_BPS` | `10000000` | Maximum custom video bitrate available in Advanced Settings (bps) |
| `SUPPORTED_FRAME_RATES` | `30\|15\|7\|1` | Frame rate options available in the Advanced Settings video tab |
| `SHOW_VIDEO_STATS` | `false` | Show overlay video stats on the waiting room |

#### Display defaults

| Variable | Default | Accepted values | Description |
|----------|---------|-----------------|-------------|
| `DEFAULT_RESOLUTION` | `1280x720` | `1920x1080` \| `1280x960` \| `1280x720` \| `640x480` \| `640x360` \| `320x240` \| `320x180` | Default outgoing video resolution |
| `DEFAULT_LAYOUT_MODE` | `active-speaker` | `active-speaker` \| `grid` | Default in-room layout when a participant joins |
| `MIN_CUSTOM_VIDEO_BITRATE_BPS` | `5000` | Positive integer (bps) | Minimum selectable custom video bitrate in the Advanced Settings dialog |
| `MAX_CUSTOM_VIDEO_BITRATE_BPS` | `10000000` | Positive integer (bps) | Maximum selectable custom video bitrate in the Advanced Settings dialog |
| `SUPPORTED_FRAME_RATES` | `30\|15\|7\|1` | `\|`-separated positive integers (fps) | Frame rate options shown in the Advanced Settings video tab |

> **Note:** `DEFAULT_LAYOUT_MODE` and `ALLOW_AUDIO_ON_JOIN` / `ALLOW_VIDEO_ON_JOIN` require the participant to **rejoin the room** to take effect after being changed.

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

---

## Storybook

Storybook is available for developing and testing UI components in isolation.

To run Storybook for the frontend:

```bash
yarn storybook frontend
```

This will start the Storybook dev server at [http://localhost:6006](http://localhost:6006).

---

To run Storybook for the UI library:

```bash
yarn storybook ui
```

This will start the Storybook dev server at [http://localhost:6007](http://localhost:6007).
