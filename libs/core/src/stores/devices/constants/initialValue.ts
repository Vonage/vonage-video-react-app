import type { MediaDeviceInfoJSON } from '../types';

/**
 * This store intent to manage all the media devices available on the client
 * and the selected devices for audio output, audio input and video input.
 */
const initialValue = () => ({
  /**
   * Native MediaDeviceInfo from navigator.mediaDevices
   */
  mediaDeviceInfo: [] as MediaDeviceInfo[],

  /**
   * Serializable selection of media devices
   */
  selection: new Map<MediaDeviceKind, MediaDeviceInfoJSON | null>(),
});

export default initialValue;
