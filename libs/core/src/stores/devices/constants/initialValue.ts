import { MediaDeviceInfoJSON, Prettify } from '@web/types';

/**
 * This store intent to manage all the media devices available on the client
 * and the selected devices for audio output, audio input and video input.
 */
const initialValue = () => {
  const selection: Record<MediaDeviceKind, string | null> = {
    /**
     * Selected audio input.
     */
    audioinput: null,

    /**
     * Selected audio output. null means no device has been selected yet. Will also be null when the browser does not support setSinkId (i.e. audio output selection is unavailable).
     */
    audiooutput: null,

    /**
     * Selected video input.
     */
    videoinput: null,
  };

  return Object.assign(selection, {
    /**
     * Native MediaDeviceInfo from navigator.mediaDevices
     */
    mediaDeviceInfo: [] as MediaDeviceInfoJSON[],
  });
};

export default initialValue as () => Prettify<ReturnType<typeof initialValue>>;
