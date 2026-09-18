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
