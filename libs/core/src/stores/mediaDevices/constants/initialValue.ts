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
     * Selected audio output. Note that if the browser does not support selecting audio output devices, this will always be undefined and the app should fallback to using the default audio output device.
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
