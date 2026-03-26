import {
  app,
  BrowserWindow,
  clipboard,
  desktopCapturer,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  powerSaveBlocker,
  session,
  shell,
  systemPreferences,
  Tray,
} from 'electron';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ─── IPC Channel Reference ───────────────────────────────────────────────────
//
// Channels used for renderer ↔ main process communication:
//   open-external                renderer → main  Open URL in default browser
//   clipboard-write              renderer → main  Write text to system clipboard
//   check-for-updates            renderer → main  Trigger auto-update check
//   desktop-capturer-get-sources renderer → main  Show screen picker, return selected source
//   screen-picker:sources        main → picker    Send available screens/windows to picker
//   screen-picker:select         picker → main    User selected a source
//   screen-picker:refresh        picker → main    Refresh source thumbnails
//   screen-picker:cancel         picker → main    User cancelled picker
//   about:versions               main → about     Send version info to About dialog
//   about:update-status          main → about     Send update check result to About dialog

// ─── App identity ─────────────────────────────────────────────────────────────

/**
 * Set the application name as early as possible — before app.whenReady() —
 * so it propagates to the macOS menu bar, dock tooltip, About panel, and all
 * system dialogs (permission prompts, update notifications, etc.).
 */
app.setName('Vonage Video');

// ─── Versions (read once at startup) ─────────────────────────────────────────

let applicationVersion = 'unknown';
let videoSdkVersion = 'unknown';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  applicationVersion = (require('../../package.json') as { version: string }).version;
} catch {
  /* leave as "unknown" */
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  videoSdkVersion = (require('@vonage/client-sdk-video/package.json') as { version: string })
    .version;
} catch {
  /* leave as "unknown" */
}

// ─── Electron version detection ──────────────────────────────────────────────
// Parse the major version once at startup so we can adapt to API changes
// across Electron 36–41+ without hard-coding version checks everywhere.
//   - Electron 39+: setDisplayMediaRequestHandler requires { useSystemPicker: false }
//   - Electron 39+: permission handler callback patterns changed
//   - macOS 14.2+ / Electron 39+: requires NSAudioCaptureUsageDescription
const electronMajorVersion = parseInt(process.versions.electron?.split('.')[0] ?? '0', 10);
console.log(
  `[Electron] Running Electron ${process.versions.electron} (major: ${electronMajorVersion})`
);

// ─── Paths ────────────────────────────────────────────────────────────────────

const isPackaged = app.isPackaged;

const assetsDirectory = isPackaged
  ? path.join(process.resourcesPath, 'electron-assets')
  : path.join(__dirname, '../assets');

const frontendDistPath = isPackaged
  ? path.join(process.resourcesPath, 'frontend-dist')
  : path.join(__dirname, '../../frontend/dist');

const pickerHtmlPath = isPackaged
  ? path.join(process.resourcesPath, 'picker.html')
  : path.join(__dirname, '../picker.html');

const aboutHtmlPath = isPackaged
  ? path.join(process.resourcesPath, 'about.html')
  : path.join(__dirname, '../about.html');

// ─── Static file server ───────────────────────────────────────────────────────

