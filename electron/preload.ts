import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposes a minimal API to the renderer process via the context bridge.
 * contextIsolation is enabled, so renderer code cannot access Node/Electron APIs directly.
 *
 * Usage in renderer (TypeScript): window.electron.isElectron === true
 * The ambient type declaration is in preload.d.ts.
 */
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  /** Open a URL in the system default browser (used by the About window). */
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  /** Check for application updates (used by the About window). */
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  /**
   * Write text to the clipboard via the main process.
   * navigator.clipboard.writeText() can silently fail in Electron when the
   * webContents loses focus at the exact moment of the call; routing through
   * the main-process clipboard module is always reliable.
   */
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard-write', text),
  /**
   * desktopCapturer shim — the @vonage/client-sdk-video SDK looks for
   * `window.electron.desktopCapturer.getSources()` when contextIsolation is
   * enabled (it cannot call require('electron') directly in the renderer).
   *
   * In Electron 17+ desktopCapturer is main-process only, so we route through
   * IPC. The main-process handler shows our custom screen picker and resolves
   * with the selected source, so the SDK's built-in "pick first source"
   * behaviour effectively becomes user-guided.
   */
  desktopCapturer: {
    getSources: (opts: { types: string[] }) =>
      ipcRenderer.invoke('desktop-capturer-get-sources', opts),
  },
});
