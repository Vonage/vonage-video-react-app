/**
 * Ambient type declarations for the Electron context bridge API.
 * `window.electron` is injected by electron/preload.ts when the app runs inside
 * Electron. In a regular browser this property is undefined.
 */
interface Window {
  electron?: {
    /** True when running inside Electron. */
    isElectron: boolean;
    /** Open a URL in the system default browser. */
    openExternal: (url: string) => void;
    /**
     * Write text to the clipboard via the Electron main process.
     * Prefer this over `navigator.clipboard.writeText()` inside Electron, which
     * can silently fail when the window loses focus at the moment of the call.
     */
    copyToClipboard: (text: string) => Promise<void>;
    /**
     * desktopCapturer shim — the @vonage/client-sdk-video SDK looks for
     * `window.electron.desktopCapturer.getSources()` when contextIsolation is
     * enabled. Implemented via IPC to the main process (desktopCapturer is
     * main-process only in Electron 17+).
     */
    desktopCapturer: {
      getSources: (opts: { types: string[] }) => Promise<Array<{ id: string; name: string }>>;
    };
  };
}
