# Vonage Video API Reference App for React

<img src="https://developer.nexmo.com/assets/images/Vonage_Nexmo.svg" height="48px" alt="Nexmo is now known as Vonage" />

## Welcome to Vonage

If you're new to Vonage, you can [sign up for a Vonage API account](https://dashboard.vonage.com/?utm_source=DEV_REL&utm_medium=github&utm_campaign=vonage-video-react-app) and get some free credit to get you started.

## Table of Contents
<!-- TOC -->

- [Table of Contents](#table-of-contents)
- [What is it?](#what-is-it)
- [Cross-Platform Support](#cross-platform-support)
- [Why use it?](#why-use-it)
- [Project Architecture](#project-architecture)
- [Platforms Supported](#platforms-supported)
- [Requirements](#requirements)
- [Running Locally](#running-locally)
- [Storybook](#storybook)
- [UI Customization](#ui-customization)
- [Environment Configuration](#environment-configuration)
- [Testing on Multiple Devices](#testing-on-multiple-devices)
- [Deployment to Vonage Cloud Runtime](#deployment-to-vonage-cloud-runtime)
- [Testing](#testing)
  - [Integration Tests](#integration-tests)
    - [Screenshot tests or Visual comparisons](#screenshot-tests-or-visual-comparisons)
    - [Generating and Updating Screenshots](#generating-and-updating-screenshots)
  - [Running the backend and frontend test suites](#running-the-backend-and-frontend-test-suites)
  - [Backend Suite](#backend-suite)
  - [Frontend Suite](#frontend-suite)
- [Code style](#code-style)
  - [Linting and auto-formatting](#linting-and-auto-formatting)
  - [File names](#file-names)
- [Documentation Generation](#documentation-generation)
- [Code of Conduct](#code-of-conduct)
- [Maintainers](#maintainers)
- [Getting Involved](#getting-involved)
- [Known Issues](#known-issues)
- [Report Issues](#report-issues)

<!-- /TOC -->
## What is it?
The Vonage Video API Reference App for React is an open-source video conferencing reference application for the [Vonage Video API](https://developer.vonage.com/en/video/client-sdks/web/overview) using the React framework.

The Reference App demonstrates the best practices for integrating the [Vonage Video API](https://developer.vonage.com/en/video/client-sdks/web/overview) with your application for various use cases, from one-to-one and multi-participant video calling to recording, screen sharing, reactions, and more.

## Why use it?
The Vonage Video API Reference App for React provides developers an easy-to-setup way to get started with using our APIs with React.

The application is open-source, so you can not only get started quickly, but easily extend it with features needed for your use case. Any features already implemented in the Reference App use best practices for scalability and security.

As a commercial open-source project, you can also count on a solid information security architecture. While no packaged solution can guarantee absolute security, the transparency that comes with open-source software, combined with the proactive and responsive open-source community and vendors, provides significant advantages in addressing information security challenges compared to closed-source alternatives.

This application provides features for common conferencing use cases, such as:

- <details>
    <summary>A landing page for users to create and join meeting rooms.</summary>
    <img src="docs/assets/Welcome.png" alt="Screenshot of landing page">
  </details>
- <details>
    <summary>A waiting room for users to preview their audio and video device settings and set their name before entering a meeting room.</summary>
    <img src="docs/assets/WaitingRoom.png" alt="Screenshot of waiting room">
  </details>
- <details>
    <summary>A post-call page to navigate users to the landing page, re-enter the left room, and display archive(s), if any.</summary>
    <img src="docs/assets/Goodbye.png" alt="Screenshot of goodbye page">
  </details>
- A video conferencing “room” supporting up to 25 participants and the following features:
- <details>
    <summary>Input and output device selectors.</summary>
    <img src="docs/assets/DeviceSelector.png" alt="Screenshot of audio devices selector">
  </details>
- <details>
    <summary>Noise suppression toggles in meeting room</summary>
    <img src="docs/assets/NoiseSupression.png" alt="Screenshot of noise supression toggle">
  </details>
- <details>
    <summary>
      Video effects in meeting and waiting room. You can set predefined images, custom image or slight/strong background blur. Images can be uploaded from local device or URL in these formats: JPG, PNG, GIF or BMP. Video effects are not supported in non-Chromium-based browsers or on iOS.
      
    Please see [OT.hasMediaProcessorSupport](https://vonage.github.io/video-docs/video-js-reference/latest/OT.html#hasMediaProcessorSupport) for more information.
    </summary>
  
    <img src="docs/assets/BGEffects.png" alt="Screenshot of video effects">
  </details>
- <details>
    <summary>Composed archiving capabilities to record your meetings.</summary>
    <img src="docs/assets/Archiving.png" alt="Screenshot of archiving dialog box">
  </details>
- <details>
    <summary>In-call tools such as screen sharing (subscriber can zoom in/out if hasMediaProcessorSupport), group chat function, and emoji reactions.</summary>
    <img src="docs/assets/Emojis.png" alt="Screenshot of emojis">
  </details>
- Active speaker detection.
- Layout manager with options to display active speaker, screen share, or all participants in a grid view.
- The dynamic display adjusts to show new joiners, hide video tiles to conserve bandwidth, and show the “next” participant when someone previously speaking leaves.
- <details>
    <summary>Ability to mute other participants during the meeting.</summary>
    <img src="docs/assets/MutingParticipant.png" alt="Screenshot of muting participant dialog box">
  </details>
- <details>
    <summary>Call participant list with audio on/off indicator.</summary>
    <img src="docs/assets/ParticipantList.png" alt="Screenshot of participant list">
  </details>
- Meeting information with an easy-to-share URL to join the meeting.
- <details>
    <summary>A reporting tool to enable participants to file any in-call issues.</summary>
    <img src="docs/assets/ReportIssue.png" alt="Screenshot of report issue pane">
  </details>

## Project Architecture

The project uses an Nx workspace to manage the frontend and backend applications.

![Vonage Video API Reference App Architecture Diagram](./docs/assets/project-architecture.svg)

## Platforms Supported
The Vonage Video API Reference App for React is currently supported on the latest release versions for the following browsers:
- ![Chrome icon](/docs/assets/chrome.svg) Google Chrome
- ![Firefox icon](/docs/assets/ff.svg) Firefox
- ![Edge icon](/docs/assets/edge.svg) Microsoft Edge
- ![Opera icon](/docs/assets/opera.svg) Opera
- ![Safari icon](/docs/assets/safari.svg) Safari

*Note:* Some browsers such as Firefox or Safari do not support media processors like video and audio filters (e.g video effects): Please see [OT.hasMediaProcessorSupport](https://vonage.github.io/video-docs/video-js-reference/latest/OT.html#hasMediaProcessorSupport) for more information.

*Note:* Mobile web views have limited supported at the moment. The minimum supported device width is `360px`.

## Cross-Platform Support
Looking to build on other platforms? The Vonage Video API Reference App is also available for:

- *iOS*: [vonage-video-ios-app](https://github.com/Vonage/vonage-video-ios-app)
- *Android*: [vonage-video-android-app](https://github.com/Vonage/vonage-video-android-app)

These reference apps share the same backend infrastructure and demonstrate consistent best practices across all platforms, making it easy to build unified video experiences for your users.

## Requirements


- [node.js](https://nodejs.org/en/download/releases/) (version 22)
- [yarn](https://yarnpkg.com)
- optional - [nvm](https://github.com/creationix/nvm) (recommended for switching Node versions)

## Running Locally

- **Ensure You Have a Vonage Account**

  You can create one at the [Vonage API Dashboard](https://dashboard.vonage.com/applications).

- **Create an Application in the Dashboard**

  Once logged in, navigate to the [Applications page](https://dashboard.vonage.com/applications) via the main dashboard menu:

  <details close>
  <summary>Applications dashboard view</summary>
  <img src="./docs/assets/readme/1-dashboard-applications.png" alt="Applications dashboard" style="max-width: 100%; height: auto;" />
  </details>

  If you don’t already have an application, create a new one:

  <details close>
  <summary>Create new app</summary>
  <img src="./docs/assets/readme/2-create-app.png" alt="Create app button" style="max-width: 100%; height: auto;" />
  </details>

  During the setup process, make sure to:

  - Provide a name for your application.
  - Generate and download the public and private keys.
  - Enable **Video** capabilities.

  Refer to the following image for visual guidance:

  <details close>
  <summary>Configuring a new app</summary>
  <img src="./docs/assets/readme/3-create-app-form.png" alt="Create app form" style="max-width: 100%; height: auto;" />
  </details>
  </br>

- **Environment Variables**

  In the root project directory, create the backend environment file by running:

  ``` bash
  cp backend/.env.example backend/.env
  ```

  Then, open **backend/.env** and fill in the required configuration:

  - **VONAGE_APP_ID** – This is the ID of your Vonage application. You can find it on the [Applications page](https://dashboard.vonage.com/applications).
  - **VONAGE_PRIVATE_KEY** – If you've already generated a private key, use that. Otherwise, use the key you downloaded when creating the app.

  Frontend feature flags and display settings are configured in [`vcrBuild.env.sh`](vcrBuild.env.sh). The defaults work out of the box — edit that file only when you need to customise behaviour. See [Environment Configuration](#environment-configuration) for the full list of available options.

</br>

-  **Start in Development Mode**

    ``` bash
    yarn dev
    ```

    This starts both the backend server (port **3345**) and the frontend Vite dev server (port **5173**). You can now access the app at [http://localhost:5173](http://localhost:5173).

## Storybook

Storybook is available for developing and testing UI components in isolation.

To run Storybook for the frontend:

```bash
yarn storybook:frontend
```

This will start the Storybook dev server at [http://localhost:6006](http://localhost:6006).

-----

To run Storybook for the ui:

```bash
yarn storybook:ui
```

This will start the Storybook dev server at [http://localhost:6007](http://localhost:6007).

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

## Environment Configuration

The app has two parts — a **backend** server and a **frontend** UI. The backend is configured through `backend/.env`. Frontend settings are configured through [`vcrBuild.env.sh`](vcrBuild.env.sh), which is the single place for all frontend configuration.

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

Frontend settings control which features are visible, what language the app uses, and how the video room behaves by default. **All frontend configuration lives in a single file: [`vcrBuild.env.sh`](vcrBuild.env.sh).**

This file is loaded automatically whenever the app is built or deployed. To change a setting, open [`vcrBuild.env.sh`](vcrBuild.env.sh), update the relevant `export` line, and restart or rebuild:

```bash
# vcrBuild.env.sh
export ALLOW_CHAT=false
export DEFAULT_LAYOUT_MODE='grid'
export I18N_SUPPORTED_LANGUAGES='en|es'
```

> **Note:** After editing [`vcrBuild.env.sh`](vcrBuild.env.sh) you need to restart the app (`yarn dev`) or trigger a new build for the changes to take effect.

#### Network

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:3345` (local) / `window.location.origin` (production) | URL of the backend API server |
| `TUNNEL_DOMAIN` | — | ngrok (or similar) domain used when testing across devices. See [Testing on Multiple Devices](#testing-on-multiple-devices) |

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

## Testing on Multiple Devices

To test the video API across multiple devices on your local network, you can use **ngrok** to expose your frontend and backend publicly.

1. Create an account at [ngrok](https://dashboard.ngrok.com/signup) if you haven't already.

2. Follow the [Setup and Installation instructions](https://dashboard.ngrok.com/get-started/setup/) for your operating system to install and configure ngrok.

3. **Start the application locally first:**

    ``` bash
    yarn dev
    ```

    Make sure both the backend server (port 3345) and frontend dev server (port 5173) are running before proceeding to the next step.

4. Create secure tunnels for both frontend and backend:

    **Set up ngrok configuration:**
    
    First, find your ngrok config file location:
    ``` bash
    ngrok config check
    ```

    Create or edit the ngrok configuration file (typically located at `~/Library/Application Support/ngrok/ngrok.yml` on macOS; `~/.config/ngrok/ngrok.yml` on Linux and `%HOMEPATH%\AppData\Local\ngrok\ngrok.yml` on Windows) with the following content:

    ``` yaml
    version: "2"
    tunnels:
      frontend:
        addr: 5173
        proto: http
      backend:
        addr: 3345
        proto: http
    ```

    **Start both tunnels:**
    ``` bash
    ngrok start backend frontend
    ```

    This command will create publicly accessible HTTPS URLs for both your frontend and backend. The output will appear in your terminal, similar to the image below:

    <details close>
    <summary>ngrok output example</summary>
    <img src="./docs/assets/readme/4-forwarding.png" alt="ngrok tunnel example" style="max-width: 100%; height: auto;" />
    </details>

    </br>

5. Copy the domains from both outputs and update [`vcrBuild.env.sh`](vcrBuild.env.sh):

    ``` bash
    export TUNNEL_DOMAIN=your-frontend-domain.ngrok.io
    export API_URL=https://your-backend-domain.ngrok.io
    ```

    **Note:** ngrok assigns temporary domains. You'll need to update these values each time the domains change.

  </br>

6. Open the provided frontend **Forwarding** URL in your browser. This exposes your entire application publicly, allowing devices on any network to access it.

</br>

Enjoy testing!

## Deployment to Vonage Cloud Runtime

You can deploy the application to Vonage Cloud Runtime (VCR) for testing in a cloud environment. See the [VCR overview](https://developer.vonage.com/en/vonage-cloud-runtime/overview) for more information.

For quick development deployments directly from your local machine, you can use the `vcr:dev` script:

1. **Install the VCR CLI** (if not already installed):
   
   Follow the installation instructions at https://developer.vonage.com/en/vonage-cloud-runtime/getting-started/working-locally#cli-installation

2. **Configure VCR with your credentials**:

   ```bash
   vcr configure
   ```

   Enter your Vonage API Key and Secret, and select a region.

3. **Generate application keys**:

   ```bash
   vcr app generate-keys --app-id <app-id> --region <region>
   ```

   Replace `<app-id>` with your Vonage application ID and `<region>` with your region.
   
   > ⚠️ **Warning**: You should use a **separate** Vonage application for VCR deployment (different from the `VONAGE_APP_ID` in your `backend/.env` file) to avoid issues with your private key.

4. **Set up your development configuration**:

   Copy the development configuration example file:

   ```bash
   cp vcr.yml.example vcr-dev.yml
   ```

   Open `vcr-dev.yml` and add your application ID.

5. **Deploy to development**:

   ```bash
   yarn vcr:dev
   ```

This will deploy using your local development configuration and code, making it quick to test changes in a cloud environment.

## Testing

### Integration Tests

We have integration tests using [Playwright](https://playwright.dev/). We recommend using their [VSCode integration](https://playwright.dev/docs/getting-started-vscode) to run tests.

To run the tests you need to run the app server separately:

```console
# In one terminal tab
yarn start

# In a separate tab. Or use vscode extension to run tests
yarn test:integration
```

#### Screenshot tests or Visual comparisons

We use [Playwright Visual Comparison](https://playwright.dev/docs/test-snapshots) for Screenshot UI tests. Since screenshot tests are part of our integration tests, running our integration tests also executes the screenshot tests.

#### Generating and Updating Screenshots

If we need to update the expected screenshot due to UI changes, we can delete the existing expected screenshot and then run the test. The test will fail, but a new expected screenshot will be generated. Running the test again should pass, as the expected and actual screenshots will now match.

For CI tests, we require screenshots for various browsers and operating systems because they [render interfaces with subtle differences](https://github.com/microsoft/playwright/issues/18240#issuecomment-1287546463).

To capture CI-specific screenshots, you can use the `update-screenshots` job. This job is triggered by creating a pull request (PR) with the `update-screenshots` label on GitHub. Once triggered, it will capture new screenshots on the virtual machine (VM) and automatically push those to the PR's branch.

### Running the backend and frontend test suites

- To run the frontend and backend tests:
```console
yarn test
```

### Backend Suite

- To run backend tests once:

```console
yarn test:backend
```

- For additional CLI options, see [jest docs](https://jestjs.io/docs/cli).

### Frontend Suite
We have frontend tests using [vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). We recommend using the [vitest VSCode integration]( https://marketplace.visualstudio.com/items?itemName=vitest.explorer) to run tests.

For guidance on writing unit tests, see the [Test Instructions](./.github/instructions/test-files.instructions.md).

Alternatively you can run the tests in the terminal:
- To run frontend tests once:

```console
yarn test:frontend
```

- For additional CLI options, see [vitest docs](https://vitest.dev/guide/cli#options)

## Code style

### Linting and auto-formatting
We use eslint and prettier to format code. Prettier issues will show up in eslint too via eslint-plugin-prettier.
You can setup an eslint extension for your editor. For VSCode use: [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

You can either set up vscode to fix eslint issues on save or fix them with VSCode keyboard command palette shortcut `cmd + shift + p > "ESLint: Fix all auto-fixable problems"`.

In the terminal you can run

```console
yarn lint
```

to check for eslint issues and

```console
yarn lint:fix
```

to fix any auto-fixable issues and also run prettier on all files.

### File names

All filenames are in `camelCase`.

## Documentation Generation

We use `typedoc` to generate documentation from our jsdoc comments.
Generated documents can be found in the `frontend/dist` folder.

To generate documentation, run the following in the terminal

```console
yarn nx run frontend:docs
```

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Maintainers

This repository is actively maintained by the Vonage Video team.

For maintainer responsibilities, review expectations, and project ownership guidelines, see [MAINTAINERS.md](./MAINTAINERS.md).

## Getting Involved

If you wish to contribute to this project, read how in [Contributing](./docs/CONTRIBUTING.md).

## Known Issues

We track known issues in [Known Issues](./docs/KNOWN_ISSUES.md). Please refer to it for details.

## Report Issues

If you have any issues, feel free to open an issue or reach out to support via [support@api.vonage.com](support@api.vonage.com).
