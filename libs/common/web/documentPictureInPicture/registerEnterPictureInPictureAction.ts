/**
 * Chromium fires this Media Session action when the user switches to another tab
 * while the page is capturing camera/microphone, letting the page open a
 * Picture-in-Picture window without a user gesture ("automatic picture-in-picture").
 * The action is not part of TypeScript's `MediaSessionAction` union yet.
 * @see https://developer.chrome.com/blog/automatic-picture-in-picture
 */
const ENTER_PICTURE_IN_PICTURE_ACTION = 'enterpictureinpicture' as MediaSessionAction;

/**
 * Registers a handler for the `enterpictureinpicture` Media Session action.
 * @param {() => void} handler - Called when the browser asks the page to enter Picture-in-Picture
 * @returns {() => void} Unregisters the handler; a no-op where the action is unsupported
 */
const registerEnterPictureInPictureAction = (handler: () => void): (() => void) => {
  const mediaSession = typeof navigator === 'undefined' ? undefined : navigator.mediaSession;
  if (!mediaSession) {
    return () => undefined;
  }

  try {
    mediaSession.setActionHandler(ENTER_PICTURE_IN_PICTURE_ACTION, handler);
  } catch {
    // Browsers that do not know the action throw a TypeError
    return () => undefined;
  }

  return () => {
    mediaSession.setActionHandler(ENTER_PICTURE_IN_PICTURE_ACTION, null);
  };
};

export default registerEnterPictureInPictureAction;
