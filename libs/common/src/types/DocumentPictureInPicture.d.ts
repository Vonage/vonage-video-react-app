/**
 * Type augmentation for the Document Picture-in-Picture API.
 *
 * The `documentPictureInPicture` property on `Window` is a relatively recent
 * browser API that is not yet included in TypeScript's built-in DOM type
 * definitions. This declaration augments the global `Window` interface so that
 * code in `libs/common` (which does not extend the frontend project's type
 * declarations) can reference the API without type errors.
 */

type DocumentPictureInPicture = {
  requestWindow: (options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
  }) => Promise<Window>;
};

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export {};
