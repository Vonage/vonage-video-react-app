/**
 * Ambient type declaration for the context bridge API exposed by electron/preload.ts.
 * Import this file (or add a triple-slash reference) in any frontend file that needs
 * to detect the Electron environment via `window.electron.isElectron`.
 */
interface Window {
  electron?: {
    isElectron: boolean;
    /** Open a URL in the system default browser. */
    openExternal: (url: string) => void;
    /**
     * Write text to the clipboard via the Electron main process.
     * Prefer this over navigator.clipboard.writeText() inside Electron, which
     * can fail silently when the window loses focus mid-call.
     */
    copyToClipboard: (text: string) => Promise<void>;
    /** Check for application updates. Returns a status message string. */
    checkForUpdates: () => Promise<string>;
  };
}
