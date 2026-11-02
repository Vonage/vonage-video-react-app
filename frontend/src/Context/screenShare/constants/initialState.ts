import { Publisher } from '@vonage/client-sdk-video';

/**
 * @typedef {object} UseScreenShareType
 * @property {() => void} toggleScreenShare - Function that starts and stop screen sharing
 * @property {boolean} isSharingScreen - Indicates whether you are sharing your screen or not
 */
export type ScreenShareState = {
  // toggleShareScreen: () => Promise<void>;
  isSharingScreen: boolean;
  isEntireScreen: boolean;
  screensharingPublisher: Publisher | null;
  screenshareVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  publisher: Publisher | null;
};

const initialState = (): ScreenShareState => ({
  // toggleShareScreen: async () => {},
  isSharingScreen: false,
  isEntireScreen: false,
  screensharingPublisher: null,
  screenshareVideoElement: undefined,
  publisher: null,
});

export default initialState;