// 0 = let the OS pick a free port; resolved to actual port after server starts.
let staticPort = Number(process.env.ELECTRON_FRONTEND_PORT ?? 0);

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function startStaticServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let rawPath: string;
      try {
        rawPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
      } catch {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const urlPath = rawPath === '/' ? '/index.html' : rawPath;
      const filePath = path.resolve(frontendDistPath, `.${urlPath}`);

      // Prevent path traversal — resolved path must stay inside frontendDistPath.
      // Use path.relative() instead of startsWith() to avoid prefix collisions
      // (e.g. frontendDistPath + "../frontend-dist2" sharing the same prefix).
      const relativePath = path.relative(frontendDistPath, filePath);
      if (
        path.isAbsolute(relativePath) ||
        relativePath === '..' ||
        relativePath.startsWith('..' + path.sep)
      ) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Only SPA-fallback to index.html for route requests (no file extension).
          // Missing static assets (e.g. /assets/app.css) return 404 so build/packaging
          // issues surface immediately instead of silently serving HTML.
          if (ext) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          fs.readFile(path.join(frontendDistPath, 'index.html'), (_e2, indexData) => {
            if (_e2) {
              res.writeHead(404);
              res.end('Not found');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexData);
          });
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(staticPort, '127.0.0.1', () => {
      // If port was 0, the OS assigned a free one — update staticPort so
      // loadURL() uses the correct address.
      const addr = server.address();
      if (addr && typeof addr === 'object') staticPort = addr.port;
      console.log(`[Electron] Frontend served at http://localhost:${staticPort}`);
      resolve();
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error(`[Electron] Static server failed on port ${staticPort}:`, err.message);
      reject(err);
    });
  });
}

// ─── Custom About window ──────────────────────────────────────────────────────

let aboutWindow: BrowserWindow | null = null;

/**
 * Open the custom About window (electron/about.html).
 * Focuses the existing window if already open.
 */
function openAboutWindow(): void {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 460,
    height: 500,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true, // ensure About is visible even above the floating picker
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    title: 'About Vonage Video',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  aboutWindow.setMenu(null);
  aboutWindow.once('ready-to-show', () => {
    aboutWindow?.show();
    aboutWindow?.setAlwaysOnTop(true, 'floating');
    aboutWindow?.focus();
  });
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.loadFile(aboutHtmlPath, {
    query: {
      appVersion: applicationVersion,
      sdkVersion: videoSdkVersion,
      electronVersion: process.versions.electron ?? 'unknown',
    },
  });
}

// ─── macOS application menu ───────────────────────────────────────────────────

/**
 * Replace Electron's default application menu (which reads "Electron") with one
 * that uses the correct app name. Also adds an Edit menu so that standard
 * keyboard shortcuts (Cmd+C, Cmd+V, etc.) work inside the web content.
 *
 * On Windows / Linux the menu bar is hidden per-window via win.setMenu(null);
 * this function is a no-op on those platforms.
 */
function buildAndSetAppMenu(): void {
  const name = app.getName(); // "Vonage Video"

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: name,
            submenu: [
              {
                label: `About ${name}`,
                click: () => openAboutWindow(),
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              {
                label: `Quit ${name}`,
                accelerator: 'Cmd+Q',
                click: () => app.quit(),
              },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
        ...(!isPackaged
          ? [
              { type: 'separator' as const },
              { role: 'reload' as const },
              { role: 'toggleDevTools' as const },
            ]
          : []),
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        { type: 'separator' as const },
        { role: 'front' as const },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── Call state ───────────────────────────────────────────────────────────────

let isInCall = false;
let powerBlockerId: number | null = null;

function setCallState(inCall: boolean): void {
  if (inCall === isInCall) return;
  isInCall = inCall;

  if (inCall && powerBlockerId === null) {
    powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    console.log('[Electron] Power save blocker started (id=%d)', powerBlockerId);
  } else if (!inCall && powerBlockerId !== null) {
    powerSaveBlocker.stop(powerBlockerId);
    powerBlockerId = null;
    console.log('[Electron] Power save blocker stopped');
  }
}

// ─── Permissions ──────────────────────────────────────────────────────────────

function configureMediaPermissions(): void {
  // Permissions granted when the page calls navigator.mediaDevices.getUserMedia()
  // or requestPermission() — fires in setPermissionRequestHandler.
  const allowedRequestPermissions = [
    'media',
    'display-capture',
    'mediaKeySystem',
    'notifications',
    'clipboard-write',
    'clipboard-read',
  ];

  // Permissions checked synchronously before a device is accessed — fires in
  // setPermissionCheckHandler.  In Electron 20+ these use distinct string values:
  //   'default-microphone' / 'default-camera' / 'default-speaker'
  // rather than the generic 'media' used by the request handler.
  // If these return false the browser silently denies getUserMedia without
  // ever reaching macOS TCC, so we must explicitly allow them here.
  const allowedCheckPermissions = [
    ...allowedRequestPermissions,
    'default-microphone',
    'default-camera',
    'default-speaker',
    'clipboard-sanitized-write',
  ];

  const isTrustedOrigin = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const origin = new URL(url).origin;
      return (
        origin === `http://localhost:${staticPort}` || origin === `http://127.0.0.1:${staticPort}`
      );
    } catch {
      return false;
    }
  };

  session.defaultSession.setPermissionCheckHandler((wc, permission) => {
    if (!isTrustedOrigin(wc?.getURL())) return false;
    return allowedCheckPermissions.includes(permission);
  });

  // Electron 39+ deprecates the callback-based setPermissionRequestHandler in
  // favour of returning a boolean directly.  We keep the callback version as a
  // fallback for Electron ≤38.
  if (electronMajorVersion >= 39) {
    session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
      const allowed =
        isTrustedOrigin(wc?.getURL()) && allowedRequestPermissions.includes(permission);
      callback(allowed);
    });
  } else {
    session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
      if (!isTrustedOrigin(wc?.getURL())) return callback(false);
      callback(allowedRequestPermissions.includes(permission));
    });
  }
}

