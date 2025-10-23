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
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';

type UsePublisherOptionsProps = {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
};

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherProperties | null} publisher properties object
 */

const usePublisherOptions = ({
  isVideoEnabled,
  isAudioEnabled,
}: UsePublisherOptionsProps): PublisherProperties | null => {
  useSuspenseUntilAppConfigReady();

  const { user } = useUserContext();

  const defaultResolution = useAppConfig(({ videoSettings }) => videoSettings.defaultResolution);
  const allowVideoOnJoin = useAppConfig(({ videoSettings }) => videoSettings.allowVideoOnJoin);
  const allowAudioOnJoin = useAppConfig(({ audioSettings }) => audioSettings.allowAudioOnJoin);

  const [publisherOptions, setPublisherOptions] = useState<PublisherProperties | null>(null);

  const deviceStoreRef = useRef<DeviceStore | null>(null);

  const isCameraAllowed = useIsCameraControlAllowed();
  const isMicrophoneAllowed = useIsMicrophoneControlAllowed();

  useEffect(() => {
    const shouldInitializeAudioSource = isMicrophoneAllowed && isAudioEnabled;
    const shouldInitializeVideoSource = isCameraAllowed && isVideoEnabled;

    const setOptions = async () => {
      if (!deviceStoreRef.current) {
        deviceStoreRef.current = new DeviceStore();
        await deviceStoreRef.current.init();
      }

      const videoSource = shouldInitializeVideoSource
        ? deviceStoreRef.current.getConnectedDeviceId('videoinput')
        : undefined;

      const audioSource = shouldInitializeAudioSource
        ? deviceStoreRef.current.getConnectedDeviceId('audioinput')
        : undefined;

      const { name, noiseSuppression, backgroundFilter, publishCaptions } = user.defaultSettings;

      const initials = getInitials(name);

      const audioFilter: AudioFilter | undefined = (() => {
        if (!shouldInitializeAudioSource) {
          return undefined;
        }

        return noiseSuppression && hasMediaProcessorSupport()
          ? { type: 'advancedNoiseSuppression' }
          : undefined;
      })();

      const videoFilter: VideoFilter | undefined = (() => {
        if (!shouldInitializeVideoSource) {
          return undefined;
        }

        return backgroundFilter && hasMediaProcessorSupport() ? backgroundFilter : undefined;
      })();

      setPublisherOptions({
        audioFallback: { publisher: true },
        audioSource,
        initials,
        insertDefaultUI: false,
        name,
        publishAudio: shouldInitializeAudioSource && allowAudioOnJoin,
        publishVideo: shouldInitializeVideoSource && allowVideoOnJoin,
        resolution: defaultResolution,
        audioFilter,
        videoFilter,
        videoSource,
        publishCaptions,
      });
    };

    setOptions();
  }, [
    allowAudioOnJoin,
    defaultResolution,
    allowVideoOnJoin,
    user.defaultSettings,
    isMicrophoneAllowed,
    isCameraAllowed,
    isAudioEnabled,
    isVideoEnabled,
  ]);

  return publisherOptions;
};

export default usePublisherOptions;
