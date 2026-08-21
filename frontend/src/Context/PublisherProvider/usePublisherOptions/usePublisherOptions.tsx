import { useMemo } from 'react';
import {
  PublisherProperties,
  VideoFilter,
  AudioFilter,
  hasMediaProcessorSupport,
} from '@vonage/client-sdk-video';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import { useDeviceId } from '@core/stores/mediaDevices/hooks';
import useStableCallback from '@web/hooks/useStableCallback';
import { env } from '../../../env';
import advancedSettings$ from '@Context/AdvancedSettings';

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherProperties | null} publisher properties object
 */

const usePublisherOptions = ({
  isAudioEnabled,
  isVideoEnabled,
}: {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}): PublisherProperties => {
  const { user } = useUserContext();
  const enableDtx = advancedSettings$.use.select((state) => state.enableDtx);
  const frameRate = advancedSettings$.use.select((state) => state.frameRate);
  const codecMode = advancedSettings$.use.select((state) => state.codecMode);
  const codecPriority = advancedSettings$.use.select((state) => state.codecPriority);
  const publisherAudioFallbackEnabled = advancedSettings$.use.select(
    (state) => state.publisherAudioFallbackEnabled
  );
  const subscriberAudioFallbackEnabled = advancedSettings$.use.select(
    (state) => state.subscriberAudioFallbackEnabled
  );
  const advancedNoiseSuppressionEnabled = advancedSettings$.use.select(
    (state) => state.advancedNoiseSuppressionEnabled
  );
  const echoCancellationEnabled = advancedSettings$.use.select(
    (state) => state.echoCancellationEnabled
  );
  const noiseSuppressionEnabled = advancedSettings$.use.select(
    (state) => state.noiseSuppressionEnabled
  );
  const autoGainControlEnabled = advancedSettings$.use.select(
    (state) => state.autoGainControlEnabled
  );

  // Extract individual properties to avoid object reference changes
  const { name, backgroundFilter, publishAudio, publishVideo, publishCaptions } =
    user.defaultSettings;

  const videoSource = useDeviceId('videoinput');
  const audioSource = useDeviceId('audioinput');

  const getOptions = useStableCallback(() => {
    const initials = getInitials(name);

    const audioFilter: AudioFilter | undefined =
      advancedNoiseSuppressionEnabled && hasMediaProcessorSupport('audio')
        ? { type: 'advancedNoiseSuppression' }
        : undefined;

    const videoFilter: VideoFilter | undefined =
      backgroundFilter && hasMediaProcessorSupport('video') ? backgroundFilter : undefined;

    const options = {
      audioFallback: {
        publisher: publisherAudioFallbackEnabled,
        subscriber: subscriberAudioFallbackEnabled,
      },
      audioFilter,
      audioSource,
      autoGainControl: autoGainControlEnabled,
      echoCancellation: echoCancellationEnabled,
      enableDtx,
      initials,
      insertDefaultUI: false,
      name,
      noiseSuppression: noiseSuppressionEnabled,
      publishAudio: env.ALLOW_AUDIO_ON_JOIN && publishAudio && isAudioEnabled,
      publishCaptions,
      publishVideo: env.ALLOW_VIDEO_ON_JOIN && publishVideo && isVideoEnabled,
      frameRate,
      preferredVideoCodecs: (codecMode === 'automatic'
        ? 'automatic'
        : codecPriority) as PublisherProperties['preferredVideoCodecs'],
      resolution: env.PUBLISHER_MAX_RESOLUTION,
      videoFilter,
      videoSource,
      publishSenderStats: env.MEETING_ROOM_ALLOW_ADVANCED_SETTINGS,
    };

    return options;
  });

  return useMemo(
    () => getOptions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getOptions,
      audioSource,
      backgroundFilter,
      enableDtx,
      name,
      publishAudio,
      publishCaptions,
      publishVideo,
      videoSource,
      isAudioEnabled,
      isVideoEnabled,
      frameRate,
      codecMode,
      codecPriority,
      publisherAudioFallbackEnabled,
      subscriberAudioFallbackEnabled,
      advancedNoiseSuppressionEnabled,
      echoCancellationEnabled,
      noiseSuppressionEnabled,
      autoGainControlEnabled,
    ]
  );
};

export default usePublisherOptions;