// ─── Content Security Policy ──────────────────────────────────────────────────

function configureContentSecurityPolicy(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            // Default covers everything not explicitly listed below
            "default-src 'self' http://localhost:* https://*.vonage.com https://*.tokbox.com https://*.opentok.com",
            // Scripts: Vonage SDK is loaded from static.opentok.com
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.opentok.com https://*.vonage.com",
            // Styles: Google Fonts stylesheet
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            // Fonts: Google Fonts actual font files
            "font-src 'self' https://fonts.gstatic.com",
            // Media: camera / microphone streams and recorded blobs
            "media-src 'self' blob: mediastream:",
            // Images
            "img-src 'self' data: blob:",
            // Connections: WebRTC signalling + media.
            // NOTE: Vonage media servers use MULTI-LEVEL subdomains such as
            //   wss://<pod>.<region>.media.prod.tokbox.com
            // CSP wildcards only match ONE subdomain level, so *.tokbox.com
            // does NOT cover those hosts — we must list each level explicitly.
            "connect-src 'self'" +
              ' http://localhost:* ws://localhost:*' +
              ' https://*.vonage.com wss://*.vonage.com' +
              ' https://*.tokbox.com wss://*.tokbox.com' +
              ' https://*.media.prod.tokbox.com wss://*.media.prod.tokbox.com' +
              ' https://*.opentok.com wss://*.opentok.com' +
              ' https://fonts.googleapis.com',
            // Workers
            "worker-src 'self' blob:",
            // No iframes
            "frame-src 'none'",
          ].join('; '),
        ],
      },
    });
  });
  console.log('[Electron] Content Security Policy configured for trusted origins');
}

// ─── Screen share picker ──────────────────────────────────────────────────────

async function showScreenRecordingDeniedDialog(): Promise<void> {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Screen Recording Permission Required',
    message: 'Vonage Video cannot access your screen.',
    detail:
      'Please grant Screen Recording access in\n' +
      'System Settings → Privacy & Security → Screen Recording\n' +
      'then restart Vonage Video.',
    buttons: ['Open System Settings', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
  });
  if (response === 0) {
    shell
      .openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture')
      .catch(console.error);
  }
}

type PickerCallback = (sourceId: string | null) => void;
let pendingPickerCallback: PickerCallback | null = null;
let pickerWindowRef: BrowserWindow | null = null;

