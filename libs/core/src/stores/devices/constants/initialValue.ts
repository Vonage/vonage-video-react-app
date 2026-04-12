import { MediaDeviceInfoJSON, Prettify } from '@web/types';

/**
 * This store intent to manage all the media devices available on the client
 * and the selected devices for audio output, audio input and video input.
 */
const initialValue = () => {
  const selection: Record<MediaDeviceKind, string | undefined> = {
    /**
     * Selected audio input.
     */
    audioinput: undefined,

    /**
     * Selected audio output. undefined means no device has been selected yet. Will also be undefined when the browser does not support setSinkId (i.e. audio output selection is unavailable).
     */
    audiooutput: undefined,

    /**
     * Selected video input.
     */
    videoinput: undefined,
  };

  return Object.assign(selection, {
    /**
     * Native MediaDeviceInfo from navigator.mediaDevices
     */
    mediaDeviceInfo: [] as MediaDeviceInfoJSON[],
  });
};

export default initialValue as () => Prettify<ReturnType<typeof initialValue>>;
