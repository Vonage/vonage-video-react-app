import { useState, useMemo } from 'react';
import {
  PublisherProperties,
  VideoFilter,
  AudioFilter,
  hasMediaProcessorSupport,
  type GetUserMediaProperties,
} from '@vonage/client-sdk-video';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';
import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import isNil from 'lodash/isNil';
import useStableCallback from '@hooks/useStableCallback';
import useConnectedDeviceId from '@Context/Device/hooks/useConnectedDeviceId';
import { UserType } from '@Context/user';

type PublisherOptions = {
  publisherOptions: PublisherProperties;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: (enabled: boolean) => void;
  toggleAudio: (enabled: boolean) => void;
};

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherOptions} publisher properties object
 */

const usePublisherOptions = (options: { videoFilter?: VideoFilter } = {}): PublisherOptions => {
  useSuspenseUntilAppConfigReady();

  const { user } = useUserContext();

  const isCameraAllowed = useIsCameraControlAllowed();
  const isMicrophoneAllowed = useIsMicrophoneControlAllowed();
  const defaultResolution = useAppConfig(({ videoSettings }) => videoSettings.defaultResolution);
  const allowVideoOnJoin = useAppConfig(({ videoSettings }) => videoSettings.allowVideoOnJoin);
  const allowAudioOnJoin = useAppConfig(({ audioSettings }) => audioSettings.allowAudioOnJoin);

  const [isVideoEnabled, _setIsVideoEnabled] = useState<boolean>(() => {
    const localIsVideoEnabled = getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED);

    if (isNil(localIsVideoEnabled)) {
      return user.defaultSettings.publishVideo;
    }

    return localIsVideoEnabled === 'true';
  });

  const [isAudioEnabled, _setIsAudioEnabled] = useState<boolean>(() => {
    const localIsAudioEnabled = getStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED);

    if (isNil(localIsAudioEnabled)) {
      return user.defaultSettings.publishAudio;
    }

    return localIsAudioEnabled === 'true';
  });

  const [videoSource, audioSource] = useConnectedDeviceId('videoinput', 'audioinput');

  const [publisherOptions, setPublisherOptions] = useState<PublisherProperties>(() =>
    getInitialPublisherOptions({
      isCameraAllowed,
      isMicrophoneAllowed,
      isVideoEnabled,
      isAudioEnabled,
      user,
      defaultResolution,
      videoSource,
      audioSource,
      allowVideoOnJoin,
      allowAudioOnJoin,
      ...options,
    } as GetInitialPublisherOptionsParams)
  );

  const toggleVideo = useStableCallback((enabled?: boolean) => {
    const _enabled = enabled ?? !isVideoEnabled;

    localStorage.setItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, String(_enabled));

    _setIsVideoEnabled(_enabled);
    setPublisherOptions((prevOptions) => ({
      ...prevOptions,
      publishVideo: _enabled,
    }));
  });

  const toggleAudio = useStableCallback((enabled?: boolean) => {
    const _enabled = enabled ?? !isAudioEnabled;

    localStorage.setItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, String(_enabled));

    _setIsAudioEnabled(_enabled);
    setPublisherOptions((prevOptions) => ({
      ...prevOptions,
      publishAudio: _enabled,
    }));
  });

  return useMemo(
    () => ({
      publisherOptions,
      isVideoEnabled,
      isAudioEnabled,
      toggleVideo,
      toggleAudio,
    }),
    [publisherOptions, isVideoEnabled, isAudioEnabled, toggleVideo, toggleAudio]
  );
};

type GetInitialPublisherOptionsParams = Parameters<typeof getInitialPublisherOptions>[0];

function getInitialPublisherOptions(options: {
  isCameraAllowed: boolean;
  isMicrophoneAllowed: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  user: UserType;
  defaultResolution: GetUserMediaProperties['resolution'];
  videoSource: string | null;
  audioSource: string | null;
  allowVideoOnJoin: boolean;
  allowAudioOnJoin: boolean;
  videoFilter: VideoFilter | undefined;
}): PublisherProperties {
  const shouldInitializeAudioSource = options.isMicrophoneAllowed && options.isAudioEnabled;
  const shouldInitializeVideoSource = options.isCameraAllowed && options.isVideoEnabled;

  const { name, noiseSuppression, backgroundFilter, publishCaptions } =
    options.user.defaultSettings;

  const initials = getInitials(name);

  const audioFilter: AudioFilter | undefined = (() => {
    if (!shouldInitializeAudioSource) return undefined;

    return noiseSuppression && hasMediaProcessorSupport()
      ? { type: 'advancedNoiseSuppression' }
      : undefined;
  })();

  const videoFilter: VideoFilter | undefined = (() => {
    if (options.videoFilter) return options.videoFilter;
    if (!shouldInitializeVideoSource) return undefined;
    return backgroundFilter && hasMediaProcessorSupport() ? backgroundFilter : undefined;
  })();

  return {
    audioFallback: { publisher: true },
    audioSource: options.audioSource,
    initials,
    insertDefaultUI: false,
    name,
    publishAudio: shouldInitializeAudioSource && options.allowAudioOnJoin,
    publishVideo: shouldInitializeVideoSource && options.allowVideoOnJoin,
    resolution: options.defaultResolution,
    audioFilter,
    videoFilter,
    videoSource: options.videoSource,
    publishCaptions,
  };
}

export default usePublisherOptions;