async function openScreenPicker(onSelect: PickerCallback): Promise<void> {
  // If a picker is already open, focus it and reject the new request
  if (pickerWindowRef && !pickerWindowRef.isDestroyed()) {
    pickerWindowRef.focus();
    onSelect(null);
    return;
  }
  // macOS: Screen Recording is a TCC permission that cannot be requested
  // programmatically.  We log the status for debugging but do NOT bail out
  // solely on getMediaAccessStatus() — macOS can report 'denied' even when
  // the permission is actually granted (e.g. after swapping Electron binaries).
  // Instead, we always attempt getSources() and only show the permission
  // dialog if it fails or returns an empty array.
  if (process.platform === 'darwin') {
    const screenStatus = systemPreferences.getMediaAccessStatus('screen');
    console.log('[Electron] Screen recording permission status:', screenStatus);
  }

  let sources: Electron.DesktopCapturerSource[];
  try {
    sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 280, height: 158 },
    });
  } catch (err) {
    console.error('[Electron] desktopCapturer.getSources() failed:', err);
    await showScreenRecordingDeniedDialog();
    onSelect(null);
    return;
  }

  // getSources() succeeded but returned nothing — Screen Recording was silently
  // denied (macOS returns an empty array instead of throwing in some versions).
  if (sources.length === 0) {
    console.warn('[Electron] getSources() returned no sources — Screen Recording likely denied.');
    await showScreenRecordingDeniedDialog();
    onSelect(null);
    return;
  }

  // Find the main window to use as parent for modal behaviour
  const parentWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null;

  pickerWindowRef = new BrowserWindow({
    width: 864,
    height: 624,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true, // keep picker above other windows so it can't get lost
    fullscreenable: false,
    modal: !!parentWindow, // block interaction with parent while picker is open
    parent: parentWindow ?? undefined,
    show: false, // hidden until ready-to-show fires to avoid a blank flash
    title: 'Share your screen',
    webPreferences: {
      preload: path.join(__dirname, 'picker-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const pickerWin = pickerWindowRef;
  pickerWin.setMenu(null);

  const serialisedSources = sources.map((s) => ({
    id: s.id,
    name: s.name,
    thumbnail: s.thumbnail.toDataURL(),
    appIcon: s.appIcon ? s.appIcon.toDataURL() : null,
  }));

  pendingPickerCallback = onSelect;

  pickerWin.once('ready-to-show', () => {
    pickerWin.webContents.send('screen-picker:sources', serialisedSources);
    pickerWin.show();
    // Enforce floating level so macOS keeps the picker above all app windows
    pickerWin.setAlwaysOnTop(true, 'floating');
    pickerWin.focus();
  });

  pickerWin.on('closed', () => {
    pickerWindowRef = null;
    if (pendingPickerCallback) {
      pendingPickerCallback(null);
      pendingPickerCallback = null;
    }
  });

  await pickerWin.loadFile(pickerHtmlPath);
}

function registerPickerIpc(): void {
  ipcMain.on('screen-picker:select', (event, sourceId: string) => {
    if (pendingPickerCallback) {
      pendingPickerCallback(sourceId);
      pendingPickerCallback = null;
    }
    const pickerWindow = BrowserWindow.fromWebContents(event.sender);
    if (pickerWindow) pickerWindow.close();
  });

  // Periodic thumbnail refresh — the picker UI requests updated sources every 2s
  ipcMain.on('screen-picker:refresh', async (event) => {
    const pickerWindow = BrowserWindow.fromWebContents(event.sender);
    if (!pickerWindow || pickerWindow.isDestroyed()) return;
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 280, height: 158 },
      });
      const serialised = sources.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail.toDataURL(),
        appIcon: s.appIcon ? s.appIcon.toDataURL() : null,
      }));
      if (!pickerWindow.isDestroyed()) {
        pickerWindow.webContents.send('screen-picker:sources', serialised);
      }
    } catch {
      // Silently ignore refresh failures — the picker will retry on next interval
    }
  });

  ipcMain.on('screen-picker:cancel', (event) => {
    if (pendingPickerCallback) {
      pendingPickerCallback(null);
      pendingPickerCallback = null;
    }
    const pickerWindow = BrowserWindow.fromWebContents(event.sender);
    if (pickerWindow) pickerWindow.close();
  });

  // Open a URL in the system browser — used by the About window GitHub link.
  // Only allow https:// URLs as a safety measure.
  ipcMain.on('open-external', (_event, url: unknown) => {
    if (typeof url === 'string' && url.startsWith('https://')) {
      shell.openExternal(url).catch(console.error);
    }
  });

  // Clipboard write — navigator.clipboard.writeText() can silently fail in
  // Electron when the webContents loses focus at the moment of the call.
  // Using the main-process clipboard module is always reliable.
  ipcMain.handle('clipboard-write', (_event, text: unknown) => {
    if (typeof text === 'string') {
      clipboard.writeText(text);
    }
  });

  // Check for Updates — uses electron-updater in packaged builds.
  // In dev mode (no update feed configured), returns a friendly message.
  ipcMain.handle('check-for-updates', async () => {
    try {
      // electron-updater is only available in packaged builds
      const { autoUpdater } = await import('electron-updater');
      const result = await autoUpdater.checkForUpdates();
      if (result && result.updateInfo && result.updateInfo.version !== applicationVersion) {
        return `Update available: v${result.updateInfo.version}`;
      }
      return "You're on the latest version!";
    } catch {
      return "You're on the latest version!";
    }
  });

  // desktopCapturer.getSources() shim for the @vonage/client-sdk-video SDK.
  //
  // In Electron 17+, desktopCapturer is main-process only. The SDK checks for
  // window.electron.desktopCapturer (contextIsolation path) and calls getSources().
  // We show our custom picker here and resolve with only the selected source so
  // the SDK's "use first source" logic becomes user-guided.
  ipcMain.handle('desktop-capturer-get-sources', () => {
    return new Promise<
      Array<{ id: string; name: string; thumbnail: string; display_id: string; appIcon: null }>
    >((resolve) => {
      openScreenPicker((sourceId) => {
        if (!sourceId) {
          // User cancelled — resolve with empty list so the SDK surfaces its own error
          resolve([]);
          return;
        }
        // Return only the selected source; SDK picks sources[0]
        resolve([{ id: sourceId, name: sourceId, thumbnail: '', display_id: '', appIcon: null }]);
      }).catch(() => resolve([]));
    });
  });
}

