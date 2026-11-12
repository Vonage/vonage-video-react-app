type DocumentPictureInPicture = {
  requestWindow: (options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
  }) => Promise<Window>;
};

declare global {
  // Document Picture-in-Picture is not yet part of TypeScript's DOM lib.
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

/**
 * Whether the Document Picture-in-Picture API is available in this browser.
 * Available in desktop Chromium 116+ and Firefox 151+; Safari does not implement it.
 * @returns {boolean} true when `documentPictureInPicture.requestWindow` exists
 */
const isDocumentPictureInPictureSupported = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.documentPictureInPicture?.requestWindow === 'function';

export default isDocumentPictureInPictureSupported;
