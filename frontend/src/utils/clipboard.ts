/**
 * Write text to the system clipboard.
 *
 * In an Electron host, `navigator.clipboard.writeText()` can silently fail
 * when the webContents loses focus at the exact moment of the call. We
 * therefore prefer the Electron-specific `window.electron.copyToClipboard`
 * helper (backed by the main-process `clipboard` module) when it is available,
 * and fall back to the standard Web API in a browser context.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (window.electron?.copyToClipboard) {
    await window.electron.copyToClipboard(text);
  } else {
    await navigator.clipboard.writeText(text);
  }
}
