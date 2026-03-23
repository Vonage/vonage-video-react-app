# Electron Desktop App

This document explains how the Vonage Video React Reference App was extended to run as a native desktop application using [Electron](https://www.electronjs.org/).

## Architecture Overview

The Electron integration follows a **localhost embedding** strategy:

```
┌─────────────────────────────────────────────────┐
│  Electron Main Process (electron/main.ts)       │
│                                                 │
│  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  Static HTTP Server │  │  BrowserWindow   │  │
│  │  (frontend/dist/)   │──│  loads localhost  │  │
│  │  port: auto-assigned│  │  URL into Chromium│  │
│  └─────────────────────┘  └──────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────────┐ │
│  │  Permissions · CSP · Screen Picker · Tray   │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

The main process starts a lightweight HTTP server that serves the pre-built frontend (`frontend/dist/`), then opens a `BrowserWindow` pointing at `http://localhost:<port>`. From the renderer's perspective, it's just a browser hitting localhost — so `BrowserRouter`, `window.location`, `localStorage`, and all existing web app logic work unchanged.

The **backend runs separately** alongside Electron. In dev mode, `yarn dev:electron` starts the backend on port 3345 via `concurrently` while the Electron app serves the frontend from a built-in static HTTP server. The frontend's `env.ts` auto-detects `localhost` and sets `API_URL` to `http://localhost:3345`. For packaged builds, the backend is not bundled with the Electron app and must be deployed and started as a separate service.

## File Structure

```
electron/
├── main.ts              # Main process — window, permissions, tray, screen picker
├── preload.ts           # Context bridge — exposes minimal API to renderer
├── preload.d.ts         # TypeScript ambient types for window.electron
├── picker-preload.ts    # Preload for the screen sharing picker window
├── picker.html          # Custom screen sharing source picker UI
├── about.html           # Custom About dialog
├── project.json         # Nx project descriptor
├── tsconfig.json        # TypeScript config (CommonJS target for Node)
├── electron-builder.json # Packaging config (dmg/exe/AppImage)
├── entitlements.mac.plist # macOS hardened runtime entitlements
├── assets/              # App icons, tray icons
├── build-resources/     # electron-builder resources (installer icons)
└── ELECTRON.md          # This file

scripts/
├── electronDev.ts       # Dev mode: build + launch Electron
├── electronPackage.ts   # Package for distribution
└── generateElectronIcons.ts # Generate tray/app icons from source PNG

frontend/src/
├── utils/clipboard.ts   # Clipboard utility (Electron IPC + web fallback)
└── types/electron.d.ts  # Ambient type for window.electron
```

## What Was Changed in the Web App

Only a few frontend files were modified, all with graceful fallbacks so the web app continues to work identically:

### `frontend/src/utils/clipboard.ts` (new)

A clipboard utility that uses Electron's main-process `clipboard` module via IPC when available, falling back to `navigator.clipboard.writeText()` for web browsers. This avoids a known Electron issue where `navigator.clipboard.writeText()` silently fails when the `BrowserWindow` loses focus.

### `frontend/src/components/MeetingRoom/ParticipantList/ParticipantList.tsx`
### `frontend/src/components/MeetingRoom/SmallViewportHeader/SmallViewportHeader.tsx`

Both components now use `copyTextToClipboard()` instead of `navigator.clipboard.writeText()` directly.

### `frontend/src/hooks/useRoomShareUrl.tsx`

Uses `env.TUNNEL_DOMAIN` (if set) as the share URL origin instead of `window.location.origin`. In Electron, `window.location.origin` returns `http://localhost:<port>`, which isn't shareable externally. With `TUNNEL_DOMAIN` configured (e.g. via ngrok), the share URL points to the public domain.

### `frontend/src/types/electron.d.ts` (new)

Ambient TypeScript declaration adding an optional `window.electron` property. This is typed as optional (`?`) so all access requires null-checking, ensuring web builds work without any Electron APIs present.

## Electron Main Process (`electron/main.ts`)

The main process handles:

### Media Permissions

```ts
session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
  ALLOWED_CHECK.includes(permission)
);
session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
  callback(ALLOWED_REQUEST.includes(permission))
);
```

Electron's Chromium requires explicit permission grants for camera, microphone, and display capture. Without these handlers, `getUserMedia()` is silently denied.

### Screen Sharing

Two complementary mechanisms:

1. **`setDisplayMediaRequestHandler`** — intercepts `getDisplayMedia()` calls from the web content and opens our custom picker.
2. **`desktop-capturer-get-sources` IPC handler** — the Vonage SDK checks for `window.electron.desktopCapturer.getSources()` when running in Electron with `contextIsolation`. This IPC handler also opens the custom picker and returns only the user-selected source.

The custom picker (`picker.html`) shows thumbnails of all screens and windows, organized in tabs, with a Vonage-branded UI.

### Content Security Policy

A permissive CSP is configured via `session.defaultSession.webRequest.onHeadersReceived()` to allow:
- WebRTC signaling and media connections to Vonage/TokBox domains
- Multi-level subdomains (e.g. `*.media.prod.tokbox.com`)
- Blob and mediastream sources for camera/screen capture
- Google Fonts for the UI

### Other Features

- **System tray** with context menu (show, open in browser, about, quit)
- **Custom About dialog** showing app version, SDK version, and Electron version
- **Power save blocker** during active calls (prevents display sleep)
- **Leave meeting confirmation** dialog when closing window during a call
- **macOS app menu** with correct app name ("Vonage Video" instead of "Electron")
- **Auto-updater** (packaged builds only, via `electron-updater`)
- **Dock icon** override on macOS

## Context Bridge (`electron/preload.ts`)

The preload script exposes a minimal API to the renderer via `contextBridge`:

```ts
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  openExternal: (url) => ipcRenderer.send('open-external', url),
  copyToClipboard: (text) => ipcRenderer.invoke('clipboard-write', text),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  desktopCapturer: {
    getSources: (opts) => ipcRenderer.invoke('desktop-capturer-get-sources', opts),
  },
});
```

`contextIsolation` is enabled and `nodeIntegration` is disabled — the renderer has no direct access to Node.js or Electron APIs.

## macOS Permissions (TCC)

macOS uses TCC (Transparency, Consent, and Control) to gate access to camera, microphone, and screen recording. Key details:

### Responsible Process

macOS attributes permission prompts to the **responsible process** — the top-level app that Launch Services knows about. If Electron is spawned as a child of another process (e.g. a terminal or CLI tool), TCC attributes the prompts to the parent, which may lack the required `Info.plist` keys.

**Solution**: On macOS, the dev script (`electronDev.ts`) launches Electron via `open -n` (Launch Services) instead of spawning the binary directly. This ensures Electron.app is the responsible process.

### Info.plist Patching

The dev script patches `node_modules/electron/dist/Electron.app/Contents/Info.plist` to add:
- `CFBundleName` / `CFBundleDisplayName` → "Vonage Video"
- `NSCameraUsageDescription` → camera permission prompt text
- `NSMicrophoneUsageDescription` → microphone permission prompt text

The `CFBundleIdentifier` is intentionally **not** changed from `com.github.electron` — changing it would break TCC's code signature verification since the Electron binary is signed by GitHub.

### Screen Recording

Screen Recording cannot be requested programmatically on macOS. On first launch, the main process probes `desktopCapturer.getSources()` at startup to register the app in System Settings. The user must then enable Screen Recording manually in **System Settings → Privacy & Security → Screen & System Audio Recording**.

If Screen Recording is denied when the user tries to share their screen, the app shows a dialog with a button to open System Settings directly.

### Entitlements (Packaged Builds)

For distribution, the app must be signed with entitlements (`entitlements.mac.plist`) that declare camera, microphone, and screen capture access. These are used by `electron-builder` during packaging.

## Build Pipeline

```
Frontend build (Vite)    →  frontend/dist/
Electron build (tsc)     →  electron/dist/main.js + preload.js
electron-builder         →  dist/mac/*.dmg, dist/win/*.exe, dist/linux/*.AppImage
```

### Dev Mode

```bash
yarn dev electron
```

This starts the backend and Electron together. Under the hood it runs `concurrently` with `nx run backend:dev` and `scripts/electronDev.ts`.

`electronDev.ts` does:
1. Patches Electron.app's Info.plist (macOS only)
2. Generates tray/app icons
3. Builds the React frontend via Vite
4. Compiles Electron TypeScript
5. Launches Electron via `open -n` (macOS) or direct spawn (Windows/Linux)

You can also run Electron separately with `yarn dev:electron` (backend must be running separately in that case).

### Packaging

```bash
yarn build:electron
```

This runs `scripts/electronPackage.ts` which builds everything and then invokes `electron-builder` to produce platform-specific installers.

## Electron Version Compatibility

The code is **version-adaptive** — it detects the Electron major version at startup (`ELECTRON_MAJOR`) and adapts API calls accordingly. This ensures the app works across a wide range of Electron versions without code changes.

### Tested Versions

| Electron | Chromium | Node | Status |
|---|---|---|---|
| 36.9.5 | 128 | 20.18 | ✅ All features working |
| 39.8.3 | 134 | 22.x | ✅ All features working |
| 41.0.3 | 136 | 24.x | ✅ All features working |

### Version-Specific Adaptations

- **Electron 39+**: `setDisplayMediaRequestHandler` requires `{ useSystemPicker: false }` as a second argument to use the custom picker instead of the OS-level system picker (which became the default in Electron 39).
- **Electron 39+**: Permission request handler callback patterns differ; the code branches based on `ELECTRON_MAJOR`.
- **macOS 14.2+ / Electron 39+**: `NSAudioCaptureUsageDescription` is added to `Info.plist` during dev-mode patching to support the CoreAudio Tap API used for desktop audio capture.
- **All versions**: `electron-updater` is dynamically imported (no top-level import) so the app starts cleanly even if the package is unavailable.
- **Screen Recording pre-check**: The code always attempts `desktopCapturer.getSources()` rather than bailing out when `systemPreferences.getMediaAccessStatus('screen')` reports `'denied'` — macOS TCC can report stale status after Electron binary swaps (e.g. version upgrades).
- **`setDisplayMediaRequestHandler`**: Runtime feature-checked before use. If unavailable (unlikely in modern Electron), the app falls back to Chrome's built-in picker.

### Upgrading Electron

To test with a different Electron version:

```bash
# Install a specific version
rm -rf node_modules/electron && yarn add electron@41.0.3 --dev

# Reset macOS Screen Recording permission (new binary = new TCC entry)
tccutil reset ScreenCapture com.github.electron

# Launch and re-grant Screen Recording in System Settings when prompted
yarn dev:electron
```

**Important**: After swapping Electron versions on macOS, you must re-grant Screen Recording permission. macOS ties TCC permissions to the binary hash — a different Electron version has a different binary.

## What Did NOT Need Changes

These files work unchanged in Electron:

| File | Why |
|---|---|
| `frontend/src/App.tsx` | `BrowserRouter` works via localhost |
| `frontend/src/env.ts` | Localhost detection returns correct API URL |
| `frontend/src/utils/storage.ts` | `localStorage` works in Electron Chromium |
| `frontend/src/hooks/usePermissions.tsx` | Works with main-process permission handlers |
| `frontend/src/hooks/useScreenShare.tsx` | `videoSource: 'screen'` triggers `getDisplayMedia`, intercepted by main process |
| `backend/server.ts` | Not embedded; runs separately |
