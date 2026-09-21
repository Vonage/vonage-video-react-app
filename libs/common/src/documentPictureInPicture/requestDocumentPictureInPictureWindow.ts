export type DocumentPictureInPictureWindowOptions = {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
};

/**
 * Opens a Document Picture-in-Picture window. Must run in a user-gesture handler.
 * @param {DocumentPictureInPictureWindowOptions} options - Size of the floating window
 * @returns {Promise<Window>} The new always-on-top window
 */
const requestDocumentPictureInPictureWindow = async (
  options: DocumentPictureInPictureWindowOptions = {}
): Promise<Window> => {
  const api = window.documentPictureInPicture;
  if (!api) {
    throw new Error('Document Picture-in-Picture is not supported');
  }

  return api.requestWindow(options);
};

export default requestDocumentPictureInPictureWindow;
