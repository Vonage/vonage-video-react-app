import { useMemo } from 'react';
import {
  PublisherProperties,
  VideoFilter,
  AudioFilter,
  hasMediaProcessorSupport,
} from '@vonage/client-sdk-video';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import { useDeviceId } from '@core/stores/devices/hooks';
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

  // Extract individual properties to avoid object reference changes
  const { name, noiseSuppression, backgroundFilter, publishAudio, publishVideo, publishCaptions } =
    user.defaultSettings;

  const videoSource = useDeviceId('videoinput');
  const audioSource = useDeviceId('audioinput');

  const getOptions = useStableCallback(() => {
    const initials = getInitials(name);

    const audioFilter: AudioFilter | undefined =
      noiseSuppression && hasMediaProcessorSupport('both')
        ? { type: 'advancedNoiseSuppression' }
        : undefined;

    const videoFilter: VideoFilter | undefined =
      backgroundFilter && hasMediaProcessorSupport('both') ? backgroundFilter : undefined;

    const options = {
      audioFallback: {
        publisher: publisherAudioFallbackEnabled,
        subscriber: subscriberAudioFallbackEnabled,
      },
      audioFilter,
      audioSource,
      enableDtx,
      initials,
      insertDefaultUI: false,
      name,
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
      noiseSuppression,
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
    ]
  );
};

export default usePublisherOptions;
