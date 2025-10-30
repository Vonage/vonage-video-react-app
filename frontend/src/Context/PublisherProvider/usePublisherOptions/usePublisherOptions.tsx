import { useRef, useEffect, useState } from 'react';
import {
  PublisherProperties,
  VideoFilter,
  AudioFilter,
  hasMediaProcessorSupport,
} from '@vonage/client-sdk-video';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import DeviceStore from '@utils/DeviceStore';

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherProperties | null} publisher properties object
 */

const usePublisherOptions = (): PublisherProperties | null => {
  const { user } = useUserContext();

  const defaultResolution = useAppConfig(({ videoSettings }) => videoSettings.defaultResolution);
  const allowVideoOnJoin = useAppConfig(({ videoSettings }) => videoSettings.allowVideoOnJoin);
  const allowAudioOnJoin = useAppConfig(({ audioSettings }) => audioSettings.allowAudioOnJoin);

  const [publisherOptions, setPublisherOptions] = useState<PublisherProperties | null>(null);
  const deviceStoreRef = useRef<DeviceStore | null>(null);

  useEffect(() => {
    const setOptions = async () => {
      if (!deviceStoreRef.current) {
        deviceStoreRef.current = new DeviceStore();
        await deviceStoreRef.current.init();
      }

      const videoSource = deviceStoreRef.current.getConnectedDeviceId('videoinput');
      const audioSource = deviceStoreRef.current.getConnectedDeviceId('audioinput');

      const {
        name,
        noiseSuppression,
        backgroundFilter,
        publishAudio,
        publishVideo,
        publishCaptions,
      } = user.defaultSettings;
      const initials = getInitials(name);

      const audioFilter: AudioFilter | undefined =
        noiseSuppression && hasMediaProcessorSupport()
          ? { type: 'advancedNoiseSuppression' }
          : undefined;

      const videoFilter: VideoFilter | undefined =
        backgroundFilter && hasMediaProcessorSupport() ? backgroundFilter : undefined;

      setPublisherOptions({
        audioFallback: { publisher: true },
        audioSource,
        initials,
        insertDefaultUI: false,
        name,
        publishAudio: allowAudioOnJoin && publishAudio,
        publishVideo: allowVideoOnJoin && publishVideo,
        resolution: defaultResolution,
        audioFilter,
        videoFilter,
        videoSource,
        publishCaptions,
      });
    };

    setOptions();
  }, [allowAudioOnJoin, defaultResolution, allowVideoOnJoin, user.defaultSettings]);

  return publisherOptions;
};

export default usePublisherOptions;