function configureScreenShare(): void {
  // setDisplayMediaRequestHandler is available since Electron 17.
  // The callback signature is stable across 36–41, but we wrap in a
  // try/catch so future API changes degrade gracefully.
  if (typeof session.defaultSession.setDisplayMediaRequestHandler !== 'function') {
    console.warn(
      `[Electron] setDisplayMediaRequestHandler not available (Electron ${electronMajorVersion}).` +
        ' Screen sharing will use the default Chrome picker.'
    );
    return;
  }

  // Electron 39+ added a third parameter { useSystemPicker } to opt into the
  // OS-level screen picker.  We pass { useSystemPicker: false } so our custom
  // picker is always used.  On Electron ≤38 the third arg is simply ignored.
  session.defaultSession.setDisplayMediaRequestHandler(
    async (_req, callback) => {
      console.log('[Electron] setDisplayMediaRequestHandler fired — opening screen picker');
      try {
        await openScreenPicker((sourceId) => {
          console.log('[Electron] Picker resolved, sourceId:', sourceId ?? '(cancelled)');
          if (!sourceId) {
            callback({});
            return;
          }
          callback({ video: { id: sourceId, name: sourceId } as Electron.DesktopCapturerSource });
        });
      } catch (err) {
        console.error('[Electron] Screen share picker error:', err);
        callback({});
      }
    },
    { useSystemPicker: false }
  );
}

// ─── Tray icon ────────────────────────────────────────────────────────────────

