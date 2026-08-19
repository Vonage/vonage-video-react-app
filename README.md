# Vonage Video API Reference App for React

<img src="https://developer.nexmo.com/assets/images/Vonage_Nexmo.svg" height="48px" alt="Nexmo is now known as Vonage" />

## Welcome to Vonage

If you're new to Vonage, you can [sign up for a Vonage API account](https://dashboard.vonage.com/?utm_source=DEV_REL&utm_medium=github&utm_campaign=vonage-video-react-app) and get some free credit to get you started.

## What is it?

The Vonage Video API Reference App for React is an open-source video conferencing reference application for the [Vonage Video API](https://developer.vonage.com/en/video/client-sdks/web/overview) using the React framework.

The Reference App demonstrates the best practices for integrating the [Vonage Video API](https://developer.vonage.com/en/video/client-sdks/web/overview) with your application for various use cases, from one-to-one and multi-participant video calling to recording, screen sharing, reactions, and more.

## Why use it?

The Vonage Video API Reference App for React provides developers an easy-to-setup way to get started with using our APIs with React.

The application is open-source, so you can not only get started quickly, but easily extend it with features needed for your use case. Any features already implemented in the Reference App use best practices for scalability and security.

As a commercial open-source project, you can also count on a solid information security architecture. While no packaged solution can guarantee absolute security, the transparency that comes with open-source software, combined with the proactive and responsive open-source community and vendors, provides significant advantages in addressing information security challenges compared to closed-source alternatives.

## Cross-Platform Support

Looking to build on other platforms? The Vonage Video API Reference App is also available for:

- **iOS**: [vonage-video-ios-app](https://github.com/Vonage/vonage-video-ios-app)
- **Android**: [vonage-video-android-app](https://github.com/Vonage/vonage-video-android-app)

These reference apps share the same backend infrastructure and demonstrate consistent best practices across all platforms, making it easy to build unified video experiences for your users.

## Project Architecture

The project uses an Nx workspace to manage the frontend and backend applications.

![Vonage Video API Reference App Architecture Diagram](./docs/assets/project-architecture.svg)

For details on the workspace structure, libraries, and module boundaries, see [Architecture](./docs/ARCHITECTURE.md).

## SDK Compatibility & Requirements

| Category | Details |
|----------|---------|
| ![Chrome icon](/docs/assets/chrome.svg) Chrome | Latest release |
| ![Firefox icon](/docs/assets/ff.svg) Firefox | Latest release |
| ![Edge icon](/docs/assets/edge.svg) Edge | Latest release |
| ![Opera icon](/docs/assets/opera.svg) Opera | Latest release |
| ![Safari icon](/docs/assets/safari.svg) Safari | Latest release |
| Minimum device width | 360px |
| Media Processors | Chromium-based browsers only (see [OT.hasMediaProcessorSupport](https://vonage.github.io/video-docs/video-js-reference/latest/OT.html#hasMediaProcessorSupport)) |
| Node.js | v22 |
| Package manager | [yarn](https://yarnpkg.com) |
| Version manager (optional) | [nvm](https://github.com/creationix/nvm) |

## Features

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
- A video conferencing "room" supporting up to 25 participants and the following features:
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
- The dynamic display adjusts to show new joiners, hide video tiles to conserve bandwidth, and show the "next" participant when someone previously speaking leaves.
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
  - <details>
 <summary>Advanced settings panel available in both the waiting room and meeting room, allowing fine-grained control over video, audio and metrics</summary>
 </details>

## Running Locally

See [Getting Started](./docs/GETTING_STARTED.md) for the full setup guide (Vonage account, environment variables, multi-device testing, and VCR deployment).

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Environment setup, local development, and deployment guide |
| [Architecture](./docs/ARCHITECTURE.md) | Nx workspace structure, projects, and library boundaries |
| [Configuration](./docs/CONFIGURATION.md) | Environment variables, feature flags, theming, and Storybook |
| [Session Migration](./docs/SESSION_MIGRATION.md) | Server rotation support, archiving recovery, and testing |
| [Testing](./docs/TESTING.md) | Integration tests, screenshot tests, and unit test suites |
| [Code Style](./docs/CODE_STYLE.md) | Linting, formatting, naming conventions, and doc generation |
| [Contributing](./docs/CONTRIBUTING.md) | How to contribute to the project |
| [Known Issues](./docs/KNOWN_ISSUES.md) | Tracked known issues and workarounds |
| [Dependencies](./docs/DEPENDENCIES.md) | Third-party dependency information |

## Contributing

We welcome contributions from the community. Please read our [Contributing guide](./docs/CONTRIBUTING.md) for details on how to get involved.

## Support / Getting Help

If you need help or have questions, reach out to [support@api.vonage.com](mailto:support@api.vonage.com).

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Maintainers

This repository is actively maintained by the Vonage Video team. See [MAINTAINERS.md](./MAINTAINERS.md) for details.

## Report Issues

If you encounter any issues, [open a GitHub issue](https://github.com/Vonage/vonage-video-react-app/issues) or reach out to [support@api.vonage.com](mailto:support@api.vonage.com).
