/**
 * Whether the Document Picture-in-Picture API is available in this browser.
 * Chromium-only as of 2026; Safari and Firefox do not implement it.
 * @returns {boolean} true when `documentPictureInPicture.requestWindow` exists
 */
const isDocumentPictureInPictureSupported = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.documentPictureInPicture?.requestWindow === 'function';

export default isDocumentPictureInPictureSupported;
