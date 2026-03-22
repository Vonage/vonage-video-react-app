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
import { autoUpdater } from 'electron-updater';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ─── App identity ─────────────────────────────────────────────────────────────

/**
 * Set the application name as early as possible — before app.whenReady() —
 * so it propagates to the macOS menu bar, dock tooltip, About panel, and all
 * system dialogs (permission prompts, update notifications, etc.).
 */
app.setName('Vonage Video');

// ─── Versions (read once at startup) ─────────────────────────────────────────

let APP_VERSION = 'unknown';
let SDK_VERSION = 'unknown';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  APP_VERSION = (require('../../package.json') as { version: string }).version;
} catch {
  /* leave as "unknown" */
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SDK_VERSION = (require('@vonage/client-sdk-video/package.json') as { version: string }).version;
} catch {
  /* leave as "unknown" */
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const IS_PACKAGED = app.isPackaged;

const ASSETS_DIR = IS_PACKAGED
  ? path.join(process.resourcesPath, 'electron-assets')
  : path.join(__dirname, '../assets');

const frontendDistPath = IS_PACKAGED
  ? path.join(process.resourcesPath, 'frontend-dist')
  : path.join(__dirname, '../../frontend/dist');

const pickerHtmlPath = IS_PACKAGED
  ? path.join(process.resourcesPath, 'picker.html')
  : path.join(__dirname, '../picker.html');

const aboutHtmlPath = IS_PACKAGED
  ? path.join(process.resourcesPath, 'about.html')
  : path.join(__dirname, '../about.html');

// ─── Static file server ───────────────────────────────────────────────────────

// 0 = let the OS pick a free port; resolved to actual port after server starts.
let STATIC_PORT = Number(process.env.ELECTRON_FRONTEND_PORT ?? 0);

const MIME: Record<string, string> = {
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
      const rawPath = (req.url ?? '/').split('?')[0];
      const urlPath = rawPath === '/' ? '/index.html' : rawPath;
      const filePath = path.join(frontendDistPath, urlPath);
      const ext = path.extname(filePath).toLowerCase();

      fs.readFile(filePath, (err, data) => {
        if (err) {
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
        res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(STATIC_PORT, '127.0.0.1', () => {
      // If port was 0, the OS assigned a free one — update STATIC_PORT so
      // loadURL() uses the correct address.
      const addr = server.address();
      if (addr && typeof addr === 'object') STATIC_PORT = addr.port;
      console.log(`[Electron] Frontend served at http://localhost:${STATIC_PORT}`);
      resolve();
    });
    server.on('error', reject);
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
    height: 420,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    title: 'About Vonage Video',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  aboutWindow.setMenu(null);
  aboutWindow.once('ready-to-show', () => aboutWindow?.show());
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.loadFile(aboutHtmlPath, {
    query: {
      appVersion: APP_VERSION,
      sdkVersion: SDK_VERSION,
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
        ...(!IS_PACKAGED
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
  const ALLOWED_REQUEST = [
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
  const ALLOWED_CHECK = [
    ...ALLOWED_REQUEST,
    'default-microphone',
    'default-camera',
    'default-speaker',
    'clipboard-sanitized-write',
  ];

  session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
    ALLOWED_CHECK.includes(permission)
  );

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
    callback(ALLOWED_REQUEST.includes(permission))
  );
}

// ─── Content Security Policy ──────────────────────────────────────────────────

function configureCSP(): void {
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

async function openScreenPicker(onSelect: PickerCallback): Promise<void> {
  // macOS: Screen Recording is a TCC permission that cannot be requested
  // programmatically.  Check the current status and bail out early with a
  // helpful dialog if it has been denied so the user knows what to do.
  if (process.platform === 'darwin') {
    const screenStatus = systemPreferences.getMediaAccessStatus('screen');
    console.log('[Electron] Screen recording permission status:', screenStatus);
    if (screenStatus === 'denied') {
      await showScreenRecordingDeniedDialog();
      onSelect(null);
      return;
    }
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

  const pickerWin = new BrowserWindow({
    width: 720,
    height: 520,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false, // hidden until ready-to-show fires to avoid a blank flash
    title: 'Share your screen',
    webPreferences: {
      preload: path.join(__dirname, 'picker-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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
  });

  pickerWin.on('closed', () => {
    if (pendingPickerCallback) {
      pendingPickerCallback(null);
      pendingPickerCallback = null;
    }
  });

  await pickerWin.loadFile(pickerHtmlPath);
}

function registerPickerIpc(): void {
  ipcMain.on('screen-picker:select', (_event, sourceId: string) => {
    if (pendingPickerCallback) {
      pendingPickerCallback(sourceId);
      pendingPickerCallback = null;
    }
    BrowserWindow.getAllWindows()
      .filter((w) => w.getTitle() === 'Share your screen')
      .forEach((w) => w.close());
  });

  ipcMain.on('screen-picker:cancel', () => {
    if (pendingPickerCallback) {
      pendingPickerCallback(null);
      pendingPickerCallback = null;
    }
    BrowserWindow.getAllWindows()
      .filter((w) => w.getTitle() === 'Share your screen')
      .forEach((w) => w.close());
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
  session.defaultSession.setDisplayMediaRequestHandler(async (_req, callback) => {
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
  });
}

// ─── Tray icon ────────────────────────────────────────────────────────────────

let tray: Tray | null = null;

function loadTrayIcon(): Electron.NativeImage {
  if (process.platform === 'darwin') {
    const iconPath = path.join(ASSETS_DIR, 'tray-template.png');
    const image = nativeImage.createFromPath(iconPath);
    image.setTemplateImage(true);
    return image;
  }
  return nativeImage.createFromPath(path.join(ASSETS_DIR, 'tray-icon.png'));
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
        shell.openExternal(`http://localhost:${STATIC_PORT}`).catch(console.error);
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

function setupAutoUpdater(win: BrowserWindow): void {
  if (!IS_PACKAGED) {
    console.log('[Electron] Skipping auto-update in dev mode');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
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

  autoUpdater.on('update-downloaded', (info) => {
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
        if (response === 0) autoUpdater.quitAndInstall();
      })
      .catch(console.error);
  });

  autoUpdater.on('error', (err) => {
    console.error('[Electron] Auto-update error:', err.message);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(console.error);
  }, 10_000);
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
      sandbox: false,
    },
  });

  // Hide the per-window menu bar on Windows/Linux
  // (the macOS app menu is set globally via Menu.setApplicationMenu)
  win.setMenu(null);

  const trackUrl = (url: string) => setCallState(url.includes('/room/'));
  win.webContents.on('did-navigate', (_e, url) => trackUrl(url));
  win.webContents.on('did-navigate-in-page', (_e, url) => trackUrl(url));
  win.webContents.on('did-finish-load', () => trackUrl(win.webContents.getURL()));

  win.once('ready-to-show', () => {
    win.show();
    if (!IS_PACKAGED) win.webContents.openDevTools({ mode: 'detach' });
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
  if (IS_PACKAGED) {
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
    const dockIcon = nativeImage.createFromPath(path.join(ASSETS_DIR, 'app-icon.png'));
    if (!dockIcon.isEmpty()) app.dock?.setIcon(dockIcon);
  }

  // ── Core setup ────────────────────────────────────────────────────────────
  configureMediaPermissions();
  configureCSP();
  configureScreenShare();
  registerPickerIpc();

  // Probe desktopCapturer early so macOS registers the app in the Screen
  // Recording list under System Settings → Privacy & Security.  Without this
  // call the app never appears in the list and the user must manually add it.
  // The result is intentionally discarded — we only care about the side-effect.
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

  await startStaticServer();

  // Create the main window and load the frontend BEFORE showing any permission
  // dialogs — this way the app is visible and responsive immediately.
  // Use `let` so the activate handler can reassign after the window is destroyed
  let win = createMainWindow();
  tray = createTray(win);
  setupAutoUpdater(win);

  await win.loadURL(`http://localhost:${STATIC_PORT}`);

  app.on('activate', () => {
    // Don't rely on getAllWindows().length — the About / picker windows inflate it.
    // Check the main window reference directly.
    if (win.isDestroyed()) {
      win = createMainWindow();
      tray?.setContextMenu(buildTrayMenu(win));
      win.loadURL(`http://localhost:${STATIC_PORT}`).catch(console.error);
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