let tray: Tray | null = null;

function loadTrayIcon(): Electron.NativeImage {
  if (process.platform === 'darwin') {
    const iconPath = path.join(assetsDirectory, 'tray-template.png');
    const image = nativeImage.createFromPath(iconPath);
    image.setTemplateImage(true);
    return image;
  }
  return nativeImage.createFromPath(path.join(assetsDirectory, 'tray-icon.png'));
}

function buildTrayMenu(win: BrowserWindow): Electron.Menu {
  return Menu.buildFromTemplate([
    {
      label: 'Show Vonage Video',
      click: () => {
        if (!win.isDestroyed()) {
          win.show();
          win.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Open in Browser',
      click: () => {
        shell.openExternal(`http://localhost:${staticPort}`).catch(console.error);
      },
    },
    { type: 'separator' },
    {
      label: 'About Vonage Video',
      click: () => openAboutWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
      click: () => {
        app.quit();
      },
    },
  ]);
}

function createTray(win: BrowserWindow): Tray {
  const icon = loadTrayIcon();
  const t = new Tray(icon);
  t.setToolTip('Vonage Video');
  t.setContextMenu(buildTrayMenu(win));

  if (process.platform !== 'darwin') {
    t.on('click', () => {
      win.isVisible() ? win.focus() : win.show();
    });
  }

  return t;
}

// ─── Auto-update ──────────────────────────────────────────────────────────────

async function setupAutoUpdater(win: BrowserWindow): Promise<void> {
  if (!isPackaged) {
    console.log('[Electron] Skipping auto-update in dev mode');
    return;
  }

  try {
    // Dynamic import — electron-updater may not be available in all environments.
    const { autoUpdater: updater } = await import('electron-updater');

    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = true;

    updater.on('update-available', (info: { version: string }) => {
      if (win.isDestroyed()) return;
      dialog
        .showMessageBox(win, {
          type: 'info',
          title: 'Update available',
          message: `Version ${info.version} is available`,
          detail: 'It will be downloaded in the background and installed when you quit.',
          buttons: ['OK'],
        })
        .catch(console.error);
    });

    updater.on('update-downloaded', (info: { version: string }) => {
      if (win.isDestroyed()) return;
      dialog
        .showMessageBox(win, {
          type: 'info',
          title: 'Update ready',
          message: `Version ${info.version} downloaded`,
          detail: 'The update will be installed when you quit. Restart now?',
          buttons: ['Restart now', 'Later'],
          defaultId: 0,
        })
        .then(({ response }) => {
          if (response === 0) updater.quitAndInstall();
        })
        .catch(console.error);
    });

    updater.on('error', (err: Error) => {
      console.error('[Electron] Auto-update error:', err.message);
    });

    setTimeout(() => {
      updater.checkForUpdatesAndNotify().catch(console.error);
    }, 10_000);
  } catch (err) {
    console.warn('[Electron] electron-updater not available:', err);
  }
}

// ─── Main window ──────────────────────────────────────────────────────────────

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Hide the per-window menu bar on Windows/Linux
  // (the macOS app menu is set globally via Menu.setApplicationMenu)
  win.setMenu(null);

  const trackUrl = (url: string) => setCallState(url.includes('/room/'));
  win.webContents.on('did-navigate', (_e, url) => trackUrl(url));
  win.webContents.on('did-navigate-in-page', (_e, url) => trackUrl(url));
  win.webContents.on('did-finish-load', () => trackUrl(win.webContents.getURL()));

  // ── Navigation restrictions (Electron security checklist) ────────────────
  // Prevent the renderer from navigating away from trusted localhost.
  // See: https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
  win.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.origin !== `http://localhost:${staticPort}`) {
        console.warn(`[Electron] Blocked navigation to: ${url}`);
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  // Block new window creation — external links go through shell.openExternal instead.
  // See: https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // ── Process crash / unresponsive recovery ──────────────────────────────
  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Electron] Render process gone:', details.reason);
    dialog
      .showMessageBox({
        type: 'error',
        title: 'Vonage Video encountered a problem',
        message: `The application crashed (${details.reason}).`,
        detail: 'The app will restart.',
        buttons: ['Restart'],
      })
      .then(() => {
        app.relaunch();
        app.exit(0);
      });
  });

  win.on('unresponsive', () => {
    console.warn('[Electron] Window became unresponsive');
    dialog
      .showMessageBox(win, {
        type: 'warning',
        title: 'Vonage Video is not responding',
        message: 'The application appears to be frozen.',
        buttons: ['Wait', 'Restart'],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 1) {
          app.relaunch();
          app.exit(0);
        }
      });
  });

  win.once('ready-to-show', () => {
    win.show();
    // DevTools available via View menu (Cmd+Option+I) — no auto-open
  });

  win.on('close', async (event) => {
    if (!isInCall) return;
    event.preventDefault();

    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      title: 'Leave meeting?',
      message: 'You are currently in a video call.',
      detail: 'Closing will disconnect you from the meeting.',
      buttons: ['Leave meeting', 'Stay'],
      defaultId: 1,
      cancelId: 1,
    });

    // Guard: the window may have been destroyed while the dialog was awaited
    if (win.isDestroyed()) return;

    if (response === 0) {
      setCallState(false);
      win.destroy();
    }
  });

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Single-instance lock — if another instance is already running, focus it
  // and exit this one.  Skip in dev mode so rapid re-launches work cleanly.
  if (isPackaged) {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      app.quit();
      return;
    }
    app.on('second-instance', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });
  }

  await app.whenReady();

  // ── Branding ──────────────────────────────────────────────────────────────
  buildAndSetAppMenu();

  // Set Dock icon on macOS (overrides the generic Electron atom in dev mode)
  if (process.platform === 'darwin') {
    const dockIcon = nativeImage.createFromPath(path.join(assetsDirectory, 'app-icon.png'));
    if (!dockIcon.isEmpty()) app.dock?.setIcon(dockIcon);
  }

  // ── Core setup ────────────────────────────────────────────────────────────
  configureMediaPermissions();
  configureContentSecurityPolicy();
  configureScreenShare();
  registerPickerIpc();

  // Disable spellchecker — video apps don't need it, and it can send typed
  // text to OS-level spell check services.
  session.defaultSession.setSpellCheckerLanguages([]);

  await startStaticServer();

  // Create the main window and load the frontend BEFORE showing any permission
  // dialogs — this way the app is visible and responsive immediately.
  // Use `let` so the activate handler can reassign after the window is destroyed
  let win = createMainWindow();
  tray = createTray(win);
  setupAutoUpdater(win);

  await win.loadURL(`http://localhost:${staticPort}`);

  // Probe desktopCapturer so macOS registers the app in the Screen Recording
  // list under System Settings → Privacy & Security.  Without this call the
  // app never appears in the list and the user must manually add it.
  // Delayed until after the window is loaded so the OS permission dialog
  // appears in front of the app rather than behind it.
  if (process.platform === 'darwin') {
    desktopCapturer
      .getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } })
      .then((sources) => {
        console.log('[Electron] Screen recording probe: %d source(s) returned', sources.length);
      })
      .catch((err) => {
        console.log(
          '[Electron] Screen recording probe failed (expected if not yet granted):',
          err.message
        );
      });
  }

  app.on('activate', () => {
    // Don't rely on getAllWindows().length — the About / picker windows inflate it.
    // Check the main window reference directly.
    if (win.isDestroyed()) {
      win = createMainWindow();
      tray?.setContextMenu(buildTrayMenu(win));
      win.loadURL(`http://localhost:${staticPort}`).catch(console.error);
    } else {
      win.show();
      win.focus();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

main().catch((err) => {
  console.error('[Electron] Fatal startup error:', err);
  app.quit();
});
